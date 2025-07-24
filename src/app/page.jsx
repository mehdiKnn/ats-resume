'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import PDFPreview from '@/components/PDFPreview';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const paymentSectionRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('Please select a PDF file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      setError(null);
    } else if (droppedFile) {
      setError('Please drop a PDF file');
    }
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const data = await response.json();
      setResult(data);
      setCvData(data.cv_data);
      
      // Auto-scroll to payment section after processing
      setTimeout(() => {
        paymentSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  const generatePDF = async () => {
    if (!cvData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData: cvData
        }),
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${file?.name?.replace('.pdf', '') || 'resume'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during PDF generation';
      setError(`PDF generation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <Image
        src="/background_blur.png"
        alt="Background"
        fill
        className="object-cover -z-10"
        priority
      />
      {/* Header */}
      <header className="flex items-center justify-between p-4 sm:p-6">
        <h1 className="text-xl font-black text-black sm:text-2xl font-roboto">
          ResumeATS
        </h1>
        <button 
          type="button"
          className="px-3 py-2 text-sm font-bold text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 sm:px-4 sm:py-2 sm:text-base font-roboto"
        >
          Contact
        </button>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center flex-1">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="mb-4 text-3xl font-black leading-tight text-black sm:text-4xl lg:text-5xl font-roboto">
            Transforme 🚀 ton CV design<br />
            en Cv ATS en seulement 1mn ⚡
          </h2>
          <p className="px-4 text-lg font-medium text-gray-800 sm:px-0 sm:text-xl font-roboto">
            Fais partie des CV que les recruteurs lisent vraiment
          </p>
        </div>
        
        <div className="w-full max-w-xs mx-auto mb-6 p-6 bg-white shadow-lg rounded-2xl sm:max-w-lg sm:mb-8 sm:p-8 lg:max-w-2xl lg:p-12">
          <div className="text-center">
            {/* Drag and Drop Area */}
            <div 
              className={`p-8 mb-6 transition-colors border-2 border-dashed rounded-lg cursor-pointer ${
                isDragging 
                  ? 'bg-orange-50 border-orange-500' 
                  : 'border-gray-300 hover:bg-gray-50 hover:border-orange-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBoxClick}
            >
              {/* Upload icon */}
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto text-orange-500 sm:w-16 sm:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <p className="text-base text-gray-600 sm:text-lg font-roboto">
                Cliquez ici ou glissez votre PDF
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload PDF file"
              />
            </div>
            
            {file && (
              <p className="mb-4 text-sm text-gray-600 font-roboto">
                Selected: {file.name}
              </p>
            )}
            
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-6 py-3 text-base font-bold text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed sm:px-8 sm:py-4 sm:text-lg lg:px-10 lg:py-4 font-roboto"
            >
              {loading ? 'Processing...' : 'Optimiser mon CV'}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 px-4 mb-6 text-xs sm:gap-6 sm:px-0 sm:mb-8 sm:text-sm lg:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-xs text-gray-700 sm:text-sm font-roboto">100 % sécurisé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="text-xs text-gray-700 sm:text-sm font-roboto">+10 000 CV optimisés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="text-xs text-gray-700 sm:text-sm font-roboto">Satisfait ou rembourse</span>
          </div>
        </div>


        {error && (
          <div className="p-4 mt-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div ref={paymentSectionRef} className="w-full">
            <div className="min-h-screen pb-16">
              <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
                {/* CV Preview - Left Side - Centered */}
                <div className="flex items-center justify-center p-4 sm:p-8">
                  <div className="h-[80vh] overflow-x-auto overflow-y-auto">
                    <div className="min-w-fit">
                      <PDFPreview cvData={cvData} />
                    </div>
                  </div>
                </div>
                
                {/* CV Benefits - Right Side - Centered */}
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="w-full max-w-md">
                    {/* Header with celebration emoji */}
                    <div className="mb-8 text-center">
                      <div className="mb-4 text-4xl">🎉</div>
                      <h2 className="mb-4 text-3xl font-black text-black font-roboto">
                        Ton CV optimisé est prêt !
                      </h2>
                      <p className="mb-8 text-lg text-gray-600 font-roboto">
                        Il est maintenant parfaitement lisible par les logiciels de recrutement ATS.
                      </p>
                    </div>
                    
                    {/* CV Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-base text-gray-700 font-roboto">Ton CV a bien été transformé pour les ATS</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-base text-gray-700 font-roboto">Prêt à l'emploi</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-base text-gray-700 font-roboto">Optimisé par IA</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-base text-gray-700 font-roboto">ATS friendly</span>
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <div className="mt-8">
                      <button
                        type="button"
                        onClick={generatePDF}
                        disabled={!cvData || loading}
                        className="w-full py-4 text-lg font-bold text-white transition-colors bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-roboto"
                      >
                        {loading ? 'Génération...' : 'Télécharger mon CV optimisé'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Only show when not in results view */}

        <footer className="flex flex-wrap items-center justify-center gap-4 p-4 sm:justify-start sm:p-6 sm:gap-6 lg:gap-8">
          <span className="text-xs text-gray-600 sm:text-sm font-roboto">About</span>
          <span className="text-xs text-gray-600 sm:text-sm font-roboto">CGU</span>
          <span className="text-xs text-gray-600 sm:text-sm font-roboto">Contact</span>
          <span className="text-xs text-gray-600 sm:text-sm font-roboto">Support</span>
        </footer>
    </div>
  );
}