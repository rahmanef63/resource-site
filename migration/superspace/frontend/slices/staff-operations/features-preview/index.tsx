'use client'

import { defineFeaturePreview } from '@/frontend/shared/preview'

function StaffOperationsPreview() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Staff Operations</h3>
      <p className="text-muted-foreground text-sm">
        Housekeeping checklist, laundry tracking, damage reports, reimbursement, shift scheduling.
      </p>
    </div>
  )
}

export default defineFeaturePreview({
  featureId: 'staff-operations',
  name: 'Staff Operations',
  description: 'Housekeeping, laundry, damage reports, and shift scheduling for hospitality ops',
  component: StaffOperationsPreview,
  category: 'productivity',
  tags: ['hospitality', 'housekeeping', 'laundry', 'operations'],
  mockDataSets: [
    { id: 'default', name: 'Sample', description: 'Sample ops data', data: {} },
  ],
})
