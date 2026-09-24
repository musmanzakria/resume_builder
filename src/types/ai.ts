export interface AvailableModelItem {
  id: string; // Model Code / ID, e.g. "gemini-3.8-flash"
  name: string; // Display Name, e.g. "Gemini 3.8 Flash (Latest Workhorse)"
  isCustom?: boolean;
}

export interface ApiProfileBackoffConfig {
  maxRetries: number;     // e.g. 2 (1 initial + 2 retries = 3 attempts)
  initialDelayMs: number; // e.g. 1500 ms (1.5s)
  maxDelayMs: number;     // e.g. 8000 ms (8s)
  timeoutMs: number;      // e.g. 65000 ms (65s)
  cascadeDelayMs?: number; // e.g. 2000 ms (pause before cascading to next model in sequence)
}

export interface ApiProfile {
  id: string;
  name: string;           // e.g. "Usman's API", "Man Spider API", "Paid API"
  apiKey: string;         // Gemini API Key
  enabled: boolean;
  modelCascade: string[]; // Ordered list of model IDs to cycle through
  modelAttempts?: Record<string, number>; // Specific attempts per model code, e.g. { "gemini-3.8-flash": 1, "gemini-3.6-flash": 2 }
  backoffConfig: ApiProfileBackoffConfig;
}

export const DEFAULT_AVAILABLE_MODELS: AvailableModelItem[] = [
  { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash (Latest Workhorse)" },
  { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash (Hybrid Reasoning)" },
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash (Fast & Stable)" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
];

export const DEFAULT_BACKOFF_CONFIG: ApiProfileBackoffConfig = {
  maxRetries: 2,
  initialDelayMs: 1500,
  maxDelayMs: 8000,
  timeoutMs: 65000,
  cascadeDelayMs: 2000,
};
