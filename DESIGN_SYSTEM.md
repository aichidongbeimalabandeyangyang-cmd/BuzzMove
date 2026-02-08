# BuzzMove Design System & Guidelines

> 从 Pencil 设计稿 (`designs/buzzmove.pen`) 提取的完整设计规范。
> 所有前端代码必须严格遵循本文档，不允许任何自行发挥。

---

## 1. 全局设计令牌 (Design Tokens)

### 1.1 颜色系统

| Token | 色值 | 用途 |
|-------|------|------|
| `--bg` | `#0B0B0E` | 全局背景、Header/BottomTab 背景 |
| `--foreground` | `#FAFAF9` | 主文字颜色 |
| `--primary` | `#E8A838` | 品牌主色、活跃状态、CTA 辅色 |
| `--primary-light` | `#F0C060` | 渐变亮端 |
| `--card` | `#16161A` | 卡片/输入框/Badge 背景 |
| `--card-hover` | `#1E1E22` | 头像圆圈、hover 态 |
| `--border` | `#252530` | 分割线、描边、按钮边框 |
| `--tab-separator` | `#1A1A1E` | Tab 分隔线 |
| `--muted` | `#6B6B70` | 次要文字、未激活 Tab |
| `--muted-dark` | `#4A4A50` | 字数统计、版本号 |
| `--muted-light` | `#9898A4` | 图标默认色 |
| `--destructive` | `#EF4444` | 退出登录、错误 |
| `--success` | `#22C55E` | 折扣 Badge |
| `--overlay` | `#00000080` | 登录遮罩 |
| `--overlay-light` | `#00000060` | 视频播放按钮背景 |
| `--badge-bg` | `#00000099` | 标签 Badge |
| `--processing-bg` | `#0B0B0ECC` | 处理中 Badge |
| `--plan-badge-bg` | `#E8A83820` | Pro 计划 Badge 背景 |
| `--plan-badge-border` | `#E8A83830` | MOST POPULAR Badge 背景 |

### 1.2 渐变

| 名称 | 值 | 用途 |
|------|---|------|
| **Primary Gradient** | `linear-gradient(135deg, #F0C060, #E8A838)` | Logo 背景、CTA 按钮 |
| **Primary Shadow** | `0 4px 20px #E8A83840` | CTA 按钮阴影 |
| **Hero Fade** | `linear-gradient(180deg, #0B0B0E00, #0B0B0E)` | 首页英雄图底部渐变 |
| **Progress Bar** | `linear-gradient(90deg, #F0C060, #E8A838)` | 进度条 |
| **Pricing Border** | `linear-gradient(135deg, #F0C060, #E8A83850)` | 定价卡片外圈渐变边框 |

### 1.3 字体

- **字体族**: `DM Sans` — 全局唯一字体，无例外
- **不使用** Sora 或其他字体

| 用途 | 大小 | 粗细 | 颜色 |
|------|------|------|------|
| Logo 文字 | 17px | 700 | #FAFAF9 |
| 页面大标题 (Assets) | 20px | 700 | #FAFAF9 |
| Profile 用户名 | 20px | 700 | #FAFAF9 |
| 定价页标题 | 28px | 700 | #FAFAF9, letterSpacing: -0.8 |
| 定价卡标题 | 22px | 700 | #FAFAF9 |
| 上传页标题 | 22px | 700 | #FAFAF9 |
| 进度页标题 | 18px | 700 | #FAFAF9 |
| 子页面返回标题 | 17px | 700 | #FAFAF9 |
| CTA 按钮文字 (大) | 17px | 700 | #0B0B0E |
| CTA 按钮文字 (中) | 16px | 700 | #0B0B0E |
| 菜单项/二级按钮 | 15px | 500/600 | #FAFAF9 |
| 正文/Prompt | 15px | 400 | #FAFAF9, lineHeight: 1.4 |
| 副标题 | 15px | 400 | #6B6B70 |
| 输入框 placeholder | 14px | 400 | #6B6B70, lineHeight: 1.4 |
| Toggle 选中 | 14px | 600 | #0B0B0E |
| Toggle 未选中 | 14px | 500 | #6B6B70 |
| 特征列表 | 14px | 500 | #FAFAF9 |
| Email/信息 | 14px | 400 | #6B6B70 |
| Badge 文字 | 13px | 600 | #E8A838 或 #FAFAF9 |
| 提示/描述 | 13px | 400/500 | #6B6B70, lineHeight: 1.6 |
| 字数统计 | 12px | 400 | #4A4A50 |
| Section 标题 | 12px | 600 | #6B6B70, letterSpacing: 1px |
| 标签 Badge | 12px | 500 | #FFFFFFCC |
| 底部 Tab 标签 | 11px | 500/600 | — |
| 视频时长 | 11px | 600 | #FFFFFF |
| MOST POPULAR | 10px | 700 | #E8A838, letterSpacing: 0.5px |
| 条款文字 | 12px | 400 | #4A4A50, lineHeight: 1.5 |

