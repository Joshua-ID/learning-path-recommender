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

// Enable detailed logging for debugging (set to false in production)
const DEBUG_MODE = process.env.NODE_ENV === "development";

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

REQUIRED JSON FORMAT - Return ONLY valid JSON, no markdown:
{
  "paths": [
    {
      "title": "Path Name",
      "level": "beginner/intermediate/advanced",
      "duration_weeks": 8,
      "steps": [
        {
          "title": "Step Title",
          "description": "Detailed description",
          "estimated_time_hours": 15,
          "resources": [
            {"name": "Resource Name", "url": "https://..."}
          ],
          "why": "Why this step matters"
        }
      ]
    }
  ]
}
`;
}

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

  if (DEBUG_MODE) console.log(`[${provider}] Calling API...`);

  try {
    const response = await fetch(config.url, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (DEBUG_MODE) {
        console.error(
          `[${provider}] HTTP ${response.status}:`,
          errorText.substring(0, 200)
        );
      }
      throw new Error(
        `HTTP ${response.status}: ${errorText.substring(0, 100)}`
      );
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      if (DEBUG_MODE) {
        console.error(
          `[${provider}] Non-JSON response:`,
          textResponse.substring(0, 200)
        );
      }
      throw new Error(
        `Expected JSON but received: ${contentType || "unknown"}`
      );
    }

    const data = await response.json();

    if (data.error) {
      if (DEBUG_MODE) console.error(`[${provider}] API error:`, data.error);
      throw new Error(data.error.message || `API error from ${provider}`);
    }

    return parseAIResponse(data, provider);
  } catch (error) {
    if (DEBUG_MODE) console.error(`[${provider}] Failed:`, error.message);
    throw error;
  }
}

function parseAIResponse(data, provider) {
  // Try function call response first (OpenAI with function calling)
  if (data.choices?.[0]?.message?.function_call?.arguments) {
    try {
      const parsed = JSON.parse(
        data.choices[0].message.function_call.arguments
      );
      if (isValidResponse(parsed)) {
        if (DEBUG_MODE)
          console.log(`[${provider}]  Function call response validated`);
        return parsed;
      }
    } catch (e) {
      if (DEBUG_MODE)
        console.warn(`[${provider}] Function call parse failed:`, e.message);
    }
  }

  // Try direct content response (standard chat completion)
  if (data.choices?.[0]?.message?.content) {
    try {
      const content = data.choices[0].message.content;
      // Extract JSON if it's wrapped in code blocks or has extra text
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : content;
      const parsed = JSON.parse(jsonString);

      // Normalize response format - handle different key names
      let normalized = parsed;
      if (parsed.learning_paths && !parsed.paths) {
        if (DEBUG_MODE)
          console.log(`[${provider}] Converting learning_paths → paths`);
        normalized = { paths: parsed.learning_paths };
      }

      if (isValidResponse(normalized)) {
        if (DEBUG_MODE)
          console.log(`[${provider}]  Content response validated`);
        return normalized;
      }

      if (DEBUG_MODE) {
        console.warn(`[${provider}] Validation failed:`, {
          hasPaths: !!normalized?.paths,
          pathsCount: normalized?.paths?.length,
          hasSteps: !!normalized?.paths?.[0]?.steps,
          stepsCount: normalized?.paths?.[0]?.steps?.length,
        });
      }
    } catch (parseError) {
      if (DEBUG_MODE)
        console.warn(`[${provider}] JSON parse failed:`, parseError.message);
    }
  }

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

    if (DEBUG_MODE) {
      console.log("\n=== Learning Path API Request ===");
      console.log("Skills:", skills);
      console.log("Goal:", goal);
      console.log("Level:", experience_level);
      console.log("API Keys:", {
        openai: !!OPENAI_KEY,
        openrouter: !!OPENROUTER_KEY,
      });
    }

    // Use mock data if no API keys available
    if (!hasValidKeys) {
      if (DEBUG_MODE) console.warn("⚠ No API keys found, using mock data");
      const mockResponse = createMockResponse(skills, goal, experience_level);
      return res.status(200).json({ ...mockResponse, _source: "mock" });
    }

    const prompt = createPrompt(skills, goal, experience_level);
    let result;
    let successfulProvider = null;

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
          successfulProvider = provider.name;
          if (DEBUG_MODE) console.log(` Success with ${provider.name}`);
          break;
        } catch (error) {
          if (DEBUG_MODE)
            console.warn(` ${provider.name} failed, trying next...`);
        }
      }
    }

    // Fallback to mock data if all providers fail
    if (!result) {
      if (DEBUG_MODE) console.warn("⚠ All providers failed, using mock data");
      result = createMockResponse(skills, goal, experience_level);
      successfulProvider = "mock";
    }

    if (DEBUG_MODE) console.log(`Response source: ${successfulProvider}\n`);

    return res.status(200).json({ ...result, _source: successfulProvider });
  } catch (error) {
    console.error("API handler error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
      fallback_used: true,
    });
  }
}
