import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const checks = {
      pdflatex: false,
      path: '',
      version: '',
      packages: [] as string[],
      errors: [] as string[]
    };

    // Check if pdflatex is available
    try {
      const { stdout: pdflatexPath } = await execAsync('which pdflatex');
      checks.pdflatex = true;
      checks.path = pdflatexPath.trim();
      
      // Get version
      try {
        const { stdout: versionOutput } = await execAsync('pdflatex --version');
        checks.version = versionOutput.split('\n')[0];
      } catch (versionError) {
        checks.errors.push(`Version check failed: ${versionError}`);
      }

      // Check common LaTeX packages
      const packagesToCheck = [
        'latexsym',
        'fullpage', 
        'titlesec',
        'marvosym',
        'color',
        'verbatim',
        'enumitem',
        'hyperref',
        'fancyhdr',
        'babel',
        'tabularx',
        'fontawesome5',
        'multicol'
      ];

      for (const pkg of packagesToCheck) {
        try {
          // Try to find the package file
          await execAsync(`kpsewhich ${pkg}.sty`);
          checks.packages.push(pkg);
        } catch {
          // Package not found, but don't add to errors as this is expected
        }
      }

    } catch (pdflatexError) {
      checks.errors.push(`pdflatex not found: ${pdflatexError}`);
    }

    return NextResponse.json({
      status: checks.pdflatex ? 'ready' : 'missing',
      checks,
      installation_guide: {
        macos: 'Install BasicTeX: https://www.tug.org/mactex/morepackages.html or full MacTeX: https://www.tug.org/mactex/',
        ubuntu: 'sudo apt-get install texlive-latex-base texlive-fonts-recommended texlive-latex-extra',
        windows: 'Install MiKTeX: https://miktex.org/download'
      }
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}