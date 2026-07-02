"use client"

import * as React from "react"
import { ResponsiveDialog } from "@/frontend/shared/ui"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Trash2 } from "lucide-react"

export interface VoiceRecorderProps {
  open: boolean
  onClose: () => void
  onRecordComplete: (audioBlob: Blob, duration: number) => void
}

export function VoiceRecorder({ open, onClose, onRecordComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const [duration, setDuration] = React.useState(0)
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setDuration(0)
      intervalRef.current = setInterval(() => {
        setDuration(d => d + 1)
      }, 1000)
    } catch (error) {
      console.error("Failed to start recording:", error)
      alert("Could not access microphone. Please check permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const handleSend = () => {
    if (audioUrl && chunksRef.current.length > 0) {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" })
      onRecordComplete(blob, duration)
      handleReset()
      onClose()
    }
  }

  const handleReset = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setDuration(0)
    chunksRef.current = []
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  if (!open) return null

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      variant="modal"
      size="sm"
    >
      <ResponsiveDialog.Header>
        <ResponsiveDialog.Title>Voice Message</ResponsiveDialog.Title>
        <ResponsiveDialog.Description>Record a voice message to send</ResponsiveDialog.Description>
      </ResponsiveDialog.Header>

      <ResponsiveDialog.Body className="px-6 py-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl font-mono">{formatDuration(duration)}</div>

          {isRecording && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Recording...</span>
            </div>
          )}

          {audioUrl && !isRecording && (
            <audio controls src={audioUrl} className="w-full" />
          )}

          <div className="flex items-center gap-3">
            {!audioUrl ? (
              <>
                {!isRecording ? (
                  <Button size="lg" onClick={startRecording}>
                    <Mic className="h-5 w-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button size="lg" variant="destructive" onClick={stopRecording}>
                    <MicOff className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleReset}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Discard
                </Button>
                <Button onClick={handleSend}>Send</Button>
              </>
            )}
          </div>
        </div>
      </ResponsiveDialog.Body>
    </ResponsiveDialog>
  )
}
