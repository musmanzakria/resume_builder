import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  ResumeData, 
  SavedApplication, 
  ProjectItem, 
  SkillCategory, 
  EducationItem, 
  OtherExperienceItem,
  AwardItem,
  CustomSectionItem,
  ExperiencePreset
} from "@/types/resume";
import { initialMasterContext } from "./initialData";

const defaultInitialResumeData: ResumeData = {
  personal: {
    fullName: "Usman Zakria",
    email: "m.usmanzakria@gmail.com",
    phone: "+49 170 695 9515",
    location: "Berlin, Germany",
    portfolioLabel: "Portfolio Link",
    portfolioUrl: "https://usmanzakria.com",
    showPortfolioIcon: true,
  },
  summary: {
    content: "Marketing professional with expertise in **SEO, Social Media, and Content**, experienced in delivering growth through data-driven storytelling and strategic positioning. I enjoy working in dynamic, fast-paced environments and can explain complex topics in a simple way with excellent communication skills in English (**8.5 IELTS / C2**), and growing German proficiency (A2). I bring practical skills in SEO/AEO/GEO, and social media content, a strong understanding of editorial calendars, and a strategic mindset for campaign ideas and PR activities. Having worked closely with cross-functional teams, I thrive in international environments, take ownership of tasks, and enjoy transforming complex topics into engaging web content and sales materials.",
    closingLine: "I am eager to be an integral part of autarc's Marketing team, create and schedule social media content, maintain and update our website, and help simplify the transition towards renewable energy as a **Marketing Associate Working Student in Berlin**.",
  },
  education: [
    {
      id: "edu-1",
      degree: "Master's in International Business",
      institution: "Hochschule für Technik und Wirtschaft Berlin",
      grade: "CGPA 1.8/1.0",
      period: "2025 – Present",
      electives: "",
      visible: true,
    },
    {
      id: "edu-2",
      degree: "Bachelor's in Business Administration",
      institution: "Institute of Business Administration",
      grade: "Dean's List | 3.74/4.00 (90.95%)",
      period: "2019 – 2023",
      electives: "Marketing Analytics, Digital Marketing, Product Management, Consumer Behavior, Brand Management, Media Management, Trade Marketing.",
      visible: true,
    },
  ],
  experience_presets: {
    hashmove: {
      company: "HashMove",
      business_type: "B2B SaaS Logistics ERP",
      title: "Product Marketing Analyst",
      period: "10/2023 – 04/2025",
      activePreset: "product_marketing",
      presets: {
        product_marketing: {
          label: "Growth & Product Marketing Focus",
          description: "Highlights GTM playbooks, LinkedIn enterprise campaigns, multi-channel content, and website UX/SEO",
          bullets: [
            "Developed go-to-market strategies for two new SaaS modules ([AI-powered Logistics](https://usmanzakria.com#icon), Yard Management), collaborating with design teams to create sales playbooks, driving a **24% increase in average deal size**.",
            "Executed hyper-personalized LinkedIn campaigns for large enterprises with custom ad copies and landing pages, increasing conversion rate by **213%** while almost doubling ROAS QoQ.",
            "Managed a multi-channel content library (sales decks, brochures, blogs, video tutorials), increasing feature adoption by **362%** for key partners like the Arab British Chamber of Commerce.",
            "Led end-to-end website redesign, optimizing UX and SEO, resulting in a **36% increase in organic traffic**.",
            "Designed high-impact Figma demos addressing freight optimization using Agentic AI, securing a multi-million-dollar PoC; accelerating sales cycle by 20%.",
            "Used Figma, Clay, Apollo, Mailjet, LinkedIn Ads, SQL, Python, Trello, Jira, PowerPoint, Excel (ETL, VLOOKUP, Pivot Tables, LAMBDA), Power BI, Claude, ElevenLabs, Play.ht, Synthesia, Slack.",
          ],
        },
        data_analytics: {
          label: "Data Analytics & Commercials Focus",
          description: "Highlights Excel modeling, Python BI dashboards, and live tracking API integrations",
          bullets: [
            "Developed go-to-market strategies for two new SaaS modules ([AI-powered Logistics](https://usmanzakria.com#icon), Yard Management), collaborating with design to equip sales with new playbooks that led to a **24% increase in average deal size**.",
            "Built advanced Excel models, Python scripts, and BI dashboards for sales forecasting, proposal automation, and value proposition analysis, reducing commercials' processing time by **13%**.",
            "Evaluated 13 vendor solutions for live tracking APIs, migrating 1,500+ annual shipments to enhanced tracking and carbon calculation; increasing user adoption by **132%**.",
            "Led end-to-end website redesign, optimizing UX and SEO, resulting in a **36% increase in organic traffic**.",
            "Designed high-impact Figma demos addressing freight optimization using Agentic AI, securing a multi-million-dollar PoC; accelerating sales cycle by 20%.",
            "Used Figma, Clay, Apollo, Mailjet, LinkedIn Ads, SQL, Python, Trello, Jira, PowerPoint, Excel (ETL, VLOOKUP, Pivot Tables, LAMBDA), Power BI, Claude, ElevenLabs, Play.ht, Synthesia, Slack.",
          ],
        },
        product_management: {
          label: "Product Management & Yard Vertical Focus",
          description: "Highlights yard management feature research, process mapping, and wireframing",
          bullets: [
            "Developed go-to-market strategies for two new SaaS modules ([AI-powered Logistics](https://usmanzakria.com#icon), Yard Management), collaborating with design teams to create sales playbooks, driving a **24% increase in average deal size**.",
            "Managed a multi-channel content library (sales decks, brochures, blogs, video tutorials), increasing feature adoption by **362%** for key partners like the Arab British Chamber of Commerce.",
            "Directed product development for a new yard management vertical (feature research, process mapping, wireframing), cutting yard manhours by **33%** in pilot through automated task assignment.",
            "Designed high-impact Figma demos addressing freight optimization using Agentic AI, securing a multi-million-dollar PoC; accelerating sales cycle by 20%.",
            "Executed hyper-personalized LinkedIn campaigns for large enterprises with custom ad copies and landing pages, increasing conversion rate by **213%** while almost doubling ROAS QoQ.",
            "Used Figma, Clay, Apollo, Mailjet, LinkedIn Ads, SQL, Python, Trello, Jira, PowerPoint, Excel (ETL, VLOOKUP, Pivot Tables, LAMBDA), Power BI, Claude, ElevenLabs, Play.ht, Synthesia, Slack.",
          ],
        },
        gdpr_operations: {
          label: "GDPR & Technical Operations Focus",
          description: "Highlights 100% GDPR compliance, data regulation alignment, and API telemetry",
          bullets: [
            "Developed go-to-market strategies for two new SaaS modules ([AI-powered Logistics](https://usmanzakria.com#icon), Yard Management), collaborating with design to equip sales with new playbooks that led to a **24% increase in average deal size**.",
            "Built advanced Excel models, Python scripts, and BI dashboards for sales forecasting, proposal automation, and value proposition analysis, reducing commercials' processing time by **13%**.",
            "Evaluated 13 vendor solutions for live tracking APIs, migrating 1,500+ annual shipments to enhanced tracking and carbon calculation; increasing user adoption by **132%**.",
            "Led end-to-end website redesign, optimizing UX and SEO, resulting in a **36% increase in organic traffic**.",
            "Designed high-impact Figma demos addressing freight optimization using Agentic AI, securing a multi-million-dollar PoC; accelerating sales cycle by 20%.",
            "Led 100% GDPR compliance and implementation, ensuring product alignment with data regulation.",
            "Used Figma, Clay, Apollo, Mailjet, LinkedIn Ads, SQL, Python, Trello, Jira, PowerPoint, Excel (ETL, VLOOKUP, Pivot Tables, LAMBDA), Power BI, Claude, ElevenLabs, Play.ht, Synthesia, Slack.",
          ],
        },
      },
    },
  },
  other_experiences: [
    {
      "id": "exp-goodcore",
      "role": "SEO Content Writer (Part-time)",
      "company": "GoodCore Software",
      "period": "03/2024 – 08/2024",
      "visible": true,
      "bullets": [
        "Authored multiple articles on Agile SDLC with [Figma illustrations](https://usmanzakria.com#icon), increasing organic traffic by **18%**.",
        "Operated Semrush, Figma, Notion, Webflow, Google Analytics (GA4), Mixpanel, Grammarly, HubSpot.",
      ],
    },
    {
      "id": "exp-loreal",
      "role": "Final Year Project Trainee",
      "company": "L'Oréal Pakistan",
      "period": "01/2023 – 06/2023",
      "visible": true,
      "bullets": [
        "Created a business case, high-fidelity prototype, and go-to-market strategy for a salon booking app.",
        "Utilized Figma, Canva, NVIVO, R (tidytext, tm, sentimentr), AnswerThePublic, Google Trends.",
      ],
    },
    {
      "id": "exp-iba-ta",
      "role": "Teaching Assistant - Analytical Approach to Decisions",
      "company": "IBA",
      "period": "04/2022 – 06/2023",
      "visible": true,
      "bullets": [
        "Guided 250+ students through business analytics projects by creating an interactive learning environment.",
        "Employed Advanced Excel, SQL, R (ggplot2, dplyr, tidyr, lm, caret, tm), Google Colabs.",
      ],
    },
    {
      "id": "exp-dawlance",
      "role": "Consumer Insights Intern",
      "company": "Dawlance",
      "period": "07/2022 – 10/2022",
      "visible": true,
      "bullets": [
        "Led 5 consumer research projects with IPSOS (200+ participants), generating insights that optimized e-commerce strategy by mapping end-to-end consumer journeys, improving CTR by **6.3%**.",
        "Leveraged IPSOS digital communities, Brandwatch, Tableau, R, Google Workspace, Microsoft Office.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      title: "Agile SDLC Article Illustrations",
      description: "Designed Figma illustrations to simplify complex topics like **Agile, Scrum, DevOps** for non-technical audiences.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: true,
      defaultOrder: 1,
      tags: ["Figma", "Agile", "DevOps"],
    },
    {
      id: "proj-2",
      title: "Agentic AI in Finance (Beam AI)",
      description: "Explored Agentic AI players and use cases in Finance, creating a PoC automation workflow using **n8n**.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: true,
      defaultOrder: 2,
      tags: ["Agentic AI", "n8n", "FinTech"],
    },
    {
      id: "proj-3",
      title: "Property Price Prediction (Airbnb NYC)",
      description: "Developed and compared 4 regression models (**Step, Decision Tree, Lasso, Ridge**) to predict property prices and identify key valuation drivers using R.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: true,
      defaultOrder: 3,
      tags: ["R", "Machine Learning", "Predictive Analytics"],
    },
    {
      id: "proj-4",
      title: "AI Digital Twin Persona",
      description: "Synthesized 11-factor psychographics data into a functional **AI clone** of myself, testing with blind Turing Test.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: true,
      defaultOrder: 4,
      tags: ["Generative AI", "LLM", "Psychometrics"],
    },
    {
      id: "proj-5",
      title: "AI in Marketing Analytics - Visual Saliency",
      description: "Compared **deep learning and neuroscience-based AI saliency models**, studying key drivers of Ad/Brand Gaze.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: true,
      defaultOrder: 5,
      tags: ["Deep Learning", "Computer Vision", "Marketing Analytics"],
    },
    {
      id: "proj-6",
      title: "Signavio Competitive Analysis",
      description: "Compared leading BPM and Process Mining solutions, **Signavio and Celonis**, identifying strategic advantages, differentiators and competitive intelligence initiatives.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: false,
      defaultOrder: 6,
      tags: ["BPM", "Process Mining", "Signavio", "Celonis"],
    },
    {
      id: "proj-7",
      title: "Consumer Insights Research",
      description: "Mapped user journeys, benchmarking against competitors, optimizing Dawlance's DTC eCommerce strategy.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: false,
      defaultOrder: 7,
      tags: ["User Research", "Consumer Insights", "eCommerce"],
    },
    {
      id: "proj-8",
      title: "Product Onboarding Tutorials",
      description: "Leveraged **ElevenLabs, Play.ht, Synthesia, and DaVinci Resolve** to create intuitive user onboarding tutorials.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: false,
      defaultOrder: 8,
      tags: ["ElevenLabs", "Synthesia", "Video", "Onboarding"],
    },
    {
      id: "proj-9",
      title: "AI-Powered Logistics Platform",
      description: "Architected Agentic AI-powered logistics platform including **Conversational, Analytics, and Automation AI**.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: false,
      defaultOrder: 9,
      tags: ["Agentic AI", "Logistics", "Architecture"],
    },
    {
      id: "proj-10",
      title: "L'Oréal Financial Analysis",
      description: "Conducted detailed financial analysis of L'Oreal estimating **WACC, Valuation, and Strategic Assessment**.",
      url: "https://usmanzakria.com",
      showIcon: true,
      visible: false,
      defaultOrder: 10,
      tags: ["Financial Modeling", "Valuation", "DCF"],
    },
  ],
  skills_categories: {
    product_management: {
      id: "skill-pm",
      name: "Product Management",
      content: "Product Strategy, User Stories, User Research, Sprint Planning, Agile & Scrum, SaaS, Requirements Gathering, Feature Specification, UI/UX Design, Roadmapping, Backlog Management, Process Mapping",
      visible: false,
      isVariable: true,
    },
    product_marketing: {
      id: "skill-pmm",
      name: "Product Marketing",
      content: "Digital Marketing, CRM, SEO & Analytics, Content Writing, Go-to-Market, Social Media Campaigns, B2B Market Research, Consumer Insights, A/B Testing, UI/UX Design, User Journey Mapping, Cross-functional Collaboration",
      visible: true,
      isVariable: true,
    },
    product_and_data_analytics: {
      id: "skill-pda",
      name: "Product & Data Analytics",
      content: "[SQL](https://usmanzakria.com#icon), [Python](https://usmanzakria.com#icon), R, n8n, Tableau, Power BI, Advanced Excel, Project Documentation, Machine Learning, SPSS, User Research, Agile & Scrum, Requirements Gathering, Process Mapping, SaaS, Product Strategy",
      visible: false,
      isVariable: true,
    },
    data_analytics: {
      id: "skill-da",
      name: "Data Analytics",
      content: "[SQL](https://usmanzakria.com#icon), [Python](https://usmanzakria.com#icon), R, Tableau, Power BI, Advanced Excel, Data Visualization, Machine Learning, SPSS",
      visible: true,
      isVariable: false,
    },
    certifications_and_tools: {
      id: "skill-tools",
      name: "Certification & Tools",
      content: "[Associate Data Analyst](https://usmanzakria.com#icon), [Intermediate Python](https://usmanzakria.com#icon), [Intermediate SQL](https://usmanzakria.com#icon), [Customer Analytics (UPenn)](https://usmanzakria.com#icon), Figma, GA4, Canva, MixPanel, Clay, LinkedIn Ads, Notion, Jira, Trello, Microsoft Office, Google Workspace",
      visible: true,
      isVariable: false,
    },
  },
  awards: {
    title: "Awards",
    visible: true,
    items: [
      { id: "award-1", title: "L'Oréal Brandstorm National Finalist", visible: true },
      { id: "award-2", title: "Dawlance Top Intern", visible: true },
      { id: "award-3", title: "Quora (846k views)", visible: true },
      { id: "award-4", title: "IELTS 8.5 (Top 3% globally)", visible: true },
    ],
    content: "L'Oréal Brandstorm National Finalist | Dawlance Top Intern | Quora (846k views) | IELTS 8.5 (Top 3% globally)",
  },
  languages_availability: {
    title: "Languages & Availability",
    content: "English — IELTS 8.5 (C2) • German — A2 • Urdu/Hindi • Student Visa — Available 12+ months",
    visible: true,
  },
  custom_sections: [],
  settings: {
    aiProjectCount: 5,
    previewMode: "paginated",
    typography: {
      fontFamily: "Merriweather",
      headerFontSize: 14,
      sectionHeadingSize: 12.5,
      bodyFontSize: 10,
      lineHeight: 1.35,
    },
    spacing: {
      pageMarginX: 36,
      pageMarginY: 24,
      pageMarginTop: 24,
      pageMarginBottom: 24,
      sectionGap: 12,
      itemGap: 6,
    },
    sectionOrder: [
      "header",
      "summary",
      "education",
      "experience",
      "projects",
      "skills",
      "awards",
      "languages",
    ],
  },
};

interface ResumeStoreState {
  resume: ResumeData;
  masterContext: any;
  geminiApiKey: string;
  selectedAiModel: string;
  activeCoverLetter: string;
  targetRole: string;
  targetCompany: string;
  targetJobDescription: string;
  savedApplications: SavedApplication[];
  activeTab: "editor" | "presets" | "design" | "ai" | "cover-letter" | "settings" | "history";
  activeSection: string;
  previewZoom: number;
  isAiLoading: boolean;
  aiStatusMessage: string;

  // Actions
  setGeminiApiKey: (key: string) => void;
  setSelectedAiModel: (model: string) => void;
  updatePersonalInfo: (data: Partial<ResumeData["personal"]>) => void;
  updateSummary: (content: string, closingLine?: string) => void;

  // HashMove Presets
  setHashMovePreset: (presetKey: string) => void;
  addHashMovePreset: (key: string, preset: ExperiencePreset) => void;
  deleteHashMovePreset: (key: string) => void;
  updateHashMoveBullets: (presetKey: string, bullets: string[]) => void;
  addHashMoveBullet: (presetKey: string, bullet: string) => void;
  removeHashMoveBullet: (presetKey: string, index: number) => void;

  // Other Experiences
  updateOtherExperience: (id: string, updates: Partial<OtherExperienceItem>) => void;
  toggleOtherExperienceVisibility: (id: string) => void;
  addOtherExperience: (item: OtherExperienceItem) => void;
  deleteOtherExperience: (id: string) => void;

  // Education
  updateEducation: (id: string, updates: Partial<EducationItem>) => void;
  toggleEducationVisibility: (id: string) => void;
  addEducation: (item: EducationItem) => void;
  deleteEducation: (id: string) => void;

  // Projects
  updateProject: (id: string, updates: Partial<ProjectItem>) => void;
  toggleProjectVisibility: (id: string) => void;
  addProject: (project: ProjectItem) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (startIndex: number, endIndex: number) => void;
  applyTopNProjects: (n: number) => void;

  // Skills
  toggleSkillCategoryVisibility: (key: string) => void;
  selectVariableSkillCategory: (selectedKey: string) => void;
  updateSkillCategory: (key: string, updates: Partial<SkillCategory>) => void;
  addSkillCategory: (key: string, category: SkillCategory) => void;
  deleteSkillCategory: (key: string) => void;

  // Awards
  updateAwards: (updates: Partial<ResumeData["awards"]>) => void;
  addAwardItem: (title: string) => void;
  removeAwardItem: (id: string) => void;
  updateAwardItem: (id: string, title: string) => void;
  toggleAwardItem: (id: string) => void;

  // Languages
  updateLanguages: (updates: Partial<ResumeData["languages_availability"]>) => void;

  // Custom Sections
  addCustomSection: (item: CustomSectionItem) => void;
  updateCustomSection: (id: string, updates: Partial<CustomSectionItem>) => void;
  deleteCustomSection: (id: string) => void;
  toggleCustomSection: (id: string) => void;

  // Design & Spacing & Typography
  updateSettings: (updates: Partial<ResumeData["settings"]>) => void;
  updateTypography: (updates: Partial<ResumeData["settings"]["typography"]>) => void;
  updateSpacing: (updates: Partial<ResumeData["settings"]["spacing"]>) => void;
  setSectionOrder: (order: string[]) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  setPreviewMode: (mode: "paginated" | "continuous") => void;

  // Master Context
  updateMasterContext: (context: any) => void;

  // AI & Cover Letter
  setTargetInfo: (role: string, company: string, jd: string) => void;
  setCoverLetter: (letter: string) => void;
  setAiLoading: (loading: boolean, message?: string) => void;
  applyAiTailoringResult: (result: {
    selectedPresetKey?: string;
    selectedSkillKey?: string;
    selectedProjectIds?: string[];
    tailoredSummary?: string;
    closingLine?: string;
    coverLetter?: string;
  }) => void;

  // Saved Applications
  saveCurrentApplication: (name?: string) => string;
  loadApplication: (id: string) => void;
  deleteApplication: (id: string) => void;

  // UI Helpers
  setActiveTab: (tab: ResumeStoreState["activeTab"]) => void;
  setActiveSection: (section: string) => void;
  setPreviewZoom: (zoom: number) => void;
  resetToDefaults: () => void;
}

export const useResumeStore = create<ResumeStoreState>()(
  persist(
    (set, get) => ({
      resume: defaultInitialResumeData,
      masterContext: initialMasterContext,
      geminiApiKey: "",
      selectedAiModel: "gemini-2.0-flash",
      activeCoverLetter: "",
      targetRole: "",
      targetCompany: "",
      targetJobDescription: "",
      savedApplications: [],
      activeTab: "editor",
      activeSection: "summary",
      previewZoom: 1.0,
      isAiLoading: false,
      aiStatusMessage: "",

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setSelectedAiModel: (model) => set({ selectedAiModel: model }),

      updatePersonalInfo: (data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: { ...state.resume.personal, ...data },
          },
        })),

      updateSummary: (content, closingLine) =>
        set((state) => ({
          resume: {
            ...state.resume,
            summary: {
              content,
              closingLine: closingLine !== undefined ? closingLine : state.resume.summary.closingLine,
            },
          },
        })),

      setHashMovePreset: (presetKey) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience_presets: {
              ...state.resume.experience_presets,
              hashmove: {
                ...state.resume.experience_presets.hashmove,
                activePreset: presetKey,
              },
            },
          },
        })),

      addHashMovePreset: (key, preset) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience_presets: {
              ...state.resume.experience_presets,
              hashmove: {
                ...state.resume.experience_presets.hashmove,
                presets: {
                  ...state.resume.experience_presets.hashmove.presets,
                  [key]: preset,
                },
                activePreset: key,
              },
            },
          },
        })),

      deleteHashMovePreset: (key) =>
        set((state) => {
          const currentPresets = { ...state.resume.experience_presets.hashmove.presets };
          delete currentPresets[key];
          const remainingKeys = Object.keys(currentPresets);
          return {
            resume: {
              ...state.resume,
              experience_presets: {
                ...state.resume.experience_presets,
                hashmove: {
                  ...state.resume.experience_presets.hashmove,
                  presets: currentPresets,
                  activePreset: remainingKeys[0] || "product_marketing",
                },
              },
            },
          };
        }),

      updateHashMoveBullets: (presetKey, bullets) =>
        set((state) => {
          const currentHashmove = state.resume.experience_presets.hashmove;
          const currentPreset = currentHashmove.presets[presetKey];
          if (!currentPreset) return state;

          return {
            resume: {
              ...state.resume,
              experience_presets: {
                ...state.resume.experience_presets,
                hashmove: {
                  ...currentHashmove,
                  presets: {
                    ...currentHashmove.presets,
                    [presetKey]: {
                      ...currentPreset,
                      bullets,
                    },
                  },
                },
              },
            },
          };
        }),

      addHashMoveBullet: (presetKey, bullet) =>
        set((state) => {
          const currentHashmove = state.resume.experience_presets.hashmove;
          const currentPreset = currentHashmove.presets[presetKey];
          if (!currentPreset) return state;

          return {
            resume: {
              ...state.resume,
              experience_presets: {
                ...state.resume.experience_presets,
                hashmove: {
                  ...currentHashmove,
                  presets: {
                    ...currentHashmove.presets,
                    [presetKey]: {
                      ...currentPreset,
                      bullets: [...currentPreset.bullets, bullet],
                    },
                  },
                },
              },
            },
          };
        }),

      removeHashMoveBullet: (presetKey, index) =>
        set((state) => {
          const currentHashmove = state.resume.experience_presets.hashmove;
          const currentPreset = currentHashmove.presets[presetKey];
          if (!currentPreset) return state;

          return {
            resume: {
              ...state.resume,
              experience_presets: {
                ...state.resume.experience_presets,
                hashmove: {
                  ...currentHashmove,
                  presets: {
                    ...currentHashmove.presets,
                    [presetKey]: {
                      ...currentPreset,
                      bullets: currentPreset.bullets.filter((_, i) => i !== index),
                    },
                  },
                },
              },
            },
          };
        }),

      updateOtherExperience: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            other_experiences: state.resume.other_experiences.map((exp) =>
              exp.id === id ? { ...exp, ...updates } : exp
            ),
          },
        })),

      toggleOtherExperienceVisibility: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            other_experiences: state.resume.other_experiences.map((exp) =>
              exp.id === id ? { ...exp, visible: !exp.visible } : exp
            ),
          },
        })),

      addOtherExperience: (item) =>
        set((state) => ({
          resume: {
            ...state.resume,
            other_experiences: [...state.resume.other_experiences, item],
          },
        })),

      deleteOtherExperience: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            other_experiences: state.resume.other_experiences.filter((exp) => exp.id !== id),
          },
        })),

      updateEducation: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((edu) =>
              edu.id === id ? { ...edu, ...updates } : edu
            ),
          },
        })),

      toggleEducationVisibility: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((edu) =>
              edu.id === id ? { ...edu, visible: !edu.visible } : edu
            ),
          },
        })),

      addEducation: (item) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [...state.resume.education, item],
          },
        })),

      deleteEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((edu) => edu.id !== id),
          },
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) =>
              proj.id === id ? { ...proj, ...updates } : proj
            ),
          },
        })),

      toggleProjectVisibility: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) =>
              proj.id === id ? { ...proj, visible: !proj.visible } : proj
            ),
          },
        })),

      addProject: (project) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: [...state.resume.projects, project],
          },
        })),

      deleteProject: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.filter((p) => p.id !== id),
          },
        })),

      reorderProjects: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.resume.projects);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            resume: {
              ...state.resume,
              projects: result,
            },
          };
        }),

      applyTopNProjects: (n) =>
        set((state) => {
          const projects = state.resume.projects.map((proj, idx) => ({
            ...proj,
            visible: idx < n,
          }));
          return {
            resume: {
              ...state.resume,
              projects,
              settings: {
                ...state.resume.settings,
                aiProjectCount: n,
              },
            },
          };
        }),

      toggleSkillCategoryVisibility: (key) =>
        set((state) => {
          const category = state.resume.skills_categories[key];
          if (!category) return state;
          return {
            resume: {
              ...state.resume,
              skills_categories: {
                ...state.resume.skills_categories,
                [key]: {
                  ...category,
                  visible: !category.visible,
                },
              },
            },
          };
        }),

      selectVariableSkillCategory: (selectedKey) =>
        set((state) => {
          const updatedCategories = { ...state.resume.skills_categories };
          Object.keys(updatedCategories).forEach((key) => {
            if (updatedCategories[key].isVariable) {
              updatedCategories[key] = {
                ...updatedCategories[key],
                visible: key === selectedKey,
              };
            }
          });
          return {
            resume: {
              ...state.resume,
              skills_categories: updatedCategories,
            },
          };
        }),

      updateSkillCategory: (key, updates) =>
        set((state) => {
          const category = state.resume.skills_categories[key];
          if (!category) return state;
          return {
            resume: {
              ...state.resume,
              skills_categories: {
                ...state.resume.skills_categories,
                [key]: {
                  ...category,
                  ...updates,
                },
              },
            },
          };
        }),

      addSkillCategory: (key, category) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills_categories: {
              ...state.resume.skills_categories,
              [key]: category,
            },
          },
        })),

      deleteSkillCategory: (key) =>
        set((state) => {
          const newCategories = { ...state.resume.skills_categories };
          delete newCategories[key];
          return {
            resume: {
              ...state.resume,
              skills_categories: newCategories,
            },
          };
        }),

      updateAwards: (updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            awards: { ...state.resume.awards, ...updates },
          },
        })),

      addAwardItem: (title) =>
        set((state) => {
          const newItem: AwardItem = {
            id: "award-" + Date.now(),
            title,
            visible: true,
          };
          const currentItems = state.resume.awards.items || [];
          return {
            resume: {
              ...state.resume,
              awards: {
                ...state.resume.awards,
                items: [...currentItems, newItem],
              },
            },
          };
        }),

      removeAwardItem: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            awards: {
              ...state.resume.awards,
              items: (state.resume.awards.items || []).filter((a) => a.id !== id),
            },
          },
        })),

      updateAwardItem: (id, title) =>
        set((state) => ({
          resume: {
            ...state.resume,
            awards: {
              ...state.resume.awards,
              items: (state.resume.awards.items || []).map((a) => (a.id === id ? { ...a, title } : a)),
            },
          },
        })),

      toggleAwardItem: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            awards: {
              ...state.resume.awards,
              items: (state.resume.awards.items || []).map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)),
            },
          },
        })),

      updateLanguages: (updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            languages_availability: { ...state.resume.languages_availability, ...updates },
          },
        })),

      addCustomSection: (item) =>
        set((state) => ({
          resume: {
            ...state.resume,
            custom_sections: [...(state.resume.custom_sections || []), item],
            settings: {
              ...state.resume.settings,
              sectionOrder: [...state.resume.settings.sectionOrder, `custom-${item.id}`],
            },
          },
        })),

      updateCustomSection: (id, updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            custom_sections: (state.resume.custom_sections || []).map((sec) =>
              sec.id === id ? { ...sec, ...updates } : sec
            ),
          },
        })),

      deleteCustomSection: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            custom_sections: (state.resume.custom_sections || []).filter((sec) => sec.id !== id),
            settings: {
              ...state.resume.settings,
              sectionOrder: state.resume.settings.sectionOrder.filter((o) => o !== `custom-${id}`),
            },
          },
        })),

      toggleCustomSection: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            custom_sections: (state.resume.custom_sections || []).map((sec) =>
              sec.id === id ? { ...sec, visible: !sec.visible } : sec
            ),
          },
        })),

      updateSettings: (updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            settings: { ...state.resume.settings, ...updates },
          },
        })),

      updateTypography: (updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            settings: {
              ...state.resume.settings,
              typography: { ...state.resume.settings.typography, ...updates },
            },
          },
        })),

      updateSpacing: (updates) =>
        set((state) => ({
          resume: {
            ...state.resume,
            settings: {
              ...state.resume.settings,
              spacing: { ...state.resume.settings.spacing, ...updates },
            },
          },
        })),

      setSectionOrder: (order) =>
        set((state) => ({
          resume: {
            ...state.resume,
            settings: {
              ...state.resume.settings,
              sectionOrder: order,
            },
          },
        })),

      reorderSections: (startIndex, endIndex) =>
        set((state) => {
          const result = Array.from(state.resume.settings.sectionOrder);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return {
            resume: {
              ...state.resume,
              settings: {
                ...state.resume.settings,
                sectionOrder: result,
              },
            },
          };
        }),

      setPreviewMode: (mode) =>
        set((state) => ({
          resume: {
            ...state.resume,
            settings: {
              ...state.resume.settings,
              previewMode: mode,
            },
          },
        })),

      updateMasterContext: (context) =>
        set(() => ({
          masterContext: context,
        })),

      setTargetInfo: (role, company, jd) =>
        set(() => ({
          targetRole: role,
          targetCompany: company,
          targetJobDescription: jd,
        })),

      setCoverLetter: (letter) =>
        set(() => ({
          activeCoverLetter: letter,
        })),

      setAiLoading: (loading, message = "") =>
        set(() => ({
          isAiLoading: loading,
          aiStatusMessage: message,
        })),

      applyAiTailoringResult: (result) =>
        set((state) => {
          let updatedResume = { ...state.resume };

          if (result.selectedPresetKey && updatedResume.experience_presets.hashmove.presets[result.selectedPresetKey]) {
            updatedResume.experience_presets = {
              ...updatedResume.experience_presets,
              hashmove: {
                ...updatedResume.experience_presets.hashmove,
                activePreset: result.selectedPresetKey,
              },
            };
          }

          if (result.selectedSkillKey && updatedResume.skills_categories[result.selectedSkillKey]) {
            const newCats = { ...updatedResume.skills_categories };
            Object.keys(newCats).forEach((k) => {
              if (newCats[k].isVariable) {
                newCats[k] = {
                  ...newCats[k],
                  visible: k === result.selectedSkillKey,
                };
              }
            });
            updatedResume.skills_categories = newCats;
          }

          if (result.selectedProjectIds && result.selectedProjectIds.length > 0) {
            const idSet = new Set(result.selectedProjectIds);
            const selectedProjects = result.selectedProjectIds
              .map((id) => updatedResume.projects.find((p) => p.id === id))
              .filter(Boolean) as ProjectItem[];

            const remainingProjects = updatedResume.projects.filter(
              (p) => !idSet.has(p.id)
            );

            const reordered = [
              ...selectedProjects.map((p) => ({ ...p, visible: true })),
              ...remainingProjects.map((p) => ({ ...p, visible: false })),
            ];

            updatedResume.projects = reordered;
          }

          if (result.tailoredSummary) {
            updatedResume.summary = {
              content: result.tailoredSummary,
              closingLine: result.closingLine || updatedResume.summary.closingLine,
            };
          }

          return {
            resume: updatedResume,
            activeCoverLetter: result.coverLetter || state.activeCoverLetter,
            isAiLoading: false,
            aiStatusMessage: "AI Tailoring applied successfully!",
          };
        }),

      saveCurrentApplication: (name) => {
        const state = get();
        const id = "app-" + Date.now();
        const appName = name || `${state.targetCompany || "Company"} - ${state.targetRole || "Position"}`;
        const newApp: SavedApplication = {
          id,
          company: state.targetCompany || "Unknown Company",
          role: state.targetRole || "Position",
          jobDescription: state.targetJobDescription,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          resumeData: JSON.parse(JSON.stringify(state.resume)),
          coverLetter: state.activeCoverLetter,
          selectedPresetKey: state.resume.experience_presets.hashmove.activePreset,
          selectedSkillKey:
            Object.keys(state.resume.skills_categories).find(
              (k) => state.resume.skills_categories[k].isVariable && state.resume.skills_categories[k].visible
            ) || "product_marketing",
          selectedProjectIds: state.resume.projects.filter((p) => p.visible).map((p) => p.id),
        };

        set((s) => ({
          savedApplications: [newApp, ...s.savedApplications],
        }));
        return id;
      },

      loadApplication: (id) => {
        const state = get();
        const app = state.savedApplications.find((a) => a.id === id);
        if (!app) return;

        set(() => ({
          resume: JSON.parse(JSON.stringify(app.resumeData)),
          activeCoverLetter: app.coverLetter,
          targetCompany: app.company,
          targetRole: app.role,
          targetJobDescription: app.jobDescription,
          activeTab: "editor",
        }));
      },

      deleteApplication: (id) =>
        set((state) => ({
          savedApplications: state.savedApplications.filter((a) => a.id !== id),
        })),

      setActiveTab: (tab) => set(() => ({ activeTab: tab })),
      setActiveSection: (section) => set(() => ({ activeSection: section })),
      setPreviewZoom: (zoom) => set(() => ({ previewZoom: zoom })),
      resetToDefaults: () =>
        set(() => ({
          resume: defaultInitialResumeData,
        })),
    }),
    {
      name: "flowcv-resume-storage-v5",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
