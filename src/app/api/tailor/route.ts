import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetRole,
      targetCompany,
      jobDescription,
      additionalContext,
      masterResumeData,
      masterContext,
      topN = 5,
      apiKey: userApiKey,
      apiProfiles: incomingProfiles,
      modelName = "gemini-3.8-flash",
      screeningQuestions,
      mode = "all", // "all" | "resume_only"
    } = body;

    // Resolve active API profiles pool
    let profilesToUse: Array<{
      id: string;
      name: string;
      apiKey: string;
      enabled: boolean;
      modelCascade: string[];
      backoffConfig?: {
        maxRetries: number;
        initialDelayMs: number;
        maxDelayMs: number;
        timeoutMs: number;
      };
    }> = [];

    if (Array.isArray(incomingProfiles) && incomingProfiles.length > 0) {
      profilesToUse = incomingProfiles
        .filter((p: any) => p && p.enabled !== false && typeof p.apiKey === "string" && p.apiKey.trim().length > 5)
        .map((p: any) => ({
          id: p.id || `prof-${Math.random().toString(36).substring(2, 6)}`,
          name: p.name || "Configured API",
          apiKey: p.apiKey.trim(),
          enabled: true,
          modelCascade:
            Array.isArray(p.modelCascade) && p.modelCascade.length > 0
              ? p.modelCascade
              : ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"],
          backoffConfig: p.backoffConfig || {
            maxRetries: 2,
            initialDelayMs: 1500,
            maxDelayMs: 8000,
            timeoutMs: 65000,
          },
        }));
    }

    if (profilesToUse.length === 0) {
      const rawKeysInput =
        userApiKey ||
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        "";

      const apiKeys: string[] = Array.from(
        new Set<string>(
          rawKeysInput
            .split(/[\n,;\s]+/)
            .map((k: string) => k.trim())
            .filter((k: string) => k.length > 5)
        )
      );

      profilesToUse = apiKeys.map((k, idx) => ({
        id: `prof-legacy-${idx}`,
        name: idx === 0 ? "Usman's API" : `Backup API #${idx + 1}`,
        apiKey: k,
        enabled: true,
        modelCascade: idx === 0
          ? ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"]
          : ["gemini-3.6-flash", "gemini-3.5-flash"],
        backoffConfig: {
          maxRetries: 2,
          initialDelayMs: 1500,
          maxDelayMs: 8000,
          timeoutMs: 65000,
        },
      }));
    }

    const isResumeOnly = mode === "resume_only";

    // Build the prompt context
    const availableHashMovePresets = masterResumeData?.experience_presets?.hashmove?.presets || {};
    const availableVariableSkills = Object.entries(masterResumeData?.skills_categories || {})
      .filter(([_, cat]: [string, any]) => cat.isVariable)
      .map(([k, cat]: [string, any]) => ({ key: k, name: cat.name, content: cat.content }));

    const rawProjects = masterResumeData?.projects || [];
    // Only consider projects that have NOT been disabled for AI consideration
    const projectPool = rawProjects.filter((p: any) => p.enabledForAi !== false && p.enabled !== false);

    // Extract active few-shot samples and rulebook from master context
    const rulebook = masterContext?.professional_bio?.profile_summary_rulebook;
    const allSamples = rulebook?.few_shot_benchmark_samples || [];
    const activeSamples = allSamples.filter((s: any) => s.enabled !== false);
    const archFramework = rulebook?.architectural_framework || {};
    const styleConstraints = rulebook?.style_and_ats_constraints || [];

    // Clean target role: remove (m/f/d), (m/w/d), m/w/x, dashes
    const cleanedRole = (targetRole || "Working Student")
      .replace(/\s*[\(\[\{]?(?:m\/w\/d|m\/f\/d|m\/w\/x|all genders|d\/m\/w)[\)\]\}]?\s*/gi, "")
      .replace(/^[–—\-\s]+|[–—\-\s]+$/g, "")
      .trim();

    // Prompt company reconnaissance & values context
    const companyInstruction = targetCompany
      ? `COMPANY RECONNAISSANCE & CORE VALUES SYNTHESIS:
   Before drafting, analyze ${targetCompany} deeply. Identify what ${targetCompany} manufactures or delivers (e.g. for Trench Group: specialized high-voltage electrical equipment, instrument transformers, bushings, and coil systems for power transmission and the global energy transition), what operational or strategic challenges their teams face, and their corporate reputation. Directly weave these concrete company values and products into the Cover Letter intro and Stage 4 closing commitment.`
      : `COMPANY CONTEXT: Focus on the company's core mission and industry as outlined in the Job Description.`;

    const screeningInstruction = screeningQuestions && screeningQuestions.trim()
      ? `\n8. APPLICATION SCREENING QUESTIONS (CUSTOM JOB PORTAL PROMPT):
   The user provided explicit application screening questions:
   ${screeningQuestions.trim()}
   For EACH question, synthesize a compelling, tailored, high-converting answer (typically 1-2 focused paragraphs) grounded strictly in Usman's background (HTW Berlin data master's, B2B SaaS experience at HashMove, n8n automated workflows, advanced Excel modeling, 8.5 IELTS score (C2), IBA Teaching Assistant). Embolden key metrics and tools (**362% increase**, **8.5 IELTS**, **13% reduction**, etc.). Return these in the "screeningAnswers" array.`
      : "";

    const systemPrompt = `You are a precision AI Resume & Career Strategist for Usman Zakria (Berlin, Germany).
Your objective is to tailor Usman's existing resume presets and generate an editable Cover Letter for a specific job application.

CRITICAL CONSTRAINTS (ZERO-HALLUCINATION POLICY):
1. FOR EXPERIENCES & PRESETS: You must NOT write or invent new bullets. You must STRICTLY CHOOSE the single best-fit preset key for HashMove from: ${JSON.stringify(Object.keys(availableHashMovePresets))}.
2. FOR SKILLS: You must STRICTLY CHOOSE the single best matching variable skill category key from: ${JSON.stringify(availableVariableSkills.map(s => s.key))}.
3. FOR RESUME PROJECTS: You must evaluate all ${projectPool.length} active projects in the candidate pool below and rank strictly the TOP ${topN} project IDs that are most relevant to the target role and JD.
   CRITICAL FOR RESUME PROJECTS:
   - Select strictly using the exact project "id" from the Available projects pool below (which all start with "proj-"). Do NOT use "cl-" IDs for the resume!
   - Newly added entries in this candidate pool (e.g. Spotify Regression, financial modeling, workflow automations) are actively competing candidates.
   - If the job description requires data analysis, statistical modeling, regression, Python, SQL, or metrics modeling, give high priority to projects that demonstrate those exact competencies (like the Spotify regression analysis). Every project in this candidate pool is an active candidate.
   Available projects pool (${projectPool.length} projects):
   ${JSON.stringify(projectPool.map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags || [], deep_context: p.deep_context || "" })))}

════════════════════════════════════════════════════════════════════════════════
USMAN'S PROFILE SUMMARY MASTER ARCHITECTURE & ATS RULEBOOK:
════════════════════════════════════════════════════════════════════════════════
OBJECTIVE:
${rulebook?.objective || "Synthesize an authentic, high-converting, ATS-tailored 3-4 sentence professional summary. Balance disciplined structure with creative leeway to adapt tone and vocabulary to the employer's industry culture."}

GOLD STANDARD BENCHMARK PRINCIPLE:
${rulebook?.gold_standard_clause || "The benchmark samples represent Usman's authentic gold standard—the exact cadence, keyword density, confidence, and visual bolding aesthetics desired. Use the 4-stage framework as an architectural guide, but look to the active samples as the benchmark of excellence. Do not rigidly restrict yourself only to the words in the samples; think out of the box and pull dynamically from Usman's entire background to tailor to novel roles."}

4-STAGE DYNAMIC FLOW & GENERALIZED SKILL SYNTHESIS:
1. STAGE 1 (Persona Hook): Establish immediate domain authority tailored to the target company's industry (SaaS, eCommerce, AI/Workflow Automation, Logistics ERP, BioTech, Startup Strategy).
2. STAGE 2 (Generalized Skill & Competency Bridge): Bridge hard software tools, domain methodologies, and interpersonal communication strengths. NOTE: Tools mentioned in rulebooks are illustrative examples, NOT an exhaustive list. Usman has diverse skills across Python, SQL, Excel, n8n, AI, Figma, CRM, BI, and more. Draw freely and authentically from Usman's complete Master Context based on the JD.
3. STAGE 3 (Commercial Impact & Execution Value): Demonstrate proactive execution (e.g. automating manual pipelines to give teams back time, conducting growth experiments, translating technical architecture into sales pitch decks and demos).
4. STAGE 4 (Closing Commitment Anchor): Clean, forward-looking commitment customized to the team's mission:
   "I am eager to be an integral part of ${targetCompany || "the company"}'s team, [Value 1], [Value 2], and help [Company Mission Impact] as a **${cleanedRole} in Berlin**."

CRITICAL ATS & STYLE RULES:
- STRICT ZERO EM-DASHES: Never use em-dashes (—) or en-dashes (–) within narrative sentences. Use commas, parentheses, or smooth connective syntax.
- STRATEGIC BOLDING: Bolds 3-5 high-impact keywords, core tools, and metrics matching the JD with double asterisks (**).
- CLEAN ROLE TITLE: Strip all hiring noise like (m/f/d) or (m/w/d).
- DEDUPLICATION: "tailoredSummary" must contain strictly Stages 1 to 3 (the 3 core bio sentences). Do NOT append Stage 4 to "tailoredSummary", because Stage 4 is provided separately in "closingLine" to prevent double-rendering!

ACTIVE BENCHMARK FEW-SHOT SAMPLES (${activeSamples.length} Active Examples from Usman's Gold-Standard Library):
${JSON.stringify(activeSamples.slice(0, 6), null, 2)}

${!isResumeOnly ? `
════════════════════════════════════════════════════════════════════════════════
COVER LETTER MASTER ARCHITECTURE & ATS RULEBOOK:
════════════════════════════════════════════════════════════════════════════════
1. ${companyInstruction}

