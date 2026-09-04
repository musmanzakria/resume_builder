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
      modelName = "gemini-3.6-flash",
    } = body;

    const apiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    // Build the prompt context
    const availableHashMovePresets = masterResumeData?.experience_presets?.hashmove?.presets || {};
    const availableVariableSkills = Object.entries(masterResumeData?.skills_categories || {})
      .filter(([_, cat]: [string, any]) => cat.isVariable)
      .map(([k, cat]: [string, any]) => ({ key: k, name: cat.name, content: cat.content }));

    const projectPool = masterResumeData?.projects || [];

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

    const systemPrompt = `You are a precision AI Resume & Career Strategist for Usman Zakria (Berlin, Germany).
Your objective is to tailor Usman's existing resume presets and generate an editable Cover Letter for a specific job application.

CRITICAL CONSTRAINTS (ZERO-HALLUCINATION POLICY):
1. FOR EXPERIENCES & PRESETS: You must NOT write or invent new bullets. You must STRICTLY CHOOSE the single best-fit preset key for HashMove from: ${JSON.stringify(Object.keys(availableHashMovePresets))}.
2. FOR SKILLS: You must STRICTLY CHOOSE the single best matching variable skill category key from: ${JSON.stringify(availableVariableSkills.map(s => s.key))}.
3. FOR PROJECTS: You must RANK all available projects from the provided pool and return an array of strictly the TOP ${topN} project IDs that are most relevant to the Target Role and Job Description.
   Available projects pool: ${JSON.stringify(projectPool.map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}

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

ACTIVE BENCHMARK FEW-SHOT SAMPLES (${activeSamples.length} Active Examples from Usman's Gold-Standard Library):
${JSON.stringify(activeSamples.slice(0, 6), null, 2)}

════════════════════════════════════════════════════════════════════════════════
COVER LETTER MASTER ARCHITECTURE & ATS RULEBOOK:
════════════════════════════════════════════════════════════════════════════════
1. SALUTATION: Always format as "Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}".
2. INTRO PARAGRAPH: Begin with "I'm Usman, a [tailored persona, e.g. Product Marketing professional / data-driven Master's student at HTW Berlin with B2B SaaS experience in shipping AI projects...]. I was thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**, as it perfectly aligns with my background in [Core Value 1] and my passion for [Core Value 2]..."
3. THREE CORE BODY PARAGRAPHS (EACH WITH A PUNCHY BOLD HEADING):
   - Synthesize exactly 3 paragraphs, each preceded by a bold heading (3-5 words) that maps directly against the 3 key requirement areas of the Job Description.
   - Heading Examples from Usman's winning letters: "Internal Enablement and Content Creation", "Cross-Functional Collaboration and Feedback Loops", "Data-Driven and Tech-Savvy Mindset", "Operational Support and Project Coordination", "Strategic Collaboration and Project Management", "Process Optimization and Internal Tools".
   - Opening sentence addresses employer's pain point ("You need someone who...", "The role requires...", "At HashMove, a B2B...").
   - Highlight and bold real tools and metrics. IMPORTANT: Any tools (**Excel**, **SQL**, **n8n**, **Figma**, **Jira**, **Notion**, **Tableau**, **Power BI**, etc.) or metrics (**362%**, **13%**, **800k+ views**, **8.5 IELTS**) mentioned in guidelines are NON-RESTRICTIVE ILLUSTRATIVE EXAMPLES ONLY. Usman is proficient across diverse tools, languages, and methodologies. Draw freely and accurately from Usman's Master Context to best match what the specific employer needs.
   - STRICT ZERO EM-DASHES: Never use em-dashes (— or –). Use natural commas, parentheses, or smooth connective syntax.
4. PORTFOLIO PROJECTS SELECTION:
   Choose strictly the top 3 most relevant project IDs from Usman's concise CL projects pool:
   ${JSON.stringify((masterContext?.cl_projects_pool || []).map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object matching this exact schema:
{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": "growth_marketing" | "product_management" | "product_and_data_analytics",
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "3-4 sentence tailored summary with strategic **bold keywords** and NO em-dashes...",
  "closingLine": "I am eager to be an integral part of ... as a **${cleanedRole} in Berlin**.",
  "coverLetter": "Full plain text representation of cover letter...",
  "structuredCoverLetter": {
    "salutation": "Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}",
    "intro": "I'm Usman, a ... thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**...",
    "bodyParagraphs": [
      { "heading": "Heading 1 (3-5 words matching JD)", "body": "Paragraph 1 with bolded tools & metrics..." },
      { "heading": "Heading 2 (3-5 words matching JD)", "body": "Paragraph 2 with bolded tools & metrics..." },
      { "heading": "Heading 3 (3-5 words matching JD)", "body": "Paragraph 3 with bolded tools & metrics..." }
    ],
    "selectedClProjectIds": ["cl-proj-id-1", "cl-proj-id-2", "cl-proj-id-3"],
    "projectCount": 3,
    "availabilityText": "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
    "documentTitle": "CoverLetter_UsmanZakria_${(targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "")}"
  },
  "company": "${targetCompany || "Company"}"
}`;

    const userPrompt = `
TARGET ROLE: ${cleanedRole}
TARGET COMPANY: ${targetCompany || "Target Company"}
JOB DESCRIPTION:
${jobDescription || "Standard Product / Data / Marketing position"}

${additionalContext ? `USER'S ADDITIONAL CONTEXT & CUSTOM INSTRUCTIONS:\n${additionalContext}\n` : ""}

