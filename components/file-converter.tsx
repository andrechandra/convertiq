'use client'

import type React from 'react'

import { useState, useRef } from 'react'
import { Upload, ArrowRight, File, Download, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

// File type mapping
const fileTypeMap: Record<
  string,
  { name: string; icon: React.ReactNode; conversions: string[] }
> = {
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
  'image/jpeg': {
    name: 'JPG',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['PNG', 'PDF', 'WEBP'],
  },
  'image/png': {
    name: 'PNG',
    icon: <File className="h-10 w-10 text-green-500" />,
    conversions: ['JPG', 'PDF', 'WEBP'],
  },
  'audio/mpeg': {
    name: 'MP3',
    icon: <File className="h-10 w-10 text-purple-500" />,
    conversions: ['WAV', 'OGG', 'AAC'],
  },
  'video/mp4': {
    name: 'MP4',
    icon: <File className="h-10 w-10 text-orange-500" />,
    conversions: ['AVI', 'MOV', 'GIF', 'WEBM'],
  },
  'text/plain': {
    name: 'TXT',
    icon: <File className="h-10 w-10 text-gray-500" />,
    conversions: ['PDF', 'DOCX'],
  },
}

const defaultFileType = {
  name: 'Unknown',
  icon: <File className="h-10 w-10 text-gray-500" />,
  conversions: [],
}

export default function FileConverter() {
  const [file, setFile] = useState<File | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fileType, setFileType] = useState<any>(null)
  const [selectedConversion, setSelectedConversion] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [conversionStatus, setConversionStatus] = useState<
    'idle' | 'converting' | 'completed' | 'error'
  >('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [debugLog, setDebugLog] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  const logDebug = (message: string) => {
    console.log(message) // Also log to console
    setDebugLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ])
  }

  const testUpload = async () => {
    if (!file) return
    logDebug(`Testing upload: ${file.name}`)

    try {
      const formData = new FormData()
      formData.append('file', file)

      logDebug(`Sending request to /api/test-upload`)
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      logDebug(`Upload response: ${JSON.stringify(data)}`)

      if (data.success) {
        alert(
          `File uploaded successfully!\nType: ${data.fileInfo.type}\nSize: ${data.fileInfo.size} bytes`
        )
      } else {
        alert(`Upload failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Test upload error:', error)
      logDebug(`Upload test error: ${error}`)
      alert('Upload test failed')
    }
  }

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile)
    const type = fileTypeMap[selectedFile.type] || defaultFileType
    setFileType(type)
    setSelectedConversion(type.conversions[0] || '')
    setConversionStatus('idle')
    setConversionProgress(0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  // const handleConvert = () => {
  //   if (!file || !selectedConversion) return

  //   setConversionStatus('converting')

  //   let progress = 0
  //   const interval = setInterval(() => {
  //     progress += Math.random() * 10
  //     if (progress >= 100) {
  //       progress = 100
  //       clearInterval(interval)
  //       setConversionProgress(100)
  //       setConversionStatus('completed')
  //     } else {
  //       setConversionProgress(progress)
  //     }
  //   }, 300)
  // }

  const resetConverter = () => {
    setFile(null)
    setFileType(null)
    setSelectedConversion('')
    setConversionStatus('idle')
    setConversionProgress(0)
  }

  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-6">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 dark:border-slate-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  Drag and drop your file here
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Supports PDF, DOCX, JPG, PNG, MP3, MP4, and more
                </p>
              </div>
              <div className="mt-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-2"
                >
                  Browse Files
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileChange(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium">File Conversion</h3>
              <Button variant="ghost" size="icon" onClick={resetConverter}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="flex items-center gap-3 min-w-[180px]">
                {fileType.icon}
                <div>
                  <p className="font-medium">{fileType.name} File</p>
                  <p className="text-sm text-slate-500 truncate max-w-[150px]">
                    {file.name}
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowRight className="hidden sm:block h-5 w-5 text-slate-400" />
                  <Select
                    value={selectedConversion}
                    onValueChange={setSelectedConversion}
                  >
                    <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileType.conversions.length > 0 ? (
                        fileType.conversions.map((format: string) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No conversions available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 w-full">
                  {conversionStatus === 'idle' && (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={testUpload}
                      disabled={!file}
                    >
                      Test Upload
                    </Button>
                  )}

                  {conversionStatus === 'converting' && (
                    <div className="w-full space-y-2">
                      <Progress value={conversionProgress} className="h-2" />
                      <p className="text-sm text-slate-500">
                        Converting... {Math.round(conversionProgress)}%
                      </p>
                    </div>
                  )}

                  {conversionStatus === 'completed' && (
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-500">
                        Conversion complete!
                      </span>
                      <Button
                        variant="outline"
                        size="small"
                        className="ml-auto"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  {conversionStatus === 'error' && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>
                        Conversion failed. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {fileType.conversions.length === 0 && (
              <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30">
                <AlertDescription>
                  This file type cannot be converted. Please try a different
                  file.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">About this converter</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                This tool allows you to convert {fileType.name} files to various
                formats. The conversion is done securely on our servers and your
                files are deleted after conversion.
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium mb-2">
                  About this converter
                </h4>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => setShowDebug(!showDebug)}
                >
                  {showDebug ? 'Hide Debug' : 'Show Debug'}
                </Button>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                This tool allows you to convert {fileType?.name} files to
                various formats. The conversion is done securely on our servers
                and your files are deleted after conversion.
              </p>

              {showDebug && (
                <div className="mt-4 border rounded p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="mb-2 flex justify-between items-center">
                    <h5 className="text-sm font-medium">Debug Log</h5>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setDebugLog([])}
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="h-40 overflow-y-auto border rounded text-xs font-mono p-2 bg-white dark:bg-slate-800">
                    {debugLog.length === 0 ? (
                      <p className="text-slate-400 dark:text-slate-500">
                        No log entries yet
                      </p>
                    ) : (
                      debugLog.map((log, i) => (
                        <div
                          key={i}
                          className="py-1 border-b border-slate-100 dark:border-slate-700 last:border-0"
                        >
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
