
/* ==========================================
   STUDY SESSION DETAILS
========================================== */

export interface StudySessionDetails {
  sessionId: number;
  sessionUuid: string;
  status: string;
}

/* ==========================================
   SESSION DOCUMENT DETAILS
========================================== */

export interface StudySessionDocument {
  documentId: number;
  originalFilename: string;
  totalPages: number;
}

/* ==========================================
   SESSION RESTORATION DETAILS
========================================== */

export interface StudySessionRestoration {
  success: boolean;
  totalPages: number;
  totalChunks: number;
}

/* ==========================================
   SESSION RESTORE RESPONSE
========================================== */

export interface StudySessionRestoreResponse {
  message: string;

  document: StudySessionDocument;

  session: StudySessionDetails;

  restoration: StudySessionRestoration;
}
