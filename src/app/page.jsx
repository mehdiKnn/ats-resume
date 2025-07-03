'use client';

import { useState, useRef } from 'react';
import PDFPreview from '@/components/PDFPreview';

export default function Home() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const paymentSectionRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full">
        <h1 className="text-4xl font-bold text-center mb-16 text-blue-600">
          Transforme ton CV design en CV ATS<br />en seulement 1mn
        </h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-lg mx-auto">
          <div className="text-center">
            {/* Cloud upload icon */}
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            
            <p className="text-base text-gray-600 mb-6">
              Drag & drop your PDF file here or
            </p>
            
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className="cursor-pointer inline-block px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Choose PDF file
            </label>
            
            {file && (
              <p className="mt-3 text-sm text-gray-600">
                Selected: {file.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="px-12 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            {loading ? 'Processing...' : 'GO'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div ref={paymentSectionRef} className="max-w-7xl mx-auto mt-8 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-screen py-8">
              {/* CV Preview */}
              <PDFPreview cvData={cvData} />
              
              {/* Payment Section */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-2xl font-bold text-blue-600 mb-4">Ton cv est prêt !</h2>
                
                <p className="text-gray-600 mb-4 text-sm">
                  ton cv a bien était transformé et optimisé pour les logiciels ATS !
                </p>
                
                {/* Features */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">Téléchargement immédiat après paiement</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 text-sm">Support client 24/7</span>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-3">0,99€</div>
                  <button
                    onClick={generatePDF}
                    disabled={!cvData || loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold mb-4"
                  >
                    {loading ? 'Generating...' : '📥 Download'}
                  </button>
                </div>
                
                {/* Payment Form */}
                <div className="border-t pt-4">
                  <h3 className="text-base font-medium text-gray-400 mb-4">Stripe Payment Form</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Card information</label>
                      <div className="space-y-2">
                        <div className="relative">
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="1234 1234 1234 1234"
                          />
                          <div className="absolute right-3 top-2 flex gap-1">
                            <div className="w-5 h-3 bg-blue-600 rounded text-xs text-white flex items-center justify-center">VISA</div>
                            <div className="w-5 h-3 bg-red-600 rounded text-xs text-white flex items-center justify-center">MC</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="MM / YY"
                          />
                          <input 
                            type="text" 
                            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="CVC"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Cardholder name</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Full name on card"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Country or region</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>United States</option>
                        <option>France</option>
                        <option>Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ZIP"
                      />
                    </div>
                    
                    <button className="w-full py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors font-medium">
                      Pay
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      By clicking Pay, you agree to the Link Terms and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}