'use client';

import '../../pdfConfig.js'
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';


export default function PDFPreview({ cvData }) {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const generatePreview = async () => {
    if (!cvData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/preview-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cvData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF preview');
      }

      const data = await response.json();
      setPdfData(data.pdf);
    } catch (err) {
      setError(err.message);
      console.error('PDF preview error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cvData) {
      generatePreview();
    }
  }, [cvData]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF preview');
  };

  if (loading) {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[60vh] lg:min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Generating PDF preview...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg flex items-center justify-center min-h-[60vh] lg:min-h-full">
        <div className="text-center p-6">
          <div className="text-red-600 mb-2">⚠️ Preview Error</div>
          <div className="text-red-500 text-sm">{error}</div>
          <button 
            onClick={generatePreview}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry Preview
          </button>
        </div>
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className="bg-gray-300 rounded-lg flex items-center justify-center min-h-[60vh] lg:min-h-full">
        <div className="text-gray-600 text-lg">CV Preview</div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="h-full overflow-auto">
        <Document
          file={pdfData}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={typeof window !== 'undefined' ? Math.min(600, window.innerWidth - 100) : 600}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-4 shadow-md"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}