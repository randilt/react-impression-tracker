export interface ImpressionData {
  elementId: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface StorageConfig {
  type: "localStorage" | "sessionStorage" | "cookie";
  expirationDays?: number; // For cookies
}

export interface APIConfig {
  endpoint: string;
  method?: "POST" | "PUT";
  headers?: Record<string, string>;
  formatData?: (data: ImpressionData[]) => any;
}

export interface ImpressionTrackerProps {
  elementId: string;
  children: React.ReactNode;
  onImpression?: (data: ImpressionData) => void;
  metadata?: Record<string, any>;
  viewDuration?: number; // Duration in ms required for valid impression
  batchInterval?: number; // Interval in ms to batch and send impressions
  storage?: StorageConfig;
  api?: APIConfig;
  disabled?: boolean;
}
