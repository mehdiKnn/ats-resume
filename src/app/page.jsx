'use client';

import { useState, useRef } from 'react';
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
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: 'url(/background_blur.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Header */}
      <header className="flex justify-between items-center p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-roboto font-black text-black">
          ResumeATS
        </h1>
        <button className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-roboto font-bold">
          contact
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-roboto font-black text-black mb-4 leading-tight">
            Transforme 🚀 ton CV design<br />
            en Cv ATS en seulement 1mn ⚡
          </h2>
          <p className="text-gray-800 text-lg sm:text-xl font-roboto font-medium px-4 sm:px-0">
            Fais partie des CV que les recruteurs lisent vraiment
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-12 mb-6 sm:mb-8 max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto w-full">
          <div className="text-center">
            {/* Drag and Drop Area */}
            <div 
              className={`border-2 border-dashed rounded-lg p-8 mb-6 cursor-pointer transition-colors ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBoxClick}
            >
              {/* Upload icon */}
              <div className="mb-4">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              
              <p className="text-base sm:text-lg text-gray-600 font-roboto">
                Cliquez ici ou glissez votre PDF
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            
            {file && (
              <p className="mb-4 text-sm text-gray-600 font-roboto">
                Selected: {file.name}
              </p>
            )}
            
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-roboto font-bold text-base sm:text-lg"
            >
              {loading ? 'Processing...' : 'Optimiser mon CV'}
            </button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 text-xs sm:text-sm px-4 sm:px-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-gray-700 font-roboto text-xs sm:text-sm">100 % sécurisé</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📄</span>
            <span className="text-gray-700 font-roboto text-xs sm:text-sm">+10 000 CV optimisés</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💸</span>
            <span className="text-gray-700 font-roboto text-xs sm:text-sm">Satisfait ou remboursé</span>
          </div>
        </div>


        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div ref={paymentSectionRef} className="w-full">
            <div className="min-h-screen pb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
                {/* CV Preview - Left Side - Centered */}
                <div className="p-4 sm:p-8 flex items-center justify-center">
                  <div className="h-[80vh] overflow-y-auto overflow-x-auto">
                    <div className="min-w-fit">
                      <PDFPreview cvData={cvData} />
                    </div>
                  </div>
                </div>
                
                {/* CV Benefits - Right Side - Centered */}
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="max-w-md w-full">
                    {/* Header with celebration emoji */}
                    <div className="text-center mb-8">
                      <div className="text-4xl mb-4">🎉</div>
                      <h2 className="text-3xl font-roboto font-black text-black mb-4">
                        Ton CV optimisé est prêt !
                      </h2>
                      <p className="text-gray-600 text-lg font-roboto mb-8">
                        Il est maintenant parfaitement lisible par les logiciels de recrutement ATS.
                      </p>
                    </div>
                    
                    {/* CV Benefits */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-base font-roboto">Ton CV a bien été transformé pour les ATS</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-base font-roboto">Prêt à l'emploi</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-base font-roboto">Optimisé par IA</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-base font-roboto">ATS friendly</span>
                      </div>
                    </div>
                    
                    {/* Download Button */}
                    <div className="mt-8">
                      <button
                        onClick={generatePDF}
                        disabled={!cvData || loading}
                        className="w-full py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-roboto font-bold text-lg"
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
      </div>

      {/* Footer - Only show when not in results view */}

        <footer className="flex flex-wrap justify-center sm:justify-start items-center p-4 sm:p-6 gap-4 sm:gap-6 lg:gap-8">
          <span className="text-gray-600 text-xs sm:text-sm font-roboto">About</span>
          <span className="text-gray-600 text-xs sm:text-sm font-roboto">CGU</span>
          <span className="text-gray-600 text-xs sm:text-sm font-roboto">Contact</span>
          <span className="text-gray-600 text-xs sm:text-sm font-roboto">Support</span>
        </footer>
    </div>
  );
}