### 1.4 圆角 (Corner Radius)

| 值 | 用途 |
|----|------|
| 100 (full) | 头像、Badge、进度条 |
| 24px | 登录底部弹窗顶部圆角 `[24,24,0,0]` |
| 20px | 图片预览框、视频播放器、定价卡片外圈 |
| 19px | 定价卡片内部 |
| 16px | Prompt 卡片、菜单卡片 |
| 14px | 照片卡片、CTA 按钮、二级按钮 |
| 12px | Toggle 容器、定价 Toggle |
| 10px | Tab 切换器内按钮 |
| 8px | Logo 图标、Toggle 内选项、时长 Badge、分割线 Badge |
| 6px | MOST POPULAR Badge |

### 1.5 间距 (Spacing)

#### 通用 Padding 模式

| 区域 | Padding `[top, right, bottom, left]` |
|------|------|
| Header | `[0, 20]` 即左右 20px |
| BottomTab | `[6, 0, 14, 0]` |
| 首页 Bottom Content | `[0, 20, 24, 20]` |
| Generator Content | `[0, 20, 24, 20]` |
| Profile Content | `[24, 20, 12, 20]` |
| Settings Body | `[24, 20, 12, 20]` |
| 定价标题区 | `[16, 20, 24, 20]` |
| 定价卡区 | `[0, 20]` |
| 上传页 Body | `[16, 16, 12, 16]` |
| 进度页 Body | `[0, 20]` |
| 结果页 Body | `[8, 20, 20, 20]` |
| Tab 切换器 | `[0, 16, 8, 16]` |
| Assets Grid | `[8, 16]` |
| 登录弹窗 | `[24, 24, 40, 24]` |
| Prompt/卡片内部 | 16px (all) |
| 菜单项 | `[14, 16]` |
| Toggle 容器 | 4px (all) |
| Credit Badge | `[6, 12]` |
| Plan Badge | `[6, 16]` |
| Label Badge | `[6, 14]` |

#### 通用 Gap 模式

| 值 | 用途 |
|----|------|
| 3px | BottomTab icon-label |
| 4px | Toggle 内部 |
| 6px | Logo icon-text、Sparkle-label、Duration/Quality label-toggle |
| 8px | Back icon-text、Logo icon-text、Credit dot-text、Prompt内gap、Info column、Price badge row |
| 10px | Right group items、Photo grid gap、Action row gap、Feature list gap |
| 12px | 首页 Bottom Content gap、Tab 切换器 gap、Assets grid gap、Profile menu gap、Profile user section gap、Options row gap、定价标题区 gap |
| 14px | 定价卡内部 gap |
| 16px | Generator content gap、Plans area gap、上传页 gap、Right group gap |
| 20px | Result body gap |
| 24px | Profile-Menu gap、Settings sections gap、Progress body gap、Login items gap |

---

## 2. 共享组件规范

### 2.1 Header

**通用结构**: 高 56px，左右 padding 20px，`justify-content: space-between`，`align-items: center`

#### Header 变体

| 页面 | 左侧 | 右侧 |
|------|------|------|
| **Homepage** | Logo (28×28 渐变方块 + play icon 14×14) + gap 8 + "BuzzMove" 17/700 | Avatar (32×32) |
| **Upload Photo** | 同 Homepage Logo | Avatar |
| **Video Generator** | ← arrow-left 22×22 + gap 8 + "BuzzMove" 17/700 | Credit Badge + gap 10 + Avatar |
| **Gen Progress** | ← arrow-left 22×22 + gap 8 + "BuzzMove" 17/700 | Credit Badge + gap 10 + Avatar |
| **Video Result** | ← arrow-left 22×22 + gap 8 + "Result" 17/700 | Avatar |
| **Assets** | "Assets" 20/700 | Credit Badge + gap 10 + Avatar |
| **Profile** | "BuzzMove" 17/700 (纯文字，无 logo icon) | Avatar |
| **Settings** | ← arrow-left 22×22 + gap 8 + "Settings" 17/700 | Avatar |
| **Pricing** | ← arrow-left 22×22 + gap 8 + "Pricing & Plans" 17/700 | Avatar |

