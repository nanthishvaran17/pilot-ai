export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface Project {
  id: string;
  user_id: string;
  template_id: string;
  name: string;
  raw_idea?: string;
  objective?: string;
  target_audience?: string;
  status: string;
  mode: 'beginner' | 'advanced';
  depth: 'basic' | 'detailed' | 'advanced';
  completeness_score: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  label: string;
  value: any;
  hint?: string;
}

export interface Question {
  id: string;
  section_id: string;
  key: string;
  label: string;
  explanation?: string;
  question_type: string;
  options: QuestionOption[];
  default_value?: any;
  is_required: boolean;
  help_text?: string;
  recommendation?: string;
  order_index: number;
  is_visible: boolean;
  current_response?: any;
  is_confirmed: boolean;
  is_inferred: boolean;
  is_skipped: boolean;
  is_undecided: boolean;
}

export interface Section {
  id: string;
  key: string;
  title: string;
  description?: string;
  order_index: number;
  icon: string;
  is_required: boolean;
  questions: Question[];
  is_completed: boolean;
  answered_count: number;
  required_count: number;
}

export interface ContradictionItem {
  id: string;
  severity: 'warning' | 'conflict';
  title: string;
  description: string;
  conflicting_keys: string[];
  suggested_resolution: string;
}

export interface MissingRequirementItem {
  id: string;
  category: string;
  label: string;
  importance: 'critical' | 'recommended';
  reason: string;
  quick_fix_question_key?: string;
}

export interface QuestionnaireState {
  project_id: string;
  project_name: string;
  mode: string;
  depth: string;
  completeness_score: number;
  sections: Section[];
  total_questions: number;
  visible_questions: number;
  answered_questions: number;
  contradictions: ContradictionItem[];
  missing_requirements: MissingRequirementItem[];
}

export interface Requirement {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: string;
  moscow_priority: 'must_have' | 'should_have' | 'could_have' | 'future_consideration';
  importance: number;
  time_savings?: string;
  users_affected?: string;
  complexity: 'Low' | 'Medium' | 'High';
  dependencies: string[];
  is_mvp: boolean;
  source: string;
  created_at: string;
}

export interface LiveRequirementsSummary {
  project_id: string;
  project_name: string;
  objective?: string;
  target_audience?: string;
  status: string;
  completeness_score: number;
  confirmed_answers: Record<string, any>;
  inferred_suggestions: Record<string, any>;
  unanswered_questions: any[];
  moscow_summary: {
    must_have: Requirement[];
    should_have: Requirement[];
    could_have: Requirement[];
    future_consideration: Requirement[];
  };
  mvp_features: string[];
  assumptions: any[];
  unresolved_decisions: any[];
}

export interface Blueprint {
  id: string;
  project_id: string;
  version: number;
  title: string;
  content_json: Record<string, any>;
  markdown_content: string;
  created_at: string;
}

export interface ExportJob {
  id: string;
  project_id: string;
  export_format: string;
  file_name: string;
  file_size: number;
  download_url: string;
  created_at: string;
}

export interface IdeaAnalysisResponse {
  detected_project_name: string;
  objective: string;
  target_audience: string;
  core_problem: string;
  expected_outcomes: string[];
  suggested_modules: string[];
  recommended_template_key: string;
  detected_constraints: string[];
  missing_critical_info: string[];
  extracted_answers: Record<string, any>;
}
