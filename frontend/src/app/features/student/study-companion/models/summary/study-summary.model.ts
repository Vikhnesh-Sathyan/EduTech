
export type StudySummaryLength =
  | 'short'
  | 'medium'
  | 'detailed';

export interface StudySummaryRequest {
  summary_type: StudySummaryLength;
}

export interface StudyPageSummaryRequest
  extends StudySummaryRequest {
  start_page: number;
  end_page: number;
}

export interface StudySummaryResponse {
  message: string;
  summaryId: number;
  summaryType: StudySummaryLength;
  summary: string;
}

export interface StudyPageSummaryResponse {
  message: string;
  summaryId: number;
  summaryType: StudySummaryLength;
  startPage: number;
  endPage: number;
  summary: string;
}

export interface StudySavedSummary {
  summaryId: number;
  summaryType: 'full' | 'page_wise' | 'custom';
  startPage: number | null;
  endPage: number | null;
  summaryContent: string;
  createdAt: string;
}

export interface StudySummariesResponse {
  message: string;
  summaries: StudySavedSummary[];
}