#### Credit Badge 规范
- 容器: `cornerRadius: 100`, `fill: #16161A`, `padding: [6, 12]`, `gap: 6`
- 圆点: `6×6 ellipse`, `fill: #E8A838`
- 文字: `13px/600 #FAFAF9`

#### Avatar 规范
- 容器: `32×32`, `cornerRadius: 100`, `fill: #1E1E22`
- 图标: Lucide `user`, `18×18`, `fill: #9898A4`

#### Logo Icon 规范
- 容器: `28×28`, `cornerRadius: 8`, `gradient: 135deg #E8A838 → #F0C060`
- 内部: Lucide `play`, `14×14`, `fill: #0B0B0E`

### 2.2 BottomTab

- 容器: `height: 64`, `fill: #0B0B0E`, `justify-content: space-around`, `padding: [6, 0, 14, 0]`
- Tab 分隔线: `height: 1px`, `fill: #1A1A1E`, `width: fill`
- 每个 Tab: `layout: vertical`, `gap: 3px`, `align-items: center`
- Icon: Lucide, `22×22`
- Label: `11px DM Sans`

| Tab | Icon | Label |
|-----|------|-------|
| Move | `flame` | Move |
| Assets | `layers` | Assets |
| My Profile | `circle-user` | My Profile |

| 状态 | Icon 色 | Label 色 | Label 粗细 |
|------|---------|---------|-----------|
| 活跃 | `#E8A838` | `#E8A838` | 600 |
| 默认 | `#6B6B70` | `#6B6B70` | 500 |

#### 哪个 Tab 在哪个页面高亮

| 页面 | 高亮 Tab |
|------|---------|
| Homepage, Upload, Generator, Progress, Result | Move |
| Assets (My Videos) | Assets |
| Profile, Settings, Pricing | My Profile |

### 2.3 CTA 按钮 (Primary)

- `height: 52px` (首页) 或 `48px` (定价/下载) 或 `56px` (Generator)
- `cornerRadius: 14`
- `fill: gradient 135deg #F0C060 → #E8A838`
- `shadow: 0 4px 20px #E8A83840`
- 文字: `#0B0B0E`, `DM Sans`, `700`
- `justify-content: center`, `align-items: center`

### 2.4 二级按钮 (Outlined)

- `height: 48px` (通用) 或 `52px` (首页)
- `cornerRadius: 14`
- `stroke: 1.5px #252530`
- 无 fill (透明)
- 文字: `#FAFAF9`, `DM Sans`, `500` 或 `600`
- Icon + text 间 `gap: 8`

---

## 3. 页面详细规范

### 3.1 Homepage (`pWptm`)

**结构**: `vertical layout, fill #0B0B0E, 390×844`

1. **Header** — Logo 变体 (见 2.1)
2. **Hero Photo** — `height: 460`, `width: fill`, `clip: true`, `layout: none` (绝对定位子元素)
   - Label Badge: `x:16, y:16`, `cornerRadius: 100`, `fill: #00000099`, `padding: [6,14]`
     - Text: "Example photo · Tap to upload your own", `12px/500 #FFFFFFCC`
   - Gradient Overlay: `width: 390, height: 160`, `x:0, y:300`
     - `gradient: 180deg #0B0B0E00 → #0B0B0E`
3. **Bottom Content** — `height: fill`, `layout: vertical`, `gap: 12`, `justify: end`, `padding: [0,20,24,20]`
   - **Prompt Label**: `gap: 6`, horizontal
     - Lucide `sparkles` 16×16 #E8A838 + "Motion Prompt" 13/600 #E8A838
   - **Prompt Card**: `cornerRadius: 16`, `fill: #16161A`, `padding: 16`, `width: fill`
     - Text: `15px/400 #FAFAF9`, `lineHeight: 1.4`
   - **Primary CTA**: `height: 52`, `cornerRadius: 14`, gradient + shadow
     - "Make It Move · Free" `16/700 #0B0B0E`
   - **Secondary CTA**: `height: 48`, `cornerRadius: 14`, `stroke: 1.5px #2A2A2E`
     - "Or upload your own photo" `15/500 #FAFAF9`
