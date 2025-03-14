import { NextRequest, NextResponse } from 'next/server'
import { parseFormData, cleanupTempFiles, uploadDir } from '@/utils/file-upload'
import path from 'path'
import { convertDocument, convertImage, convertVideo } from '@/utils/converters'
import fs from 'fs-extra'

export async function POST(req: NextRequest) {
  // Track files to clean up
  const filesToCleanup: string[] = []
  let outputPath: string | null = null
  
  try {
    // Parse form data from request
    const { fields, files } = await parseFormData(req)
    const file = files.file?.[0]
    const targetFormat = fields.targetFormat?.[0]

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!targetFormat) {
      return NextResponse.json(
        { error: 'No target format specified' },
        { status: 400 }
      )
    }

    // Add input file to cleanup list
    filesToCleanup.push(file.filepath)

    // Generate output filename
    const outputFilename = `${path.parse(file.originalFilename).name}-${Date.now()}.${targetFormat.toLowerCase()}`
    outputPath = path.join(uploadDir, outputFilename)

    // Determine file type and use appropriate converter
    let result
    const mimeType = file.mimetype

    if (mimeType.startsWith('application/') || mimeType === 'text/plain') {
      // Document conversion
      result = await convertDocument(file.filepath, outputPath, targetFormat)
    } else if (mimeType.startsWith('image/')) {
      // Image conversion
      result = await convertImage(file.filepath, outputPath, targetFormat)
    } else if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
      // Video/Audio conversion
      result = await convertVideo(file.filepath, outputPath, targetFormat)
    } else {
      // Clean up the uploaded file immediately
      try {
        if (fs.existsSync(file.filepath)) {
          await fs.unlink(file.filepath)
          console.log(`Deleted file: ${file.filepath}`)
        }
      } catch (cleanupError) {
        console.error(`Failed to clean up file ${file.filepath}:`, cleanupError)
      }
      
      return NextResponse.json(
        { error: 'Unsupported file type for conversion' },
        { status: 400 }
      )
    }

    if (result.success) {
      // Verify the input file exists before trying to delete it
      try {
        if (fs.existsSync(file.filepath)) {
          await fs.unlink(file.filepath)
          console.log(`Deleted original file after successful conversion: ${file.filepath}`)
        }
      } catch (cleanupError) {
        console.error(`Failed to clean up original file ${file.filepath}:`, cleanupError)
      }
      
      // Generate a temporary download ID
      const downloadId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

      // Schedule the converted file for deletion after some time (e.g., 1 hour)
      // This gives users time to download the file
      setTimeout(async () => {
        try {
          if (outputPath && fs.existsSync(outputPath)) {
            await fs.unlink(outputPath)
            console.log(`Deleted converted file after timeout: ${outputPath}`)
          }
        } catch (error) {
          console.error(`Failed to clean up converted file ${outputPath}:`, error)
        }
      }, 3600000) // 1 hour in milliseconds

      return NextResponse.json({
        success: true,
        downloadId,
        filename: outputFilename,
        originalName: file.originalFilename,
        convertedFormat: targetFormat,
      })
    } else {
      // Clean up both input and output files since conversion failed
      try {
        if (fs.existsSync(file.filepath)) {
          await fs.unlink(file.filepath)
          console.log(`Deleted original file after failed conversion: ${file.filepath}`)
        }
        
        if (outputPath && fs.existsSync(outputPath)) {
          await fs.unlink(outputPath)
          console.log(`Deleted output file after failed conversion: ${outputPath}`)
        }
      } catch (cleanupError) {
        console.error('Failed to clean up files after failed conversion:', cleanupError)
      }
      
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    // Clean up any temp files on error
    try {
      for (const filePath of filesToCleanup) {
        if (fs.existsSync(filePath)) {
          await fs.unlink(filePath)
          console.log(`Deleted file in error handler: ${filePath}`)
        }
      }
      
      if (outputPath && fs.existsSync(outputPath)) {
        await fs.unlink(outputPath)
        console.log(`Deleted output file in error handler: ${outputPath}`)
      }
    } catch (cleanupError) {
      console.error('Failed to clean up files in error handler:', cleanupError)
    }
    
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Conversion failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}