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
      modelName = "gemini-3.8-flash",
      screeningQuestions,
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
- DEDUPLICATION: "tailoredSummary" must contain strictly Stages 1 to 3 (the 3 core bio sentences). Do NOT append Stage 4 to "tailoredSummary", because Stage 4 is provided separately in "closingLine" to prevent double-rendering!

ACTIVE BENCHMARK FEW-SHOT SAMPLES (${activeSamples.length} Active Examples from Usman's Gold-Standard Library):
${JSON.stringify(activeSamples.slice(0, 6), null, 2)}

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
   ${JSON.stringify((masterContext?.cl_projects_pool || []).map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}
${screeningInstruction}

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object matching this exact schema:
{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": "growth_marketing" | "product_management" | "product_and_data_analytics",
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
}`;

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

    if (apiKey) {
      const primaryModel = modelName || "gemini-3.8-flash";
      // Priority chain: start with user's chosen model, then fall back to high-availability variants if 503/429
      const candidateModels = Array.from(
        new Set([
          primaryModel,
          "gemini-3.8-flash",
          "gemini-3.7-flash",
          "gemini-3.6-flash",
        ])
      );

      const genAI = new GoogleGenerativeAI(apiKey);
      let parsedData: any = null;
      let actualModelUsed: string | null = null;
      let fallbackNotice: string | null = null;
      const startTime = Date.now();

      for (const currentModel of candidateModels) {
        try {
          console.log(`[AI Tailor] Attempting model: ${currentModel}...`);
          const model = genAI.getGenerativeModel({
            model: currentModel,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.25,
            },
          });

          // 45 second timeout per model attempt to allow deep reasoning & screening answers
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after 45s on ${currentModel}`)), 45000)
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

          if (currentModel !== primaryModel) {
            fallbackNotice = `Note: ${primaryModel} was at high capacity (503). Live response generated seamlessly via ${currentModel}.`;
            console.log(`[AI Tailor] ${fallbackNotice}`);
          }
          break; // Successfully generated with live AI!
        } catch (modelErr: any) {
          console.warn(`[AI Tailor] Model ${currentModel} error:`, modelErr.message);
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
        }

        return NextResponse.json({
          success: true,
          data: parsedData,
          modelRequested: primaryModel,
          modelUsed: actualModelUsed,
          fallbackNotice,
          isRealAi: true,
          durationMs: Date.now() - startTime,
        });
      }

      console.warn("[AI Tailor] All Gemini models were unavailable or timed out. Falling back to rulebook heuristic.");
    }

    // Rulebook-guided heuristic classifier if API call fails or key is invalid
    const jdLower = (jobDescription + " " + cleanedRole).toLowerCase();
    const isFinanceRole = jdLower.includes("finance") || jdLower.includes("financial") || jdLower.includes("accounting") || jdLower.includes("controlling") || jdLower.includes("audit") || jdLower.includes("payroll") || jdLower.includes("treasury") || jdLower.includes("accounts payable") || jdLower.includes("accounts receivable");

    let chosenPreset = "growth_marketing";
    let chosenSkill = "growth_marketing";

    if (isFinanceRole) {
      chosenPreset = "data_analytics";
      chosenSkill = "product_and_data_analytics";
    } else if (jdLower.includes("data") || jdLower.includes("sql") || jdLower.includes("bi") || jdLower.includes("analyst") || jdLower.includes("analytics")) {
      chosenPreset = "data_analytics";
      chosenSkill = "product_and_data_analytics";
    } else if (jdLower.includes("product manager") || jdLower.includes("pm") || jdLower.includes("roadmap") || jdLower.includes("scrum")) {
      chosenPreset = "product_management";
      chosenSkill = "product_management";
    } else if (jdLower.includes("gdpr") || jdLower.includes("compliance") || jdLower.includes("security") || jdLower.includes("operations")) {
      chosenPreset = "gdpr_operations";
      chosenSkill = "product_and_data_analytics";
    }

    // Rank resume projects by keyword match
    const scoredProjects = projectPool.map((proj: any) => {
      let score = 0;
      const text = (proj.title + " " + proj.description + " " + (proj.tags || []).join(" ")).toLowerCase();
      if (isFinanceRole) {
        if (text.includes("finance") || text.includes("financial") || text.includes("wacc") || text.includes("valuation") || text.includes("l'oreal") || text.includes("loreal")) score += 10;
        if (text.includes("beam ai") || text.includes("n8n") || text.includes("price prediction") || text.includes("regression")) score += 8;
      }
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
    const selectedClProjectIds = isFinanceRole
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
        screeningAnswers: fallbackScreeningAnswers,
        company: targetCompany || "Company"
      },
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
