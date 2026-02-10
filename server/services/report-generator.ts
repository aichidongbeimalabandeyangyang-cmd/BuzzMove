/**
 * AI report generator using Gemini 3 Pro Preview.
 * Takes formatted analytics data and produces a ~1000 word markdown report.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `你是 BuzzMove 的数据分析专家。BuzzMove 是一个 AI 视频生成平台，用户上传照片后通过 Kling AI 生成动态视频。

商业模式：
- 免费用户获得有限积分
- 积分包：一次性购买（$4.99–$49.99）
- 订阅：Pro（$15.99–$19.99/月）和 Premium（$69.99/月）
- 通过 Google Ads SEM 投放获取美国市场流量

任务：撰写一篇约 1000 字的中文数据分析报告，使用 markdown 格式。报告必须以数据为依据，注重可执行性，聚焦业务指标。

报告结构：
1. **摘要** — 2-3 句话概述本周期的整体表现
2. **用户漏斗分析** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase，计算每步之间的转化率
3. **流量与获客** — 流量来源、渠道分布、Google Ads 投放效果、自然搜索趋势
4. **收入与变现** — 总收入、积分包 vs 订阅的占比、ARPU、ROI 估算
5. **SEO 表现** — 搜索词、展示量、点击率、排名
6. **关键洞察** — 3-5 条值得关注的发现
7. **优化建议** — 3-5 条具体的、可落地的优化方向

规则：
- 使用数据中的准确数字，绝不编造指标
- 计算漏斗各步骤之间的转化率
- 如果数据缺失或为零，指出并分析可能的原因
- 使用专业但简洁的中文撰写
- 使用 markdown 格式（标题、加粗、列表）
- 末尾注明"报告生成时间：[日期]"`;

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
            text: `${SYSTEM_PROMPT}\n\n---\n\n以下是本报告周期的分析数据：\n\n${formattedData}\n\n---\n\n请用中文撰写分析报告。`,
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
