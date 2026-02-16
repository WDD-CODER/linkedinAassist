---
name: deployAngularToGitHub
description: Configure an Angular Standalone SPA for deployment to GitHub Pages
argument-hint: Repository name for base-href configuration
---
Help me deploy my Angular application to GitHub Pages. Follow these Renaissance standards:

1. **Build Configuration**: Update `angular.json` or the build command to use the correct `--base-href` for GitHub Pages.
2. **Routing Compatibility**: Ensure the `provideRouter` configuration uses a strategy that works with GitHub Pages (Hash location strategy) to prevent 404s on refresh.
3. **GitHub Actions**: Create a `.github/workflows/deploy.yml` that:
    - Uses Node.js 20.x or 22.x.
    - Runs `npm ci`.
    - Builds the Angular client.
    - Deploys the `dist/client/browser` folder to the `gh-pages` branch.
4. **Environment Safety**: Ensure the Gemini API Key is NOT committed; use GitHub Secrets and reference them in the workflow.
5. **Typescript Check**: Run a full production build check to catch strict type errors before attempting deployment.