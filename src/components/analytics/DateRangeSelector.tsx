import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/analytics';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const PRESET_RANGES: { label: string; value: string; getDates: () => { startDate: Date; endDate: Date } }[] = [
  { 
    label: 'Today', 
    value: 'today',
    getDates: () => ({ startDate: startOfDay(new Date()), endDate: endOfDay(new Date()) })
  },
  { 
    label: 'Last 7 days', 
    value: '7d',
    getDates: () => ({ startDate: startOfDay(subDays(new Date(), 7)), endDate: endOfDay(new Date()) })
  },
  { 
    label: 'Last 30 days', 
    value: '30d',
    getDates: () => ({ startDate: startOfDay(subDays(new Date(), 30)), endDate: endOfDay(new Date()) })
  },
  { 
    label: 'Last 90 days', 
    value: '90d',
    getDates: () => ({ startDate: startOfDay(subDays(new Date(), 90)), endDate: endOfDay(new Date()) })
  },
];

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  const [isCustom, setIsCustom] = useState(value.value === 'custom');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({
    from: value.startDate,
    to: value.endDate
  });

  const handlePresetChange = (presetValue: string) => {
    if (presetValue === 'custom') {
      setIsCustom(true);
      return;
    }

    setIsCustom(false);
    const preset = PRESET_RANGES.find(r => r.value === presetValue);
    if (preset) {
      const dates = preset.getDates();
      onChange({
        label: preset.label,
        value: preset.value,
        startDate: dates.startDate,
        endDate: dates.endDate
      });
    }
  };

  const handleCustomRangeApply = () => {
    if (customRange.from && customRange.to) {
      onChange({
        label: `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`,
        value: 'custom',
        startDate: startOfDay(customRange.from),
        endDate: endOfDay(customRange.to)
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select 
        value={isCustom ? 'custom' : value.value} 
        onValueChange={handlePresetChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_RANGES.map(range => (
            <SelectItem key={range.value} value={range.value}>
              {range.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom range</SelectItem>
        </SelectContent>
      </Select>

      {isCustom && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !customRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {customRange.from ? (
                customRange.to ? (
                  <>
                    {format(customRange.from, "LLL dd, y")} -{" "}
                    {format(customRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(customRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={customRange.from}
              selected={{ from: customRange.from, to: customRange.to }}
              onSelect={(range) => {
                setCustomRange({ from: range?.from, to: range?.to });
              }}
              numberOfMonths={2}
            />
            <div className="p-3 border-t flex justify-end">
              <Button 
                size="sm" 
                onClick={handleCustomRangeApply}
                disabled={!customRange.from || !customRange.to}
              >
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}

      <div className="text-sm text-muted-foreground">
        {format(value.startDate, 'MMM d, yyyy')} - {format(value.endDate, 'MMM d, yyyy')}
      </div>
    </div>
  );
}