4. **Tab Separator** — `1px #1A1A1E`
5. **BottomTab** — Move 高亮

### 3.2 Video Generator (`6GA2i`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Back + "BuzzMove" + Credit Badge + Avatar
2. **Gen Content** — `height: fill`, `layout: vertical`, `gap: 16`, `padding: [0,20,24,20]`
   - **Image Preview**: `height: 280`, `cornerRadius: 20`, `clip: true`, `layout: none`
     - Close Button: `32×32`, `cornerRadius: 100`, `fill: #00000066`, `x: 310, y: 12`
       - Lucide `x` 16×16 #FFFFFF
   - **Prompt Input**: `cornerRadius: 16`, `fill: #16161A`, `gap: 8`, `padding: 16`, `width: fill`
     - Placeholder: `14px/400 #6B6B70`, `lineHeight: 1.4`
     - Char Count: `12px #4A4A50`, `text-align: right`
   - **Options Row**: `gap: 12`, horizontal, `width: fill`
     - **Duration Column**: `gap: 6`, `width: fill`
       - Label: "Duration" `12/500 #6B6B70`
       - Toggle: `height: 44`, `cornerRadius: 12`, `fill: #16161A`, `padding: 4`
         - 选中: `cornerRadius: 8`, `fill: #E8A838`, `14/600 #0B0B0E`
         - 未选中: `cornerRadius: 8`, `14/500 #6B6B70`
     - **Quality Column**: 同结构，"Quality"/"Std"/"Pro"
   - **Spacer**: `height: fill` (弹性空间)
   - **Generate Button**: `height: 56`, `cornerRadius: 14`, gradient + shadow
     - "Generate Video · 300 credits" `17/700 #0B0B0E`
3. **Tab Sep + BottomTab** — Move 高亮

### 3.3 Generation Progress (`lRwCF`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Back + "BuzzMove" + Credit Badge + Avatar
2. **Progress Body** — `height: fill`, `layout: vertical`, `gap: 24`, `justify: center`, `padding: [0,20]`
   - **Processing Image**: `height: 280`, `cornerRadius: 20`, `clip: true`, `layout: none`
     - Badge: centered, `cornerRadius: 100`, `fill: #0B0B0ECC`, `padding: [8,16]`, `gap: 8`
       - Text: "✨ Processing..." `14/600 #FAFAF9`
   - **Progress Section**: `gap: 10`, `width: fill`
     - Row: `justify: space-between`
       - Percentage: `16/700 #E8A838`
       - Stage: `13/400 #6B6B70`
     - Bar Background: `height: 6`, `cornerRadius: 100`, `fill: #1A1A1E`
       - Bar Fill: `height: 6`, `cornerRadius: 100`, gradient 90deg
   - **Info Column**: `gap: 8`, center aligned
     - Title: "Creating your video..." `18/700 #FAFAF9`, center
     - Desc: `13/400 #6B6B70`, `lineHeight: 1.6`, center
   - **Back to Move Button**: `height: 48`, `cornerRadius: 14`, `stroke: 1.5px #252530`, `gap: 8`
     - Lucide `flame` 18×18 #E8A838 + "Back to Move" `15/600 #FAFAF9`
3. **Tab Sep + BottomTab** — Move 高亮

### 3.4 Video Result (`B9bU1`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Back + "Result" + Avatar (无 Credit Badge)
2. **Result Body** — `height: fill`, `layout: vertical`, `gap: 20`, `padding: [8,20,20,20]`
   - **Video Player**: `height: 440`, `cornerRadius: 20`, `layout: none`
     - Play Button: centered, `64×64`, `cornerRadius: 100`, `fill: #00000060`
       - Lucide `play` 28×28 #FFFFFF
   - **Action Row**: `gap: 10`, horizontal, `width: fill`
     - **Download**: `height: 48`, `cornerRadius: 14`, `fill: gradient`, `shadow`, `gap: 8`, `width: fill`
       - Lucide `download` 20×20 #0B0B0E + "Download" `15/700 #0B0B0E`
     - **Share**: `height: 48`, `cornerRadius: 14`, `stroke: 1.5px #252530`, `gap: 8`, `width: fill`
       - Lucide `share-2` 20×20 #FAFAF9 + "Share" `15/600 #FAFAF9`
   - **Regenerate**: `height: 48`, `cornerRadius: 14`, `stroke: 1.5px #252530`, `gap: 8`, `width: fill`
     - Lucide `refresh-cw` 18×18 #FAFAF9 + "Regenerate · 300 credits" `15/600 #FAFAF9`
