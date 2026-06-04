# Firebase 配置详细指南

## 第一步：创建 Firebase 项目

1. 访问 https://console.firebase.google.com/
2. 点击 "Add project" / "创建项目"
3. 输入项目名称（例如：personal-work-assistant）
4. （可选）启用 Google Analytics
5. 点击 "Create project"

## 第二步：添加 Web 应用

1. 在项目首页，点击 Web 图标（`</>`）
2. 输入应用名称（例如：personal-work-assistant-web）
3. 点击 "Register app"
4. 复制页面上的 firebaseConfig 配置（先不要关闭页面）

## 第三步：获取配置信息

你会看到类似这样的配置：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123..."
};
```

保存好这些信息，我们后面会用到！

## 第四步：启用 Firestore 数据库

1. 在左侧菜单，点击 "Firestore Database"
2. 点击 "Create Database"
3. 选择 "Start in test mode"（测试模式）- 这样开发阶段方便使用
4. 选择地理位置（建议选 asia-east1 或 us-central1）
5. 点击 "Enable"

## 第五步：配置本地环境变量（本地开发用）

在项目根目录的 `.env.local` 文件中填入配置：

```
NEXT_PUBLIC_FIREBASE_API_KEY=你的 apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的 authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的 projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的 storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的 messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=你的 appId
```

## 第六步：配置 Vercel 环境变量（线上部署用）

1. 访问你的 Vercel 项目页：https://vercel.com/liukaixin0410-5753s-projects/personal-work-assistant
2. 在左侧菜单点击 "Settings"（设置）
3. 选择 "Environment Variables"（环境变量）
4. 添加以下 6 个环境变量：
   - `NEXT_PUBLIC_FIREBASE_API_KEY` → 填入 apiKey 的值
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` → 填入 authDomain 的值
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` → 填入 projectId 的值
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` → 填入 storageBucket 的值
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` → 填入 messagingSenderId 的值
   - `NEXT_PUBLIC_FIREBASE_APP_ID` → 填入 appId 的值
5. 确保勾选 "Automatically expose System Environment Variables"（自动暴露系统环境变量）
6. 点击 "Save" 保存

## 第七步：重新部署 Vercel

1. 在 Vercel 项目页面，点击 "Deployments"（部署）标签
2. 找到最新的成功的部署
3. 点击右侧的 "..." 按钮
4. 选择 "Redeploy"（重新部署）
5. 确认重新部署

## 完成！

部署成功后，你的网站就会自动连接到 Firebase 数据库了！现在你可以：
- 创建真实的项目
- 添加真实的任务
- 所有数据都会自动保存到 Firebase

## 安全提示（正式使用前）

开发阶段使用测试模式没问题，但正式使用前建议：
1. 设置 Firestore 安全规则，限制只有你能访问数据
2. 配置用户认证（可选，如果你想多人使用）
