
export interface Improvement {
  category: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface SpellingError {
  original: string;
  suggestion: string;
  context: string;
}

export interface JobAlignment {
  matchPercentage: number;
  missingKeywords: string[];
  suggestedKeywords: string[];
  roleFitSummary: string;
}

export interface AnalysisResult {
  overallScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: Improvement[];
  spellingErrors: SpellingError[];
  jobAlignment: JobAlignment;
}

export interface JobDetails {
  title: string;
  company: string;
  description: string;
}
