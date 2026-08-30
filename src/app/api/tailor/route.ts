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
      modelName = "gemini-2.0-flash",
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

    const systemPrompt = `You are a precision AI Resume & Career Strategist for Usman Zakria.
Your objective is to tailor Usman's existing resume presets and generate an editable Cover Letter for a specific job application.

CRITICAL CONSTRAINTS (ZERO-HALLUCINATION POLICY):
1. FOR EXPERIENCES & PRESETS: You must NOT write or invent new bullets. You must STRICTLY CHOOSE the single best-fit preset key for HashMove from: ${JSON.stringify(Object.keys(availableHashMovePresets))}.
2. FOR SKILLS: You must STRICTLY CHOOSE the single best matching variable skill category key from: ${JSON.stringify(availableVariableSkills.map(s => s.key))}.
3. FOR PROJECTS: You must RANK all available projects from the provided pool and return an array of strictly the TOP ${topN} project IDs that are most relevant to the Target Role and Job Description.
   Available projects pool: ${JSON.stringify(projectPool.map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}
4. FOR PROFILE SUMMARY: Write a tailored 3-4 line bio in first-person ("Marketing professional with expertise in..."), naturally incorporating core keywords from the job description and candidate background.
5. FOR SUMMARY CLOSING LINE: You MUST end with this exact structure: "I am eager to be an integral part of ${targetCompany || "the company"}'s team, contribute to key goals, and help drive impact as a ${targetRole || "Working Student in Berlin"}."
6. FOR COVER LETTER: Draft a compelling, professional German/English standard cover letter referencing Usman's real achievements and 2-3 specific relevant projects from the master context.

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object (no markdown code block fences if possible, or standard \`\`\`json) matching this exact schema:
{
  "selectedPresetKey": "growth_marketing" | "data_analytics" | "product_management" | "gdpr_operations",
  "selectedSkillKey": "growth_marketing" | "product_management" | "product_and_data_analytics",
  "selectedProjectIds": ["id1", "id2", "id3", ... (length strictly ${topN})],
  "tailoredSummary": "3-4 line summary string...",
  "closingLine": "I am eager to be an integral part of ...",
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
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName || "gemini-2.0-flash" });

        const result = await model.generateContent([
          { text: systemPrompt },
          { text: userPrompt },
        ]);

        const responseText = result.response.text();
        const cleaned = responseText
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

        const parsed = JSON.parse(cleaned);
        return NextResponse.json({ success: true, data: parsed, modelUsed: modelName });
      } catch (aiErr: any) {
        console.warn("Gemini API direct call returned error, applying intelligent heuristic fallback:", aiErr.message);
      }
    }

    // Fallback deterministic heuristic classifier if API call fails or key is invalid
    const jdLower = (jobDescription + " " + targetRole).toLowerCase();
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

    const fallbackSummary = `Marketing professional with expertise in **SEO, Social Media, and Content**, experienced in delivering growth through data-driven storytelling and strategic positioning. I enjoy working in dynamic, fast-paced environments and can explain complex topics in a simple way with excellent communication skills in English (**8.5 IELTS / C2**), and growing German proficiency (A2). I bring practical skills in SEO/AEO/GEO, and social media content, a strong understanding of editorial calendars, and a strategic mindset for campaign ideas and PR activities.`;
    const fallbackClosing = `I am eager to be an integral part of ${targetCompany || "the"}'s Marketing team, create and schedule social media content, maintain and update our website, and help simplify the transition towards renewable energy as a **${targetRole || "Marketing Associate Working Student in Berlin"}**.`;
    const fallbackCoverLetter = `Dear Hiring Team at ${targetCompany || "the company"},\n\nI am writing to express my strong enthusiasm for the ${targetRole || "open position"} role. With my background in data-driven storytelling, SaaS growth marketing, and multi-channel content strategy, I am excited about the opportunity to contribute directly to your team's mission.\n\nThroughout my career at HashMove and past engagements, I have focused on translating strategic insights into commercial impact—from building automated campaigns and designing high-impact Figma illustrations to orchestrating GTM execution and demand generation.\n\nI look forward to the opportunity to discuss how my skill set and proactive mindset can support ${targetCompany || "your organization"}.\n\nSincerely,\nUsman Zakria\nBerlin, Germany\nhttps://usmanzakria.com`;

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
      modelUsed: "heuristic-fallback",
    });
  } catch (error: any) {
    console.error("AI Tailor error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to tailor resume" },
      { status: 500 }
    );
  }
}
