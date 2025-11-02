# NYC Startup → IPO Simulator

A web-based startup simulation game built with React, TypeScript, and Vite.

## Development

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Deployment

This project is deployed to GitHub Pages using GitHub Actions. The workflow automatically builds and deploys on every push to `main`.

### Important: GitHub Pages Settings

1. Go to repository Settings → Pages
2. Under "Source", select **"GitHub Actions"** (NOT "Deploy from a branch")
3. Save the settings

The GitHub Actions workflow will:
- Build the project for production
- Upload the `dist` folder to GitHub Pages
- Deploy automatically on every push

If the site shows a blank page, check:
- GitHub Actions workflow status (Actions tab)
- GitHub Pages source is set to "GitHub Actions"
- Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)

