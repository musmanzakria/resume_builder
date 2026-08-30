export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  portfolioLabel: string;
  portfolioUrl: string;
  showPortfolioIcon?: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  grade: string;
  period: string;
  electives?: string;
  visible: boolean;
}

export interface ExperiencePreset {
  label?: string;
  title?: string;
  description?: string;
  bullets: string[];
}

export interface HashMoveExperience {
  company: string;
  business_type: string;
  title: string;
  period: string;
  activePreset: string;
  presets: Record<string, ExperiencePreset>;
}

export interface OtherExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  visible: boolean;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  url: string;
  showIcon?: boolean;
  visible: boolean;
  defaultOrder: number;
  tags?: string[];
  deep_context?: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  content: string;
  visible: boolean;
  isVariable: boolean;
}

export interface AwardItem {
  id: string;
  title: string;
  visible: boolean;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  content: string;
  visible: boolean;
}

export interface ResumeSettings {
  aiProjectCount: number;
  previewMode: "paginated" | "continuous";
  typography: {
    fontFamily: string;
    headerFontSize: number; // in px / pt
    sectionHeadingSize: number;
    bodyFontSize: number;
    lineHeight: number;
  };
  spacing: {
    pageMarginX: number; // in px
    pageMarginY?: number;
    pageMarginTop?: number;
    pageMarginBottom?: number;
    sectionGap: number;
    itemGap: number;
  };
  sectionOrder: string[];
}

export interface ResumeData {
  personal: PersonalInfo;
  summary: {
    content: string;
    closingLine: string;
  };
  education: EducationItem[];
  experience_presets: {
    hashmove: HashMoveExperience;
  };
  other_experiences: OtherExperienceItem[];
  projects: ProjectItem[];
  skills_categories: Record<string, SkillCategory>;
  awards: {
    title: string;
    items: AwardItem[];
    content?: string; // fallback legacy string
    visible: boolean;
  };
  languages_availability: {
    title: string;
    content: string;
    visible: boolean;
  };
  custom_sections?: CustomSectionItem[];
  settings: ResumeSettings;
}

export interface SavedApplication {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  createdAt: string;
  updatedAt: string;
  resumeData: ResumeData;
  coverLetter: string;
  selectedPresetKey: string;
  selectedSkillKey: string;
  selectedProjectIds: string[];
}
