import React from 'react'
import { File } from 'lucide-react'

// Define the type for file type entries
export type FileTypeInfo = {
  name: string
  icon: React.ReactNode
  conversions: string[]
}

// Define the map of MIME types to file information
const fileTypeMap: Record<string, FileTypeInfo> = {
  // Document types
  'application/pdf': {
    name: 'PDF',
    icon: <File className="h-10 w-10 text-red-500" />,
    conversions: ['DOCX', 'JPG', 'PNG', 'TXT'],
  },
  'application/msword': {
    name: 'DOC',
    icon: <File className="h-10 w-10 text-blue-500" />,
    conversions: ['PDF', 'DOCX', 'TXT'],
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    name: 'DOCX',
    icon: <File className="h-10 w-10 text-blue-500" />,
    conversions: ['PDF', 'DOC', 'TXT'],
  },
  'application/rtf': {
    name: 'RTF',
    icon: <File className="h-10 w-10 text-blue-500" />,
    conversions: ['PDF', 'DOCX', 'TXT'],
  },
  'application/vnd.oasis.opendocument.text': {
    name: 'ODT',
    icon: <File className="h-10 w-10 text-blue-500" />,
    conversions: ['PDF', 'DOCX', 'TXT'],
  },
  'text/plain': {
    name: 'TXT',
    icon: <File className="h-10 w-10 text-gray-500" />,
    conversions: ['PDF', 'DOCX', 'HTML'],
  },
  'text/html': {
    name: 'HTML',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['PDF', 'TXT', 'DOCX'],
  },
  'text/markdown': {
    name: 'MD',
    icon: <File className="h-10 w-10 text-gray-500" />,
    conversions: ['PDF', 'HTML', 'DOCX', 'TXT'],
  },
  'application/vnd.ms-excel': {
    name: 'XLS',
    icon: <File className="h-10 w-10 text-green-600" />,
    conversions: ['XLSX', 'CSV', 'PDF'],
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    name: 'XLSX',
    icon: <File className="h-10 w-10 text-green-600" />,
    conversions: ['XLS', 'CSV', 'PDF'],
  },
  'text/csv': {
    name: 'CSV',
    icon: <File className="h-10 w-10 text-green-600" />,
    conversions: ['XLSX', 'XLS', 'JSON', 'PDF'],
  },
  'application/vnd.ms-powerpoint': {
    name: 'PPT',
    icon: <File className="h-10 w-10 text-red-600" />,
    conversions: ['PPTX', 'PDF'],
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    name: 'PPTX',
    icon: <File className="h-10 w-10 text-red-600" />,
    conversions: ['PPT', 'PDF'],
  },

  // Image types
  'image/jpeg': {
    name: 'JPG',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['PNG', 'WEBP', 'GIF', 'PDF', 'AVIF'],
  },
  'image/png': {
    name: 'PNG',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'WEBP', 'GIF', 'PDF', 'AVIF'],
  },
  'image/webp': {
    name: 'WEBP',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PNG', 'GIF'],
  },
  'image/gif': {
    name: 'GIF',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PNG', 'WEBP', 'MP4'],
  },
  'image/svg+xml': {
    name: 'SVG',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['PNG', 'JPG', 'PDF'],
  },
  'image/tiff': {
    name: 'TIFF',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PNG', 'PDF'],
  },
  'image/bmp': {
    name: 'BMP',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PNG', 'PDF'],
  },
  'image/avif': {
    name: 'AVIF',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PNG', 'WEBP'],
  },

  // Audio types
  'audio/mpeg': {
    name: 'MP3',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['WAV', 'OGG', 'AAC', 'FLAC'],
  },
  'audio/wav': {
    name: 'WAV',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['MP3', 'OGG', 'AAC', 'FLAC'],
  },
  'audio/ogg': {
    name: 'OGG',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['MP3', 'WAV', 'AAC'],
  },
  'audio/aac': {
    name: 'AAC',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['MP3', 'WAV', 'OGG'],
  },
  'audio/flac': {
    name: 'FLAC',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['MP3', 'WAV', 'OGG', 'AAC'],
  },
  'audio/webm': {
    name: 'WEBM Audio',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['MP3', 'WAV', 'OGG'],
  },

  // Video types
  'video/mp4': {
    name: 'MP4',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['AVI', 'MOV', 'GIF', 'WEBM', 'MKV'],
  },
  'video/x-msvideo': {
    name: 'AVI',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'MOV', 'WEBM', 'MKV'],
  },
  'video/quicktime': {
    name: 'MOV',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'AVI', 'WEBM', 'MKV'],
  },
  'video/webm': {
    name: 'WEBM',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'AVI', 'MOV', 'MKV'],
  },
  'video/x-matroska': {
    name: 'MKV',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'AVI', 'WEBM'],
  },
  'video/3gpp': {
    name: '3GP',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'AVI', 'MOV'],
  },
  'video/x-flv': {
    name: 'FLV',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['MP4', 'AVI', 'WEBM'],
  },

  // Archive types
  'application/zip': {
    name: 'ZIP',
    icon: <File className="h-10 w-10 text-yellow-500" />,
    conversions: ['RAR', '7Z', 'TAR.GZ'],
  },
  'application/x-rar-compressed': {
    name: 'RAR',
    icon: <File className="h-10 w-10 text-yellow-500" />,
    conversions: ['ZIP', '7Z', 'TAR.GZ'],
  },
  'application/x-7z-compressed': {
    name: '7Z',
    icon: <File className="h-10 w-10 text-yellow-500" />,
    conversions: ['ZIP', 'RAR', 'TAR.GZ'],
  },
  'application/gzip': {
    name: 'GZIP',
    icon: <File className="h-10 w-10 text-yellow-500" />,
    conversions: ['ZIP', 'RAR', '7Z', 'TAR'],
  },
  'application/x-tar': {
    name: 'TAR',
    icon: <File className="h-10 w-10 text-yellow-500" />,
    conversions: ['ZIP', 'RAR', '7Z', 'TAR.GZ'],
  },
}

// Default file type for unknown files
export const defaultFileType: FileTypeInfo = {
  name: 'Unknown',
  icon: <File className="h-10 w-10 text-gray-500" />,
  conversions: [],
}

export default fileTypeMap
