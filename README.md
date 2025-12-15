<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# zero-ai-react（前端）

一个用于连接 Python 后端的管理控制台，包含仪表盘、AI 对话、模型密钥管理、开发者 API 令牌等功能。

## 本地运行

- 前置条件：安装 `Node.js`

1. 安装依赖：
   `npm install`
2. 在项目根目录创建或编辑 `.env.local`，设置 `GEMINI_API_KEY`：
   `GEMINI_API_KEY=你的密钥`
3. 启动开发服务：
   `npm run dev`

默认会通过代理连接后端 `http://localhost:8000`（见 `vite.config.ts`）。也可在登录页点击“配置服务器”直接修改后端地址。

## 构建与预览

- 构建生产包：`npm run build`
- 本地预览构建结果：`npm run preview`

## 功能概览

- 仪表盘：基础指标与系统健康信息
- AI 对话：与后端会话接口交互
- 模型密钥：管理外部 LLM 供应商密钥
- API 令牌：为个人开发生成/管理访问令牌
- 用户管理（管理员）：增删改查系统用户
