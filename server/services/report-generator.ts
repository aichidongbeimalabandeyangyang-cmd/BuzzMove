/**
 * AI report generator using Gemini 3 Pro Preview.
 * Two report types: half-day (~600 words) and daily (~1500 words).
 * Output is styled HTML with tables and inline SVG charts.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ReportType } from "./analytics-data";

const HTML_STYLE_GUIDE = `输出格式要求 — 必须严格遵守：
- 输出纯 HTML 片段（不需要 <html>/<head>/<body> 标签，直接从内容开始）
- 不要输出 markdown，不要用 \`\`\`html 代码块包裹，直接输出 HTML 代码
- 使用内联 style 属性设置样式，不要使用 <style> 标签或 class
- 配色方案（深色主题）：
  - 背景不需要设置（外层容器已有深色背景）
  - 标题颜色：h1 用 #FAFAF9，h2 用 #E8A838（金色），h3 用 #FAFAF9
  - 正文颜色：#C4C4C8
  - 次要文字：#7A7A82
  - 强调/高亮数字：#FAFAF9 加粗
  - 正向指标（增长）：#22C55E（绿色）
  - 负向指标（下降）：#EF4444（红色）
  - 中性指标：#E8A838（金色）
  - 分割线：#252530
  - 表格边框：#1E1E24

表格样式要求：
- 积极使用 <table> 展示结构化数据（漏斗、趋势、渠道对比等）
- 表格样式：width:100%; border-collapse:collapse; font-size:13px
- 表头 <th>：padding:10px 14px; text-align:left; color:#E8A838; font-weight:600; font-size:12px; border-bottom:2px solid #252530; white-space:nowrap
- 单元格 <td>：padding:10px 14px; color:#C4C4C8; border-bottom:1px solid #1E1E24; font-size:13px
- 数字列右对齐：text-align:right
- 环比/同比变化用颜色标注：正值绿色带 ↑，负值红色带 ↓

图表要求 — 使用内联 SVG 绘制简单图表：
- 7日趋势用 SVG 折线图或柱状图展示（宽度100%, 高度约120-160px）
- 漏斗转化用水平柱状图展示各步骤的相对比例
- 收入占比可用简单的 SVG 水平堆叠条
- SVG 内文字使用 fill 属性设置颜色，与主题配色一致
- 图表要标注数值，不能只有图形

排版要求：
- h1: font-size:22px; font-weight:700; color:#FAFAF9; margin:28px 0 14px
- h2: font-size:17px; font-weight:700; color:#E8A838; margin:28px 0 12px
- h3: font-size:14px; font-weight:600; color:#FAFAF9; margin:18px 0 8px
- p: font-size:14px; line-height:1.8; color:#C4C4C8; margin:10px 0
- 列表项: font-size:14px; line-height:1.8; color:#C4C4C8
- 板块之间用 <hr style="border:none;border-top:1px solid #252530;margin:24px 0"> 分隔`;

const BASE_CONTEXT = `你是 BuzzMove 的数据分析专家。BuzzMove 是一个 AI 视频生成平台，用户上传照片后通过 Kling AI 生成动态视频。

产品与积分体系：
- 每次视频生成消耗积分：5秒无声 100积分、10秒无声 200积分、5秒有声 200积分、10秒有声 400积分
- 免费用户：注册获得 500 积分（约可生成 5 个 5秒标准视频），有水印，最高 480p
- 推荐奖励：每成功推荐 1 位新用户，双方各得 500 积分

商业模式（价格均为美元）：
- 积分包（一次性购买）：
  - Mini Pack: 700积分 / $4.99
  - Starter Pack: 1,500积分 / $9.99（节省7%）
  - Creator Pack: 5,000积分 / $29.99（节省16%）
  - Pro Pack: 20,000积分 / $99.99（节省30%，最划算）
- 订阅计划：
  - Pro: $4.99/周（首周试用 $0.99，含 500 试用积分），正常每周 1,000积分，年付 $184.99（-29%）
  - Premium: $14.99/周，每周 4,375积分，年付 $549.99（-29%）
  - 订阅用户：无水印、1080p、商用授权
- 主要获客渠道：Google Ads SEM 投放（目标市场：美国）

用户漏斗各事件含义：
- login_modal_view: 用户看到登录弹窗（首次互动触发）
- sign_up: 完成注册（Google OAuth 或 Email OTP）
- image_upload: 上传照片准备生成视频
- video_generate: 提交视频生成请求
- paywall_view: 触发付费墙（免费积分用完后弹出）
- click_checkout: 点击付费按钮进入支付流程
- purchase: 完成付款（积分包或订阅）
- video_download_click: 下载生成的视频
- click_share: 分享视频

规则：
- 使用数据中的准确数字，绝不编造指标
- 计算漏斗各步骤之间的转化率，并结合上述事件含义分析流失原因
- 如果数据缺失或为零，指出并分析可能的原因
- 使用专业但简洁的中文撰写
- 在分析收入时，结合积分包定价计算 ARPU、单视频成本等指标
- 末尾注明"报告生成时间：[日期时间]"

${HTML_STYLE_GUIDE}`;

const HALF_DAY_PROMPT = `${BASE_CONTEXT}

任务：撰写一篇约 600 字的中文**半日运营快报**（HTML 格式），覆盖过去 12 小时的数据。报告侧重运营层面的快速洞察。

报告结构：
1. **摘要** — 1-2 句话概述半日表现
2. **用户漏斗快照** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase
   - 用表格展示每步的事件数、用户数、转化率
   - 用 SVG 水平柱状图可视化漏斗各步骤
3. **流量快照** — 用表格展示渠道数据，campaign 级别表现，Google Ads 关键词和广告组效果
4. **收入快照** — 总收入、积分包 vs 订阅分布（用 SVG 堆叠条展示占比）
5. **产品改动速览**（如果数据中包含 Git Commits）— 列出近期代码改动，简要点评可能对指标产生的影响
6. **异常与关注点** — 2-3 条需要关注的异常或机会`;

const DAILY_PROMPT = `${BASE_CONTEXT}

任务：撰写一篇约 1500 字的中文**日度深度分析报告**（HTML 格式），覆盖过去 24 小时的数据，并结合过去 7 天的趋势数据进行分析。

报告结构：
1. **摘要** — 2-3 句话概述当日整体表现及趋势判断

2. **7日数据趋势分析** — 这是本报告的重要板块
   - 用表格展示过去7天每日关键指标（活跃用户、会话、新用户、视频生成量、收入），包含环比变化列（用颜色标注涨跌）
   - 用 SVG 折线图或柱状图可视化7天趋势（至少展示 sessions 和 revenue 两条线/组柱）
   - 计算并解读同比（7天前 vs 今天）变化
   - 标注异常波动日并分析原因

3. **用户漏斗深度分析** — login_modal_view → sign_up → image_upload → video_generate → paywall_view → click_checkout → purchase
   - 用表格展示每步事件数、用户数、步间转化率
   - 用 SVG 水平柱状图可视化漏斗
   - 识别最大流失环节并分析原因

4. **流量与获客深度分析** — 核心板块
   - **渠道概览**：用表格对比各来源/媒介的会话数、用户数、新用户数
   - **Campaign 级别分析**：表格展示每个 campaign 的会话、互动率、跳出率
   - **Google Ads 关键词 & 广告组**：表格展示关键词/广告组的会话量、用户质量
   - **Landing Page 效果**：表格展示不同着陆页的跳出率、停留时间
   - **用户参与度对比**：表格对比各渠道的停留时间、互动率、pages/session
   - 综合评估和优化方向

5. **收入与变现分析**
   - 总收入及与前日对比
   - 积分包 vs 订阅占比（SVG 堆叠条）
   - 付费用户数及转化率
   - 结合来源分析变现效率

6. **SEO 表现** — 表格展示搜索词、展示量、点击率、排名

7. **产品改动与数据归因**（如果数据中包含 Git Commits）— 这是很有价值的分析板块
   - 列出过去7天的主要代码改动（按日期分组）
   - 将改动与同期的数据指标变化做关联分析（例如：某天上线了新 landing page，第二天该页面流量和转化是否有变化）
   - 区分"可能相关"和"大概率相关"的归因，避免过度推断
   - 如果某个改动明显对应数据变化，用高亮标注
   - 如果没有 commit 数据，跳过此板块

8. **关键洞察** — 3-5 条数据驱动的发现

9. **优化建议** — 3-5 条具体可落地的方向`;

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
            text: `${systemPrompt}\n\n---\n\n以下是本报告周期的分析数据：\n\n${formattedData}\n\n---\n\n请直接输出 HTML 片段（不要用代码块包裹，不要输出 markdown）。`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: type === "daily" ? 12000 : 6000,
      temperature: 0.3,
    },
  });

  const response = result.response;
  let text = response.text();

  if (!text || text.length < 100) {
    throw new Error("Gemini returned an empty or too-short response");
  }

  // Strip markdown code fences if Gemini wraps output in ```html ... ```
  text = text.replace(/^```html\s*\n?/i, "").replace(/\n?```\s*$/i, "");

  return text;
}
