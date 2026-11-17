
import * as pdfjsLib from "pdfjs-dist";

// Configure the local PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
    "/assets/pdfjs/pdf.worker.min.mjs";

export const pdfjs = pdfjsLib;
