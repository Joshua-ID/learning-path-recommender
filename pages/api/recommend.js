// Server-side API route to call an LLM and return structured learning paths.
// This example uses OpenAI's API via fetch. Set process.env.OPENAI_API_KEY.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST" });
  }
  const { skills, goal, experience_level } = req.body || {};
  if (!skills || !goal) {
    return res.status(400).json({ error: "Missing skills or goal" });
  }

  // Build a prompt for the LLM to return JSON containing "paths": [{title, duration_weeks, steps: [{title, description, resources: []}], level}]
  const prompt = `
You are an expert career coach and must respond ONLY with valid JSON.
Do not include explanations, introductions, or markdown formatting.

Input:
SKILLS: ${Array.isArray(skills) ? skills.join(", ") : skills}
GOAL: ${goal}
EXPERIENCE_LEVEL: ${experience_level || "intermediate"}

Output JSON structure:
{
  "paths": [
    {
      "title": "string",
      "level": "string",
      "duration_weeks": number,
      "steps": [
        {
          "title": "string",
          "description": "string",
          "estimated_time_hours": number,
          "resources": [{"name": "string", "url": "string"}],
          "why": "string"
        }
      ]
    }
  ]
}
Return only valid JSON.
`;

  try {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      // Return a mocked response for local testing without a key
      const mock = {
        paths: [
          {
            title: "Frontend React + Next.js Path",
            level: "intermediate",
            duration_weeks: 8,
            steps: [
              {
                title: "Core React Patterns",
                description: "Hooks, component design",
                estimated_time_hours: 10,
                resources: [{ name: "React Docs", url: "https://react.dev" }],
                why: "Foundation for modern frontend",
              },
              {
                title: "Next.js 13+ App Router",
                description: "Routing, server components",
                estimated_time_hours: 12,
                resources: [
                  { name: "Next.js Docs", url: "https://nextjs.org" },
                ],
                why: "Build fullstack with SSR/ISR",
              },
            ],
          },
        ],
      };
      return res.status(200).json(mock);
    }

    const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // placeholder - change to available model
        messages: [
          {
            role: "system",
            content: "You are a helpful career coach that outputs strict JSON.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });
    const json = await apiRes.json();
    const txt = json.choices?.[0]?.message?.content || "";
    // Attempt to parse JSON from model output
    let parsed = {};

    try {
      parsed = JSON.parse(txt);
    } catch (e) {
      // Try to extract JSON substring safely
      const match = txt.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch (err2) {
          console.warn("Secondary parse failed", err2);
          throw new Error("Model returned invalid JSON");
        }
      } else {
        console.warn("No JSON block detected");
        throw new Error("Could not parse model output as JSON");
      }
    }

    if (!parsed.paths || !Array.isArray(parsed.paths)) {
      throw new Error('Invalid format — missing "paths" array');
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}
