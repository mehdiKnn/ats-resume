// Helper function to escape LaTeX special characters
const escapeLaTeX = (text: any): string => {
  if (!text) return '';
  // Convert to string if text is not already a string
  const str = String(text);
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}~^]/g, '\\$&')
    .replace(/\[/g, '{[}')
    .replace(/\]/g, '{]}');
};

// Helper function to format dates
const formatDate = (dateStr: any): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

// Helper function to create hyperlinks
const createHyperlink = (text: string, url: string): string => {
  if (!text || !url) return escapeLaTeX(text || '');
  return `\\href{${escapeLaTeX(url)}}{${escapeLaTeX(text)}}`;
};

// Helper function to create list items
const createListItems = (items: string[]): string => {
  if (!items || !items.length) return '';
  return items.map(item => `  \\resumeItem{${escapeLaTeX(item)}}`).join('\n');
};

// Generate LaTeX document header
const generateHeader = (): string => {
  return `\\documentclass[letterpaper,11pt]{article}

% Essential packages
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

% Optional packages with fallbacks
\\IfFileExists{marvosym.sty}{\\usepackage{marvosym}}{}
\\IfFileExists{fontawesome5.sty}{\\usepackage{fontawesome5}}{
  % Fallback definitions for FontAwesome icons
  \\newcommand{\\faPhone}{📞}
  \\newcommand{\\faEnvelope}{📧}
  \\newcommand{\\faLinkedin}{🔗}
  \\newcommand{\\faGlobe}{🌐}
  \\newcommand{\\faGithub}{🔗}
}
\\IfFileExists{multicol.sty}{
  \\usepackage{multicol}
  \\setlength{\\multicolsep}{-3.0pt}
  \\setlength{\\columnsep}{-1pt}
}{}

% Unicode support (optional)
\\IfFileExists{glyphtounicode.def}{\\input{glyphtounicode}}{}

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
};

export const generateCVLatexTemplate = (cvData: any): string => {
  // All section generator functions
  const sectionGenerators = {
    header: () => {
      const header = cvData.cv_template.sections.header;
      if (!header) return '';

      // Safely extract values with fallbacks
      const email = header.contact_info?.email?.value || '';
      const phone = header.contact_info?.phone?.value || '';
      const linkedin = header.contact_info?.linkedin?.value || '';
      const portfolio = header.contact_info?.portfolio?.value || '';
      const github = header.contact_info?.github?.value || '';
      const location = header.contact_info?.location?.value || '';
      const name = header.name || 'Name Not Provided';

      // Build contact sections conditionally
      const contactSections = [];

      if (phone) {
        contactSections.push(`\\raisebox{-0.1\\height}\\faPhone\\ ${escapeLaTeX(phone)}`);
      }

      if (email) {
        contactSections.push(`\\href{mailto:${email}}{\\raisebox{-0.2\\height}\\faEnvelope\\  \\underline{${escapeLaTeX(email)}}}`);
      }

      if (linkedin) {
        const linkedinText = header.contact_info?.linkedin?.value || 'LinkedIn';
        const linkedinUrl = header.contact_info?.linkedin?.link || linkedin;
        contactSections.push(`\\href{${escapeLaTeX(linkedinUrl)}}{\\raisebox{-0.2\\height}\\faLinkedin\\ \\underline{${escapeLaTeX(linkedinText)}}}`);
      }

      if (portfolio) {
        const portfolioLink = portfolio.startsWith('http') ? portfolio : `https://${portfolio}`;
        const cleanPortfolioLink = portfolioLink.replace(/^https?:\/\//, '');
        contactSections.push(`\\href{${portfolioLink}}{\\raisebox{-0.2\\height}\\faGlobe\\ \\underline{${escapeLaTeX(cleanPortfolioLink)}}}`);
      }

      if (github) {
        const githubText = header.contact_info?.github?.value || 'GitHub';
        const githubUrl = header.contact_info?.github?.link || github;
        contactSections.push(`\\href{${escapeLaTeX(githubUrl)}}{\\raisebox{-0.2\\height}\\faGithub\\ \\underline{${escapeLaTeX(githubText)}}}`);
      }

      return `
\\begin{center}
    {\\Huge \\scshape ${escapeLaTeX(name)}} \\\\ \\vspace{1pt}
    ${location ? `${escapeLaTeX(location)} \\\\ \\vspace{1pt}` : ''}
    ${contactSections.length ? `\\small ${contactSections.join(' ~ ')}` : ''}
    \\vspace{-8pt}
\\end{center}`;
    },

    summary: () => {
      const summary = cvData.cv_template.sections.summary;
      if (!summary || !summary.content) return '';

      return `
\\section{${escapeLaTeX(summary.section_title)}}
\\resumeSubHeadingListStart
    \\resumeParagraph{${escapeLaTeX(summary.content)}}
\\resumeSubHeadingListEnd`;
    },

    experience: () => {
      const experience = cvData.cv_template.sections.experience;
      if (!experience?.items?.length) return '';

      const experienceItems = experience.items.map((job: any) => {
        if (!job) return '';

        const startDate = formatDate(job.dates?.start);
        const endDate = job.dates?.is_current ? 'Present' : formatDate(job.dates?.end);
        const company = job.company || 'Company Not Specified';
        const title = job.title || 'Position Not Specified';
        const location = job.location || '';

        return `    \\resumeSubheading
      {${escapeLaTeX(company)}}{${startDate} -- ${endDate}}
      {${escapeLaTeX(title)}}{${escapeLaTeX(location)}}
      ${job.achievements?.length ? `\\resumeItemListStart
        ${job.achievements.map((achievement: string) =>
                    `\\resumeItem{${escapeLaTeX(achievement || '')}}`
                ).join('\n        ')}
      \\resumeItemListEnd` : ''}`
      }).filter(Boolean).join('\n\n');

      if (!experienceItems) return '';

      return `
\\section{${escapeLaTeX(experience.section_title || 'Professional Experience')}}
  \\resumeSubHeadingListStart
${experienceItems}
  \\resumeSubHeadingListEnd`;
    },

    education: () => {
      const education = cvData.cv_template.sections.education;
      if (!education?.items?.length) return '';

      const educationItems = education.items.map((edu: any) => {
        if (!edu) return '';

        const startDate = formatDate(edu.dates?.start);
        const endDate = edu.dates?.end ? formatDate(edu.dates.end) : '';
        const dateString = startDate && endDate ? `${startDate} -- ${endDate}` : '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(edu.institution || '')}}{${dateString}}
      {${escapeLaTeX(edu.degree || '')}}{${escapeLaTeX(edu.location || '')}}`
      }).filter(Boolean).join('\n\n');

      if (!educationItems) return '';

      return `
\\section{${escapeLaTeX(education.section_title || 'Education')}}
  \\resumeSubHeadingListStart
${educationItems}
  \\resumeSubHeadingListEnd`;
    },

    skills: () => {
      const skills = cvData.cv_template.sections.skills;
      if (!skills?.categories?.length) return '';

      // Only include categories that have items
      const validCategories = skills.categories.filter((category: any) =>
        category?.items?.length && category.items.some((item: any) => item && typeof item === 'string' && item.trim())
      );

      if (!validCategories.length) return '';

      const skillCategories = validCategories.map((category: any) => `    \\resumeSubheading
      {${escapeLaTeX(category.name)}}{}
      {${category.items.filter(Boolean).map((skill: string) => escapeLaTeX(skill)).join(' | ')}}{}
    `).join('\n');

      return `
\\section{${escapeLaTeX(skills.section_title || 'Skills')}}
  \\resumeSubHeadingListStart
${skillCategories}
  \\resumeSubHeadingListEnd`;
    },

    projects: () => {
      const projects = cvData.cv_template.sections.projects;
      if (!projects?.items?.length) return '';

      const projectItems = projects.items.map((project: any) => {
        if (!project) return '';
        
        return `    \\projectEntry{${createHyperlink(project.title || '', project.url || '')}}{}
    \\resumeParagraph{${escapeLaTeX(project.description || '')}}
    ${project.technologies?.length ? `\\resumeItemListStart
      \\resumeItem{Technologies: ${project.technologies.map((tech: string) => escapeLaTeX(tech || '')).join(', ')}}
    \\resumeItemListEnd` : ''}`
      }).filter(Boolean).join('\n\n');

      if (!projectItems) return '';

      return `
\\section{${escapeLaTeX(projects.section_title || 'Projects')}}
  \\resumeSubHeadingListStart
${projectItems}
  \\resumeSubHeadingListEnd`;
    },

    certifications: () => {
      const certifications = cvData.cv_template.sections.certifications || cvData.cv_template.sections['certifications or courses'];
      if (!certifications?.items?.length) return '';

      const certItems = certifications.items.map((cert: any) => {
        if (!cert) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(cert.title || '')}}{}
      {}{}`;
      }).filter(Boolean).join('\n');

      if (!certItems) return '';

      return `
\\section{${escapeLaTeX(certifications.section_title || 'Certifications')}}
  \\resumeSubHeadingListStart
${certItems}
  \\resumeSubHeadingListEnd`;
    },

    languages: () => {
      const languages = cvData.cv_template.sections.languages;
      if (!languages?.items?.length) return '';

      const languageItems = languages.items.map((lang: any) => {
        if (!lang) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(lang.name || '')}}{}
      {${escapeLaTeX(lang.proficiency || '')}}{}`;
      }).filter(Boolean).join('\n');

      if (!languageItems) return '';

      return `
\\section{${escapeLaTeX(languages.section_title || 'Languages')}}
  \\resumeSubHeadingListStart
${languageItems}
  \\resumeSubHeadingListEnd`;
    },

    volunteer: () => {
      const volunteer = cvData.cv_template.sections.volunteer;
      if (!volunteer?.items?.length) return '';

      const volunteerItems = volunteer.items.map((vol: any) => {
        if (!vol) return '';

        const startDate = formatDate(vol.dates?.start);
        const endDate = vol.dates?.is_current ? 'Present' : formatDate(vol.dates?.end);
        const dateString = startDate || endDate ? `${startDate}${startDate && endDate ? ' -- ' : ''}${endDate}` : '';

        return `    \\resumeSubheading
      {${escapeLaTeX(vol.organization || '')}}{${dateString}}
      {${escapeLaTeX(vol.title || '')}}{${escapeLaTeX(vol.location || '')}}
      ${vol.achievements?.length ? `\\resumeItemListStart
        ${vol.achievements.map((achievement: string) =>
                    `\\resumeItem{${escapeLaTeX(achievement || '')}}`
                ).join('\n        ')}
      \\resumeItemListEnd` : ''}`;
      }).filter(Boolean).join('\n\n');

      if (!volunteerItems) return '';

      return `
\\section{${escapeLaTeX(volunteer.section_title || 'Volunteer Experience')}}
  \\resumeSubHeadingListStart
${volunteerItems}
  \\resumeSubHeadingListEnd`;
    },

    achievements: () => {
      const achievements = cvData.cv_template.sections.achievements;
      if (!achievements?.items?.length) return '';

      const achievementItems = achievements.items.map((achievement: any) => {
        if (!achievement) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(achievement.title || '')}}{${formatDate(achievement.date)}}
      {${escapeLaTeX(achievement.organization || '')}}{}`;
      }).filter(Boolean).join('\n');

      if (!achievementItems) return '';

      return `
\\section{${escapeLaTeX(achievements.section_title || 'Awards & Achievements')}}
  \\resumeSubHeadingListStart
${achievementItems}
  \\resumeSubHeadingListEnd`;
    },

    publications: () => {
      const publications = cvData.cv_template.sections.publications;
      if (!publications?.items?.length) return '';

      const pubItems = publications.items.map((pub: any) => {
        if (!pub) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(pub.title || '')}}{${formatDate(pub.date)}}
      {}{}`;
      }).filter(Boolean).join('\n');

      if (!pubItems) return '';

      return `
\\section{${escapeLaTeX(publications.section_title || 'Publications')}}
  \\resumeSubHeadingListStart
${pubItems}
  \\resumeSubHeadingListEnd`;
    },

    interests: () => {
      const interests = cvData.cv_template.sections.interests;
      if (!interests?.items?.length) return '';

      // Filter out empty, null, or non-string items and ensure strings
      const validItems = interests.items
        .filter((item: any) => item && typeof item === 'string' && item.trim().length > 0);

      if (!validItems.length) return '';

      return `
\\section{${escapeLaTeX(interests.section_title || 'Interests')}}
  \\resumeSubHeadingListStart
    \\resumeParagraph{${validItems.map((interest: string) => escapeLaTeX(interest)).join(' | ')}}
  \\resumeSubHeadingListEnd`;
    },

    patents: () => {
      const patents = cvData.cv_template.sections.patents;
      if (!patents?.items?.length) return '';

      const patentItems = patents.items.map((patent: any) => {
        if (!patent) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(patent.title || '')}}{${formatDate(patent.date)}}
      {Patent Number: ${escapeLaTeX(patent.number || '')}}{}`;
      }).filter(Boolean).join('\n');

      if (!patentItems) return '';

      return `
\\section{${escapeLaTeX(patents.section_title || 'Patents')}}
  \\resumeSubHeadingListStart
${patentItems}
  \\resumeSubHeadingListEnd`;
    },

    research: () => {
      const research = cvData.cv_template.sections.research;
      if (!research?.items?.length) return '';

      const researchItems = research.items.map((item: any) => {
        if (!item) return '';
        
        return `      \\resumeParagraph{${escapeLaTeX(item.description || '')}}`;
      }).filter(Boolean).join('\n');

      if (!researchItems) return '';

      return `
\\section{${escapeLaTeX(research.section_title || 'Research')}}
  \\resumeSubHeadingListStart
${researchItems}
  \\resumeSubHeadingListEnd`;
    },

    custom: () => {
      const custom = cvData.cv_template.sections.custom;
      if (!custom?.items?.length) return '';

      const customItems = custom.items.map((item: any) => {
        if (!item) return '';
        
        return `    \\resumeSubheading
      {${escapeLaTeX(item.title || '')}}{${formatDate(item.date)}}
      {${escapeLaTeX(item.description || '')}}{}`;
      }).filter(Boolean).join('\n');

      if (!customItems) return '';

      return `
\\section{${escapeLaTeX(custom.section_title || 'Custom Section')}}
  \\resumeSubHeadingListStart
${customItems}
  \\resumeSubHeadingListEnd`;
    }
  };

  // Get the section order from metadata or use default order
  const defaultSectionOrder = [
    'header', 'summary', 'experience', 'education', 'skills', 
    'projects', 'certifications', 'languages', 'volunteer', 
    'achievements', 'publications', 'interests', 'patents', 
    'research', 'custom'
  ];
  
  const sectionOrder = cvData.cv_template.metadata?.section_order || defaultSectionOrder;

  // Generate content based on metadata order
  const content = sectionOrder
    .map((sectionName: string) => {
      if (!sectionGenerators[sectionName as keyof typeof sectionGenerators]) return '';

      const sectionData = cvData.cv_template.sections[sectionName];
      if (!sectionData) return '';

      // More strict validation for each section type
      if (sectionName === 'header') {
        const header = sectionData;
        const hasContactInfo = header.contact_info &&
          Object.values(header.contact_info).some((info: any) => info?.value?.trim());
        const hasName = header.name?.trim();
        if (!hasContactInfo && !hasName) return '';
      }

      if (sectionName === 'summary') {
        if (!sectionData.content?.trim()) return '';
      }

      if (Array.isArray(sectionData.items)) {
        // For sections with items array, ensure there are valid items
        const hasValidItems = sectionData.items?.some((item: any) => {
          if (!item) return false;
          // For text-only items
          if (typeof item === 'string') return item.trim().length > 0;
          // For object items, check if they have any non-empty required fields
          return Object.values(item).some((val: any) =>
            val && (typeof val === 'string' ? val.trim().length > 0 : true)
          );
        });
        if (!hasValidItems) return '';
      }

      return sectionGenerators[sectionName as keyof typeof sectionGenerators]();
    })
    .filter((section: string) => section.trim() !== '') // Remove empty sections
    .join('\n\n');

  // Combine everything
  return `${generateHeader()}
  
${content}
  
\\end{document}`;
};