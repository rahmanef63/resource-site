import { Clock, Calendar, X } from 'lucide-react';
import { Button } from './Button';

interface SchedulePublisherProps {
  scheduledAt?: Date;
  onChange: (date?: Date) => void;
  label?: string;
  minDate?: Date;
}

export function SchedulePublisher({
  scheduledAt,
  onChange,
  label = "Schedule Publish At",
  minDate = new Date(),
}: SchedulePublisherProps) {
  const handleDateTimeChange = (value: string) => {
    if (!value) {
      onChange(undefined);
      return;
    }
    
    const date = new Date(value);
    if (date < minDate) {
      return;
    }
    
    onChange(date);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const quickScheduleOptions = [
    { label: '1 hour', hours: 1 },
    { label: '4 hours', hours: 4 },
    { label: '1 day', hours: 24 },
    { label: '3 days', hours: 72 },
    { label: '1 week', hours: 168 },
  ];

  const handleQuickSchedule = (hours: number) => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    onChange(date);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium">{label}</label>
        {scheduledAt && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-red-600 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {quickScheduleOptions.map(option => (
          <button
            key={option.label}
            type="button"
            onClick={() => handleQuickSchedule(option.hours)}
            className="px-3 py-2 border rounded-lg text-xs hover:bg-muted transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Calendar className="w-4 h-4 text-foreground/40" />
        </div>
        <input
          type="datetime-local"
          value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ''}
          onChange={(e) => handleDateTimeChange(e.target.value)}
          min={minDate.toISOString().slice(0, 16)}
          className="w-full pl-10 pr-3 py-2 border rounded-lg bg-background"
        />
      </div>

      {scheduledAt && (
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-700">Scheduled for:</p>
            <p className="text-foreground/80">
              {new Date(scheduledAt).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
            <p className="text-xs text-foreground/60 mt-1">
              {getRelativeTime(scheduledAt)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'In the past';
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `In ${days} day${days > 1 ? 's' : ''}`;
  }
  
  return `In ${hours} hour${hours !== 1 ? 's' : ''}`;
}
