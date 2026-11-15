
import { Component } from '@angular/core';

import { DocumentUpload } from '../../components/document/document-upload/document-upload';
import { DocumentList } from '../../components/document/document-list/document-list';

@Component({
  selector: 'app-study-companion-page',
  imports: [
    DocumentUpload,
    DocumentList
  ],
  templateUrl: './study-companion-page.html',
  styleUrl: './study-companion-page.css',
})
export class StudyCompanionPage {}
