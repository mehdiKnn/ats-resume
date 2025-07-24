import { NextResponse } from 'next/server';
import { parsePDF } from '@/lib/pdfParser';
import { processCVWithAI } from '@/lib/cvProcessor';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf');
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Step 1: Parse PDF directly
    let parsedData;
    try {
      parsedData = await parsePDF(file);
    } catch (parseError) {
      console.error('PDF parsing failed:', parseError);
      return NextResponse.json({ 
        error: `PDF parsing failed: ${parseError.message}` 
      }, { status: 500 });
    }
    
    // Step 2: Process with AI directly
    let processedData;
    try {
      processedData = await processCVWithAI(
        parsedData.content.fullText,
        parsedData.metadata
      );
    } catch (aiError) {
      console.error('AI processing failed:', aiError);
      return NextResponse.json({ 
        error: `AI processing failed: ${aiError.message}` 
      }, { status: 500 });
    }

    // Combine both parsed and processed data
    const structuredData = {
      metadata: {
        title: 'CV Document',
        author: processedData.cv_data?.cv_template?.sections?.header?.name || 'Unknown',
        subject: 'Resume/CV',
        creator: 'pdfjs-dist',
        producer: 'CV Processor',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
        pages: parsedData.metadata.pages,
      },
      cv_data: processedData.cv_data,
      content: parsedData.content,
      links: parsedData.links,
      latex: processedData.latex,
      statistics: parsedData.statistics,
      processing: {
        method: 'pdfjs-dist (Text Extraction) + Gemini (JSON Structuring)',
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(structuredData);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}