# Summit Check

A mobile-first mountain weather conditions app for hikers and mountaineers. Search for any US peak by name and get a single-screen Conditions Card with current summit weather, an AI-generated plain-english summary, gear advisories, and a compact 24-hour outlook — all designed to be glanced at before you head out the door.

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/summit-check.git
cd summit-check
npm install
```

Create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
```

Then start the dev server:

```bash
npm run dev
```

## Deploy to GitHub Pages

1. Push the repo to GitHub on the `main` branch.
2. Go to **Settings → Secrets and variables → Actions** and add a repository secret named `ANTHROPIC_API_KEY` with your Anthropic API key.
3. Go to **Settings → Pages** and set the source to **GitHub Actions**.
4. Every push to `main` triggers the deploy workflow automatically.

> **Note:** The API key is embedded in the client-side bundle since this app has no backend. Set a budget/usage limit on your Anthropic API key to avoid unexpected charges.

## Credits

- [Open-Meteo](https://open-meteo.com/) — free weather data API (no key required)
- [Anthropic](https://www.anthropic.com/) — Claude AI for plain-english summit condition summaries
