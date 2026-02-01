'use client';

import { useState, useSyncExternalStore } from 'react';
import { performanceTracker } from '@/services/performance-tracker';
import { useSettings } from '@/contexts/settings-context';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconActivity } from '@tabler/icons-react';

function formatMs(ms: number | null): string {
  if (ms === null) return '-';
  if (ms < 1) return '<1ms';
  return `${Math.round(ms)}ms`;
}

function ProgressBar({ value, max }: { value: number | null; max: number }) {
  if (value === null) return <div className="h-1.5 w-16 bg-muted rounded" />;
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-16 bg-muted rounded overflow-hidden">
      <div
        className="h-full bg-primary rounded transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function MetricRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number | null;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-muted-foreground w-24">{label}</span>
      <ProgressBar value={value} max={max} />
      <span className="font-mono w-12 text-right">{formatMs(value)}</span>
    </div>
  );
}

// Subscribe to performance tracker updates using useSyncExternalStore
function usePerformanceMetrics() {
  const subscribe = (callback: () => void) => {
    return performanceTracker.subscribe(callback);
  };

  const getSnapshot = () => performanceTracker.getLatest();
  const getHistorySnapshot = () => performanceTracker.getHistory();

  const metrics = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const history = useSyncExternalStore(subscribe, getHistorySnapshot, getHistorySnapshot);

  return { metrics, history };
}

export function DevPanel() {
  const { settings } = useSettings();
  const { metrics, history } = usePerformanceMetrics();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if dev mode is off
  if (!settings.devMode) {
    return null;
  }

  // Get the metrics to display (selected from history or latest)
  // If selectedId is set but not found in history, fall back to latest
  const selectedFromHistory = selectedId ? history.find((m) => m.id === selectedId) : null;
  const displayMetrics = selectedFromHistory ?? metrics;

  // Calculate max for progress bars (use total or sum of steps)
  const maxTime = displayMetrics?.total ?? 100;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full',
              'bg-background/80 backdrop-blur-sm border shadow-sm',
              'text-xs font-mono transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              metrics ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <IconActivity className="size-3.5" />
            {metrics ? formatMs(metrics.total) : 'No data'}
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-72 p-3"
          sideOffset={8}
        >
          {displayMetrics ? (
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate max-w-[160px]">
                  {displayMetrics.fileName}
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  {formatMs(displayMetrics.total)}
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-1.5">
                <MetricRow
                  label="Disk read"
                  value={displayMetrics.steps.rustReadFile}
                  max={maxTime}
                />
                <MetricRow
                  label="IPC overhead"
                  value={displayMetrics.steps.ipcRoundTrip}
                  max={maxTime}
                />
                <MetricRow
                  label="MD conversion"
                  value={displayMetrics.steps.markdownConversion}
                  max={maxTime}
                />
                <MetricRow
                  label="Editor init"
                  value={displayMetrics.steps.editorInit}
                  max={maxTime}
                />
                <MetricRow
                  label="First render"
                  value={displayMetrics.steps.firstRender}
                  max={maxTime}
                />
              </div>

              {/* History selector */}
              {history.length > 1 && (
                <div className="pt-2 border-t">
                  <Select
                    value={selectedId ?? 'latest'}
                    onValueChange={(value) =>
                      setSelectedId(value === 'latest' ? null : value)
                    }
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select measurement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Latest</SelectItem>
                      {history.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.fileName} ({formatMs(m.total)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-2">
              Open a file to see metrics
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
