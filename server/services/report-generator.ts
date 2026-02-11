/**
 * AI report generator using Gemini 3 Pro Preview.
 * Two report types: half-day (~600 words) and daily (~1500 words).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ReportType } from "./analytics-data";

const BASE_CONTEXT = `你是 BuzzMove 的数据分析专家。BuzzMove 是一个 AI 视频生成平台，用户上传照片后通过 Kling AI 生成动态视频。

商业模式：
- 免费用户获得有限积分
- 积分包：一次性购买（$4.99–$49.99）
- 订阅：Pro（$4.99/周，首周试用$0.99）和 Premium（$14.99/周），均提供年付（-29%）
- 通过 Google Ads SEM 投放获取美国市场流量

规则：
- 使用数据中的准确数字，绝不编造指标
- 计算漏斗各步骤之间的转化率
- 如果数据缺失或为零，指出并分析可能的原因
- 使用专业但简洁的中文撰写
- 使用 markdown 格式（标题、加粗、列表）
- 重要：不要使用 markdown 表格语法（| 分隔的表格），用加粗标题 + 缩进列表的方式展示结构化数据
- 末尾注明"报告生成时间：[日期时间]"`;

const HALF_DAY_PROMPT = `${BASE_CONTEXT}

任务：撰写一篇约 600 字的中文**半日运营快报**，覆盖过去 12 小时的数据。报告侧重运营层面的快速洞察。

报告结构：
1. **摘要** — 1-2 句话概述半日表现
2. **用户漏斗快照** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase，计算关键转化率
3. **流量快照** — 主要流量来源和渠道表现，campaign 级别表现，Google Ads 关键词和广告组效果
4. **收入快照** — 总收入、积分包 vs 订阅分布
5. **异常与关注点** — 2-3 条需要关注的异常或机会`;

const DAILY_PROMPT = `${BASE_CONTEXT}

任务：撰写一篇约 1500 字的中文**日度深度分析报告**，覆盖过去 24 小时的数据，并结合过去 7 天的趋势数据进行分析。

报告结构：
1. **摘要** — 2-3 句话概述当日整体表现及趋势判断

2. **7日数据趋势分析** — 这是本报告的重要板块
   - 分析过去7天每日的关键指标变化趋势（活跃用户、会话、新用户、视频生成量、收入）
   - 计算并解读环比（日环比）变化，识别上升/下降趋势
   - 计算并解读同比（7天前 vs 今天）变化，评估整体增长方向
   - 标注异常波动日并分析可能原因

3. **用户漏斗深度分析** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase
   - 计算每步之间的转化率
   - 识别漏斗中最大的流失环节并分析原因

4. **流量与获客深度分析** — 这是本报告的核心板块，要深入分析
   - **渠道概览**：各来源/媒介的会话数、用户数、新用户数对比
   - **Campaign 级别分析**：每个广告系列的表现（会话、互动率、跳出率），哪些 campaign 效果好、哪些需要优化
   - **Google Ads 关键词 & 广告组**：具体关键词和广告组的会话量、用户质量（engaged sessions），识别高效和低效关键词
   - **Landing Page 效果**：不同着陆页从不同来源获取的流量质量（跳出率、停留时间），哪些着陆页对 SEM 流量最有效
   - **用户参与度对比**：各渠道的平均停留时间、互动率、每用户会话数、每会话页面数，评估流量质量差异
   - 综合以上维度，给出流量获取策略的评估和优化方向

5. **收入与变现分析**
   - 总收入及与前日对比
   - 积分包 vs 订阅的占比分析
   - 付费用户数及付费转化率
   - 结合用户来源分析变现效率

6. **SEO 表现** — 搜索词、展示量、点击率、排名变化

7. **关键洞察** — 3-5 条值得关注的发现（数据驱动）

8. **优化建议** — 3-5 条具体的、可落地的优化方向`;

export async function generateReport(formattedData: string, type: ReportType = "daily"): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY env var not set");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

  const systemPrompt = type === "half_day" ? HALF_DAY_PROMPT : DAILY_PROMPT;

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${systemPrompt}\n\n---\n\n以下是本报告周期的分析数据：\n\n${formattedData}\n\n---\n\n请用中文撰写分析报告。`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: type === "daily" ? 8192 : 4096,
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
