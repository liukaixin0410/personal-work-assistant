# Firebase 配置指南

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
4. 复制页面上的 firebaseConfig 配置

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

## 第四步：启用 Firestore

1. 在左侧菜单，点击 "Firestore Database"
2. 点击 "Create Database"
3. 选择 "Start in test mode"（测试模式）
4. 选择地理位置，点击 "Enable"

## 第五步：填写配置

将上面获取到的配置信息填入 `.env.local` 文件：

```
NEXT_PUBLIC_FIREBASE_API_KEY=你的 apiKey
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的 authDomain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的 projectId
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的 storageBucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的 messagingSenderId
NEXT_PUBLIC_FIREBASE_APP_ID=你的 appId
```
