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
    } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

    // Build the prompt context
    const availableHashMovePresets = masterResumeData?.experience_presets?.hashmove?.presets || {};
    const availableVariableSkills = Object.entries(masterResumeData?.skills_categories || {})
      .filter(([_, cat]: [string, any]) => cat.isVariable)
      .map(([k, cat]: [string, any]) => ({ key: k, name: cat.name, content: cat.content }));

    const projectPool = masterResumeData?.projects || [];

    const systemPrompt = `You are a precision AI Resume & Career Strategist for Usman Zakria.
Your objective is to tailor Usman's existing resume presets and generate an editable Cover Letter for a specific job application.

CRITICAL CONSTRAINTS (ZERO-HALLUCINATION POLICY):
1. FOR EXPERIENCES & PRESETS: You must NOT write or invent new bullets. You must STRICTLY CHOOSE the single best-fit preset key for HashMove from: ${JSON.stringify(Object.keys(availableHashMovePresets))}.
2. FOR SKILLS: You must STRICTLY CHOOSE the single best matching variable skill category key from: ${JSON.stringify(availableVariableSkills.map(s => s.key))}.
3. FOR PROJECTS: You must RANK all available projects from the provided pool and return an array of strictly the TOP ${topN} project IDs that are most relevant to the Target Role and Job Description.
   Available projects pool: ${JSON.stringify(projectPool.map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}
4. FOR PROFILE SUMMARY: Write a tailored 3-4 line bio in first-person ("I am Usman, a data-driven..."), naturally incorporating core keywords from the job description and candidate background.
5. FOR SUMMARY CLOSING LINE: You MUST end with this exact structure: "I look forward to working as a ${targetRole || "Working Student"} in your ${targetCompany || "company"} team."
6. FOR COVER LETTER: Draft a compelling, professional cover letter referencing Usman's real achievements and 2-3 specific relevant projects from the master context.

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object (no markdown code block fences if possible, or standard \`\`\`json) matching this exact schema:
{
  "selectedPresetKey": "product_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": "product_marketing" | "product_management" | "product_and_data_analytics",
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "3-4 line summary string...",
  "closingLine": "I look forward to working as a ...",
  "coverLetter": "Full formatted cover letter text with paragraphs..."
}`;

    const userPrompt = `
TARGET ROLE: ${targetRole || "Data / Product / Marketing Analyst"}
TARGET COMPANY: ${targetCompany || "Target Company"}
JOB DESCRIPTION:
${jobDescription || "Standard Product / Data / Marketing position"}

CANDIDATE MASTER CONTEXT:
${JSON.stringify(masterContext || {})}
`;

    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userPrompt },
      ]);

      const responseText = result.response.text();
      // Clean JSON formatting
      const cleaned = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return NextResponse.json({ success: true, data: parsed });
    } else {
      // Fallback deterministic heuristic classifier if API key is not yet set in environment
      const jdLower = (jobDescription + " " + targetRole).toLowerCase();
      let chosenPreset = "product_marketing";
      let chosenSkill = "product_marketing";

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

      const fallbackSummary = `Data-driven Product and Growth Specialist experienced in delivering scalable digital solutions, cross-functional collaboration, and technical analytics. Skilled in converting complex requirements into high-converting GTM strategies, automated workflows, and user-centric features tailored for ${targetCompany || "your team"}.`;
      const fallbackClosing = `I look forward to working as a ${targetRole || "Working Student"} in your ${targetCompany || "company"} team.`;
      const fallbackCoverLetter = `Dear Hiring Team at ${targetCompany || "the company"},\n\nI am writing to express my strong enthusiasm for the ${targetRole || "open position"} role. With my background in data analytics, product lifecycle management, and SaaS growth, I am excited about the opportunity to contribute directly to your team's mission.\n\nThroughout my career at HashMove and past engagements, I have focused on translating quantitative insights into commercial impact—from building automated forecasting tools in Python and Excel to launching enterprise GTM campaigns and designing Agentic AI workflow demos.\n\nI look forward to the opportunity to discuss how my skill set and proactive mindset can support ${targetCompany || "your organization"}.\n\nSincerely,\nUsman Zakria\nBerlin, Germany\nhttps://usmanzakria.com`;

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
      });
    }
  } catch (error: any) {
    console.error("AI Tailor error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
