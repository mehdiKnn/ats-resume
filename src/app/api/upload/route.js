import { NextResponse } from 'next/server';
import { Mistral } from '@mistralai/mistralai';
import { generateCVLatexTemplate } from '@/utils/pdf-generator';

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

    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: 'Mistral API key is required. Please configure MISTRAL_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    const mistralClient = new Mistral({
      apiKey: process.env.MISTRAL_API_KEY,
    });
    
    const base64Buffer = buffer.toString('base64');
    const dataUri = `data:application/pdf;base64,${base64Buffer}`;
    
    const ocrResponse = await mistralClient.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'document_url',
        documentUrl: dataUri
      },
      includeImageBase64: false
    });
    
    // Handle multi-page PDFs by combining all pages with better formatting
    let extractedText = '';
    let structuredPages = [];
    
    if (ocrResponse.pages && ocrResponse.pages.length > 0) {
      structuredPages = ocrResponse.pages.map((page, index) => ({
        pageNumber: index + 1,
        content: page.markdown || ''
      }));
      
      // Clean and preserve markdown formatting
      extractedText = structuredPages
        .map(page => {
          let content = page.content;
          // Clean up common markdown issues but preserve structure
          content = content
            .replace(/\\\$([^$]+)\\\$/g, '$1') // Remove LaTeX escaping around math
            .replace(/\\([{}%&_#^~])/g, '$1') // Remove LaTeX escaping of special chars
            .replace(/\\textbackslash\{\}/g, '\\') // Fix backslashes
            .replace(/\\textasciicircum\{\}/g, '^') // Fix carets
            .replace(/\\textasciitilde\{\}/g, '~') // Fix tildes
            .replace(/\\\s*\n/g, '\n') // Clean up line breaks
            .replace(/\n{3,}/g, '\n\n') // Normalize multiple line breaks
            .trim();
          return content;
        })
        .join('\n\n---PAGE BREAK---\n\n');
    }
    
    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'No text could be extracted from the PDF. Please ensure the document is readable and contains text.' },
        { status: 400 }
      );
    }

 // TODO :  Add language level inspection and extraction, Regroup interest by categories, Fix modification, fix pdf generation
    const cvDataResponse = await mistralClient.chat.complete({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'user',
          content: `Extrais et structure toutes les données de ce CV selon le schéma JSON EXACT suivant. Retourne UNIQUEMENT le JSON valide, sans commentaires ni texte supplémentaire :

{
  "cv_template": {
    "metadata": {
      "section_order": ["header", "summary", "experience", "education", "skills", "projects", "certifications or courses", "languages", "volunteer", "achievements", "publications", "interests", "references", "patents", "research", "custom"]
    },
    "sections": {
      "header": {
        "name": "Your Full Name",
        "title": "Your Professional Title, e.g., Software Engineer",
        "contact_info": {
          "email": {"value": "Your Email", "link": "mailto:Your Email"},
          "phone": {"value": "Your Phone Number", "link": "tel:Your Phone Number"},
          "portfolio": {"value": "Your Portfolio URL", "link": "Your Portfolio URL"},
          "linkedin": {"value": "Your LinkedIn Profile", "link": "LinkedIn Profile URL"},
          "location": {"value": "City, Country"}
        }
      },
      "summary": {
        "section_title": "Summary",
        "content": "Brief professional summary highlighting your experience, skills, and career goals."
      },
      "experience": {
        "section_title": "Professional Experience",
        "items": [
          {
            "type": "job",
            "title": "Job Title",
            "company": "Company Name",
            "url": "Company URL",
            "location": "City, Country",
            "dates": {"start": "Start Date", "end": "End Date", "is_current": false},
            "achievements": ["Achievement 1", "Achievement 2"],
            "technologies": ["Technology 1", "Technology 2"]
          }
        ]
      },
      "education": {
        "section_title": "Education",
        "items": [
          {
            "degree": "Degree Title",
            "institution": "Institution Name",
            "url": "Institution URL",
            "location": "City, Country",
            "dates": {"start": "Start Date", "end": "End Date"},
            "gpa": "GPA",
            "honors": ["Honor or Award"]
          }
        ]
      },
      "skills": {
        "section_title": "Skills",
        "categories": [
          {
            "name": "Technical Skills",
            "items": ["Skill 1", "Skill 2"],
            "description": "Short description based on data",
            "proficiency": "expert"
          },
          {
            "name": "Soft Skills",
            "items": ["Skill 1", "Skill 2"],
            "description": "Short description based on data",
            "proficiency": "intermediate"
          }
        ]
      },
      "projects": {
        "section_title": "Projects",
        "items": [
          {
            "title": "Project Title",
            "url": "Project URL",
            "description": "Project Description",
            "dates": {"start": "Start Date", "end": "End Date"},
            "technologies": ["Technology 1", "Technology 2"],
            "key_contributions": ["Contribution 1", "Contribution 2"]
          }
        ]
      },
      "certifications or courses": {
        "section_title": "Certifications",
        "items": [
          {
            "title": "Certification Name",
            "institution": "Issuing Institution",
            "url": "Certification URL",
            "date": {"start": "Start Date", "end": "End Date"}
          }
        ]
      },
      "languages": {
        "section_title": "Languages",
        "items": [
          {"name": "Language", "proficiency": "Proficiency Level"}
        ]
      },
      "volunteer": {
        "section_title": "Volunteer Experience",
        "items": [
          {
            "title": "Volunteer Role",
            "organization": "Organization Name",
            "location": "City, Country",
            "dates": {"start": "Start Date", "end": "End Date"},
            "achievements": ["Achievement 1"]
          }
        ]
      },
      "achievements": {
        "section_title": "Awards & Achievements",
        "items": [
          {
            "organization": "Example Organization",
            "description": "Achievement description",
            "date": "2023-01-01"
          }
        ]
      },
      "publications": {
        "section_title": "Publications",
        "items": [
          {
            "title": "Publication Title",
            "url": "Publication URL",
            "date": "Publication Date"
          }
        ]
      },
      "interests": {
        "section_title": "Interests",
        "items": ["Interest 1", "Interest 2"]
      },
      "references": {
        "section_title": "References",
        "items": [
          {
            "name": "Reference Name",
            "title": "Title",
            "company": "Company Name",
            "email": "Email",
            "phone": "Phone Number"
          }
        ]
      },
      "patents": {
        "section_title": "Patents",
        "items": [
          {
            "title": "Patent Title",
            "number": "Patent Number",
            "url": "Patent URL",
            "date": "2023-01-01"
          }
        ]
      },
      "research": {
        "section_title": "Research",
        "items": [
          {
            "title": "Research Title",
            "description": "Research Description",
            "url": "Research URL",
            "date": "2023-01-01"
          }
        ]
      },
      "custom": {
        "section_title": "Custom Section",
        "items": [
          {
            "title": "Custom Item Title",
            "description": "Custom Item Description",
            "url": "Custom Item URL",
            "date": "2023-01-01"
          }
        ]
      }
    },
    "rendering_rules": {
      "date_format": "MMM YYYY",
      "hide_empty_sections": true,
      "max_items_per_section": "No limit for now",
      "truncate_descriptions_at": 600
    }
  }
}

IMPORTANT : 
- N'inclus QUE les sections qui ont du contenu réel dans le CV
- Extrait toutes les informations disponibles de TOUTES LES PAGES
- Utilise les dates au format trouvé dans le CV
- Si des informations manquent, omets ces champs plutôt que de mettre des valeurs par défaut
- Ce CV peut avoir plusieurs pages, assure-toi de traiter tout le contenu

CV Markdown (multi-pages) :
${extractedText}`
        }
      ],
      maxTokens: 4000
    });

    let cvData = null;
    let cvSections = [];
    
    try {
      const cvContent = cvDataResponse.choices?.[0]?.message?.content || '';
      const contentString = typeof cvContent === 'string' ? cvContent : '';
      const jsonMatch = contentString.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cvData = JSON.parse(jsonMatch[0]);
        
        // Create backward-compatible sections for display
        const cvDataTyped = cvData;
        const sections = cvDataTyped.cv_template?.sections || {};
        
        const headerSection = sections.header;
        if (headerSection) {
          cvSections.push({ title: 'En-tête', content: `${headerSection.name || ''}\n${headerSection.title || ''}` });
        }
        
        const summarySection = sections.summary;
        if (summarySection) {
          cvSections.push({ title: summarySection.section_title || 'Summary', content: summarySection.content || '' });
        }
        
        const experienceSection = sections.experience;
        if (experienceSection?.items?.length) {
          const content = experienceSection.items.map((item) => 
            `${item.title || ''} - ${item.company || ''} (${item.dates?.start || ''} - ${item.dates?.end || ''})`
          ).join('\n');
          cvSections.push({ title: experienceSection.section_title || 'Experience', content });
        }
        
        const educationSection = sections.education;
        if (educationSection?.items?.length) {
          const content = educationSection.items.map((item) => 
            `${item.degree || ''} - ${item.institution || ''} (${item.dates?.start || ''} - ${item.dates?.end || ''})`
          ).join('\n');
          cvSections.push({ title: educationSection.section_title || 'Education', content });
        }
        
        const skillsSection = sections.skills;
        if (skillsSection?.categories?.length) {
          const content = skillsSection.categories.map((cat) => 
            `${cat.name || ''}: ${(cat.items || []).join(', ')}`
          ).join('\n');
          cvSections.push({ title: skillsSection.section_title || 'Skills', content });
        }
      }
    } catch {
      console.warn('Could not parse CV data as JSON, using fallback structure');
      cvSections = [{ title: 'CV Content', content: extractedText }];
    }

    // Generate LaTeX from structured data if available
    let latex = '';
    if (cvData && cvData.cv_template) {
      try {
        latex = generateCVLatexTemplate(cvData);
      } catch (latexError) {
        console.warn('Failed to generate LaTeX from schema:', latexError);
      }
    }
    
    const cvDataTyped = cvData;
    
    const structuredData = {
      metadata: {
        title: 'CV Document',
        author: cvDataTyped?.cv_template?.sections?.header?.name || 'Unknown',
        subject: 'Resume/CV',
        creator: 'Mistral Document AI',
        producer: 'CV Processor',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
        pages: ocrResponse.pages?.length || 1,
      },
      cv_data: cvData || null,
      sections: cvSections,
      content: {
        fullText: extractedText,
        markdown: extractedText,
        pages: structuredPages.map((page) => ({
          pageNumber: page.pageNumber,
          text: page.content.trim(),
          wordCount: page.content.trim().split(/\s+/).filter(word => word.length > 0).length
        })),
        paragraphs: extractedText
          .split(/\n\s*\n/)
          .filter(p => p.trim().length > 0 && !p.includes('---PAGE BREAK---'))
          .map((paragraph, index) => ({
            id: index + 1,
            text: paragraph.trim().replace(/\s+/g, ' '),
            wordCount: paragraph.trim().split(/\s+/).filter(word => word.length > 0).length,
          })),
      },
      latex: latex,
      statistics: {
        totalWords: extractedText.split(/\s+/).filter(word => word.length > 0).length,
        totalCharacters: extractedText.length,
        totalParagraphs: extractedText.split(/\n\s*\n/).filter(p => p.trim().length > 0 && !p.includes('---PAGE BREAK---')).length,
        totalSections: cvSections.length,
        totalPages: structuredPages.length,
      },
      processing: {
        method: 'Mistral Document AI (OCR + Structured JSON)',
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