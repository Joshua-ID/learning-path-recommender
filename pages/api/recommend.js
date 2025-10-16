// pages/api/recommend.js

// Configuration constants
const API_CONFIG = {
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    models: {
      primary: "gpt-3.5-turbo",
      fallback: "gpt-3.5-turbo",
    },
  },
  openrouter: {
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: {
      primary: "openai/gpt-3.5-turbo",
      fallback: "meta-llama/llama-3.1-8b-instruct:free",
    },
    headers: {
      "HTTP-Referer": "https://learners-pathway.vercel.app",
      "X-Title": "Learning Path Recommender",
    },
  },
};

// Function calling schema (reusable)
const LEARNING_PATH_FUNCTION_SCHEMA = {
  name: "generate_learning_paths",
  description: "Generate a structured learning plan with paths and steps",
  parameters: {
    type: "object",
    properties: {
      paths: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            level: { type: "string" },
            duration_weeks: { type: "number" },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  estimated_time_hours: { type: "number" },
                  resources: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        url: { type: "string" },
                      },
                      required: ["name", "url"],
                    },
                  },
                  why: { type: "string" },
                },
                required: ["title", "description", "why"],
              },
            },
          },
          required: ["title", "level", "steps"],
        },
      },
    },
    required: ["paths"],
  },
};

// Helper functions
function getApiKeys() {
  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

  return { OPENAI_KEY, OPENROUTER_KEY };
}

function createPrompt(skills, goal, experience_level) {
  return `
You are an expert AI career coach specializing in creating personalized learning paths.
Generate a structured, actionable learning plan for the following user:

CURRENT SKILLS: ${Array.isArray(skills) ? skills.join(", ") : skills}
DESIRED GOAL: ${goal}
EXPERIENCE LEVEL: ${experience_level || "intermediate"}

CRITICAL REQUIREMENTS:
- Return exactly 1-2 learning paths maximum
- Each path must have 3-5 concrete, actionable steps
- Include realistic time estimates (hours and weeks)
- Provide genuine, useful resource links (not placeholder URLs)
- Focus on practical, project-based learning
- Explain the "why" behind each step for motivation

FORMAT: Structured JSON with paths containing steps with resources.
`;
}

// mock response incase api fails
function createMockResponse(skills, goal, experience_level) {
  return {
    paths: [
      {
        title: `Personalized ${goal} Mastery Path`,
        level: experience_level || "intermediate",
        duration_weeks: 8,
        steps: [
          {
            title: `Master ${skills} Core Concepts`,
            description: `Build a strong foundation in ${skills} through practical exercises and fundamental concepts.`,
            estimated_time_hours: 15,
            resources: [
              { name: "MDN Web Docs", url: "https://developer.mozilla.org" },
              {
                name: "Official Documentation",
                url: "https://example.com/docs",
              },
            ],
            why: "Solid fundamentals enable advanced learning and problem-solving.",
          },
          {
            title: "Hands-on Project Development",
            description:
              "Apply your skills by building real-world projects that demonstrate practical application.",
            estimated_time_hours: 20,
            resources: [
              {
                name: "Project Ideas Repository",
                url: "https://github.com/topics/learning-projects",
              },
              { name: "CodeSandbox", url: "https://codesandbox.io" },
            ],
            why: "Project-based learning reinforces concepts and builds portfolio pieces.",
          },
          {
            title: "Advanced Patterns & Best Practices",
            description:
              "Learn industry standards, optimization techniques, and professional development workflows.",
            estimated_time_hours: 12,
            resources: [
              {
                name: "Best Practices Guide",
                url: "https://github.com/goldbergyoni/javascript-best-practices",
              },
              { name: "Patterns Library", url: "https://www.patterns.dev" },
            ],
            why: "Mastering advanced concepts ensures professional-level competency and efficiency.",
          },
        ],
      },
    ],
  };
}

async function callAIProvider(
  provider,
  apiKey,
  prompt,
  useFunctionCalling = true
) {
  const config = API_CONFIG[provider];
  const requestBody = {
    model: config.models.primary,
    messages: [
      {
        role: "system",
        content:
          "You are an expert career coach. Generate structured, actionable learning paths in valid JSON format.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.4,
    max_tokens: 1500,
  };

  if (useFunctionCalling && provider === "openai") {
    requestBody.functions = [LEARNING_PATH_FUNCTION_SCHEMA];
    requestBody.function_call = { name: "generate_learning_paths" };
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    ...(config.headers || {}),
  };

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || `API error from ${provider}`);
    }

    return parseAIResponse(data, provider);
  } catch (error) {
    console.error(`API call failed:`, error.message);
    throw error;
  }
}

function parseAIResponse(data, provider) {
  // Try function call response first
  if (data.choices?.[0]?.message?.function_call?.arguments) {
    const parsed = JSON.parse(data.choices[0].message.function_call.arguments);
    if (isValidResponse(parsed)) return parsed;
  }

  // Try direct content response
  if (data.choices?.[0]?.message?.content) {
    try {
      const content = data.choices[0].message.content;
      // Extract JSON if it's wrapped in code blocks
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      const parsed = JSON.parse(jsonString);
      if (isValidResponse(parsed)) return parsed;
    } catch (parseError) {
      console.warn(`${provider} JSON parse failed, using structured fallback`);
    }
  }

  // Final fallback
  throw new Error(`Invalid response format from ${provider}`);
}

function isValidResponse(result) {
  return (
    result &&
    result.paths &&
    Array.isArray(result.paths) &&
    result.paths.length > 0 &&
    result.paths[0].steps &&
    Array.isArray(result.paths[0].steps) &&
    result.paths[0].steps.length >= 2
  );
}

// Main API handler
export default async function handler(req, res) {
  // Set timeout for long-running requests
  res.setTimeout(30000, () => {});

  try {
    // Validate request method
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed. Use POST." });
    }

    // Validate request body
    const { skills, goal, experience_level } = req.body || {};
    if (!skills || !goal) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["skills", "goal"],
        received: { skills: !!skills, goal: !!goal },
      });
    }

    // Get API keys from environment
    const { OPENAI_KEY, OPENROUTER_KEY } = getApiKeys();
    const hasValidKeys = OPENAI_KEY || OPENROUTER_KEY;

    if (!hasValidKeys) {
      console.warn("No API keys found, using mock data");
      const mockResponse = createMockResponse(skills, goal, experience_level);
      return res.status(200).json(mockResponse);
    }

    const prompt = createPrompt(skills, goal, experience_level);
    let result;

    // Try providers in order of preference
    const providers = [
      { name: "openai", key: OPENAI_KEY, useFunctionCalling: true },
      { name: "openrouter", key: OPENROUTER_KEY, useFunctionCalling: false },
    ];

    for (const provider of providers) {
      if (provider.key && !result) {
        try {
          result = await callAIProvider(
            provider.name,
            provider.key,
            prompt,
            provider.useFunctionCalling
          );
          break; // Exit loop if successful
        } catch (error) {
          console.warn(`${provider.name} failed:`, error.message);
        }
      }
    }

    if (!result) {
      result = createMockResponse(skills, goal, experience_level);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Unexpected error in API handler:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      fallback_used: true,
    });
  }
}