3. **Tab Sep + BottomTab** — Move 高亮

### 3.5 Assets / My Videos (`7DpcE`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — "Assets" 20/700 + Credit Badge + Avatar
2. **Tab Switcher** — `padding: [0,16,8,16]`, horizontal, `width: fill`
   - **Active Tab** (Videos): `height: 36`, `cornerRadius: 10`, `fill: #E8A838`, `padding: [0,20]`
     - Text: `14/600 #0B0B0E`
   - **Inactive Tab** (Photos): `height: 36`, `cornerRadius: 10`, `padding: [0,20]`
     - Text: `14/500 #6B6B70`
3. **Video Grid** — `layout: vertical`, `gap: 12`, `padding: [8,16]`, `height: fill`, scrollable
   - Row: `gap: 12`, horizontal, `width: fill`, 2 列均分
   - Card: `height: 210`, `cornerRadius: 16`, `clip: true`, `layout: none`, `width: fill`
     - Duration Badge: `x: 8, y: 182`, `cornerRadius: 8`, `fill: #00000080`, `padding: [3,8]`
       - Text: `11/600 #FFFFFF`
4. **Tab Sep + BottomTab** — Assets 高亮

### 3.6 Profile (`pzpLB`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — "BuzzMove" 17/700 纯文字 (无 logo icon) + Avatar
2. **Profile Content** — `gap: 24`, `padding: [24,20,12,20]`, `height: fill`
   - **User Section**: `layout: vertical`, `gap: 12`, `padding: [8,0]`, `align: center`, `width: fill`
     - Avatar: `72×72`, `cornerRadius: 100`, `fill: #1E1E22`
       - Lucide `user` 36×36 #9898A4
     - Name: `20/700 #FAFAF9`
     - Email: `14/400 #6B6B70`
     - Plan Badge: `cornerRadius: 100`, `fill: #E8A83820`, `padding: [6,16]`
       - Text: `13/600 #E8A838`
   - **Menu List**: `cornerRadius: 16`, `fill: #16161A`, `layout: vertical`, `width: fill`
     - Item: `gap: 12`, `padding: [14,16]`, `width: fill`, `align: center`
       - Icon: Lucide, 20×20
       - Text: `15/500`
     - Items:
       1. `crown` #E8A838 + "Pricing & Plans" #FAFAF9
       2. `settings` #9898A4 + "Settings" #FAFAF9
       3. `life-buoy` #9898A4 + "Help & Support" #FAFAF9
       4. Divider: `1px #252530`
       5. `log-out` #EF4444 + "Log Out" #EF4444
3. **Tab Sep + BottomTab** — My Profile 高亮

### 3.7 Settings (`kcTRr`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Back + "Settings" + Avatar
2. **Settings Body** — `gap: 24`, `padding: [24,20,12,20]`, `height: fill`
   - **Section 1** — `gap: 8`
     - Label: "ACCOUNT" `12/600 #6B6B70`, `letterSpacing: 1px`
     - Card: `cornerRadius: 16`, `fill: #16161A`, `layout: vertical`, `width: fill`
       - Item: `gap: 12`, `padding: [14,16]`, `align: center`
         1. `user` #9898A4 + "Edit Profile" #FAFAF9
         2. `bell` #9898A4 + "Notifications" #FAFAF9
         3. `shield` #9898A4 + "Privacy & Security" #FAFAF9
   - **Section 2** — `gap: 8`
     - Label: "LEGAL" `12/600 #6B6B70`, `letterSpacing: 1px`
     - Card: `cornerRadius: 16`, `fill: #16161A`, `layout: vertical`, `width: fill`
       - Items:
         1. `file-text` #9898A4 + "Terms of Service" #FAFAF9
         2. `lock` #9898A4 + "Privacy Policy" #FAFAF9
         3. `rotate-ccw` #9898A4 + "Refund Policy" #FAFAF9
   - **Version**: "BuzzMove v1.0.0" `12/400 #4A4A50`, center
