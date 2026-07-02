import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * Guest Booking Feature
 *
 * Hotel guest self-service lifecycle: search → book → verify → check-in → in-stay → checkout.
 * Syariah-compliant hospitality (mahram verification, prayer times, qibla, halal amenities).
 *
 * Source: extracted from zianinn-dekstop + zianinn-mobile spec (merge-playbook/sources/zianinn-feature-spec.md).
 */
export default defineFeature({
  id: 'guest-booking',
  name: 'Guest Booking',
  description: 'Hotel guest self-service lifecycle with Syariah-compliance verification',

  ui: {
    icon: 'BedDouble',
    path: '/dashboard/guest-booking',
    component: 'GuestBookingPage',
    category: 'productivity',
    order: 50,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '0.1.0',
  },

  status: {
    state: 'beta',
    isReady: true,
  },

  generation: {
    mode: 'hybrid-json',
    sharedEngineId: 'guest-booking',
  },

  navigation: {
    aliases: ['booking', 'reservation', 'stay'],
    patterns: {
      'booking': 'booking/:id',
      'verification': 'verification/:id',
    },
  },

  agent: {
    definitionPath: 'convex/features/guestBooking/agent.ts',
    capabilities: ['create', 'read', 'update', 'search'],
  },

  bundles: {
    core: [],
    recommended: ['custom'],
    optional: ['startup'],
  },

  tags: ['hospitality', 'hotel', 'booking', 'syariah', 'mahram'],

  permissions: [
    'guest-booking.view',
    'guest-booking.create',
    'guest-booking.update',
    'guest-booking.verify',
    'guest-booking.cancel',
  ],
})
