
import {
  Component,
  EventEmitter,
  Input,
  Output,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import * as pdfjsLib from 'pdfjs-dist';

import { MentorCareerResourcesService } from '../../../../../services/mentor/career-hub/mentor-career-resources.service';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface RedactionEntry {
  layer: HTMLCanvasElement;
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-mentor-pdf-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-editor.html',
  styleUrl: './pdf-editor.css'
})
export class MentorPdfEditor implements AfterViewInit {

  private resourceService = inject(MentorCareerResourcesService);

  private sanitizer = inject(DomSanitizer);

  previewUrl = signal<SafeResourceUrl | null>(null);
  isLoadingPreview = signal(false);
  isConfirming = signal(false);
  publicationCompleted = signal(false);

  private previewObjectUrl: string | null = null;

  @Input({ required: true }) resourceId!: number;

  @Output() closeEditor = new EventEmitter<void>();

  @ViewChild('pagesContainer')
  pagesContainer!: ElementRef<HTMLDivElement>;

  isLoading = signal(true);
  errorMessage = signal('');

  isSaving = signal(false);
  saveMessage = signal('');

  redactionMode = signal(false);
  redactionCount = signal(0);

  private redactionLayers: HTMLCanvasElement[] = [];

  redactionEntries: RedactionEntry[] = [];

  private hasLoaded = false;

  private drawing = false;
  private startX = 0;
  private startY = 0;

  private currentLayer: HTMLCanvasElement | null = null;

  private activeRedaction: RedactionEntry | null = null;

  ngAfterViewInit(): void {
    this.loadOriginalPdf();
  }

  // ==========================================
  // LOAD ORIGINAL PDF
  // ==========================================

  loadOriginalPdf(): void {

    if (this.hasLoaded) return;

    this.hasLoaded = true;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.resourceService.getOriginalResource(this.resourceId).subscribe({

      next: async (blob) => {

        try {

          const pdfData = await blob.arrayBuffer();

          const pdf = await pdfjsLib.getDocument({
            data: pdfData
          }).promise;

          const container = this.pagesContainer.nativeElement;

          container.innerHTML = '';

          this.redactionLayers = [];
          this.redactionEntries = [];
          this.redactionCount.set(0);

          for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
          ) {

            const page = await pdf.getPage(pageNumber);

            const viewport = page.getViewport({
              scale: 1.3
            });

            const canvas = document.createElement('canvas');

            const context = canvas.getContext('2d');

            if (!context) {
              throw new Error('Unable to create PDF canvas.');
            }

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            canvas.className = 'pdf-page-canvas';

            canvas.style.display = 'block';
            canvas.style.width = `${viewport.width}px`;
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';

            await page.render({
              canvas,
              canvasContext: context,
              viewport
            }).promise;

            const pageWrapper = document.createElement('div');

            pageWrapper.className = 'pdf-page-wrapper';

            const redactionLayer = document.createElement('canvas');

            redactionLayer.width = canvas.width;
            redactionLayer.height = canvas.height;

            redactionLayer.className = 'redaction-layer';

            redactionLayer.style.position = 'absolute';
            redactionLayer.style.top = '0';
            redactionLayer.style.left = '0';
            redactionLayer.style.width = '100%';
            redactionLayer.style.height = '100%';
            redactionLayer.style.pointerEvents = 'none';
            redactionLayer.style.touchAction = 'none';

            redactionLayer.addEventListener('pointerdown', (event) => {
              this.startDrawing(event, redactionLayer);
            });

            redactionLayer.addEventListener('pointermove', (event) => {
              this.drawRedaction(event);
            });

            redactionLayer.addEventListener('pointerup', () => {
              this.stopDrawing();
            });

            redactionLayer.addEventListener('pointercancel', () => {
              this.cancelDrawing();
            });

            this.redactionLayers.push(redactionLayer);

            pageWrapper.appendChild(canvas);
            pageWrapper.appendChild(redactionLayer);

            container.appendChild(pageWrapper);
          }

          this.isLoading.set(false);

        } catch (error) {

          console.error('PDF rendering error:', error);

          this.errorMessage.set(
            'Unable to display this PDF document.'
          );

          this.isLoading.set(false);
        }
      },

      error: (error) => {

        console.error('Original PDF loading error:', error);

        this.errorMessage.set(
          error.error?.message || 'Failed to load the original PDF.'
        );

        this.isLoading.set(false);
      }
    });
  }

  // ==========================================
  // REDACTION MODE
  // ==========================================

