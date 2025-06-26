export interface CVSchema {
  cv_template: {
    metadata: {
      section_order: string[];
    };
    sections: {
      header?: {
        name: string;
        title: string;
        contact_info: {
          email?: { value: string; link: string };
          phone?: { value: string; link: string };
          portfolio?: { value: string; link: string };
          linkedin?: { value: string; link: string };
          location?: { value: string };
        };
      };
      summary?: {
        section_title: string;
        content: string;
      };
      experience?: {
        section_title: string;
        items: Array<{
          type: string;
          title: string;
          company: string;
          url?: string;
          location: string;
          dates: { start: string; end: string; is_current: boolean };
          achievements?: string[];
          technologies?: string[];
        }>;
      };
      education?: {
        section_title: string;
        items: Array<{
          degree: string;
          institution: string;
          url?: string;
          location: string;
          dates?: { start: string; end: string };
          gpa?: string;
          honors?: string[];
        }>;
      };
      skills?: {
        section_title: string;
        categories: Array<{
          name: string;
          items: string[];
          description?: string;
          proficiency?: string;
        }>;
      };
      projects?: {
        section_title: string;
        items: Array<{
          title: string;
          url?: string;
          description: string;
          dates?: { start: string; end: string };
          technologies?: string[];
          key_contributions?: string[];
        }>;
      };
      "certifications or courses"?: {
        section_title: string;
        items: Array<{
          title: string;
          institution: string;
          url?: string;
          date: { start?: string; end?: string };
        }>;
      };
      languages?: {
        section_title: string;
        items: Array<{
          name: string;
          proficiency: string;
        }>;
      };
      volunteer?: {
        section_title: string;
        items: Array<{
          title: string;
          organization: string;
          location: string;
          dates?: { start: string; end: string };
          achievements?: string[];
        }>;
      };
      achievements?: {
        section_title: string;
        items: Array<{
          organization: string;
          description: string;
          date: string;
        }>;
      };
      publications?: {
        section_title: string;
        items: Array<{
          title: string;
          url?: string;
          date: string;
        }>;
      };
      interests?: {
        section_title: string;
        items: string[];
      };
      references?: {
        section_title: string;
        items: Array<{
          name: string;
          title: string;
          company: string;
          email: string;
          phone: string;
        }>;
      };
      patents?: {
        section_title: string;
        items: Array<{
          title: string;
          number: string;
          url?: string;
          date: string;
        }>;
      };
      research?: {
        section_title: string;
        items: Array<{
          title: string;
          description: string;
          url?: string;
          date: string;
        }>;
      };
      custom?: {
        section_title: string;
        items: Array<{
          title: string;
          description: string;
          url?: string;
          date: string;
        }>;
      };
    };
    rendering_rules: {
      date_format: string;
      hide_empty_sections: boolean;
      max_items_per_section: string;
      truncate_descriptions_at: number;
    };
  };
}