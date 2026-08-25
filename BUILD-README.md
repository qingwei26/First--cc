# Focus Self - Android APK 构建说明

## 📦 环境准备

在另一台有网络的电脑上，需要安装以下软件：

### 1. 安装 Node.js 20+
- 下载地址：https://nodejs.org/
- 选择 LTS 版本

### 2. 安装 Java JDK 17
- 下载地址：https://adoptium.net/
- 选择 JDK 17 LTS 版本

### 3. 安装 Android Studio
- 下载地址：https://developer.android.com/studio
- 安装时勾选 Android SDK、Android SDK Platform、Android Virtual Device

## 🚀 构建步骤

### 1. 解压项目文件
解压 `focus-self-android.zip` 到任意目录，例如 `D:\focus-self`

### 2. 安装依赖
打开 PowerShell 或命令行，进入项目目录：
```bash
cd D:\focus-self
npm install
```

### 3. 构建 Web 应用
```bash
npm run build
```

### 4. 同步到 Android
```bash
npx cap sync android
```

### 5. 构建 APK

#### 方法 A：命令行构建（推荐）
```bash
cd android
.\gradlew assembleDebug
```

构建成功后，APK 文件位于：
```
android\app\build\outputs\apk\debug\app-debug.apk
```

#### 方法 B：Android Studio 构建
```bash
npx cap open android
```
在 Android Studio 中：
1. 等待 Gradle 同步完成
2. 菜单 Build → Build Bundle(s) / APK(s) → Build APK(s)
3. 完成后点击通知中的 "locate" 找到 APK

## 📱 安装到手机

### 1. 传输 APK 到手机
- 方法 1：通过 USB 数据线
- 方法 2：通过微信/QQ 发送
- 方法 3：上传到云盘后下载

### 2. 在手机上安装
1. 在文件管理器中找到 APK 文件
2. 点击安装
3. 如果提示"未知来源"，允许安装
4. 安装完成后桌面会出现 Focus Self 图标 🎯

## 🌐 推送到 GitHub（可选）

如果需要在 GitHub 上通过 Actions 自动构建：

### 1. 配置 Git
```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱"
```

### 2. 推送代码
```bash
git remote add origin https://github.com/qingwei26/First--cc.git
git push -u origin main
```

### 3. 查看 Actions
访问 https://github.com/qingwei26/First--cc/actions
GitHub 会自动构建 APK，完成后可在 Artifacts 下载

## ❓ 常见问题

### Q: gradlew 命令找不到？
A: 在 PowerShell 中运行 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`，然后 `.\gradlew assembleDebug`

### Q: JDK 版本不对？
A: 确保 JDK 17 已安装，并设置 `JAVA_HOME` 环境变量指向 JDK 安装目录

### Q: Android SDK 找不到？
A: 设置 `ANDROID_HOME` 环境变量，通常为 `C:\Users\你的用户名\AppData\Local\Android\Sdk`

### Q: 构建失败怎么办？
A: 可以使用 GitHub Actions 自动构建，推送代码后云端会自动构建

## 📞 技术支持

如有问题，可参考：
- Capacitor 官方文档：https://capacitorjs.com/docs
- Android 开发文档：https://developer.android.com/
