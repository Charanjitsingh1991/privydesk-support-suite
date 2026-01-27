import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalysisRequest {
  type: "categorize" | "sentiment" | "suggest_response" | "full_analysis" | "extract_tags";
  subject: string;
  description: string;
  messages?: string[];
}

interface CategoryResult {
  category: string;
  confidence: number;
  reasoning: string;
}

interface SentimentResult {
  sentiment: "positive" | "neutral" | "negative" | "frustrated" | "urgent";
  score: number;
  emotions: string[];
  reasoning: string;
  escalation_recommended: boolean;
  escalation_reason?: string;
}

interface ResponseSuggestion {
  title: string;
  content: string;
  tone: string;
}

interface TagsResult {
  tags: string[];
  reasoning: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, subject, description, messages = [] } = await req.json() as AnalysisRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let toolDefinition: any = null;

    if (type === "categorize") {
      systemPrompt = `You are a ticket categorization expert. Analyze the support ticket and classify it into one of these categories:
- technical: Technical issues, bugs, errors, system problems
- billing: Payment issues, invoices, subscriptions, refunds
- account: Account settings, login issues, password resets
- feature_request: New feature suggestions, improvements
- bug_report: Bug reports, defects, unexpected behavior
- general: General inquiries, questions, other

Provide your confidence score (0-100) and brief reasoning.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "categorize_ticket",
          description: "Categorize a support ticket",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["technical", "billing", "account", "feature_request", "bug_report", "general"]
              },
              confidence: { type: "number", minimum: 0, maximum: 100 },
              reasoning: { type: "string" }
            },
            required: ["category", "confidence", "reasoning"],
            additionalProperties: false
          }
        }
      };
    } else if (type === "sentiment") {
      systemPrompt = `You are a sentiment analysis expert. Analyze the customer's message and determine:
1. Overall sentiment (positive, neutral, negative, frustrated, urgent)
2. Sentiment score (-1 to 1, where -1 is very negative and 1 is very positive)
3. Detected emotions (anger, frustration, satisfaction, confusion, urgency, gratitude, etc.)
4. Whether escalation is recommended (true if customer is very frustrated or issue is critical)

Focus on understanding the customer's emotional state to help agents respond appropriately.
Flag for escalation if:
- Negative sentiment detected 3+ times in messages
- Urgency indicators like "immediately", "asap", "critical", "broken", "down"
- Explicit threats to leave or cancel`;

      toolDefinition = {
        type: "function",
        function: {
          name: "analyze_sentiment",
          description: "Analyze sentiment of a support ticket",
          parameters: {
            type: "object",
            properties: {
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative", "frustrated", "urgent"]
              },
              score: { type: "number", minimum: -1, maximum: 1 },
              emotions: {
                type: "array",
                items: { type: "string" }
              },
              reasoning: { type: "string" },
              escalation_recommended: { type: "boolean" },
              escalation_reason: { type: "string" }
            },
            required: ["sentiment", "score", "emotions", "reasoning", "escalation_recommended"],
            additionalProperties: false
          }
        }
      };
    } else if (type === "extract_tags") {
      systemPrompt = `You are a tag extraction expert. Analyze the support ticket and extract relevant tags.
Extract up to 5 concise, lowercase, hyphenated tags that describe:
- The main issue or topic
- Affected features or products
- Technical keywords
- Action type (e.g., "password-reset", "refund-request", "feature-question")

Tags should be specific and actionable, not generic like "help" or "issue".`;

      toolDefinition = {
        type: "function",
        function: {
          name: "extract_tags",
          description: "Extract relevant tags from a support ticket",
          parameters: {
            type: "object",
            properties: {
              tags: {
                type: "array",
                items: { type: "string" },
                maxItems: 5
              },
              reasoning: { type: "string" }
            },
            required: ["tags", "reasoning"],
            additionalProperties: false
          }
        }
      };
    } else if (type === "suggest_response") {
      systemPrompt = `You are a customer support expert. Based on the ticket content and conversation history, suggest 3 helpful response templates that an agent could use or adapt.

Each suggestion should:
1. Be professional and empathetic
2. Address the customer's concern directly
3. Provide actionable next steps when possible
4. Vary in tone (formal, friendly, concise)

Keep responses under 200 words each.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "suggest_responses",
          description: "Generate response suggestions for a ticket",
          parameters: {
            type: "object",
            properties: {
              suggestions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    tone: { type: "string", enum: ["formal", "friendly", "concise"] }
                  },
                  required: ["title", "content", "tone"],
                  additionalProperties: false
                }
              }
            },
            required: ["suggestions"],
            additionalProperties: false
          }
        }
      };
    } else if (type === "full_analysis") {
      systemPrompt = `You are a comprehensive ticket analysis expert. Perform a full analysis including:
1. Category classification with confidence
2. Sentiment analysis with emotions
3. Priority recommendation
4. Key issues identified
5. Suggested actions for the agent

Be thorough but concise.`;

      toolDefinition = {
        type: "function",
        function: {
          name: "full_ticket_analysis",
          description: "Perform comprehensive ticket analysis",
          parameters: {
            type: "object",
            properties: {
              category: {
                type: "string",
                enum: ["technical", "billing", "account", "feature_request", "bug_report", "general"]
              },
              category_confidence: { type: "number", minimum: 0, maximum: 100 },
              sentiment: {
                type: "string",
                enum: ["positive", "neutral", "negative", "frustrated", "urgent"]
              },
              sentiment_score: { type: "number", minimum: -1, maximum: 1 },
              emotions: { type: "array", items: { type: "string" } },
              priority_recommendation: {
                type: "string",
                enum: ["low", "medium", "high", "urgent"]
              },
              key_issues: { type: "array", items: { type: "string" } },
              suggested_actions: { type: "array", items: { type: "string" } },
              summary: { type: "string" }
            },
            required: ["category", "category_confidence", "sentiment", "sentiment_score", "emotions", "priority_recommendation", "key_issues", "suggested_actions", "summary"],
            additionalProperties: false
          }
        }
      };
    }

    const conversationContext = messages.length > 0
      ? `\n\nConversation history:\n${messages.join("\n---\n")}`
      : "";

    const userPrompt = `Subject: ${subject}\n\nDescription: ${description}${conversationContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [toolDefinition],
        tool_choice: { type: "function", function: { name: toolDefinition.function.name } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ type, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-ticket error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Analysis failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
