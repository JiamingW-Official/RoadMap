# GitHub Pages 部署指南

## 自动部署

项目已配置 GitHub Actions 自动部署。每次推送到 `main` 分支时，会自动触发部署。

## 部署步骤

### 1. 确保 GitHub Pages 设置正确

访问：https://github.com/JiamingW-Official/RoadMap/settings/pages

**必须设置：**
- **Source**: 选择 **"GitHub Actions"**（不是 "Deploy from a branch"）
- 保存设置

### 2. 触发部署

#### 方法 1: 自动触发（推荐）
- 推送代码到 `main` 分支会自动触发部署
- 已推送，部署应该正在进行中

#### 方法 2: 手动触发
1. 访问：https://github.com/JiamingW-Official/RoadMap/actions
2. 点击左侧 "Deploy to GitHub Pages"
3. 点击右上角 "Run workflow"
4. 选择 "main" 分支
5. 点击 "Run workflow"

### 3. 查看部署状态

访问：https://github.com/JiamingW-Official/RoadMap/actions

- 找到 "Deploy to GitHub Pages" 工作流
- 查看最新运行状态
- 等待部署完成（通常 2-5 分钟）

### 4. 访问部署的网站

部署完成后，访问：
**https://jiamingw-official.github.io/RoadMap/**

## 部署配置说明

- **Base URL**: `/RoadMap/` (在 `vite.config.ts` 中配置)
- **构建命令**: `pnpm build`
- **输出目录**: `dist/`
- **工作流文件**: `.github/workflows/deploy.yml`

## 故障排除

### 如果网站显示空白或 404

1. **清除浏览器缓存**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **检查 GitHub Actions 日志**
   - 访问 Actions 页面
   - 查看失败的步骤
   - 检查错误信息

3. **验证构建输出**
   - 工作流会自动验证 `dist/` 目录
   - 确保 `dist/index.html` 存在

4. **检查 GitHub Pages 设置**
   - 确保使用 "GitHub Actions" 作为源
   - 不是 "Deploy from a branch"

### 如果资源加载失败

检查 `vite.config.ts` 中的 `base` 配置：
```typescript
base: process.env.NODE_ENV === 'production' ? '/RoadMap/' : '/'
```

确保与仓库名称匹配（区分大小写）。

## 当前部署状态

- ✅ 工作流已配置
- ✅ 自动部署已启用
- ⏳ 等待 GitHub Actions 完成部署

访问 Actions 页面查看实时状态：https://github.com/JiamingW-Official/RoadMap/actions

