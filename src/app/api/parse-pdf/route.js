import { NextResponse } from 'next/server';
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import path from 'path';

GlobalWorkerOptions.workerSrc = `file://${path.resolve(
    'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs'
)}`;
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

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Parse PDF using pdfjs-dist
    const loadingTask = getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    let extractedText = '';
    let structuredPages = [];
    const links = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      structuredPages.push({
        pageNumber: pageNum,
        content: pageText
      });
      
      extractedText += pageText + '\n';

      // Process annotations for hyperlinks
      const annotations = await page.getAnnotations();
      annotations.forEach(annotation => {
        if (annotation.subtype === 'Link' && annotation.url) {
          const rect = annotation.rect;
          const xMin = Math.min(rect[0], rect[2]);
          const xMax = Math.max(rect[0], rect[2]);
          const yMin = Math.min(rect[1], rect[3]);
          const yMax = Math.max(rect[1], rect[3]);
          let anchorText = '';
          textContent.items.forEach(item => {
            const x = item.transform[4];
            const y = item.transform[5];
            if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
              anchorText += item.str + ' ';
            }
          });
          anchorText = anchorText.trim().replace(/\s+/g, ' ');
          if (anchorText) {
            links.push({ url: annotation.url, context: anchorText });
          }
        }
      });

      // Process URLs found in text content
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      let match;
      while ((match = urlRegex.exec(pageText)) !== null) {
        const url = match[0];
        const start = match.index;
        const end = start + url.length;
        const contextStart = Math.max(0, start - 30);
        const contextEnd = Math.min(pageText.length, end + 30);
        let context = pageText.slice(contextStart, contextEnd);
        // Clean up the context to avoid truncated words
        context = context.replace(/^\S*\s/, '').replace(/\s\S*$/, '');
        links.push({ url, context });
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
      .trim();
    
    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF. Please ensure the document is readable and contains text.' },
        { status: 400 }
      );
    }

    const parsedData = {
      metadata: {
        title: 'PDF Document',
        pages: numPages,
        extractionDate: new Date().toISOString(),
        method: 'pdfjs-dist'
      },
      content: {
        fullText: extractedText,
        pages: structuredPages.map(page => ({
          pageNumber: page.pageNumber,
          text: page.content.trim(),
          wordCount: page.content.trim().split(/\s+/).filter(word => word.length > 0).length
        })),
        paragraphs: extractedText
          .split(/\n\s*\n/)
          .filter(p => p.trim().length > 0)
          .map((paragraph, index) => ({
            id: index + 1,
            text: paragraph.trim().replace(/\s+/g, ' '),
            wordCount: paragraph.trim().split(/\s+/).filter(word => word.length > 0).length,
          })),
      },
      links: links,
      statistics: {
        totalWords: extractedText.split(/\s+/).filter(word => word.length > 0).length,
        totalCharacters: extractedText.length,
        totalParagraphs: extractedText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
        totalPages: structuredPages.length,
      }
    };

    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to parse PDF' },
      { status: 500 }
    );
  }
}