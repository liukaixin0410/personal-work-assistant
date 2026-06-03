# 部署指南

## 🚀 推荐方案：使用 Vercel 部署（最简单）

Vercel 是 Next.js 官方推荐的部署平台，完全免费，自动部署，支持 HTTPS！

### 步骤一：推送到 GitHub

1. 在 GitHub 上创建一个新仓库（不要初始化 README、License 等）
2. 在终端中运行：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

### 步骤二：在 Vercel 部署

1. 访问 https://vercel.com 并登录（可以用 GitHub 账号）
2. 点击 "Add New Project"
3. 选择你刚才创建的 GitHub 仓库
4. 在项目设置中：
   - 确保 "Framework Preset" 选择 "Next.js"
   - 如果要使用 Firebase，在 "Environment Variables" 中添加：
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`
5. 点击 "Deploy"！

### 步骤三：完成！

几分钟后，你的网站就上线了！会有一个类似 `https://你的项目名.vercel.app` 的地址。

---

## 📦 其他部署选项

### 使用 Netlify 部署

1. 同样先推送到 GitHub
2. 访问 https://netlify.com 并登录
3. 导入你的 GitHub 仓库
4. 配置构建命令为 `npm run build`，发布目录为 `.next`
5. 配置环境变量（如果需要 Firebase）
6. 点击部署！

### 使用 Docker 部署

如果你想自己构建和部署，可以使用 Docker：

```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 🔧 如果要配置 Firebase（可选）

即使不配置 Firebase，网站也能正常运行（会使用模拟数据）。如果需要真实的数据存储：

1. 在 Firebase 控制台创建项目
2. 获取配置信息
3. 在部署平台的环境变量设置中添加 Firebase 配置
4. 在 Firebase 控制台中，配置 Firestore 的安全规则（测试环境可以宽松一些）

简单的 Firestore 安全规则示例（仅用于开发测试）：

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ 注意：生产环境请配置更严格的安全规则！

---

## 💡 提示

- **自动部署**：每次推送到 GitHub，Vercel/Netlify 都会自动重新部署！
- **自定义域名**：可以在设置中绑定你自己的域名
- **HTTPS**：部署后自动获得免费的 HTTPS

---

## 📚 相关文档

- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Vercel 文档](https://vercel.com/docs)
- [Firebase 控制台](https://console.firebase.google.com/)
