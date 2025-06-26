import { CVSchema } from '../types/cv-schema';

export function generateLatexFromSchema(cvData: CVSchema): string {
  const sections = cvData.cv_template.sections;
  const renderingRules = cvData.cv_template.rendering_rules;

  // LaTeX escape function
  const escapeLaTeX = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/\%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  };

  // Date formatting function
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    // Simple date formatting - can be enhanced based on renderingRules.date_format
    return escapeLaTeX(dateStr);
  };

  let latex = `\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{multicol}
\\setlength{\\multicolsep}{-3.0pt}
\\setlength{\\columnsep}{-1pt}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.19in}
\\addtolength{\\topmargin}{-.7in}
\\addtolength{\\textheight}{1.4in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large\\bfseries
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{\\parbox[t]{0.7\\textwidth}{\\raggedright #1}} & \\textbf{\\small\\parbox[t]{0.25\\textwidth}{\\raggedleft #2}} \\\\
      \\textit{\\small\\parbox[t]{0.7\\textwidth}{\\raggedright #3}} & \\textit{\\small\\parbox[t]{0.25\\textwidth}{\\raggedleft #4}} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\projectEntry}[2]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{1.0\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & \\textbf{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.0in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

% New command for simple paragraph text
\\newcommand{\\resumeParagraph}[1]{
  \\item\\small{
    \\begin{flushleft}
      #1
    \\end{flushleft}
    \\vspace{-10pt}
  }
}

\\begin{document}

`;

  // Header section
  if (sections.header) {
    const header = sections.header;
    const contact = header.contact_info;
    
    latex += `\\begin{center}
    {\\Huge \\scshape ${escapeLaTeX(header.name)}} \\\\ \\vspace{1pt}
    {\\Large ${escapeLaTeX(header.title)}} \\\\ \\vspace{1pt}
    ${contact.location ? `${escapeLaTeX(contact.location.value)} \\\\ \\vspace{1pt}` : ''}
    \\small `;
    
    // Contact info
    const contactParts = [];
    if (contact.phone) {
      contactParts.push(`\\raisebox{-0.1\\height}\\faPhone\\ ${escapeLaTeX(contact.phone.value)}`);
    }
    if (contact.email) {
      contactParts.push(`\\href{${contact.email.link}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${escapeLaTeX(contact.email.value)}}}`);
    }
    if (contact.linkedin) {
      contactParts.push(`\\href{${contact.linkedin.link}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{${escapeLaTeX(contact.linkedin.value)}}}`);
    }
    if (contact.portfolio) {
      contactParts.push(`\\href{${contact.portfolio.link}}{\\raisebox{-0.2\\height}\\faGlobe\\ \\underline{${escapeLaTeX(contact.portfolio.value)}}}`);
    }
    
    latex += contactParts.join(' ~ ');
    latex += `
    \\vspace{-8pt}
\\end{center}

`;
  }

  // Process sections in order
  const sectionOrder = cvData.cv_template.metadata.section_order;
  
  for (const sectionKey of sectionOrder) {
    if (sectionKey === 'header') continue; // Already processed
    
    const section = sections[sectionKey as keyof typeof sections];
    if (!section || (renderingRules.hide_empty_sections && !hasContent(section))) continue;

    switch (sectionKey) {
      case 'summary':
        if (sections.summary) {
          latex += `\\section{${escapeLaTeX(sections.summary.section_title)}}
\\resumeSubHeadingListStart
    \\resumeParagraph{${escapeLaTeX(sections.summary.content)}}
\\resumeSubHeadingListEnd

`;
        }
        break;

      case 'experience':
        if (sections.experience?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.experience.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const exp of sections.experience.items) {
            const dateRange = `${formatDate(exp.dates.start)} -- ${exp.dates.is_current ? 'Present' : formatDate(exp.dates.end)}`;
            latex += `    \\resumeSubheading
      {${escapeLaTeX(exp.company)}}{${dateRange}}
      {${escapeLaTeX(exp.title)}}{${escapeLaTeX(exp.location)}}
`;
            if (exp.achievements?.length) {
              latex += `      \\resumeItemListStart
`;
              for (const achievement of exp.achievements) {
                latex += `        \\resumeItem{${escapeLaTeX(achievement)}}
`;
              }
              latex += `      \\resumeItemListEnd
`;
            }
            latex += `
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'education':
        if (sections.education?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.education.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const edu of sections.education.items) {
            const dateRange = edu.dates?.start && edu.dates?.end ? 
              `${formatDate(edu.dates.start)} -- ${formatDate(edu.dates.end)}` : '';
            latex += `    \\resumeSubheading
      {${escapeLaTeX(edu.institution)}}{${dateRange}}
      {${escapeLaTeX(edu.degree)}}{${escapeLaTeX(edu.location)}}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'skills':
        if (sections.skills?.categories?.length) {
          latex += `\\section{${escapeLaTeX(sections.skills.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const category of sections.skills.categories) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(category.name)}}{}
      {${category.items.map(escapeLaTeX).join(' | ')}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'projects':
        if (sections.projects?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.projects.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const project of sections.projects.items) {
            const dateRange = project.dates?.start && project.dates?.end ? 
              `${formatDate(project.dates.start)} -- ${formatDate(project.dates.end)}` : '';
            latex += `    \\projectEntry{${escapeLaTeX(project.title)}}{${dateRange}}
    \\resumeParagraph{${escapeLaTeX(project.description)}}
`;
            if (project.technologies?.length) {
              latex += `    \\resumeItemListStart
      \\resumeItem{Technologies: ${project.technologies.map(escapeLaTeX).join(', ')}}
    \\resumeItemListEnd
`;
            }
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'languages':
        if (sections.languages?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.languages.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const lang of sections.languages.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(lang.name)}}{}
      {${escapeLaTeX(lang.proficiency)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'interests':
        if (sections.interests?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.interests.section_title)}}
  \\resumeSubHeadingListStart
    \\resumeParagraph{${sections.interests.items.map(escapeLaTeX).join(' | ')}}
  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'certifications or courses':
        if (sections['certifications or courses']?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections['certifications or courses'].section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const cert of sections['certifications or courses'].items) {
            const dateRange = cert.date?.start && cert.date?.end ? 
              `${formatDate(cert.date.start)} -- ${formatDate(cert.date.end)}` : '';
            latex += `    \\resumeSubheading
      {${escapeLaTeX(cert.institution)}}{${dateRange}}
      {${escapeLaTeX(cert.title)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'volunteer':
        if (sections.volunteer?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.volunteer.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const vol of sections.volunteer.items) {
            const dateRange = vol.dates?.start && vol.dates?.end ? 
              `${formatDate(vol.dates.start)} -- ${formatDate(vol.dates.end)}` : '';
            latex += `    \\resumeSubheading
      {${escapeLaTeX(vol.organization)}}{${dateRange}}
      {${escapeLaTeX(vol.title)}}{${escapeLaTeX(vol.location)}}
`;
            if (vol.achievements?.length) {
              latex += `      \\resumeItemListStart
`;
              for (const achievement of vol.achievements) {
                latex += `        \\resumeItem{${escapeLaTeX(achievement)}}
`;
              }
              latex += `      \\resumeItemListEnd
`;
            }
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'achievements':
        if (sections.achievements?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.achievements.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const achievement of sections.achievements.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(achievement.organization)}}{${formatDate(achievement.date)}}
      {${escapeLaTeX(achievement.description)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'publications':
        if (sections.publications?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.publications.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const pub of sections.publications.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(pub.title)}}{${formatDate(pub.date)}}
      {}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'patents':
        if (sections.patents?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.patents.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const patent of sections.patents.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(patent.title)}}{${formatDate(patent.date)}}
      {${escapeLaTeX(patent.number)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'research':
        if (sections.research?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.research.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const research of sections.research.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(research.title)}}{${formatDate(research.date)}}
      {${escapeLaTeX(research.description)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'custom':
        if (sections.custom?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.custom.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const custom of sections.custom.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(custom.title)}}{${formatDate(custom.date)}}
      {${escapeLaTeX(custom.description)}}{}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      case 'references':
        if (sections.references?.items?.length) {
          latex += `\\section{${escapeLaTeX(sections.references.section_title)}}
  \\resumeSubHeadingListStart
`;
          for (const ref of sections.references.items) {
            latex += `    \\resumeSubheading
      {${escapeLaTeX(ref.name)}}{${escapeLaTeX(ref.email)}}
      {${escapeLaTeX(ref.title)}, ${escapeLaTeX(ref.company)}}{${escapeLaTeX(ref.phone)}}
`;
          }
          latex += `  \\resumeSubHeadingListEnd

`;
        }
        break;

      // Add other sections as needed
    }
  }

  latex += `\\end{document}`;
  return latex;
}

function hasContent(section: unknown): boolean {
  if (!section) return false;
  const typedSection = section as { content?: string; items?: unknown[]; categories?: unknown[] };
  if (typedSection.content) return !!typedSection.content.trim();
  if (typedSection.items) return typedSection.items.length > 0;
  if (typedSection.categories) return typedSection.categories.length > 0;
  return false;
}