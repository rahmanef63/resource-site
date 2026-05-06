"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsToggle, SettingsSelect, SettingsSlider } from "../primitives"

/**
 * Video & Voice Settings - Audio/video preferences
 */
export function VideoVoiceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audio</CardTitle>
          <CardDescription>
            Configure audio input and output
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Microphone"
            description="Select your input device"
            value="default"
            onValueChange={() => {}}
            options={[
              { value: "default", label: "System Default" },
            ]}
          />
          
          <SettingsSelect
            label="Speaker"
            description="Select your output device"
            value="default"
            onValueChange={() => {}}
            options={[
              { value: "default", label: "System Default" },
            ]}
          />
          
          <SettingsToggle
            label="Noise Suppression"
            description="Reduce background noise during calls"
            checked={true}
            onCheckedChange={() => {}}
          />
          
          <SettingsToggle
            label="Echo Cancellation"
            description="Prevent audio feedback"
            checked={true}
            onCheckedChange={() => {}}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video</CardTitle>
          <CardDescription>
            Configure video preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingsSelect
            label="Camera"
            description="Select your camera"
            value="default"
            onValueChange={() => {}}
            options={[
              { value: "default", label: "System Default" },
            ]}
          />
          
          <SettingsSelect
            label="Video Quality"
            description="Preferred video quality"
            value="auto"
            onValueChange={() => {}}
            options={[
              { value: "auto", label: "Auto" },
              { value: "high", label: "High (720p)" },
              { value: "hd", label: "HD (1080p)" },
            ]}
          />
          
          <SettingsToggle
            label="Mirror Video"
            description="Mirror your video preview"
            checked={true}
            onCheckedChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  )
}
