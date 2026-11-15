
export interface StudyDocumentPage {
  pageNumber: number;
  content: string;
}

export interface StudyDocumentPagesResponse {
  message: string;

  document: {
    documentId: number;
    originalFilename: string;
    totalPages: number;
  };

  pages: StudyDocumentPage[];
}
