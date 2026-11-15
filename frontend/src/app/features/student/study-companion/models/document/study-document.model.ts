
// ==========================================
// DOCUMENT UPLOAD RESPONSE
// ==========================================

export interface StudyDocumentUploadResponse {
  message: string;

  document: {
    documentId: number;
    originalFilename: string;
    totalPages: number | null;
    processingStatus: string;
  };

  session: {
    sessionId: number;
    sessionUuid: string;
  };
}

// ==========================================
// SINGLE STUDY DOCUMENT
// ==========================================

export interface StudyDocumentListItem {
  documentId: number;
  originalFilename: string;
  mimeType: string;
  totalPages: number | null;
  processingStatus: string;

  sessionId: number;
  sessionUuid: string;
  sessionStatus: string;
}

// ==========================================
// DOCUMENT LIST RESPONSE
// ==========================================

export interface StudyDocumentListResponse {
  message: string;
  documents: StudyDocumentListItem[];
}
