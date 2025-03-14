'use client'

import type React from 'react'

import { useState, useRef, useEffect } from 'react'
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
import fileTypeMap, { defaultFileType, FileTypeInfo } from '@/utils/file-types'

export default function FileConverter() {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development'
  const [fileType, setFileType] = useState<FileTypeInfo | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [selectedConversion, setSelectedConversion] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [conversionStatus, setConversionStatus] = useState<
    'idle' | 'converting' | 'completed' | 'error'
  >('idle')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [downloadInfo, setDownloadInfo] = useState<{
    id: string
    filename: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [debugLog, setDebugLog] = useState<string[]>([])
  const [showDebug, setShowDebug] = useState(false)

  const logDebug = (message: string) => {
    console.log(message) // Also log to console
    if (isDevelopment) {
      setDebugLog((prev) => [
        ...prev,
        `${new Date().toLocaleTimeString()}: ${message}`,
      ])
    }
  }

  // Simulated progress updates
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (conversionStatus === 'converting') {
      let progress = 0
      interval = setInterval(() => {
        progress += Math.random() * 5 + 3 // Random increment between 3-8%

        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
        }

        setConversionProgress(progress)
      }, 300)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [conversionStatus])

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

  const handleConvert = async () => {
    if (!file || !selectedConversion) return

    setConversionStatus('converting')
    setConversionProgress(0)
    logDebug(`Starting conversion to ${selectedConversion}`)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetFormat', selectedConversion)

      logDebug(`Sending request to /api/convert`)

      // The actual conversion request
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      logDebug(`Got response with status: ${response.status}`)

      // Check if the response is OK before parsing JSON
      if (!response.ok) {
        const errorText = await response.text()
        logDebug(`Error response: ${errorText.substring(0, 150)}...`)
        throw new Error(
          `Server error: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()

      if (data.success) {
        setDownloadInfo({
          id: data.downloadId,
          filename: data.filename,
        })
        setConversionProgress(100)
        setConversionStatus('completed')
      } else {
        setErrorMessage(data.error || 'Conversion failed')
        setConversionStatus('error')
      }
    } catch (error) {
      console.error('Conversion error:', error)
      logDebug(`Conversion error: ${error}`)
      setErrorMessage((error as Error).message || 'Conversion failed')
      setConversionStatus('error')
    }
  }

  const handleDownload = () => {
    if (!downloadInfo) return

    const downloadUrl = `/api/download/${downloadInfo.filename}`
    logDebug(`Downloading from: ${downloadUrl}`)

    // Create an anchor element and trigger download
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = downloadInfo.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile)
    const type = fileTypeMap[selectedFile.type] || defaultFileType
    setFileType(type)
    setSelectedConversion(type.conversions[0] || '')
    logDebug(`File Types: ${type.conversions}`)
    setConversionStatus('idle')
    setConversionProgress(0)
    setDownloadInfo(null)
    setErrorMessage('')
    logDebug(`File selected: ${selectedFile.name} (${selectedFile.type})`)
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

  const resetConverter = () => {
    setFile(null)
    setFileType(null)
    setSelectedConversion('')
    setConversionStatus('idle')
    setConversionProgress(0)
    setDownloadInfo(null)
    setErrorMessage('')
    logDebug('Converter reset')
  }

  return (
    <Card className="w-full shadow-lg">
      <CardContent className="p-4 md:p-6">
        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-6 md:p-12 text-center ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-slate-300 dark:border-slate-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
              <div className="bg-primary/10 p-3 md:p-4 rounded-full">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-medium">
                  Drag and drop your file here
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Supports PDF, DOCX, JPG, PNG, MP3, MP4, and more
                </p>
              </div>
              <div className="mt-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="mt-2"
                  size="small"
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
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-medium">
                File Conversion
              </h3>
              <Button variant="ghost" size="icon" onClick={resetConverter}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center">
              <div className="flex items-center gap-3 w-full md:min-w-[180px] md:w-auto">
                <div className="flex-shrink-0">{fileType?.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{fileType?.name} File</p>
                  <p className="text-sm text-slate-500 truncate max-w-full">
                    {file.name}
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 w-full">
                  <ArrowRight className="hidden xs:block h-5 w-5 text-slate-400" />
                  <Select
                    value={selectedConversion}
                    onValueChange={setSelectedConversion}
                    disabled={conversionStatus === 'converting'}
                  >
                    <SelectTrigger className="w-full xs:w-[120px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileType?.conversions &&
                      fileType.conversions.length > 0 ? (
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

                  {conversionStatus === 'idle' && (
                    <div className="flex gap-2 w-full xs:w-auto mt-2 xs:mt-0">
                      <Button
                        className="flex-1 xs:flex-initial"
                        onClick={handleConvert}
                        disabled={
                          !file ||
                          !selectedConversion ||
                          fileType?.conversions.length === 0
                        }
                        size="small"
                      >
                        Convert
                      </Button>
                      {isDevelopment && (
                        <Button
                          className="flex-1 xs:flex-initial"
                          variant="outline"
                          onClick={testUpload}
                          disabled={!file}
                          size="small"
                        >
                          Test Upload
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="w-full">
                  {conversionStatus === 'converting' && (
                    <div className="w-full space-y-2">
                      <Progress value={conversionProgress} className="h-2" />
                      <p className="text-xs md:text-sm text-slate-500">
                        Converting... {Math.round(conversionProgress)}%
                      </p>
                    </div>
                  )}

                  {conversionStatus === 'completed' && (
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-1" />
                        <span className="text-xs md:text-sm text-green-500">
                          Conversion complete!
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="small"
                        className="ml-auto"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}

                  {conversionStatus === 'error' && (
                    <Alert variant="destructive" className="py-2 text-sm">
                      <AlertDescription>
                        {errorMessage || 'Conversion failed. Please try again.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {fileType?.conversions.length === 0 && (
              <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/30 text-sm">
                <AlertDescription>
                  This file type cannot be converted. Please try a different
                  file.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <h4 className="text-xs md:text-sm font-medium mb-2">
                  Debug Options
                </h4>
                {isDevelopment && (
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-xs"
                  >
                    {showDebug ? 'Hide Debug' : 'Show Debug'}
                  </Button>
                )}
              </div>

              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                This tool allows you to convert {fileType?.name} files to
                various formats. The conversion is done securely on our servers
                and your files are deleted after conversion.
              </p>

              {isDevelopment && showDebug && (
                <div className="mt-4 border rounded p-3 md:p-4 bg-slate-50 dark:bg-slate-900">
                  <div className="mb-2 flex justify-between items-center">
                    <h5 className="text-xs md:text-sm font-medium">
                      Debug Log
                    </h5>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => setDebugLog([])}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>

                  <div className="h-32 md:h-40 overflow-y-auto border rounded text-xs font-mono p-2 bg-white dark:bg-slate-800">
                    {debugLog.length === 0 ? (
                      <p className="text-slate-400 dark:text-slate-500">
                        No log entries yet
                      </p>
                    ) : (
                      debugLog.map((log, i) => (
                        <div
                          key={i}
                          className="py-1 border-b border-slate-100 dark:border-slate-700 last:border-0 break-words"
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
