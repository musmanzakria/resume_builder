import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      currentCoverLetter,
      refinementInstructions,
      jobDescription = "",
      targetRole = "",
      targetCompany = "",
      masterContext,
      apiKey: userApiKey,
      modelName = "gemini-3.8-flash",
    } = body;

    const apiKey =
      userApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      "";

    if (!refinementInstructions || !refinementInstructions.trim()) {
      return NextResponse.json(
        { success: false, error: "Refinement instructions are required." },
        { status: 400 }
      );
    }

    const cleanedRole = (targetRole || "Working Student")
      .replace(/\s*[\(\[\{]?(?:m\/w\/d|m\/f\/d|m\/w\/x|all genders|d\/m\/w)[\)\]\}]?\s*/gi, "")
      .replace(/^[–—\-\s]+|[–—\-\s]+$/g, "")
      .trim();

    const clRulebook = masterContext?.professional_bio?.cover_letter_rulebook;
    const clPool = (masterContext?.cl_projects_pool || []).filter((p: any) => p.enabledForAi !== false && p.enabled !== false);

    const systemPrompt = `You are a precision AI Executive Career Strategist for Usman Zakria (Berlin, Germany).
Your task is to REFINE and EDIT Usman's existing tailored Cover Letter based on the user's specific feedback and refinement instructions.

CRITICAL MANDATE:
You must fulfill the user's requested changes while strictly adhering to Usman's Cover Letter Master Architecture & ATS Rulebook.

USMAN'S COVER LETTER MASTER ARCHITECTURE & ATS RULES:
1. STRICT ZERO EM-DASHES: Never use em-dashes (— or –) anywhere in narrative sentences. Use commas, parentheses, or smooth connective syntax.
2. IDENTITY-FIRST HOOK: Intro must begin with "I'm Usman, a [tailored persona]... I was thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**..."
3. THREE CORE BODY PARAGRAPHS:
   - Exactly 3 paragraphs, each with a bold 3-5 word heading (e.g. "Execution and Cross-Functional Coordination", "Process Automation and Analytical Tools", "Data-Driven Rigor and Communication").
   - MANDATORY SUBSTANTIAL LENGTH: 3 to 5 substantial sentences per paragraph (50 to 80 words). NEVER output brief, skeletal 1-2 sentence paragraphs.
   - MANDATORY "1-2 BLOW" MULTI-PROJECT PROOF:
     • Sentence 1 (The Need): Direct tie to employer priority from JD.
     • Sentence 2 (Blow #1 — Enterprise Proof): Anchor in HashMove enterprise achievement with exact tools and bolded KPI phrase.
     • Sentence 3-4 (Blow #2 / #3 — Reinforcing Proof): Reinforce with a second distinct achievement or project (e.g. thesis regression study of 3,600 tracks, n8n automated pipelines reducing manual processing by **13%**, IBA Teaching Assistant mentoring 250+ students in advanced data analytics).
4. STRATEGIC BOLDING:
   - Embolden the ENTIRE KPI phrase and surrounding context:
     • **362% increase in feature adoption**
     • **24% increase in average deal size**
     • **213% boost in enterprise conversion rate**
     • **33% reduction in operational manhours**
     • **13% reduction in manual processing time**
     • **8.5 IELTS score (C2)**
     • **multivariate regression analysis across 3,600 data points**
   - Also boldly highlight core tools (**SQL and Python**, **advanced Excel models (LAMBDA, VLOOKUP)**, **n8n workflow automations**, **Figma interactive prototypes**, **Agile sprint execution**).
5. PORTFOLIO PROJECTS:
   Select up to 4 project IDs from eligible CL projects pool:
   ${JSON.stringify(clPool.map((p: any) => ({ id: p.id, title: p.title, description: p.description, tags: p.tags })))}

USER REFINEMENT INSTRUCTIONS:
"${refinementInstructions.trim()}"

OUTPUT FORMAT:
Respond with ONLY a valid, raw JSON object matching this exact schema:
{
  "salutation": "Dear ${targetCompany ? `${targetCompany} Team,` : "Hiring Team,"}",
  "intro": "I'm Usman, a ... thrilled to find the **${cleanedRole}** position at **${targetCompany || "the company"}**...",
  "bodyParagraphs": [
    { "heading": "Heading 1 (3-5 words)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow, bolded KPI phrases, and refined content..." },
    { "heading": "Heading 2 (3-5 words)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow, bolded KPI phrases, and refined content..." },
    { "heading": "Heading 3 (3-5 words)", "body": "Substantial 3-5 sentence paragraph with 1-2 blow, bolded KPI phrases, and refined content..." }
  ],
  "selectedClProjectIds": ["cl-proj-id-1", "cl-proj-id-2", "cl-proj-id-3", "cl-proj-id-4"],
  "projectCount": 4,
  "availabilityText": "I’m based in Berlin and immediately available. I speak English (C2) and German (learning A2) and thrive in fast-paced, collaborative environments that value growth and experimentation.",
  "documentTitle": "CoverLetter_UsmanZakria_${(targetCompany || "Company").replace(/[^a-zA-Z0-9_-]/g, "")}"
}`;

    const userPrompt = `
TARGET ROLE: ${cleanedRole}
TARGET COMPANY: ${targetCompany || "Target Company"}
JOB DESCRIPTION:
${jobDescription || "Standard Position"}

CURRENT COVER LETTER CONTENT TO REFINE:
${JSON.stringify(currentCoverLetter || {}, null, 2)}

USER'S REFINEMENT FEEDBACK:
${refinementInstructions.trim()}

CANDIDATE MASTER CONTEXT:
${JSON.stringify(masterContext || {})}
`;

    if (apiKey) {
      const primaryModel = modelName || "gemini-3.8-flash";
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
          console.log(`[Cover Letter Refine] Attempting model: ${currentModel}...`);
          const model = genAI.getGenerativeModel({
            model: currentModel,
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.3,
            },
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout after 40s on ${currentModel}`)), 40000)
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
            fallbackNotice = `Note: ${primaryModel} was at high capacity. Refinement generated seamlessly via ${currentModel}.`;
          }
          break;
        } catch (modelErr: any) {
          console.warn(`[Cover Letter Refine] Model ${currentModel} error:`, modelErr.message);
        }
      }

      if (parsedData && actualModelUsed) {
        // Sanitize output
        if (parsedData.intro) {
          parsedData.intro = parsedData.intro.replace(/[—–]/g, ", ");
        }
        if (Array.isArray(parsedData.bodyParagraphs)) {
          parsedData.bodyParagraphs = parsedData.bodyParagraphs.map((p: any) => ({
            heading: (p.heading || "").replace(/[—–]/g, "").trim(),
            body: (p.body || "").replace(/[—–]/g, ", ").trim(),
          }));
        }

        // Validate selectedClProjectIds
        const validClIds = new Set(clPool.map((p: any) => p.id));
        const resolvedClIds: string[] = [];
        if (Array.isArray(parsedData.selectedClProjectIds)) {
          for (const rawId of parsedData.selectedClProjectIds) {
            if (!rawId || typeof rawId !== "string") continue;
            if (validClIds.has(rawId)) {
              if (!resolvedClIds.includes(rawId)) resolvedClIds.push(rawId);
              continue;
            }
            const cleanRaw = rawId.toLowerCase().replace(/^(cl-|proj-)/, "").replace(/[-_]/g, " ").trim();
            const matched = clPool.find((p: any) => {
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
          for (const p of clPool) {
            if (!resolvedClIds.includes(p.id)) {
              resolvedClIds.push(p.id);
              if (resolvedClIds.length >= 4) break;
            }
          }
        }
        parsedData.selectedClProjectIds = resolvedClIds.slice(0, 4);

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
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to connect to Google Gemini API (attempted gemini-3.8-flash, 3.7-flash, 3.6-flash). Please verify your Gemini API key in AI Tailor settings.",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Cover Letter Refine error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refine cover letter" },
      { status: 500 }
    );
  }
}