3. **Tab Sep + BottomTab** — My Profile 高亮

### 3.8 Pricing (`jjdc3`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Back + "Pricing & Plans" + Avatar
2. **Title Section** — `gap: 12`, `padding: [16,20,24,20]`, center aligned
   - Heading: "Unleash your full creativity" `28/700 #FAFAF9`, `letterSpacing: -0.8`, center
   - Subheading: "Choose the plan that fits your workflow." `15/400 #6B6B70`, center
   - **Toggle Row**: `cornerRadius: 12`, `fill: #16161A`, `gap: 4`, `padding: 4`
     - Monthly: `cornerRadius: 10`, `padding: [8,20]` — `14/500 #6B6B70`
     - Yearly (selected): `cornerRadius: 10`, `fill: #E8A838`, `padding: [8,20]`, `gap: 6`
       - "Yearly" `14/600 #0B0B0E`
       - Badge: `cornerRadius: 8`, `fill: #22C55E`, `padding: [2,8]`
         - "-20%" `13/800 #FFFFFF`
3. **Plans Area** — `gap: 16`, `padding: [0,20]`, `height: fill`
   - **Pro Card Wrapper**: `cornerRadius: 20`, `fill: gradient 135deg #F0C060 → #E8A83850`, `padding: 1.5`
     - **Pro Card**: `cornerRadius: 19`, `fill: #16161A`, `padding: 20`, `gap: 14`
       - Title Row: `gap: 8`
         - "Professional" `22/700 #FAFAF9`
         - MOST POPULAR badge: `cornerRadius: 6`, `fill: #E8A83830`, `padding: [3,10]`
           - `10/700 #E8A838`, `letterSpacing: 0.5`
       - Price Row: `gap: 4`
         - "$29.00" `46/700 #FAFAF9`, `letterSpacing: -1.5`
         - "/month" `17/400 #6B6B70`
       - "Save $87/year — was $435" `17/700 #E8A838`
       - Features: `gap: 10`
         - Row: `gap: 10`, Lucide `check` 16×16 #E8A838 + text `14/500 #FAFAF9`
       - CTA: `height: 48`, gradient + shadow
         - "Upgrade to Pro" `16/700 #0B0B0E`
       - "⏰  Offer ends Feb 28" `14/600 #FAFAF9`, center
       - "Cancel anytime. No questions asked." `12/400 #6B6B70`, center
4. **Tab Sep + BottomTab** — My Profile 高亮

### 3.9 Upload Photo (`Bl9pV`)

**结构**: `vertical, fill #0B0B0E`

1. **Header** — Logo 变体 (同 Homepage) + Avatar
2. **Photo Picker Body** — `gap: 16`, `padding: [16,16,12,16]`, `height: fill`
   - "Choose a photo" `22/700 #FAFAF9`
   - "Recent uploads" `13/500 #6B6B70`
   - **Photo Grid**: `layout: vertical`, `gap: 10`
     - Row: `gap: 10`, horizontal, 3 列均分
     - **Add New Card**: `height: 150`, `cornerRadius: 14`, `stroke: 1.5px #252530`, `layout: vertical`, `gap: 8`, center
       - Lucide `plus` 32×32 #E8A838
       - "Add New" `12/500 #6B6B70`
     - **Photo Card**: `height: 150`, `cornerRadius: 14`, `clip: true`, `layout: none`
3. **Tab Sep + BottomTab** — Move 高亮

### 3.10 Login Modal (`JrLWu`)

**结构**: 覆盖层，`fill: #00000080`，`justify: end`

