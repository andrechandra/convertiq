import { NextRequest, NextResponse } from 'next/server'
import { parseFormData } from '@/utils/file-upload'

export async function POST(req: NextRequest) {
  try {
    // Use our alternative parseFormData function
    const { files } = await parseFormData(req)
    const file = files.file?.[0]

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.originalFilename,
        type: file.mimetype,
        size: file.size,
        path: file.filepath,
      },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
