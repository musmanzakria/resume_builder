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
      apiProfiles: incomingProfiles,
      modelName = "gemini-3.8-flash",
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
      modelAttempts?: Record<string, number>;
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
          modelAttempts: p.modelAttempts || {},
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
        modelAttempts: {},
      }));
    }

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

                const configuredAttempts =
                  profile.modelAttempts && typeof profile.modelAttempts[currentModel] === "number"
                    ? profile.modelAttempts[currentModel]
                    : ((backoff.maxRetries ?? 1) + 1);
                const totalAttempts = Math.max(1, configuredAttempts);

                sendStatus(`⚡ [${profile.name}] Stage ${mIdx + 1}/${cascade.length}: Target model ${currentModel} (${totalAttempts} attempt${totalAttempts > 1 ? "s" : ""} allocated)...`);

                for (let attempt = 0; attempt < totalAttempts; attempt++) {
                  if (req.signal.aborted) break keyLoop;

                  const attemptStart = Date.now();
                  try {
                    console.log(`[Cover Letter Refine] [${profile.name}] Attempting model: ${currentModel} (attempt ${attempt + 1}/${totalAttempts})...`);
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
                      fallbackNotice = `Note: Primary model was at high capacity. Refined live via ${currentModel} using "${profile.name}".`;
                    }
                    sendStatus(`✨ [${profile.name}] Success! Refinement generated via ${currentModel} (attempt ${attempt + 1}/${totalAttempts}) in ${attemptDuration}s.`);
                    break keyLoop;
                  } catch (modelErr: any) {
                    const attemptDuration = ((Date.now() - attemptStart) / 1000).toFixed(1);
                    console.warn(`[Cover Letter Refine] [${profile.name}] ${currentModel} attempt ${attempt + 1} failed after ${attemptDuration}s:`, modelErr.message);

                    if (req.signal.aborted) break keyLoop;

                    const isQuotaOrRateLimit =
                      modelErr.status === 429 ||
                      (modelErr.message || "").toLowerCase().includes("resource_exhausted") ||
                      (modelErr.message || "").toLowerCase().includes("quota");

                    if (isQuotaOrRateLimit) {
                      sendStatus(`⚠️ [${profile.name}] 429 Rate Limit / Quota Exceeded on ${currentModel} (after ${attemptDuration}s).`);
                      if (pIdx < profilesToUse.length - 1) {
                        sendStatus(`🔄 Cycling immediately from "${profile.name}" to next Profile "${profilesToUse[pIdx + 1].name}"...`);
                        break modelLoop;
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

                    if (attempt + 1 < totalAttempts && isTransientError(modelErr)) {
                      const baseDelay = backoff.initialDelayMs || 1500;
                      const maxDelay = backoff.maxDelayMs || 8000;
                      const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt) + Math.floor(Math.random() * 400));
                      sendStatus(`⏳ [${profile.name}] 503 Server Overloaded on ${currentModel}. Exponential backoff pause ${(delay / 1000).toFixed(1)}s before attempt ${attempt + 2}/${totalAttempts}...`);
                      await new Promise((r) => setTimeout(r, delay));
                    } else {
                      if (totalAttempts > 1) {
                        sendStatus(`⚠️ [${profile.name}] ${currentModel} exhausted all ${totalAttempts} attempt(s) (${attemptDuration}s on last call). Cascading to next candidate...`);
                      } else {
                        sendStatus(`⚠️ [${profile.name}] ${currentModel} single attempt failed (${attemptDuration}s): ${modelErr.message}. Cascading immediately...`);
                      }
                      break;
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

            sendStatus(`⚠️ All configured API profiles & cascades exhausted for refinement.`);
          } catch (streamErr: any) {
            console.error("[Cover Letter Refine] Stream error:", streamErr);
          }

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: "error",
                success: false,
                error:
                  "Unable to connect to Google Gemini API (attempted gemini-3.8-flash, 3.7-flash, 3.6-flash). Please verify your Gemini API key in AI Tailor settings.",
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

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to connect to Google Gemini API. Please verify your Gemini API key in AI Tailor settings.",
      },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Cover Letter Refine error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to refine cover letter" },
      { status: 500 }
    );
  }
}