CANDIDATE MASTER CONTEXT:
${JSON.stringify(masterContext || {})}
`;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: modelName || "gemini-3.6-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.25,
          }
        });

        // Fast race timeout (12 seconds max)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Gemini API request timed out after 12s")), 12000)
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

        const parsed = JSON.parse(cleaned);

        // Sanitize output to guarantee zero em-dashes
        if (parsed.tailoredSummary) {
          parsed.tailoredSummary = parsed.tailoredSummary
            .replace(/[—–]/g, ", ")
            .replace(/\s+/g, " ")
            .trim();
        }
        if (parsed.closingLine) {
          parsed.closingLine = parsed.closingLine
            .replace(/[—–]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }

        // Sanitize structuredCoverLetter
        if (parsed.structuredCoverLetter) {
          if (parsed.structuredCoverLetter.intro) {
            parsed.structuredCoverLetter.intro = parsed.structuredCoverLetter.intro.replace(/[—–]/g, ", ");
          }
          if (Array.isArray(parsed.structuredCoverLetter.bodyParagraphs)) {
            parsed.structuredCoverLetter.bodyParagraphs = parsed.structuredCoverLetter.bodyParagraphs.map((p: any) => ({
              heading: (p.heading || "").replace(/[—–]/g, "").trim(),
              body: (p.body || "").replace(/[—–]/g, ", ").trim()
            }));
          }
        }

        return NextResponse.json({ success: true, data: parsed, modelUsed: modelName });
      } catch (aiErr: any) {
        console.warn("Gemini API call warning:", aiErr.message, "Falling back to rulebook-guided heuristic.");
      }
    }

    // Rulebook-guided heuristic classifier if API call fails or key is invalid
    const jdLower = (jobDescription + " " + cleanedRole).toLowerCase();
    let chosenPreset = "growth_marketing";
    let chosenSkill = "growth_marketing";

    if (jdLower.includes("data") || jdLower.includes("sql") || jdLower.includes("bi") || jdLower.includes("analyst") || jdLower.includes("analytics")) {
      chosenPreset = "data_analytics";
      chosenSkill = "product_and_data_analytics";
    } else if (jdLower.includes("product manager") || jdLower.includes("pm") || jdLower.includes("roadmap") || jdLower.includes("scrum")) {
      chosenPreset = "product_management";
      chosenSkill = "product_management";
    } else if (jdLower.includes("gdpr") || jdLower.includes("compliance") || jdLower.includes("security") || jdLower.includes("operations")) {
      chosenPreset = "gdpr_operations";
      chosenSkill = "product_and_data_analytics";
    }

    // Rank projects by keyword match
    const scoredProjects = projectPool.map((proj: any) => {
      let score = 0;
      const text = (proj.title + " " + proj.description + " " + (proj.tags || []).join(" ")).toLowerCase();
      if (jdLower.includes("ai") && text.includes("ai")) score += 3;
      if (jdLower.includes("data") && (text.includes("data") || text.includes("regression") || text.includes("sql"))) score += 3;
      if (jdLower.includes("marketing") && text.includes("marketing")) score += 3;
      if (jdLower.includes("product") && text.includes("product")) score += 2;
      if (jdLower.includes("figma") && text.includes("figma")) score += 2;
      return { id: proj.id, score };
    });

    scoredProjects.sort((a: any, b: any) => b.score - a.score);
    const selectedProjectIds = scoredProjects.slice(0, topN).map((p: any) => p.id);

    // Rulebook-conforming fallback matching Usman's voice
    let fallbackSummary = "";
    if (chosenPreset === "data_analytics") {
      fallbackSummary = `A data-driven professional with strong analytical skills, experienced in leveraging **data and performance metrics** to inform business strategies, optimize operations, and drive impactful decisions. I thrive in commercially focused teams with hands-on experience in **Excel/Google Sheets, SQL, CRM systems, and Tableau**. Skilled at collecting, analyzing, and maintaining key performance data and automating workflows using tools like **n8n** to ensure real-time accuracy.`;
    } else if (chosenPreset === "product_management") {
      fallbackSummary = `Product Analyst with experience in **SaaS ERP ecosystems, user research, and Agile sprint execution**, skilled at translating user needs and operational data into high-impact product features. I bring strong skills in **process mapping, backlog prioritization, and cross-functional coordination** across engineering and commercial teams, backed by an **8.5 IELTS score** and builder mindset.`;
    } else {
      fallbackSummary = `Product Marketing professional with expertise in **SEO, Content Strategy, and Growth**, experienced in delivering measurable adoption through data-driven storytelling and clear positioning. I bring practical skills in **marketing automation, paid acquisition, and Figma design**, a strong understanding of editorial workflows, and excellent communication skills in English (**8.5 IELTS / C2**), and growing German proficiency (A2).`;
    }

    const fallbackClosing = `I am eager to be an integral part of ${targetCompany || "the"}'s team, contribute to core strategic initiatives, and help drive sustainable impact as a **${cleanedRole} in Berlin**.`;
    
    const fallbackCoverLetter = `Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}\n\nI'm Usman, a data-driven Master's student at HTW Berlin with B2B SaaS experience. I was thrilled to find the ${cleanedRole} position at ${targetCompany || "your company"}.\n\nThroughout my career at HashMove, I have focused on translating strategic insights into commercial impact, automating workflows with n8n and building advanced Excel models.\n\nWarm Regards,\nUsman Zakria\nBerlin | +49 170 695 9515 | m.usmanzakria@gmail.com | Portfolio Link | 8.5 IELTS`;

    const compClean = (targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "");

    const fallbackStructuredCL = {
      salutation: `Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}`,
      intro: `I'm Usman, a data-driven Master's student at HTW Berlin with B2B SaaS experience in shipping tech modules. I was thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**, as it perfectly aligns with my background in driving product adoption and my passion for empowering teams through data.`,
      bodyParagraphs: [
        {
          heading: "Execution and Cross-Functional Coordination",
          body: `You need someone who can coordinate across teams and deliver structured results. At HashMove, I collaborated across Product, Engineering, and Go-to-Market teams to ensure seamless feature rollouts, managing feedback loops and prioritizing user requirements.`
        },
        {
          heading: "Process Automation and Analytical Tools",
          body: `I have a proactive mindset for improving efficiency. I built advanced **Excel** models and automated workflows using **n8n**, reducing manual processing time by **13%**, while maintaining transparent documentation in **Jira** and **Notion**.`
        },
        {
          heading: "Data-Driven Mindset and Communication",
          body: `I bring strong analytical skills paired with articulate communication backed by an **8.5 IELTS score**. I excel at transforming complex technical concepts into intuitive documentation and actionable insights for business stakeholders.`
        }
      ],
      selectedClProjectIds: ["cl-video-onboarding", "cl-agentic-ai-finance", "cl-figma-agile"],
      projectCount: 3,
      availabilityText: "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
      documentTitle: `CoverLetter_UsmanZakria_${compClean || "Company"}`
    };

    return NextResponse.json({
      success: true,
      data: {
        selectedPresetKey: chosenPreset,
        selectedSkillKey: chosenSkill,
        selectedProjectIds,
        tailoredSummary: fallbackSummary,
        closingLine: fallbackClosing,
        coverLetter: fallbackCoverLetter,
        structuredCoverLetter: fallbackStructuredCL,
        company: targetCompany || "Company"
      },
      modelUsed: "rulebook-heuristic",
    });
  } catch (error: any) {
    console.error("AI Tailor error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
