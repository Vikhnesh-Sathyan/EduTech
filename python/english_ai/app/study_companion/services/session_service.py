
from uuid import uuid4


class StudySessionService:

    def __init__(self):

        self.sessions = {}

    # ==========================================
    # CREATE SESSION
    # ==========================================

    def create_session(self, document_service):

        if document_service is None:
            raise ValueError("Document service is required.")

        session_id = str(uuid4())

        self.sessions[session_id] = document_service

        return {
            "session_id": session_id,
            "document_service": document_service
        }

    # ==========================================
    # GET SESSION
    # ==========================================

    def get_session(self, session_id):

        session = self.sessions.get(session_id)

        if session is None:
            raise ValueError("Study session not found.")

        return session

    # ==========================================
    # DELETE SESSION
    # ==========================================

    def delete_session(self, session_id):

        session = self.sessions.pop(session_id, None)

        if session is None:
            raise ValueError("Study session not found.")

        return {
            "success": True,
            "message": "Study session deleted successfully."
        }


# One shared session manager for all routes.
study_session_service = StudySessionService()
