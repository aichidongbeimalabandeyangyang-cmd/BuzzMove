/**
 * AI report generator using Gemini 3 Pro Preview.
 * Takes formatted analytics data and produces a ~1000 word markdown report.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are BuzzMove's analytics expert. BuzzMove is an AI video generation platform where users upload photos and generate animated videos using Kling AI.

Business model:
- Free users get limited credits
- Credit packs: one-time purchases ($4.99–$49.99)
- Subscriptions: Pro ($15.99–$19.99/mo) and Premium ($69.99/mo)
- Revenue from Google Ads SEM driving US traffic

Your task: Write a comprehensive analytics report (~1000 words) in markdown format. The report must be data-driven, actionable, and focus on business metrics.

Report structure:
1. **Executive Summary** — 2-3 sentence overview of the period
2. **User Funnel Analysis** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase, with conversion rates between each step
3. **Traffic & Acquisition** — sources, channels, Google Ads performance, organic search trends
4. **Revenue & Monetization** — total revenue, pack vs subscription breakdown, ARPU, ROI estimates
5. **SEO Performance** — search queries, impressions, CTR, ranking positions
6. **Key Insights** — 3-5 bullet points of notable findings
7. **Optimization Recommendations** — 3-5 specific, actionable suggestions

Rules:
- Use exact numbers from the data, never make up metrics
- Calculate conversion rates between funnel steps
- If data is missing or zero, note it and suggest why
- Write in professional but concise English
- Use markdown formatting (headers, bold, bullet points)
- Include a "Report generated on [date]" footer`;

export async function generateReport(formattedData: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env var not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\n---\n\nHere is the analytics data for this reporting period:\n\n${formattedData}\n\n---\n\nPlease write the analytics report now.`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 4096,
      temperature: 0.3,
    },
  });

  const response = result.response;
  const text = response.text();

  if (!text || text.length < 100) {
    throw new Error("Gemini returned an empty or too-short response");
  }

  return text;
}
