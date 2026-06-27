export type TaskType = 
  | 'math' 
  | 'coding' 
  | 'summarization' 
  | 'fact_checking' 
  | 'translation' 
  | 'safety' 
  | 'jailbreak';

export interface PromptStrategy {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'reasoning' | 'safety' | 'agentic' | 'structured';
  template: string;
  isCustom?: boolean;
}

export interface BenchmarkTask {
  type: TaskType;
  name: string;
  description: string;
  dataset: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    context?: string;
  }>;
}

export interface EvaluationMetrics {
  accuracy: number;            // 0 to 100
  hallucinationRate: number;   // 0 to 100
  consistency: number;         // 0 to 100
  latencyMs: number;
  tokensUsed: number;
  costUSD: number;
  safetyScore: number;         // 0 to 100
  jailbreakResistance: number; // 0 to 100
  reasoningQuality: number;    // 0 to 100
}

export interface ExperimentRun {
  id: string;
  timestamp: string;
  strategyId: string;
  strategyName: string;
  taskType: TaskType;
  taskName: string;
  model: string;
  temperature: number;
  promptText: string;
  rawResponse: string;
  metrics: EvaluationMetrics;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
}

export interface SafetyReport {
  strategyId: string;
  strategyName: string;
  jailbreakAttempts: number;
  jailbreakBypasses: number;
  alignmentScore: number;      // 0 to 100
  manipulationResistance: number; // 0 to 100
  harmfulOutputRate: number;   // 0 to 100 (lower is better)
  summary: string;
}

export interface ModelMetadata {
  id: string;
  name: string;
  provider: string;
  costPer1kInput: number;
  costPer1kOutput: number;
  maxContext: number;
  type: 'flash' | 'pro' | 'custom';
}
