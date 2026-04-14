// TypeScript types mirroring Pydantic schemas from contracts/evidence.py

export type EvidenceStrength = "strong" | "moderate" | "weak" | "none";

export interface Citation {
  index: number;
  paper_id: string;
  title: string;
  year: number | null;
  source: string;
}

export interface Intervention {
  name: string;
  ce_category: string | null;
  effectiveness_pct: number | null;
  n_studies: number;
  outcome_direction: "positive" | "negative" | "mixed" | "unclear";
}

export interface EvidenceSynthesis {
  answer: string;
  confidence: EvidenceStrength;
  interventions: Intervention[];
  evidence_gaps: string[];
  citations: Citation[];
  geo_limits: string | null;
  taxa_limits: string | null;
}

export interface EvidenceRequest {
  question: string;
  species?: string;
  location?: string;
  habitat?: string;
}

export interface EvidenceResult extends EvidenceSynthesis {
  query_id?: string;
}

export type InterventionType =
  | "habitat_restoration"
  | "species_reintro"
  | "protected_area"
  | "invasive_control"
  | "captive_breeding"
  | "community_mgmt"
  | "policy"
  | "monitoring"
  | "other";

export type SpeciesGroup =
  | "mammals"
  | "birds"
  | "reptiles"
  | "fish"
  | "invertebrates"
  | "plants"
  | "fungi"
  | "general";

export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ConservationProject {
  id: number;
  user_id: string;
  name: string;
  description: string;
  species_groups: string;
  intervention_types: string;
  geography: string;
  alert_frequency: string;
  is_active: number;
  created_at: string;
}

export interface Alert {
  id: number;
  user_id: string;
  paper_id: string;
  project_id: number;
  score: number;
  created_at: string;
  sent: number;
  paper_title?: string;
  project_name?: string;
}

export interface Species {
  taxon_id: number;
  name: string;
  category: string;
  class_name: string;
}

export interface QueryHistoryItem {
  id: number;
  question: string;
  query_type: string;
  confidence: string;
  latency_ms: number;
  timestamp: string;
}

export interface DashboardStats {
  total_queries: number;
  total_projects: number;
  total_species: number;
  total_papers: number;
  unread_alerts: number;
}

export interface FeedbackRequest {
  question: string;
  rating: "positive" | "negative";
}