toggleRedactionMode(): void {

  const enabled = !this.redactionMode();

  this.redactionMode.set(enabled);

  this.redactionLayers.forEach(layer => {

    layer.style.setProperty(
      'pointer-events',
      enabled ? 'auto' : 'none',
      'important'
    );

    layer.style.setProperty(
      'cursor',
      enabled ? 'crosshair' : 'default',
      'important'
    );

  });

}

  private getCanvasPosition(
    event: PointerEvent,
    layer: HTMLCanvasElement
  ): { x: number; y: number } {

    const rect = layer.getBoundingClientRect();

    const scaleX = layer.width / rect.width;
    const scaleY = layer.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return {
      x: Math.max(0, Math.min(x, layer.width)),
      y: Math.max(0, Math.min(y, layer.height))
    };
  }

  private startDrawing(
    event: PointerEvent,
    layer: HTMLCanvasElement
  ): void {

    if (!this.redactionMode() || this.drawing) return;

    if (event.button !== 0 && event.pointerType === 'mouse') return;

    event.preventDefault();

    this.drawing = true;
    this.currentLayer = layer;

    const position = this.getCanvasPosition(event, layer);

    this.startX = position.x;
    this.startY = position.y;

    this.activeRedaction = {
      layer,
      x: position.x,
      y: position.y,
      width: 0,
      height: 0
    };

    layer.setPointerCapture(event.pointerId);
  }

  private drawRedaction(event: PointerEvent): void {

    if (!this.drawing || !this.currentLayer) return;

    event.preventDefault();

    const position = this.getCanvasPosition(
      event,
      this.currentLayer
    );

    this.activeRedaction = {

      layer: this.currentLayer,

      x: Math.min(this.startX, position.x),

      y: Math.min(this.startY, position.y),

      width: Math.abs(position.x - this.startX),

      height: Math.abs(position.y - this.startY)

    };

    this.redrawLayer(this.currentLayer);
  }

  private redrawLayer(layer: HTMLCanvasElement): void {

    const context = layer.getContext('2d');

    if (!context) return;

    context.clearRect(0, 0, layer.width, layer.height);

    context.fillStyle = '#000000';

    this.redactionEntries
      .filter(entry => entry.layer === layer)
      .forEach(entry => {

        context.fillRect(
          entry.x,
          entry.y,
          entry.width,
          entry.height
        );

      });

    if (this.activeRedaction?.layer === layer) {

      const rect = this.activeRedaction;

      context.fillRect(
        rect.x,
        rect.y,
        rect.width,
        rect.height
      );
    }
  }

  private stopDrawing(): void {

    if (!this.drawing) return;

    if (this.activeRedaction) {

      const rect = this.activeRedaction;

      if (rect.width >= 3 && rect.height >= 3) {

        this.redactionEntries.push(rect);

        this.redactionCount.update(count => count + 1);
      }
    }

    const layer = this.currentLayer;

    this.drawing = false;
    this.currentLayer = null;
    this.activeRedaction = null;

    if (layer) {
      this.redrawLayer(layer);
    }
  }

  private cancelDrawing(): void {

    const layer = this.currentLayer;

    this.drawing = false;
    this.currentLayer = null;
    this.activeRedaction = null;

    if (layer) {
      this.redrawLayer(layer);
    }
  }

  // ==========================================
  // UNDO REDACTION
  // ==========================================

  undoRedaction(): void {

    const lastEntry = this.redactionEntries.pop();

    if (!lastEntry) return;

    this.redactionCount.update(count => count - 1);

    this.redrawLayer(lastEntry.layer);
  }

  // ==========================================
  // CANVAS EXPORT
  // ==========================================

  private canvasToJpeg(
    canvas: HTMLCanvasElement,
    quality: number
  ): Promise<Blob> {

    return new Promise((resolve, reject) => {

      canvas.toBlob(
        blob => {

          if (blob) {
            resolve(blob);
          } else {
            reject(
              new Error('Failed to convert PDF page into an image.')
            );
          }

        },
        'image/jpeg',
        quality
      );

    });
  }

  private async exportPage(
    redactionLayer: HTMLCanvasElement
  ): Promise<Blob> {

    const originalCanvas = redactionLayer.parentElement
      ?.querySelector('.pdf-page-canvas') as HTMLCanvasElement | null;

    if (!originalCanvas) {
      throw new Error('Original PDF page not found.');
    }

    const combinedCanvas = document.createElement('canvas');

    combinedCanvas.width = originalCanvas.width;
    combinedCanvas.height = originalCanvas.height;

    const context = combinedCanvas.getContext('2d');

    if (!context) {
      throw new Error('Unable to create export canvas.');
    }

    context.drawImage(originalCanvas, 0, 0);
    context.drawImage(redactionLayer, 0, 0);

    const maxDimension = 5000;
    const maxPixels = 12_000_000;

    const dimensionScale = Math.min(
      1,
      maxDimension / Math.max(
        combinedCanvas.width,
        combinedCanvas.height
      )
    );

    const pixelScale = Math.sqrt(
      maxPixels /
      (combinedCanvas.width * combinedCanvas.height)
    );

    const scale = Math.min(1, dimensionScale, pixelScale);

    const exportCanvas = document.createElement('canvas');

    exportCanvas.width = Math.floor(combinedCanvas.width * scale);
    exportCanvas.height = Math.floor(combinedCanvas.height * scale);

    const exportContext = exportCanvas.getContext('2d');

    if (!exportContext) {
      throw new Error('Unable to prepare PDF image.');
    }

    exportContext.drawImage(
      combinedCanvas,
      0,
      0,
      exportCanvas.width,
      exportCanvas.height
    );

    const qualities = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65];

    for (const quality of qualities) {

      const blob = await this.canvasToJpeg(
        exportCanvas,
        quality
      );

      if (blob.size <= 2 * 1024 * 1024) {
        return blob;
      }
    }

    throw new Error(
      'A PDF page exceeds the 2MB upload limit. Please try a smaller document.'
    );
  }

  // ==========================================
  // SAVE EDITED PDF
  // ==========================================

  async saveEditedPdf(): Promise<void> {

    if (this.isSaving()) return;

    if (this.redactionCount() === 0) {
      this.saveMessage.set(
        'Please mark personal information before saving.'
      );
      return;
    }

    if (this.redactionLayers.length > 20) {
      this.saveMessage.set(
        'This document has more than 20 pages. The current upload supports up to 20 pages.'
      );
      return;
    }

    this.isSaving.set(true);
    this.saveMessage.set('');

    try {

      const formData = new FormData();

      let totalSize = 0;

      for (
        let index = 0;
        index < this.redactionLayers.length;
        index++
      ) {

        const imageBlob = await this.exportPage(
          this.redactionLayers[index]
        );

        totalSize += imageBlob.size;

        if (totalSize > 20 * 1024 * 1024) {
          throw new Error(
            'The edited document exceeds the 20MB total upload limit.'
          );
        }

        formData.append(
          'pages',
          imageBlob,
          `page-${index + 1}.jpg`
        );
      }

      this.resourceService.saveEditedResource(
        this.resourceId,
        formData
      ).subscribe({

        next: (response) => {

          this.isSaving.set(false);

          this.saveMessage.set(
            response.message ||
            'Edited PDF uploaded successfully. You can now preview it.'
          );

        },

        error: (error) => {

          console.error('Edited PDF upload error:', error);

          this.isSaving.set(false);

          this.saveMessage.set(
            error.error?.message ||
            'Failed to upload the edited PDF.'
          );

        }

      });

    } catch (error) {

      console.error('PDF export error:', error);

      this.isSaving.set(false);

      this.saveMessage.set(
        error instanceof Error
          ? error.message
          : 'Failed to prepare the edited PDF.'
      );
    }
  }

  // ==========================================
  // LOAD ANONYMIZED PREVIEW
  // ==========================================

  loadAnonymizedPreview(): void {

    if (this.isLoadingPreview()) return;

    this.isLoadingPreview.set(true);
    this.saveMessage.set('');

    this.resourceService.previewAnonymizedCopy(
      this.resourceId
    ).subscribe({

      next: (blob) => {

        if (this.previewObjectUrl) {
          URL.revokeObjectURL(this.previewObjectUrl);
        }

        this.previewObjectUrl = URL.createObjectURL(blob);

        this.previewUrl.set(
          this.sanitizer.bypassSecurityTrustResourceUrl(
            this.previewObjectUrl
          )
        );

        this.isLoadingPreview.set(false);

      },

      error: (error) => {

        console.error('PDF preview error:', error);

        this.isLoadingPreview.set(false);

        this.saveMessage.set(
          error.error?.message ||
          'Unable to load the anonymized PDF preview.'
        );

      }

    });
  }

  // ==========================================
  // CONFIRM PUBLICATION
  // ==========================================

  confirmPublication(): void {

    if (this.isConfirming() || this.publicationCompleted()) return;

    if (!this.previewUrl()) {
      this.saveMessage.set(
        'Please preview the anonymized PDF before publication.'
      );
      return;
    }

    this.isConfirming.set(true);
    this.saveMessage.set('');

    this.resourceService.confirmPublication(
      this.resourceId
    ).subscribe({

      next: (response) => {

        this.isConfirming.set(false);
        this.publicationCompleted.set(true);

        this.saveMessage.set(
          response.message ||
          'Your resource has been published successfully.'
        );

      },

      error: (error) => {

        console.error('Publication confirmation error:', error);

        this.isConfirming.set(false);

        this.saveMessage.set(
          error.error?.message ||
          'Failed to confirm publication.'
        );

      }

    });
  }

  // ==========================================
  // CLOSE EDITOR
  // ==========================================

  close(): void {
    this.closeEditor.emit();
  }

}
