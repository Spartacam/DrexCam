export interface VideoSegment {
  id?: string;
  segment_id?: string;
  t_start: number;
  t_end: number;
  probability: number;
  boundary: 'onset' | 'continuation' | 'offset' | 'background';
  boundary_confidence?: number;
  transcript: string;
  visual_tags: string[];
}

export interface PolicyClause {
  id: string;
  section: string;
  title: string;
  page: number;
  text: string;
  violation_probability?: number;
  status?: 'VIOLATED' | 'COMPLIANT';
  bounding_box?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    page?: number;
  };
  crop_preview_url?: string;
  is_exclusion?: boolean;
}

export interface ScenarioMeta {
  id: string;
  title: string;
  category: string;
  query: string;
  video: {
    title: string;
    duration_seconds: number;
    total_segments: number;
    incident_start_time: number;
    incident_end_time: number;
  };
  policy: {
    document_name: string;
    total_pages: number;
    primary_violated_clause_id: string;
  };
}

export interface DrexMetadata {
  mode: string;
  latency_ms: number;
  total_questions: number;
  model: string;
}

export interface PeakLocalization {
  segment_id: string;
  probability: number;
  exact_timestamp_seconds: number;
  action_boundaries: {
    onset: string;
    peak: string;
    offset: string;
  };
}

export interface EvaluateResponse {
  status: string;
  drex_metadata: DrexMetadata;
  timeline_waveform: VideoSegment[];
  peak_localization: PeakLocalization;
  clause_evaluations: PolicyClause[];
  top_violation: {
    clause_id: string;
    probability: number;
    grounding: any;
  };
  scores: {
    severity: number;
    speed_excess: number;
    operator_culpability: number;
    liability_exposure: number;
    telematics_confidence: number;
  };
  final_disposition: {
    decision: string;
    confidence: number;
    summary: string;
  };
}

export interface RaceResponse {
  status: string;
  benchmark: {
    winner: string;
    speedup_factor: string;
    drex: {
      model: string;
      latency_ms: number;
      questions_evaluated: number;
      questions_per_second: number;
      input_tokens: number;
      output_tokens: number;
      estimated_cost_usd: number;
      disposition: string;
      confidence: number;
    };
    deepinfra_system2: {
      model: string;
      latency_ms: number;
      questions_evaluated: number;
      questions_per_second: number;
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
      estimated_cost_usd: number;
      disposition: string;
      reasoning_snippet: string;
    };
    economic_comparison: {
      latency_reduction_ms: number;
      cost_savings_percent: string;
      token_savings: number;
    };
  };
  intern_audit: {
    mode: string;
    status: string;
    latency_ms: number;
    packet_markdown: string;
    summary: any;
    supervisor_log: Array<{
      step: string;
      engine?: string;
      status: string;
      details?: string;
      confidence?: number;
    }>;
  };
}

export interface HealthResponse {
  status: string;
  credentials: {
    nace_key_configured: boolean;
    deepinfra_key_configured: boolean;
  };
  models: {
    system1: string;
    system2: string;
  };
}
