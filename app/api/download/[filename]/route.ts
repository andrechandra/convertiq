import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs-extra'
import { uploadDir } from '@/utils/file-upload'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const filename = (await params).filename
    const filePath = path.join(uploadDir, filename)

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read file
    const fileBuffer = await fs.readFile(filePath)

    // Get file extension
    const ext = path.extname(filename).substring(1).toLowerCase()

    // Extract just the name part without extension
    const nameWithoutExt = path.basename(filename, path.extname(filename))

    // Remove timestamp pattern (assuming it's a dash followed by numbers at the end)
    const cleanName = nameWithoutExt.replace(/-\d+$/, '')

    // Create display filename with "- Converted" added
    const displayFilename = `${cleanName} - Converted.${ext}`

    // Set appropriate content type
    let contentType = 'application/octet-stream'

    // Common MIME types
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      doc: 'application/msword',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',
      webm: 'video/webm',
    }

    if (ext in mimeTypes) {
      contentType = mimeTypes[ext]
    }

    // Schedule file for deletion after sending (after 1 hour)
    setTimeout(
      () => {
        fs.remove(filePath).catch((err) =>
          console.error(`Failed to remove temp file ${filePath}:`, err)
        )
      },
      60 * 60 * 1000
    )

    // Return file with headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${displayFilename}"`,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return new NextResponse('Download failed', { status: 500 })
  }
}