2. SALUTATION: Always format as "Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}".

3. INTRO PARAGRAPH (IDENTITY-FIRST HOOK):
   - Begin with "I'm Usman, a [tailored persona, e.g. Product Marketing professional / data-driven Master's student at HTW Berlin with B2B SaaS experience in shipping AI projects...]. I was thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**, as it perfectly aligns with my background in [Core Value 1] and my passion for [Core Value 2]..."
   - Ground it in the company's real domain (e.g. power grid reliability, clean energy transition, industrial automation, or SaaS workflows).
   - BANNED CLICHÉS: Never use generic openings like "I am writing to express my interest in..." or "I believe I would be an asset to...". Jump straight into Usman's identity and relevant track record.

4. THREE CORE BODY PARAGRAPHS (MANDATORY SUBSTANTIAL LENGTH & "1-2 OR 1-2-3 BLOW"):
   - Synthesize exactly 3 paragraphs, each preceded by a bold heading (3-5 words) mapping directly to the 3 key requirement areas of the Job Description.
   - Heading Examples: "Execution and Cross-Functional Coordination", "Process Automation and Analytical Tools", "Data-Driven Mindset and Articulate Communication", "Internal Enablement and Product Adoption", "Strategic Backlog Prioritization and Delivery".
   - CRITICAL LENGTH REQUIREMENT: Each paragraph MUST be 3 to 5 substantial, fully-developed sentences (around 50 to 80 words per paragraph). NEVER output brief, skeletal 1-2 sentence paragraphs.
   - MANDATORY MULTI-PROJECT PROOF ("1-2 BLOW"): Every paragraph MUST integrate AT LEAST TWO concrete achievements or experiences from Usman's background:
     • Sentence 1 (The Need): Directly address the employer's operational or strategic priority from the JD ("You need someone who can...", "The role requires...", "At ${targetCompany || "the company"}, seamless...").
     • Sentence 2 (Blow #1 — Enterprise Proof): Anchor in a concrete enterprise achievement from HashMove (e.g. cross-functional GTM rollouts, LAM conversational AI, CXO simulation dashboards, or predictive modeling) with exact tools and bolded KPI phrase.
     • Sentence 3-4 (Blow #2 / #3 — Reinforcing Proof): Reinforce with a second distinct achievement or project (e.g. thesis regression study of 3,600 tracks, n8n automated pipelines reducing manual processing by **13%**, IBA Teaching Assistant mentoring 250+ students in advanced data analytics, or consumer research).

5. STRATEGIC BOLDING (EMBOLDEN COMPLETE KPI PHRASES & CORE TOOLS):
   - IMPORTANT: Do NOT bold just naked numbers (e.g. not just **362%**). Bold the ENTIRE KPI phrase and surrounding context:
     • **362% increase in feature adoption**
     • **24% increase in average deal size**
     • **213% boost in enterprise conversion rate**
     • **33% reduction in operational manhours**
     • **13% reduction in manual processing time**
     • **8.5 IELTS score (C2)**
     • **multivariate regression analysis across 3,600 data points**
   - Also boldly highlight core tools and methodologies (**SQL and Python**, **advanced Excel models (LAMBDA, VLOOKUP)**, **n8n workflow automations**, **Figma interactive prototypes**, **Agile sprint execution**, **Tableau and Power BI**).
   - GRAMMAR & READABILITY: Extracted JD terms must flow naturally in lowercase within sentences unless they are proper nouns or acronyms (never capitalize common words mid-sentence).

6. STRICT ZERO EM-DASHES: Never use em-dashes (— or –) in body sentences. Use natural commas, parentheses, or connective syntax.

7. PORTFOLIO PROJECTS SELECTION:
   Choose strictly the top 4 most relevant project IDs from Usman's concise CL projects pool:
   ${JSON.stringify(((masterContext?.cl_projects_pool || []).filter((p: any) => p.enabledForAi !== false && p.enabled !== false)).map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}
` : `
MODE: RESUME ONLY. You must focus exclusively on selecting the best HashMove preset, variable skill key, top-${topN} candidate projects from pool, and tailored 3-sentence summary & closing line. Omit cover letter generation.
`}
${screeningInstruction}

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object matching this exact schema:
${!isResumeOnly ? `{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": ${availableVariableSkills.length > 0 ? availableVariableSkills.map((s) => `"${s.key}"`).join(" | ") : '"product_marketing" | "product_management"'},
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "Cohesive 3-sentence tailored summary with strategic **bold keywords** and NO em-dashes (do NOT include Stage 4 closing commitment here)...",
  "closingLine": "I am eager to be an integral part of ... as a **${cleanedRole} in Berlin**.",
  "coverLetter": "Full plain text representation of cover letter...",
  "structuredCoverLetter": {
    "salutation": "Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}",
    "intro": "I'm Usman, a ... thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**...",
    "bodyParagraphs": [
      { "heading": "Heading 1 (3-5 words matching JD)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow and bolded KPI phrases & tools..." },
      { "heading": "Heading 2 (3-5 words matching JD)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow and bolded KPI phrases & tools..." },
      { "heading": "Heading 3 (3-5 words matching JD)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow and bolded KPI phrases & tools..." }
    ],
    "selectedClProjectIds": ["cl-proj-id-1", "cl-proj-id-2", "cl-proj-id-3", "cl-proj-id-4"],
    "projectCount": 4,
    "availabilityText": "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
    "documentTitle": "CoverLetter_UsmanZakria_${(targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "")}"
  },
  "screeningAnswers": [
    { "question": "Question text", "answer": "Tailored answer grounded in master context with bolded metrics" }
  ],
  "company": "${targetCompany || "Company"}"
}` : `{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": ${availableVariableSkills.length > 0 ? availableVariableSkills.map((s) => `"${s.key}"`).join(" | ") : '"product_marketing" | "product_management"'},
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "Cohesive 3-sentence tailored summary with strategic **bold keywords** and NO em-dashes (do NOT include Stage 4 closing commitment here)...",
  "closingLine": "I am eager to be an integral part of ... as a **${cleanedRole} in Berlin**.",
  "screeningAnswers": [
    { "question": "Question text", "answer": "Tailored answer grounded in master context with bolded metrics" }
  ],
  "company": "${targetCompany || "Company"}"
}`}`;

    const userPrompt = `
TARGET ROLE: ${cleanedRole}
TARGET COMPANY: ${targetCompany || "Target Company"}
JOB DESCRIPTION:
${jobDescription || "Standard Product / Data / Marketing position"}

${additionalContext ? `USER'S ADDITIONAL CONTEXT & CUSTOM INSTRUCTIONS:\n${additionalContext}\n` : ""}

${screeningQuestions ? `APPLICATION SCREENING QUESTIONS TO ANSWER:\n${screeningQuestions}\n` : ""}

CANDIDATE MASTER CONTEXT:
${JSON.stringify(masterContext || {})}
`;

    // Hoist JD keywords and dynamic scoring for both AI validation and fallback
    const jdLower = (jobDescription + " " + cleanedRole).toLowerCase();
    const isFinanceRole =
      jdLower.includes("finance") ||
      jdLower.includes("financial") ||
      jdLower.includes("accounting") ||
      jdLower.includes("controlling") ||
      jdLower.includes("audit") ||
      jdLower.includes("payroll") ||
      jdLower.includes("treasury") ||
      jdLower.includes("accounts payable") ||
      jdLower.includes("accounts receivable");

    const stopWords = new Set([
      "and", "the", "for", "with", "this", "that", "from", "you", "our", "your",
      "are", "have", "has", "will", "can", "role", "team", "work", "join", "about",
      "working", "student", "berlin", "germany"
    ]);
    const jdKeywords = (jobDescription + " " + cleanedRole)
      .toLowerCase()
      .split(/[^a-z0-9+#_.-]+/i)
      .filter((w) => w.length > 2 && !stopWords.has(w));

    // Dynamically score all candidate projects in projectPool
    const scoredProjects = projectPool.map((proj: any) => {
      let score = 0;
      const projText = (
        (proj.title || "") + " " +
        (proj.description || "") + " " +
        (proj.tags || []).join(" ") + " " +
        (proj.deep_context || "")
      ).toLowerCase();

      for (const kw of jdKeywords) {
        if (projText.includes(kw)) {
          score += kw.length > 5 ? 3 : 1.5;
        }
      }

      if (isFinanceRole) {
        if (projText.includes("finance") || projText.includes("valuation") || projText.includes("wacc") || projText.includes("l'oreal")) score += 10;
        if (projText.includes("regression") || projText.includes("price prediction") || projText.includes("n8n")) score += 6;
      }
      if (jdLower.includes("spotify") && projText.includes("spotify")) score += 20;
      if ((jdLower.includes("regression") || jdLower.includes("statistics") || jdLower.includes("data")) && (projText.includes("regression") || projText.includes("statistics") || projText.includes("spotify"))) score += 8;
      if (jdLower.includes("ai") && projText.includes("ai")) score += 4;
      if (jdLower.includes("sql") && projText.includes("sql")) score += 4;
      if (jdLower.includes("python") && projText.includes("python")) score += 4;
      if (jdLower.includes("marketing") && projText.includes("marketing")) score += 4;
      if (jdLower.includes("figma") && projText.includes("figma")) score += 4;

      return { id: proj.id, score };
    });
    scoredProjects.sort((a: any, b: any) => b.score - a.score);

    // Dynamically score all eligible Cover Letter projects
    const eligibleClPool = (masterContext?.cl_projects_pool || []).filter(
      (p: any) => p.enabledForAi !== false && p.enabled !== false
    );
    const scoredCl = eligibleClPool.map((proj: any) => {
      let score = 0;
      const projText = (
        (proj.title || "") + " " +
        (proj.description || "") + " " +
        (proj.tags || []).join(" ")
      ).toLowerCase();
      for (const kw of jdKeywords) {
        if (projText.includes(kw)) score += kw.length > 5 ? 3 : 1.5;
      }
      if (isFinanceRole && (projText.includes("finance") || projText.includes("wacc") || projText.includes("l'oreal"))) score += 10;
      if (jdLower.includes("spotify") && projText.includes("spotify")) score += 20;
      if (jdLower.includes("regression") && projText.includes("regression")) score += 8;
      return { id: proj.id, score };
    });
    scoredCl.sort((a: any, b: any) => b.score - a.score);

    const generateFallback = () => {
      let chosenPreset = "growth_marketing";
      let chosenSkill = "product_marketing";

      if (isFinanceRole) {
        chosenPreset = "data_analytics";
        chosenSkill = "product_marketing";
      } else if (jdLower.includes("data") || jdLower.includes("sql") || jdLower.includes("bi") || jdLower.includes("analyst") || jdLower.includes("analytics")) {
        chosenPreset = "data_analytics";
        chosenSkill = "product_marketing";
      } else if (jdLower.includes("product manager") || jdLower.includes("pm") || jdLower.includes("roadmap") || jdLower.includes("scrum") || jdLower.includes("user stories") || jdLower.includes("backlog")) {
        chosenPreset = "product_management";
        chosenSkill = "product_management";
      } else if (jdLower.includes("gdpr") || jdLower.includes("compliance") || jdLower.includes("security") || jdLower.includes("operations")) {
        chosenPreset = "gdpr_operations";
        chosenSkill = "product_marketing";
      }

      const selectedProjectIds = scoredProjects.slice(0, topN).map((p: any) => p.id);

      let fallbackSummary = "";
      if (isFinanceRole) {
        fallbackSummary = `A data-driven professional with strong analytical skills, experienced in leveraging **data and performance metrics** to inform business strategies, optimize operations, and drive impactful decisions. I thrive in commercially focused teams with hands-on experience in **Excel/Google Sheets, SQL, CRM systems, and Tableau**. Skilled at collecting, analyzing, and maintaining key performance data and automating workflows using tools like **n8n** to ensure real-time accuracy.`;
      } else if (chosenPreset === "data_analytics") {
        fallbackSummary = `A data-driven professional with strong analytical skills, experienced in leveraging **data and performance metrics** to inform business strategies, optimize operations, and drive impactful decisions. I thrive in commercially focused teams with hands-on experience in **Excel/Google Sheets, SQL, CRM systems, and Tableau**. Skilled at collecting, analyzing, and maintaining key performance data and automating workflows using tools like **n8n** to ensure real-time accuracy.`;
      } else if (chosenPreset === "product_management") {
        fallbackSummary = `Product Analyst with experience in **SaaS ERP ecosystems, user research, and Agile sprint execution**, skilled at translating user needs and operational data into high-impact product features. I bring strong skills in **process mapping, backlog prioritization, and cross-functional coordination** across engineering and commercial teams, backed by an **8.5 IELTS score** and builder mindset.`;
      } else {
        fallbackSummary = `Product Marketing professional with expertise in **SEO, Content Strategy, and Growth**, experienced in delivering measurable adoption through data-driven storytelling and clear positioning. I bring practical skills in **marketing automation, paid acquisition, and Figma design**, a strong understanding of editorial workflows, and excellent communication skills in English (**8.5 IELTS / C2**), and growing German proficiency (A2).`;
      }

      const fallbackClosing = `I am eager to be an integral part of ${targetCompany || "the company"}'s team, contribute to core strategic initiatives, and help drive sustainable impact as a **${cleanedRole} in Berlin**.`;

      const compClean = (targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "");
      
      const selectedClProjectIds = scoredCl.length >= 4
        ? scoredCl.slice(0, 4).map((p: any) => p.id)
        : isFinanceRole
          ? ["cl-loreal-finance", "cl-agentic-ai-finance", "cl-property-price", "cl-video-onboarding"]
          : ["cl-video-onboarding", "cl-agentic-ai-finance", "cl-figma-agile", "cl-ai-digital-twin"];
      
      const fallbackStructuredCL = {
        salutation: `Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}`,
        intro: `I'm Usman, a data-driven Master's student at HTW Berlin with B2B SaaS experience in shipping tech modules. I was thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**, as it perfectly aligns with my background in driving product adoption and my passion for empowering teams through data.`,
        bodyParagraphs: [
          {
            heading: "Execution and Cross-Functional Coordination",
            body: `You need someone who can coordinate seamlessly across diverse teams and translate complex operational goals into structured, high-impact results. At HashMove, I collaborated closely across Product, Engineering, and Go-to-Market teams to drive enterprise feature rollouts, managing feedback loops and maintaining structured PRDs in **Jira and Notion**. Furthermore, in my academic leadership as an IBA Teaching Assistant, I coordinated coursework and mentored over **250+ students in advanced data analytics and statistical modeling**, ensuring clear communication across technical and non-technical stakeholders.`
          },
          {
            heading: "Process Automation and Analytical Tools",
            body: `I have a proactive builder mindset dedicated to eliminating operational bottlenecks and empowering teams through data. I built advanced **Excel models (LAMBDA, VLOOKUP, dynamic arrays)** and automated multi-step workflows using **n8n**, achieving a **13% reduction in manual processing time** for commercial operations. In parallel, I developed interactive **Tableau and Power BI dashboards** to give leadership real-time visibility into mission-critical KPIs, ensuring transparent, data-backed decision-making.`
          },
          {
            heading: "Data-Driven Mindset and Articulate Communication",
            body: `I bring strong analytical rigor paired with articulate, native-level communication backed by an **8.5 IELTS score (C2)**. In my master's thesis at HTW Berlin, I conducted extensive multivariate regression analysis across **3,600 data points** to extract actionable predictive insights. I excel at translating complex technical architectures into intuitive documentation, engaging stakeholder presentations, and persuasive business collateral that fosters organizational alignment.`
          }
        ],
        selectedClProjectIds,
        projectCount: 4,
        availabilityText: "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
        documentTitle: `CoverLetter_UsmanZakria_${compClean || "Company"}`
      };

      const fallbackCoverLetter = `${fallbackStructuredCL.salutation}\n\n${fallbackStructuredCL.intro}\n\n${fallbackStructuredCL.bodyParagraphs.map(p => `${p.heading}\n${p.body}`).join("\n\n")}\n\nWarm Regards,\nUsman Zakria\nBerlin | +49 170 695 9515 | m.usmanzakria@gmail.com | Portfolio Link | 8.5 IELTS`;

      let fallbackScreeningAnswers: { question: string; answer: string }[] = [];
      if (screeningQuestions && screeningQuestions.trim()) {
        const qList = screeningQuestions
          .split(/\n+/)
          .map((q: string) => q.replace(/^[0-9]+[\.\)\-]\s*/, "").trim())
          .filter((q: string) => q.length > 5);

        fallbackScreeningAnswers = qList.map((q: string) => ({
          question: q,
          answer: `At HashMove, I collaborated across Product and Go-to-Market teams to deliver enterprise SaaS solutions, driving a **362% increase in feature adoption**. Combining practical experience in **n8n workflow automation**, advanced **Excel modeling**, and an **8.5 IELTS score (C2)** with my Master's studies at HTW Berlin, I translate operational complexity into structured execution and clear communication aligned with ${targetCompany || "the team"}'s strategic goals.`
        }));
      }

      return {
        data: {
          selectedPresetKey: chosenPreset,
          selectedSkillKey: chosenSkill,
          selectedProjectIds,
          tailoredSummary: fallbackSummary,
          closingLine: fallbackClosing,
          coverLetter: fallbackCoverLetter,
          structuredCoverLetter: fallbackStructuredCL,
          screeningAnswers: fallbackScreeningAnswers,
          company: targetCompany || "Company"
        }
      };
    };

    if (profilesToUse.length > 0) {
      const primaryModel = modelName || "gemini-3.8-flash";
      let parsedData: any = null;
      let actualModelUsed: string | null = null;
      let actualProfileUsed: string | null = null;
      let fallbackNotice: string | null = null;
      const startTime = Date.now();

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendStatus = (msg: string) => {
            try {
              controller.enqueue(encoder.encode(JSON.stringify({ type: "status", message: msg }) + "\n"));
            } catch {}
          };

          const isTransientError = (err: any): boolean => {
            if (!err) return false;
            const msg = (err.message || "").toLowerCase();
            const status = err.status || err.statusCode;
            return (
              status === 503 ||
              status === 429 ||
              status === 500 ||
              status === 502 ||
              status === 504 ||
              msg.includes("503") ||
              msg.includes("429") ||
              msg.includes("unavailable") ||
              msg.includes("resource_exhausted") ||
              msg.includes("high demand") ||
              msg.includes("overloaded") ||
              msg.includes("capacity") ||
              msg.includes("fetch failed") ||
              msg.includes("econnreset") ||
              msg.includes("etimedout")
            );
          };

          const isClientError = (err: any): boolean => {
            if (!err) return false;
            const msg = (err.message || "").toLowerCase();
            const status = err.status || err.statusCode;
            return (
              status === 400 ||
              status === 401 ||
              status === 403 ||
              msg.includes("api_key_invalid") ||
              msg.includes("api key not valid") ||
              msg.includes("permission denied")
            );
          };

          try {
            keyLoop: for (let pIdx = 0; pIdx < profilesToUse.length; pIdx++) {
              const profile = profilesToUse[pIdx];
              const maskedKey =
                profile.apiKey.length > 10
                  ? `${profile.apiKey.slice(0, 4)}...${profile.apiKey.slice(-4)}`
                  : `Key #${pIdx + 1}`;

              const backoff = profile.backoffConfig || {
                maxRetries: 2,
                initialDelayMs: 1500,
                maxDelayMs: 8000,
                timeoutMs: 65000,
              };

              const cascade =
                profile.modelCascade && profile.modelCascade.length > 0
                  ? profile.modelCascade
                  : [primaryModel, "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash"];

              sendStatus(`🔑 [Profile ${pIdx + 1}/${profilesToUse.length}] Activating "${profile.name}" (${maskedKey})`);
              sendStatus(`📋 Pipeline Cascade: ${cascade.join(" → ")}`);

              const genAI = new GoogleGenerativeAI(profile.apiKey);

              modelLoop: for (let mIdx = 0; mIdx < cascade.length; mIdx++) {
                const currentModel = cascade[mIdx];
                if (req.signal.aborted) {
                  sendStatus(`🛑 Request cancelled by client.`);
                  break keyLoop;
                }

                sendStatus(`⚡ [${profile.name}] Stage ${mIdx + 1}/${cascade.length}: Connecting to ${currentModel}...`);

                const maxRetries = backoff.maxRetries ?? 2;
                for (let attempt = 0; attempt <= maxRetries; attempt++) {
                  if (req.signal.aborted) break keyLoop;

                  const attemptStart = Date.now();
                  try {
                    console.log(`[AI Tailor] [${profile.name}] Attempting model: ${currentModel} (attempt ${attempt + 1}/${maxRetries + 1})...`);
                    const model = genAI.getGenerativeModel({
                      model: currentModel,
                      generationConfig: {
                        responseMimeType: "application/json",
                      },
                    });

                    const timeoutMs = backoff.timeoutMs || 65000;
                    const timeoutPromise = new Promise((_, reject) =>
                      setTimeout(() => reject(new Error(`Timeout after ${(timeoutMs / 1000).toFixed(0)}s on ${currentModel}`)), timeoutMs)
                    );

                    const generatePromise = model.generateContent([
                      { text: systemPrompt },
                      { text: userPrompt },
                    ]);

                    const result: any = await Promise.race([generatePromise, timeoutPromise]);
                    const responseText = result.response.text();
                    const cleaned = responseText
                      .replace(/```json/g, "")
                      .replace(/```/g, "")
                      .trim();

                    parsedData = JSON.parse(cleaned);
                    actualModelUsed = currentModel;
                    actualProfileUsed = profile.name;

                    const attemptDuration = ((Date.now() - attemptStart) / 1000).toFixed(1);
                    if (currentModel !== cascade[0]) {
                      fallbackNotice = `Note: Primary model was at high capacity (503). Tailored live via ${currentModel} using "${profile.name}".`;
                      console.log(`[AI Tailor] ${fallbackNotice}`);
                    }
                    sendStatus(`✨ [${profile.name}] Success! Received complete response from ${currentModel} in ${attemptDuration}s.`);
                    break keyLoop; // Successfully generated with live AI!
                  } catch (modelErr: any) {
                    const attemptDuration = ((Date.now() - attemptStart) / 1000).toFixed(1);
                    console.warn(`[AI Tailor] [${profile.name}] ${currentModel} attempt ${attempt + 1} failed after ${attemptDuration}s:`, modelErr.message);

                    if (req.signal.aborted) break keyLoop;

                    const isQuotaOrRateLimit =
                      modelErr.status === 429 ||
                      (modelErr.message || "").toLowerCase().includes("resource_exhausted") ||
                      (modelErr.message || "").toLowerCase().includes("quota");

                    if (isQuotaOrRateLimit) {
                      sendStatus(`⚠️ [${profile.name}] 429 Rate Limit / Quota Exceeded on ${currentModel} (after ${attemptDuration}s).`);
                      if (pIdx < profilesToUse.length - 1) {
                        sendStatus(`🔄 Cycling immediately from "${profile.name}" to next Profile "${profilesToUse[pIdx + 1].name}"...`);
                        break modelLoop; // Skip rest of models for this key, cycle to next profile!
                      }
                    }

                    if (isClientError(modelErr)) {
                      sendStatus(`❌ [${profile.name}] API Key or Auth error on ${currentModel}: ${modelErr.message}`);
                      if (pIdx < profilesToUse.length - 1) {
                        sendStatus(`🔄 Cycling to next Profile "${profilesToUse[pIdx + 1].name}"...`);
                        break modelLoop;
                      } else {
                        break modelLoop;
                      }
                    }

                    if (attempt < maxRetries && isTransientError(modelErr)) {
                      const baseDelay = backoff.initialDelayMs || 1500;
                      const maxDelay = backoff.maxDelayMs || 8000;
                      const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 400));
                      sendStatus(`⏳ [${profile.name}] 503 Server Overloaded on ${currentModel}. Exponential backoff waiting ${(delay / 1000).toFixed(1)}s (Retry ${attempt + 1}/${maxRetries})...`);
                      await new Promise((r) => setTimeout(r, delay));
                    } else {
                      sendStatus(`⚠️ [${profile.name}] ${currentModel} attempt ${attempt + 1} failed (${attemptDuration}s): ${modelErr.message}`);
                      break; // Move to next candidate model in cascade
                    }
                  }
                }
              }

              if (parsedData) break keyLoop;
              if (pIdx < profilesToUse.length - 1) {
                sendStatus(`⚠️ "${profile.name}" exhausted its configured cascade. Failing over to [Profile ${pIdx + 2}/${profilesToUse.length}] "${profilesToUse[pIdx + 1].name}"...`);
              }
            }

            if (parsedData && actualModelUsed) {
              // Sanitize output to guarantee zero em-dashes
              if (parsedData.tailoredSummary) {
                parsedData.tailoredSummary = parsedData.tailoredSummary
                  .replace(/[—–]/g, ", ")
                  .replace(/\s+/g, " ")
                  .trim();
              }
              if (parsedData.closingLine) {
                parsedData.closingLine = parsedData.closingLine
                  .replace(/[—–]/g, " ")
                  .replace(/\s+/g, " ")
                  .trim();
              }

              // Sanitize structuredCoverLetter
              if (parsedData.structuredCoverLetter) {
                if (parsedData.structuredCoverLetter.intro) {
                  parsedData.structuredCoverLetter.intro = parsedData.structuredCoverLetter.intro.replace(/[—–]/g, ", ");
                }
                if (Array.isArray(parsedData.structuredCoverLetter.bodyParagraphs)) {
                  parsedData.structuredCoverLetter.bodyParagraphs = parsedData.structuredCoverLetter.bodyParagraphs.map((p: any) => ({
                    heading: (p.heading || "").replace(/[—–]/g, "").trim(),
                    body: (p.body || "").replace(/[—–]/g, ", ").trim()
                  }));
                }

                // Sanitize structuredCoverLetter.selectedClProjectIds
                const validClIds = new Set(eligibleClPool.map((p: any) => p.id));
                const resolvedClIds: string[] = [];
                if (Array.isArray(parsedData.structuredCoverLetter.selectedClProjectIds)) {
                  for (const rawId of parsedData.structuredCoverLetter.selectedClProjectIds) {
                    if (!rawId || typeof rawId !== "string") continue;
                    if (validClIds.has(rawId)) {
                      if (!resolvedClIds.includes(rawId)) resolvedClIds.push(rawId);
                      continue;
                    }
                    const cleanRaw = rawId.toLowerCase().replace(/^(cl-|proj-)/, "").replace(/[-_]/g, " ").trim();
                    const matched = eligibleClPool.find((p: any) => {
                      const pTitle = (p.title || "").toLowerCase();
                      const pId = (p.id || "").toLowerCase();
                      return (
                        pId === rawId.toLowerCase() ||
                        pTitle === rawId.toLowerCase() ||
                        (cleanRaw.length > 3 && (pTitle.includes(cleanRaw) || cleanRaw.includes(pTitle))) ||
                        (cleanRaw.includes("spotify") && (pTitle.includes("spotify") || pId.includes("spotify")))
                      );
                    });
                    if (matched && !resolvedClIds.includes(matched.id)) {
                      resolvedClIds.push(matched.id);
                    }
                  }
                }
                if (resolvedClIds.length < 4) {
                  for (const sp of scoredCl) {
                    if (!resolvedClIds.includes(sp.id)) {
                      resolvedClIds.push(sp.id);
                      if (resolvedClIds.length >= 4) break;
                    }
                  }
                }
                parsedData.structuredCoverLetter.selectedClProjectIds = resolvedClIds.slice(0, 4);
              }

              // Sanitize and resolve selectedProjectIds against the active projectPool
              const validPoolIds = new Set(projectPool.map((p: any) => p.id));
              const resolvedProjectIds: string[] = [];
              if (Array.isArray(parsedData.selectedProjectIds)) {
                for (const rawId of parsedData.selectedProjectIds) {
                  if (!rawId || typeof rawId !== "string") continue;
                  if (validPoolIds.has(rawId)) {
                    if (!resolvedProjectIds.includes(rawId)) resolvedProjectIds.push(rawId);
                    continue;
                  }
                  const cleanRaw = rawId.toLowerCase().replace(/^(proj-|cl-)/, "").replace(/[-_]/g, " ").trim();
                  const matched = projectPool.find((p: any) => {
                    const pTitle = (p.title || "").toLowerCase();
                    const pId = (p.id || "").toLowerCase();
                    return (
                      pId === rawId.toLowerCase() ||
                      pTitle === rawId.toLowerCase() ||
                      (cleanRaw.length > 3 && (pTitle.includes(cleanRaw) || cleanRaw.includes(pTitle))) ||
                      (cleanRaw.includes("spotify") && (pTitle.includes("spotify") || pId.includes("spotify")))
                    );
                  });
                  if (matched && !resolvedProjectIds.includes(matched.id)) {
                    resolvedProjectIds.push(matched.id);
                  }
                }
              }

              if (resolvedProjectIds.length < topN) {
                for (const sp of scoredProjects) {
                  if (!resolvedProjectIds.includes(sp.id)) {
                    resolvedProjectIds.push(sp.id);
                    if (resolvedProjectIds.length >= topN) break;
                  }
                }
              }
              parsedData.selectedProjectIds = resolvedProjectIds.slice(0, topN);

              controller.enqueue(
                encoder.encode(
                  JSON.stringify({
                    type: "result",
                    success: true,
                    data: parsedData,
                    modelRequested: primaryModel,
                    modelUsed: actualModelUsed,
                    profileUsed: actualProfileUsed,
                    fallbackNotice,
                    isRealAi: true,
                    durationMs: Date.now() - startTime,
                  }) + "\n"
                )
              );
              controller.close();
              return;
            }

            sendStatus(`⚠️ All configured API profiles & cascades exhausted. Falling back to gold-standard rulebook heuristics...`);
            console.warn("[AI Tailor] All configured profiles and models were exhausted. Falling back to rulebook heuristic.");
          } catch (streamErr: any) {
            console.error("[AI Tailor] Stream error:", streamErr);
          }

          // Generate fallback data
          const fallbackResult = generateFallback();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "result",
                success: true,
                data: fallbackResult.data,
                modelRequested: primaryModel,
                modelUsed: "rulebook-heuristic",
                isRealAi: false,
                fallbackNotice: "Google Gemini API was experiencing high demand (503). Generated using gold-standard rulebook heuristics with substantial multi-project paragraphs.",
                durationMs: Date.now() - startTime,
              }) + "\n"
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    }

    // Heuristic generator if no API key is provided
    const fallback = generateFallback();
    return NextResponse.json({
      type: "result",
      success: true,
      data: fallback.data,
      modelRequested: modelName || "gemini-3.8-flash",
      modelUsed: "rulebook-heuristic",
      isRealAi: false,
      fallbackNotice: "Google Gemini API was experiencing high demand (503). Generated using gold-standard rulebook heuristics with substantial multi-project paragraphs.",
    });
  } catch (error: any) {
    console.error("AI Tailor error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
