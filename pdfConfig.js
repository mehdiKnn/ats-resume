// lib/pdfConfig.js
import { pdfjs } from 'react-pdf';

if (typeof  window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs`;
}
