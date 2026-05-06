# Calendar Component Library

A comprehensive, reusable calendar system built for scalability and flexibility. Designed to be used across various features including database views, documents, timeline, hospitality, payroll, and more.

## Features

- ✅ **Multiple Selection Modes**: Single, multiple, and range date selection
- ✅ **Time Slot Selection**: Integrated time picker with customizable slots
- ✅ **Event Display**: Show and manage calendar events
- ✅ **Date Presets**: Quick date selection shortcuts
- ✅ **Custom Badges**: Add labels, prices, or status indicators to dates
- ✅ **Responsive Design**: Mobile-first, adapts to all screen sizes
- ✅ **Accessible**: Full keyboard navigation and screen reader support
- ✅ **Themeable**: Customizable variants, sizes, and color schemes
- ✅ **Localization**: Support for multiple locales and timezones
- ✅ **TypeScript**: Fully typed for excellent DX

## Installation

The calendar is already integrated into the project. Import from:

\`\`\`tsx
import { Calendar, DatePicker } from '@/frontend/shared/ui/components/Calendar';
\`\`\`

## Basic Usage

### Simple Date Picker

\`\`\`tsx
import { useState } from 'react';
import { Calendar } from '@/frontend/shared/ui/components/Calendar';

function MyComponent() {
  const [date, setDate] = useState<Date>();
  
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
    />
  );
}
\`\`\`

### Date Range Picker

\`\`\`tsx
import { DateRange } from 'react-day-picker';

function MyComponent() {
  const [range, setRange] = useState<DateRange>();
  
  return (
    <Calendar
      mode="range"
      selected={range}
      onSelect={setRange}
      numberOfMonths={2}
    />
  );
}
\`\`\`

### With Time Slots

\`\`\`tsx
import { Calendar, DEFAULT_TIME_SLOTS } from '@/frontend/shared/ui/components/Calendar';

function BookingCalendar() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>();
  
  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      enableTimeSlots
      timeSlots={DEFAULT_TIME_SLOTS}
      onTimeSelect={setTime}
      showFooter
      showContinueButton
      onContinue={(date, time) => {
        console.log('Booking:', date, time);
      }}
    />
  );
}
\`\`\`

### With Events

\`\`\`tsx
import { Calendar, CalendarEvent } from '@/frontend/shared/ui/components/Calendar';

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    from: new Date(2025, 5, 12, 9, 0),
    to: new Date(2025, 5, 12, 10, 0),
    color: '#3b82f6',
    icon: '📅',
  },
];

function EventCalendar() {
  return (
    <Calendar
      mode="single"
      enableEvents
      events={events}
      onEventClick={(event) => {
        console.log('Event clicked:', event);
      }}
    />
  );
}
\`\`\`

### With Presets

\`\`\`tsx
import { Calendar, DEFAULT_DATE_PRESETS } from '@/frontend/shared/ui/components/Calendar';

function QuickDatePicker() {
  return (
    <Calendar
      mode="single"
      enablePresets
      presets={DEFAULT_DATE_PRESETS}
    />
  );
}
\`\`\`

### Inline DatePicker (for forms)

\`\`\`tsx
import { DatePicker } from '@/frontend/shared/ui/components/Calendar';

function MyForm() {
  const [date, setDate] = useState<Date>();
  
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      placeholder="Select date..."
      enablePresets
      presets={DEFAULT_DATE_PRESETS}
    />
  );
}
\`\`\`

## Advanced Usage

### Custom Time Slots

\`\`\`tsx
import { generateTimeSlots } from '@/frontend/shared/ui/components/Calendar';

const customSlots = generateTimeSlots(8, 20, 30); // 8 AM to 8 PM, 30-min intervals

<Calendar
  enableTimeSlots
  timeSlots={customSlots}
/>
\`\`\`

### Disabled Dates

\`\`\`tsx
const bookedDates = [
  new Date(2025, 5, 15),
  new Date(2025, 5, 16),
];

<Calendar
  disabled={bookedDates}
  modifiers={{ booked: bookedDates }}
  modifiersClassNames={{ booked: 'line-through opacity-50' }}
/>
\`\`\`

### Date Badges (Pricing Example)

\`\`\`tsx
<Calendar
  components={{
    DayButton: ({ children, day, ...props }) => {
      const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
      return (
        <CalendarDayButton day={day} {...props}>
          {children}
          <span className="text-xs">{isWeekend ? '$220' : '$100'}</span>
        </CalendarDayButton>
      );
    },
  }}
/>
\`\`\`

## Hooks

### useCalendar

Manage calendar state:

\`\`\`tsx
import { useCalendar } from '@/frontend/shared/ui/components/Calendar';

const { selected, handleSelect, clear, currentMonth } = useCalendar('single');
\`\`\`

### useTimeSlots

Manage time selection:

\`\`\`tsx
import { useTimeSlots } from '@/frontend/shared/ui/components/Calendar';

const { selectedTime, setSelectedTime, isTimeBooked } = useTimeSlots(
  undefined,
  ['10:00', '14:00'] // booked times
);
\`\`\`

### useDateRange

Manage date range with validation:

\`\`\`tsx
import { useDateRange } from '@/frontend/shared/ui/components/Calendar';

const { range, setRange, isValidRange } = useDateRange(undefined, {
  minDays: 2,
  maxDays: 14,
});
\`\`\`

## Theme Customization

\`\`\`tsx
<Calendar
  theme={{
    variant: 'shadow', // 'default' | 'bordered' | 'shadow' | 'flat'
    size: 'lg', // 'sm' | 'md' | 'lg' | 'xl'
    colorScheme: 'primary', // 'default' | 'primary' | 'secondary' | 'accent'
  }}
/>
\`\`\`

## API Reference

### CalendarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| mode | \`'single' \\| 'multiple' \\| 'range'\` | \`'single'\` | Selection mode |
| selected | \`Date \\| Date[] \\| DateRange\` | - | Selected date(s) |
| onSelect | \`(date) => void\` | - | Selection callback |
| enableTimeSlots | \`boolean\` | \`false\` | Show time picker |
| timeSlots | \`TimeSlot[]\` | - | Time slot configuration |
| enableEvents | \`boolean\` | \`false\` | Show events |
| events | \`CalendarEvent[]\` | \`[]\` | Event list |
| enablePresets | \`boolean\` | \`false\` | Show date presets |
| presets | \`DatePreset[]\` | - | Preset configuration |
| showFooter | \`boolean\` | \`false\` | Show footer |
| showContinueButton | \`boolean\` | \`false\` | Show continue button |
| theme | \`CalendarTheme\` | - | Theme configuration |
| disabled | \`Date[] \\| function \\| object\` | - | Disabled dates |
| className | \`string\` | - | Custom CSS class |

See `types/index.ts` for full API documentation.

## Utils

### Date Formatting

\`\`\`tsx
import { formatDateRange, formatTimeTo12Hour } from '@/frontend/shared/ui/components/Calendar';

formatDateRange(from, to); // "Jun 12, 2025 - Jun 15, 2025"
formatTimeTo12Hour('14:30'); // "2:30 PM"
\`\`\`

### Event Helpers

\`\`\`tsx
import { getEventsForDate, hasEvents } from '@/frontend/shared/ui/components/Calendar';

const todayEvents = getEventsForDate(events, new Date());
const hasEventsToday = hasEvents(events, new Date());
\`\`\`

## Use Cases

### 1. Database Date Field Editor

\`\`\`tsx
import { DatePicker } from '@/frontend/shared/ui/components/Calendar';

<DatePicker
  value={cellValue}
  onChange={onCellChange}
  placeholder="Select date"
/>
\`\`\`

### 2. Hospitality Booking System

\`\`\`tsx
<Calendar
  mode="range"
  enableTimeSlots
  timeSlots={availableSlots}
  disabled={bookedDates}
  modifiers={{ booked: bookedDates }}
  showContinueButton
  continueButtonText="Book Now"
  onContinue={handleBooking}
/>
\`\`\`

### 3. Payroll Period Selector

\`\`\`tsx
<Calendar
  mode="range"
  enablePresets
  presets={[
    { label: 'This Month', value: getPresetDates().thisMonth },
    { label: 'Last Month', value: getLastMonthRange() },
  ]}
  onContinue={generatePayroll}
/>
\`\`\`

### 4. Timeline View

\`\`\`tsx
<Calendar
  mode="single"
  enableEvents
  events={projectMilestones}
  onEventClick={showMilestoneDetails}
/>
\`\`\`

## Directory Structure

\`\`\`
Calendar/
├── components/
│   ├── Calendar.tsx          # Main component
│   ├── CalendarHeader.tsx    # Presets header
│   ├── CalendarFooter.tsx    # Footer with actions
│   ├── TimeSlotPicker.tsx    # Time selection
│   └── EventList.tsx         # Event display
├── hooks/
│   └── index.ts              # Custom hooks
├── utils/
│   └── index.ts              # Helper functions
├── types/
│   └── index.ts              # TypeScript types
├── constants/
│   └── index.ts              # Default configurations
├── lib/
│   └── DatePicker.tsx        # Popover date picker
├── config/
│   └── index.ts              # Configuration
└── index.ts                  # Public API
\`\`\`

## Contributing

When adding new calendar features:

1. Add types to \`types/index.ts\`
2. Add constants to \`constants/index.ts\`
3. Add utilities to \`utils/index.ts\`
4. Create components in \`components/\`
5. Export from \`index.ts\`

## License

Internal use only.
