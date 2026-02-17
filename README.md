# LinkedinAssist

A LinkedIn assistant that scrapes profiles, generates personalized connection drafts with Gemini, and lets you approve and send them—with a 10/day limit and full human-in-the-loop control.

## Getting Started

Candidates are **not** created automatically. Sync runs automatically on startup. Here’s the flow:

### 1. Environment variables

Fill in your `.env` file with:

- `LINKEDIN_EMAIL`, `LINKEDIN_PASSWORD` — for scraping (first run only; session is saved)
- `GEMINI_API_KEY` — for generating draft messages
- `CV_PATH` — path to your resume (PDF or TXT) for personalized drafts

### 2. Add search targets

Copy `search-targets.example.json` to `data/search-targets.json`:

```bash
# Windows PowerShell
mkdir data 2>$null; copy search-targets.example.json data\search-targets.json

# macOS / Linux
mkdir -p data; cp search-targets.example.json data/search-targets.json
```

Edit `data/search-targets.json` to add LinkedIn search queries (recruiters, hiring managers, etc.). The app discovers profiles automatically from these searches.

### 3. Install and start

From the project root:

```bash
npm install
cd automation
npm install
cd ..
npm start
```

This starts both the Angular app and the API server. **Sync runs automatically** on startup: it discovers profiles from your search targets, scrapes them, generates CV-personalized drafts with Gemini, and populates candidates.

Open `http://localhost:4200/`, log in, and go to the dashboard. Candidates appear automatically. Edit, approve, then click **Confirm & Send** when ready.

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
