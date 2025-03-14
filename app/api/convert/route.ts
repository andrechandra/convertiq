import { NextRequest, NextResponse } from 'next/server'
import { parseFormData, cleanupTempFiles, uploadDir } from '@/utils/file-upload'
import path from 'path'
import { convertDocument, convertImage, convertVideo } from '@/utils/converters'

export async function POST(req: NextRequest) {
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

    // Generate output filename
    const outputFilename = `${path.parse(file.originalFilename).name}-${Date.now()}.${targetFormat.toLowerCase()}`
    const outputPath = path.join(uploadDir, outputFilename)

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
      return NextResponse.json(
        { error: 'Unsupported file type for conversion' },
        { status: 400 }
      )
    }

    if (result.success) {
      // Generate a temporary download ID
      const downloadId = `${Date.now()}-${Math.round(Math.random() * 1e9)}`

      return NextResponse.json({
        success: true,
        downloadId,
        filename: outputFilename,
        originalName: file.originalFilename,
        convertedFormat: targetFormat,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error('Conversion error:', error)
    return NextResponse.json(
      { error: 'Conversion failed: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
