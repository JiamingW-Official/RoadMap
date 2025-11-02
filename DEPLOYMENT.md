# GitHub Pages 部署说明

## 问题诊断

当前错误：`main.tsx:1 Failed to load resource: 404`

这说明 GitHub Pages 正在加载仓库根目录的 `index.html`（开发版本），而不是构建后的 `dist/index.html`。

## 解决方案

### 1. 检查 GitHub Pages 设置

访问：`https://github.com/JiamingW-Official/RoadMap/settings/pages`

**必须完成：**
- 在 "Source" 部分，选择 **"GitHub Actions"**（不是 "Deploy from a branch"）
- 保存设置

### 2. 检查 GitHub Actions 工作流

访问：`https://github.com/JiamingW-Official/RoadMap/actions`

**检查：**
- 找到 "Deploy to GitHub Pages" 工作流
- 查看最新运行状态（应该显示 ✓ 成功）
- 如果失败，点击查看错误日志

### 3. 如果工作流没有运行

在 Actions 页面：
- 点击 "Deploy to GitHub Pages"
- 点击右上角 "Run workflow"
- 选择 "main" branch
- 点击 "Run workflow"

### 4. 等待部署完成

- 通常需要 2-5 分钟
- 部署完成后访问：`https://jiamingw-official.github.io/RoadMap/`
- 按 `Cmd+Shift+R` 强制刷新清除缓存

## 验证部署

运行以下命令检查部署的文件：

```bash
curl https://jiamingw-official.github.io/RoadMap/index.html | grep script
```

**正确的输出应该显示：**
```html
<script type="module" crossorigin src="/RoadMap/assets/index-xxxxx.js"></script>
```

**错误的输出（当前问题）：**
```html
<script type="module" src="/src/main.tsx"></script>
```

## 如果还是空白

1. 清除浏览器缓存（Cmd+Shift+R）
2. 检查 GitHub Actions 工作流日志
3. 确认 GitHub Pages 设置使用 "GitHub Actions"
4. 等待 5-10 分钟让 CDN 更新

