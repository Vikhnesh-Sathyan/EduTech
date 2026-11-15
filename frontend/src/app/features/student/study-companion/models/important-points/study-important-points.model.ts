
export interface StudyImportantPoint {
  pointId: number;
  pointTitle: string | null;
  pointContent: string;
  pageNumber: number | null;
  createdAt: string;
}

export interface StudyImportantPointsResponse {
  message: string;
  importantPoints: StudyImportantPoint[];
}

export interface GenerateImportantPointsResponse {
  message: string;
  savedCount: number;
  importantPoints: {
    point_title?: string | null;
    point_content: string;
    page_number?: number | null;
  }[];
}
