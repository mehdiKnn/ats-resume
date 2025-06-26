import { NextResponse } from 'next/server';
import { generateCVLatexTemplate } from '@/utils/pdf-generator';
import latex from 'node-latex';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

export async function POST(request) {
  try {
    const { cvData } = await request.json();

    if (!cvData) {
      return NextResponse.json({ error: 'CV data is required' }, { status: 400 });
    }

    // Generate LaTeX from the structured CV data
    const latexContent = generateCVLatexTemplate(cvData);
    
    if (!latexContent || latexContent.trim().length === 0) {
      return NextResponse.json({ error: 'Failed to generate LaTeX from CV data' }, { status: 400 });
    }

    // Create output directory
    const outputDir = path.resolve('pdfs');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const texFilePath = path.join(outputDir, `resume_${timestamp}.tex`);
    path.join(outputDir, `resume_${timestamp}.pdf`);
    try {
      // Write the LaTeX content to a file for debugging
      await writeFileAsync(texFilePath, latexContent);

      // Generate PDF using node-latex
      const pdfBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        
        // Enhanced options for node-latex
        const latexOptions = {
          errorLogs: path.join(outputDir, `latex_error_${timestamp}.log`),
          passes: 2,
          cmd: 'pdflatex',
          inputs: [outputDir],
          precompiled: false,
          shellEscape: true,
        };

        const pdfStream = latex(latexContent, latexOptions);

        pdfStream.on('data', (chunk) => {
          chunks.push(chunk);
        });

        pdfStream.on('end', () => {
          const buffer = Buffer.concat(chunks);
          
          if (buffer.length === 0) {
            reject(new Error('Generated PDF is empty'));
            return;
          }
          
          resolve(buffer);
        });

        pdfStream.on('error', (err) => {
          console.error('LaTeX compilation error:', err);
          console.error('Error details:', err.message);
          
          // Try to read error log if it exists
          const errorLogPath = path.join(outputDir, `latex_error_${timestamp}.log`);
          if (fs.existsSync(errorLogPath)) {
            try {
              const errorLog = fs.readFileSync(errorLogPath, 'utf8');
              console.error('LaTeX error log:', errorLog);
            } catch (logError) {
              console.error('Could not read error log:', logError);
            }
          }
          
          reject(new Error(`LaTeX compilation failed: ${err.message}`));
        });

        // Add a timeout to prevent hanging
        setTimeout(() => {
          reject(new Error('LaTeX compilation timed out after 30 seconds'));
        }, 30000);
      });

      // Clean up temporary files
      try {
        await unlinkAsync(texFilePath);
      } catch (cleanupError) {
        console.warn('Could not clean up temporary .tex file:', cleanupError);
      }

      // Return the PDF as a downloadable response
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="resume.pdf"',
          'Content-Length': pdfBuffer.length.toString(),
        },
      });

    } catch (latexError) {
      console.error('PDF generation error:', latexError);
      
      // Clean up files on error
      try {
        await unlinkAsync(texFilePath);
      } catch (cleanupError) {
        console.warn('Could not clean up temporary files:', cleanupError);
      }

      return NextResponse.json(
        { 
          error: 'LaTeX compilation failed', 
          details: latexError instanceof Error ? latexError.message : 'Unknown error',
          suggestion: 'The LaTeX template may have syntax errors. Please check the generated LaTeX content.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in PDF generation:', error);
    return NextResponse.json(
      { 
        error: 'PDF generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}