- **Login Sheet**: `cornerRadius: [24,24,0,0]`, `fill: #0B0B0E`, `gap: 24`, `padding: [24,24,40,24]`
  1. Handle Bar: `40×4`, `cornerRadius: 100`, `fill: #3A3A40`, centered
  2. **Logo Section**: `gap: 12`, center aligned, `width: fill`
     - Logo Icon: `48×48`, `cornerRadius: 12`, gradient
       - Lucide `play` 24×24 #0B0B0E
     - "Welcome to BuzzMove" `24/700 #FAFAF9`, center
     - "Turn any photo into a stunning video with AI" `15/400 #6B6B70`, center
  3. **Google Button**: `height: 52`, `cornerRadius: 14`, `fill: #FFFFFF`, `gap: 10`
     - "G" `20/700 #4285F4` + "Continue with Google" `16/600 #0B0B0E`
  4. **Apple Button**: `height: 52`, `cornerRadius: 14`, `fill: #FFFFFF`, `gap: 10`
     - Lucide `apple` 20×20 #0B0B0E + "Continue with Apple" `16/600 #0B0B0E`
  5. **Divider Row**: `gap: 16`
     - `line 1px #252530` + "or" `13/400 #6B6B70` + `line 1px #252530`
  6. **Email Button**: `height: 52`, `cornerRadius: 14`, `stroke: 1.5px #252530`, `gap: 10`
     - Lucide `mail` 20×20 #FAFAF9 + "Continue with Email" `16/600 #FAFAF9`
  7. Terms: `12/400 #4A4A50`, center, `lineHeight: 1.5`

---

## 4. 图标清单 (Lucide React)

所有图标统一使用 `lucide-react`，`strokeWidth: 1.5`（除非另有说明）。

| Icon Name | 使用位置 | 大小 | 颜色 |
|-----------|---------|------|------|
| `play` | Logo (14), Login Logo (24), Video Play (28) | varies | #0B0B0E / #FFFFFF |
| `arrow-left` | Header 返回 | 22 | #FAFAF9 |
| `user` | Avatar (18), Profile Avatar (36), Settings menu (20) | varies | #9898A4 |
| `flame` | BottomTab, Back to Move button | 22 / 18 | #E8A838 / #6B6B70 |
| `layers` | BottomTab | 22 | #E8A838 / #6B6B70 |
| `circle-user` | BottomTab | 22 | #E8A838 / #6B6B70 |
| `sparkles` | Motion Prompt label | 16 | #E8A838 |
| `x` | Image close button | 16 | #FFFFFF |
| `plus` | Add New card | 32 | #E8A838 |
| `crown` | Profile menu | 20 | #E8A838 |
| `settings` | Profile menu | 20 | #9898A4 |
| `life-buoy` | Profile menu | 20 | #9898A4 |
| `log-out` | Profile menu | 20 | #EF4444 |
| `bell` | Settings menu | 20 | #9898A4 |
| `shield` | Settings menu | 20 | #9898A4 |
| `file-text` | Settings menu | 20 | #9898A4 |
| `lock` | Settings menu | 20 | #9898A4 |
| `rotate-ccw` | Settings menu | 20 | #9898A4 |
| `check` | Pricing features | 16 | #E8A838 |
| `download` | Video Result | 20 | #0B0B0E |
| `share-2` | Video Result | 20 | #FAFAF9 |
| `refresh-cw` | Video Result | 18 | #FAFAF9 |
| `mail` | Login email button | 20 | #FAFAF9 |
| `apple` | Login apple button | 20 | #0B0B0E |

---

## 5. 布局原则

### 5.1 页面结构

每个页面都是 `vertical flex column`:
```
Header (h: 56, fixed)
Content (flex: 1, overflow scroll if needed)
Tab Separator (h: 1)
BottomTab (h: 64, fixed)
```

### 5.2 响应式策略

- 设计稿基准宽度: 390px，高度: 844px (iPhone 14 Pro)
- 所有 `width: fill_container` → Tailwind `w-full`
- 所有 `height: fill_container` → Tailwind `flex-1` (在 flex column 中)
- 固定高度元素使用具体 px 值，不使用 vh 单位
- 照片/视频网格使用 CSS Grid，列宽均分

### 5.3 不允许的行为

- **禁止** 使用 `max-width` 约束页面宽度
- **禁止** 使用 `vh` 单位设置元素高度
- **禁止** 使用 Heroicons 或其他图标库
- **禁止** 使用 Sora 字体
- **禁止** 自行推测间距/颜色/大小，所有值必须来自本文档
- **禁止** 在不查阅本文档的情况下修改前端代码

---

## 6. 技术栈要求

- **Framework**: Next.js App Router
- **Styling**: Tailwind CSS (inline classes only)
- **Icons**: `lucide-react` (统一 `strokeWidth={1.5}`)
- **Font**: `DM Sans` via `next/font/google`
- **Images**: `next/image` with `fill` + `object-cover`
- **State**: React `useState` + Context (ViewProvider for homepage sub-views)
- **API**: tRPC hooks
- **Auth**: Supabase Auth
