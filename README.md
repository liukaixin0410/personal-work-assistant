# 个人工作助手

一个简洁的个人工作助手 Web 应用，帮助管理项目和每日任务。

## 功能特性

- 📊 数据看板：展示关键指标概览
- 📁 项目管理：创建、编辑、删除项目，支持按状态、优先级筛选
- ✅ 今日 To Do：快速添加和管理每日任务，支持标记完成
- 🔄 可选 Firebase 集成：支持使用 Firebase 实时数据库（也可直接使用模拟数据）

## 技术栈

- **前端**：Next.js 14 + React + TypeScript
- **样式**：Tailwind CSS
- **数据库**：Firebase Firestore（可选）
- **图标**：Lucide React

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用！

**注意**：即使不配置 Firebase，应用也能正常运行（会使用内置的模拟数据）。

### 3. （可选）配置 Firebase

如果需要真实的数据存储和同步：

1. 复制 `.env.example` 为 `.env.local`：
```bash
cp .env.example .env.local
```

2. 在 [Firebase 控制台](https://console.firebase.google.com/) 创建项目并获取配置信息，填入 `.env.local`

3. 在 Firebase 控制台启用 Firestore 数据库

详细步骤请参考 [FIREBASE_SETUP.md](FIREBASE_SETUP.md)

## 部署上线 🚀

一键部署到 Vercel 或其他平台！详细步骤请参考 [DEPLOY.md](DEPLOY.md)

## 项目结构

```
.
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # 首页（数据看板）
│   │   ├── projects/     # 项目页面
│   │   └── todos/        # 今日任务页面
│   ├── components/       # React 组件
│   ├── hooks/            # 自定义 Hooks
│   ├── lib/              # 工具函数
│   └── types/            # TypeScript 类型定义
├── DEPLOY.md             # 部署指南
├── FIREBASE_SETUP.md     # Firebase 配置指南
├── package.json
└── tsconfig.json
```

## 脚本说明

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run start` - 启动生产服务器
- `npm run lint` - 运行代码检查

## License

MIT
