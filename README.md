# Learning Path Recommender (Next.js + Tailwind)

**What this is**
- A starter Next.js + Tailwind app that demonstrates an AI-powered Learning Path Recommender.
- Users enter current skills and goals; the backend (stubbed) calls an LLM to generate a personalized learning path.

**What's included**
- Next.js pages and API route `/api/recommend` (server-side call to OpenAI or other LLM).
- Tailwind CSS setup.
- Components for input and path display.

**How to run**
1. Install: `npm install`
2. Set environment variable: `OPENAI_API_KEY` (or modify the API route to use another provider)
   alternative https://openrouter.ai/ -  API key - `OPENROUTER_API_KEY`
4. Run dev server: `npm run dev`
5. Open `http://localhost:3000`

**Notes**
- The repository includes a working server-side API integration scaffold but **does not** include an API key. Replace the API call with your preferred provider or mock.
- This is a minimal, production-oriented scaffold. Customize the prompts, model usage, and UI as desired.
