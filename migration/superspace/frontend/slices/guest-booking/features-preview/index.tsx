'use client'

import { defineFeaturePreview } from '@/frontend/shared/preview'

function GuestBookingPreview() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Guest Booking</h3>
      <p className="text-muted-foreground text-sm">
        Syariah-compliant hotel booking flow with mahram verification, prayer times,
        and housekeeping integration.
      </p>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: 'guest-booking',
  name: 'Guest Booking',
  description: 'Hotel guest self-service lifecycle with Syariah-compliance verification',
  component: GuestBookingPreview,
  category: 'productivity',
  tags: ['hospitality', 'hotel', 'booking', 'syariah', 'mahram'],
  mockDataSets: [
    {
      id: 'default',
      name: 'Zian-Inn Sample',
      description: 'Sample booking data for onboarding preview',
      data: {},
    },
  ],
})
