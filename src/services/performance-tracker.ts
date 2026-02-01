import type { FileOpenMetrics, MetricsListener } from '@/types/performance';

/**
 * Service for tracking file open performance metrics.
 * Collects timestamps at each step and calculates durations.
 */
class PerformanceTrackerService {
  private currentMetrics: FileOpenMetrics | null = null;
  private history: FileOpenMetrics[] = [];
  private historySnapshot: FileOpenMetrics[] = []; // Cached for useSyncExternalStore
  private listeners: Set<MetricsListener> = new Set();
  private changeListeners: Set<() => void> = new Set();
  private marks: Map<string, number> = new Map();
  private maxHistory = 10;

  /**
   * Start tracking a new file open operation
   */
  start(fileId: string, fileName: string): void {
    this.marks.clear();
    this.currentMetrics = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      fileId,
      fileName,
      timestamp: Date.now(),
      steps: {
        rustReadFile: null,
        ipcRoundTrip: null,
        markdownConversion: null,
        editorInit: null,
        firstRender: null,
      },
      total: null,
    };
    this.marks.set('start', performance.now());
  }

  /**
   * Mark the start of a step
   */
  markStart(step: string): void {
    this.marks.set(`${step}_start`, performance.now());
  }

  /**
   * Mark the end of a step and calculate duration
   */
  markEnd(step: keyof FileOpenMetrics['steps']): void {
    if (!this.currentMetrics) return;

    const startKey = `${step}_start`;
    const startTime = this.marks.get(startKey);

    if (startTime !== undefined) {
      const duration = performance.now() - startTime;
      this.currentMetrics.steps[step] = Math.round(duration * 100) / 100;
    }
  }

  /**
   * Set a step duration directly (e.g., from Rust timing)
   */
  setStepDuration(step: keyof FileOpenMetrics['steps'], duration: number): void {
    if (!this.currentMetrics) return;
    this.currentMetrics.steps[step] = Math.round(duration * 100) / 100;
  }

  /**
   * Complete the current measurement and notify listeners
   */
  complete(): FileOpenMetrics | null {
    if (!this.currentMetrics) return null;

    const startTime = this.marks.get('start');
    if (startTime !== undefined) {
      this.currentMetrics.total = Math.round((performance.now() - startTime) * 100) / 100;
    }

    // Add to history
    this.history.unshift(this.currentMetrics);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }
    // Update cached snapshot for useSyncExternalStore
    this.historySnapshot = [...this.history];

    // Notify listeners
    const metrics = this.currentMetrics;
    this.listeners.forEach(listener => listener(metrics));
    this.changeListeners.forEach(listener => listener());

    const result = this.currentMetrics;
    this.currentMetrics = null;
    this.marks.clear();

    return result;
  }

  /**
   * Get the most recent metrics
   */
  getLatest(): FileOpenMetrics | null {
    return this.history[0] ?? null;
  }

  /**
   * Get metrics history (returns cached snapshot for useSyncExternalStore)
   */
  getHistory(): FileOpenMetrics[] {
    return this.historySnapshot;
  }

  /**
   * Subscribe to metrics updates (with full metrics)
   */
  subscribeWithMetrics(listener: MetricsListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to change notifications (for useSyncExternalStore)
   */
  subscribe(listener: () => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  /**
   * Check if currently tracking
   */
  isTracking(): boolean {
    return this.currentMetrics !== null;
  }

  /**
   * Get current metrics (for editor to continue tracking)
   */
  getCurrentFileId(): string | null {
    return this.currentMetrics?.fileId ?? null;
  }
}

export const performanceTracker = new PerformanceTrackerService();
