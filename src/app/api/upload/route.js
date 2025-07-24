import { NextResponse } from 'next/server';

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

    // Step 1: Parse PDF
    const parseResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/parse-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!parseResponse.ok) {
      const parseError = await parseResponse.json();
      return NextResponse.json(parseError, { status: parseResponse.status });
    }

    const parsedData = await parseResponse.json();
    
    // Step 2: Process with AI
    const processResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/process-cv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        extractedText: parsedData.content.fullText,
        metadata: parsedData.metadata,
      }),
    });

    if (!processResponse.ok) {
      const processError = await processResponse.json();
      return NextResponse.json(processError, { status: processResponse.status });
    }

    const processedData = await processResponse.json();

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