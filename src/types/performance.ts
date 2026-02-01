/**
 * Performance tracking type definitions
 */

/**
 * Metrics for a single file open operation
 */
export interface FileOpenMetrics {
  /** Unique identifier for this measurement */
  id: string;
  /** File ID from FileNode */
  fileId: string;
  /** File name for display */
  fileName: string;
  /** Timestamp when measurement started */
  timestamp: number;
  /** Individual step timings in milliseconds */
  steps: {
    /** Time for Rust fs::read_to_string() */
    rustReadFile: number | null;
    /** IPC round-trip overhead (total IPC time minus rust read time) */
    ipcRoundTrip: number | null;
    /** Time for convertToAssetUrls() processing */
    markdownConversion: number | null;
    /** Time for Milkdown/Crepe editor initialization */
    editorInit: number | null;
    /** Time until editor content is painted */
    firstRender: number | null;
  };
  /** Total time from start to finish */
  total: number | null;
}

/**
 * Response from read_file command including timing
 */
export interface ReadFileResponse {
  content: string;
  duration_ms: number;
}

/**
 * Listener callback type for metrics updates
 */
export type MetricsListener = (metrics: FileOpenMetrics) => void;
