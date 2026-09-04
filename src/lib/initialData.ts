import defaultResumeData from "../../master-resume-data.json";
import defaultMasterContext from "../../master-context.json";
import { ResumeData } from "@/types/resume";

export const initialResumeData: ResumeData = defaultResumeData as unknown as ResumeData;
export const initialMasterContext = defaultMasterContext;

export interface StructuredCoverLetter {
  salutation: string;
  intro: string;
  bodyParagraphs: Array<{ heading: string; body: string }>;
  selectedClProjectIds: string[];
  projectCount: number;
  portfolioHeading: string;
  portfolioUrl: string;
  permanentCertifications: string;
  availabilityHeading: string;
  availabilityText: string;
  closingLine: string;
  signOff: string;
  senderName: string;
  contactLine: string;
  documentTitle?: string;
  lineSpacing?: number;
  paragraphSpacing?: number;
}

export const initialStructuredCoverLetter: StructuredCoverLetter = {
  salutation: "Dear eBay Team,",
  intro: "I'm Usman, a Product Marketing professional with hands-on experience in transforming complex B2B technology into compelling, easy-to-understand content. I was thrilled to find the **Working Student Internal Product Marketing (Insight & Reporting Tools)** position at **eBay**, as it perfectly aligns with my background in driving product adoption and my passion for empowering teams through data. At HashMove, I supported sales and product teams with go-to-market strategies and enablement materials for internal AI and ERP tools, preparing me well to help your **Global Seller Development** team generate value from internal systems.",
  bodyParagraphs: [
    {
      heading: "Internal Enablement and Content Creation",
      body: "You need someone to create clear, user-facing content and deliver training. At HashMove, I designed and managed a multi-channel content pipeline, including short videos (tutorials) and how-to guides (brochures), which increased feature adoption by **362%** for the Arab British Chamber of Commerce. I also served as a Teaching Assistant for **250+ students**, strengthening my ability to deliver training and workshops on complex analytical topics."
    },
    {
      heading: "Cross-Functional Collaboration and Feedback Loops",
      body: "The role requires close collaboration with Product, Engineering, and Go-to-Market teams. I have a proven collaborative mindset, having led product development for a new SaaS vertical by gathering user insights, mapping processes, and working directly with engineering to ensure a smooth rollout. I am adept at managing feedback loops, from qualitative and quantitative research to triaging bugs and prioritizing feature requests."
    },
    {
      heading: "Data-Driven and Tech-Savvy Mindset",
      body: "The ideal candidate has analytical thinking skills and a tech-savvy attitude. My background includes building advanced **Excel** models, **n8n** automations, using BI dashboards, and leveraging **AI** (specifically Agentic AI) to develop new product flows. I am skilled in using data to find insights and am eager to apply this **data-driven** work ethic to support eBay's teams."
    }
  ],
  selectedClProjectIds: [
    "cl-video-onboarding",
    "cl-agentic-ai-finance",
    "cl-figma-agile"
  ],
  projectCount: 3,
  portfolioHeading: "Portfolio: usmanzakria.com",
  portfolioUrl: "https://usmanzakria.com/",
  permanentCertifications: "Certifications: Intermediate SQL, Intermediate Python, Customer Analytics (UPenn)",
  availabilityHeading: "Position Preference & Availability",
  availabilityText: "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
  closingLine: "Thank you for your time and consideration.",
  signOff: "Warm Regards,",
  senderName: "Usman Zakria",
  contactLine: "Berlin | +49 170 695 9515 | m.usmanzakria@gmail.com | Portfolio Link | 8.5 IELTS",
  documentTitle: "CoverLetter_UsmanZakria_eBay",
  lineSpacing: 1.18,
  paragraphSpacing: 8
};
