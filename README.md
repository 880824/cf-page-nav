# 🧭 CloudNav - 极简高效的个人云端导航页

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Build](https://img.shields.io/badge/build-Cloudflare%20Pages-orange.svg)
![Vanilla JS](https://img.shields.io/badge/es6-Vanilla%20JS-yellow.svg)

CloudNav 是一个基于 **Cloudflare Pages** 和 **Cloudflare KV** 构建的无服务器（Serverless）个人导航网站。它拥有极简的 UI 设计、极致的“秒开”加载体验，并提供完善的后台管理功能。

真正实现了**前后端分离**，无需购买服务器或数据库，利用 Cloudflare 免费额度即可轻松部署专属你的私人书签页！

---

## ✨ 核心特性

- 🚀 **极致秒开体验**：采用 `Stale-while-revalidate` 本地缓存优先渲染策略，配合骨架屏（Skeleton Screen）过渡，告别白屏与等待。
- 📱 **PWA 渐进式应用支持**：支持添加到手机桌面，化身独立 App，断网也能访问本地缓存。
- 🖼️ **Bing 每日高清壁纸**：自动获取必应每日壁纸作为背景，后端 12 小时 KV 智能缓存，前端透明度动画平滑淡入，视觉体验极佳。
- 🖱️ **丝滑的拖拽排序**：无论是在电脑还是手机上，都可以随意拖拽卡片和分类，调整显示顺序。
- 🔍 **双引擎图标智能获取**：内置 `Favicon.im` 和 `DuckDuckGo` 双接口解析网站图标，一键自动补全。
- 🤡 **智能图标容错**：当网址图标获取失败时，自动使用精美的随机 Emoji 兜底，告别“图片裂开”的尴尬。
- 🔐 **安全私密**：全局基于 Token 的后台管理鉴权，支持一键隐藏私密分类和敏感书签。
- 📦 **配置导入 / 导出**：支持将所有书签配置导出为 JSON 文件，随时备份，永不丢失。

---

## 🛠️ 技术栈

* **前端**：HTML5, CSS3, ES6 Vanilla JavaScript (纯原生，无冗余框架)
* **后端 API**：Cloudflare Pages Functions (`functions/api/config.js`)
* **数据库**：Cloudflare Workers KV
* **第三方库**：[SortableJS](https://github.com/SortableJS/Sortable) (拖拽)、[RemixIcon](https://remixicon.com/) (精美字体图标)

---

## 📂 目录结构

```text
├── index.html               # 前端主页面 (视图、样式与交互逻辑)
├── manifest.json            # PWA 应用配置清单
├── sw.js                    # PWA Service Worker (离线缓存核心)
└── functions/
    └── api/
        └── config.js        # 后端 Serverless API (处理读写 KV 和鉴权)
```

---

## 🚀 部署指南 (Cloudflare Pages)

完全免费，整个部署过程不超过 5 分钟！

### 第一步：准备代码
1. Fork 本仓库，或者将代码 Clone 到你自己的 GitHub 仓库中。

### 第二步：创建 Cloudflare 项目
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 在左侧菜单找到 **Workers & Pages** -> 点击 **创建应用程序 (Create application)**。
3. 切换到 **Pages** 标签页，点击 **连接到 Git (Connect to Git)**。
4. 授权 GitHub 并选择你刚刚准备好的仓库。
5. **构建设置 (Build Settings)**：
   * 框架预设 (Framework preset): `None`
   * 构建命令 (Build command): *(留空)*
   * 构建输出目录 (Build output directory): *(留空 或填 `/`)*
6. 点击 **保存并部署 (Save and Deploy)**。（注意：第一次部署会提示失败或访问报错，这是正常的，因为我们还没绑定数据库）。

### 第三步：配置 KV 数据库与密码
1. 回到 Cloudflare 控制台，进入左侧 **Workers & Pages** -> **KV**，点击 **创建命名空间 (Create a namespace)**，名字随便起（例如 `my_nav_db`）。
2. 进入你刚才部署好的 Pages 项目详情页，点击 **设置 (Settings)** 选项卡。
3. **绑定 KV 数据库**：
   * 找到 **Functions** -> **KV 命名空间绑定 (KV namespace bindings)**。
   * 变量名称 (Variable name) **必须严格填入**: `page_nav`
   * KV 命名空间 (KV namespace) 选择你刚才创建的数据库。
4. **设置管理员密码**：
   * 在左侧找到 **环境变量 (Environment variables)**。
   * 添加变量，名称 **必须严格填入**: `TOKEN`
   * 值 (Value) 填入你想要的后台登录密码（建议点击右侧的 `加密` 按钮保护密码）。

### 第四步：重新部署生效
1. 返回到项目的 **部署 (Deployments)** 页面。
2. 找到最新的一次部署记录，点击最右侧的三个点 `...` -> **重试部署 (Retry deployment)**。
3. 部署完成后，点击系统分配的域名，即可访问属于你的专属导航站！

---

## 🎮 使用说明

1. **进入后台**：点击页面右下角的浮动按钮 **“管理”**，输入你在环境变量中设置的 `TOKEN`，按回车即可进入编辑模式。
2. **新增分类**：进入管理模式后，点击右侧新增的 **“偏好设置”** 按钮，可以修改全局网格宽度、拖拽分类顺序、修改分类名/图标，以及新增分类。
3. **添加书签**：在对应分类下点击虚线框的 **“新增”** 卡片。输入网址后，系统会自动尝试抓取图标并提供预览。
4. **隐藏书签**：点击书签右上角的 👁️ 眼睛图标，即可将该书签设为私密（仅在管理模式下可见）。
5. **保存修改**：所有的拖拽、编辑操作在确认后会在本地实时预览，**请务必点击右下角管理菜单里的“保存”按钮**，将最新配置同步到云端数据库。

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 开源协议。你可以自由地使用、修改和分发代码，但请保留原作者归属声明。
