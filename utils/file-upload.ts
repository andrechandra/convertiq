import fs from 'fs-extra'
import path from 'path'

// Set up temp directory for file uploads
export const uploadDir =
  process.env.NODE_ENV === 'production'
    ? '/tmp/file-converter-uploads' // Use /tmp in production (works in Lambda)
    : path.join(process.cwd(), 'temp/upload')

// Ensure directory exists
export const ensureUploadDir = async () => {
  await fs.ensureDir(uploadDir)
}

// Parse form data using the native FormData instead of formidable
export const parseFormData = async (request: Request) => {
  await ensureUploadDir()

  try {
    const formData = await request.formData()
    const fields: Record<string, string[]> = {}
    const files: Record<
      string,
      Array<{
        filepath: string
        originalFilename: string
        mimetype: string
        size: number
      }>
    > = {}

    // Process each entry in formData
    for (const [key, value] of formData.entries()) {
      // If it's a file
      if (value instanceof File) {
        // Generate a unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `${value.name}-${uniqueSuffix}${path.extname(value.name)}`
        const filepath = path.join(uploadDir, filename)

        // Convert file to buffer and save to disk
        const buffer = Buffer.from(await value.arrayBuffer())
        await fs.writeFile(filepath, buffer)

        // Add to files object
        if (!files[key]) {
          files[key] = []
        }

        files[key].push({
          filepath,
          originalFilename: value.name,
          mimetype: value.type,
          size: value.size,
        })
      }
      // If it's a text field
      else {
        if (!fields[key]) {
          fields[key] = []
        }
        fields[key].push(value.toString())
      }
    }

    return { fields, files }
  } catch (error) {
    console.error('Error parsing form data:', error)
    throw error
  }
}

// Clean up temp files
export const cleanupTempFiles = async (filePaths: string[]) => {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.error(`Failed to delete temp file ${filePath}:`, error)
    }
  }
}
