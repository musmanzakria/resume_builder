import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      targetRole,
      targetCompany,
      jobDescription,
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
Synthesize an authentic, high-converting, ATS-tailored 3-4 sentence professional summary. Balance disciplined structure with creative leeway to adapt tone and vocabulary to the employer's industry culture.

4-STAGE DYNAMIC FLOW:
1. STAGE 1 (Persona Hook): Tailor Usman's professional identity to match the target company's domain (e.g. SaaS, eCommerce, AI/Workflow Automation, Logistics ERP, Startup Strategy).
2. STAGE 2 (Technical & Language Bridge): Selectively highlight relevant tools from Usman's real toolkit (**Excel/Sheets**, **SQL**, **Python**, **n8n**, **Tableau**, **Figma**, **CRM (Salesforce/Pipedrive)**) and language fluency (**8.5 IELTS score / C2 English**, German A2).
3. STAGE 3 (Commercial & Execution Impact): Highlight cross-functional value (e.g. automating workflows to save team time, running KPI deep-dives, translating complex tech into clean documentation/sales pitch decks, executing growth experiments).
4. STAGE 4 (Closing Commitment Anchor): Standalone forward-looking commitment customized to the team:
   "I am eager to be an integral part of ${targetCompany || "the company"}'s team, [Value 1], [Value 2], and help [Company Mission Impact] as a **${cleanedRole} in Berlin**."

CRITICAL STYLE RULES:
- STRICT ZERO EM-DASHES: Never use em-dashes (—) or en-dashes (–) within narrative sentences. Use commas, parentheses, or smooth connective syntax.
- STRATEGIC BOLDING: Bolds 3-5 high-impact keywords, core tools, and metrics matching the JD with double asterisks (**).
- CLEAN ROLE TITLE: Strip all hiring noise like (m/f/d) or (m/w/d).

ACTIVE BENCHMARK FEW-SHOT SAMPLES (${activeSamples.length} Active Examples from Usman's Library):
${JSON.stringify(activeSamples.slice(0, 6), null, 2)}

7. FOR COVER LETTER: Draft a compelling, professional German/English standard cover letter referencing Usman's real achievements and 2-3 specific relevant projects from the master context.

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object matching this exact schema:
{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": "growth_marketing" | "product_management" | "product_and_data_analytics",
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "3-4 sentence tailored summary with strategic **bold keywords** and NO em-dashes...",
  "closingLine": "I am eager to be an integral part of ... as a **${cleanedRole} in Berlin**.",
  "coverLetter": "Full formatted cover letter text with paragraphs..."
}`;

    const userPrompt = `
TARGET ROLE: ${cleanedRole}
TARGET COMPANY: ${targetCompany || "Target Company"}
JOB DESCRIPTION:
${jobDescription || "Standard Product / Data / Marketing position"}

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
    const fallbackCoverLetter = `Dear Hiring Team at ${targetCompany || "the company"},\n\nI am writing to express my strong enthusiasm for the ${cleanedRole} role. With my background in data-driven storytelling, SaaS growth marketing, and multi-channel content strategy, I am excited about the opportunity to contribute directly to your team's mission.\n\nThroughout my career at HashMove and past engagements, I have focused on translating strategic insights into commercial impact—from building automated campaigns and designing high-impact Figma illustrations to orchestrating GTM execution and demand generation.\n\nI look forward to the opportunity to discuss how my skill set and proactive mindset can support ${targetCompany || "your organization"}.\n\nSincerely,\nUsman Zakria\nBerlin, Germany\nhttps://usmanzakria.com`;

    return NextResponse.json({
      success: true,
      data: {
        selectedPresetKey: chosenPreset,
        selectedSkillKey: chosenSkill,
        selectedProjectIds,
        tailoredSummary: fallbackSummary,
        closingLine: fallbackClosing,
        coverLetter: fallbackCoverLetter,
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
