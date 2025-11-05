
import { GoogleGenAI, Type } from "@google/genai";
import { KnowledgeGraph } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        features: {
            type: Type.ARRAY,
            description: "A list of all features found in the documentation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: {
                        type: Type.STRING,
                        description: "The unique name of the feature."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A brief description of what the feature does."
                    },
                    dependencies: {
                        type: Type.ARRAY,
                        description: "A list of other feature names that this feature depends on.",
                        items: { type: Type.STRING }
                    },
                    parameters: {
                        type: Type.ARRAY,
                        description: "Configuration parameters associated with this feature.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: {
                                    type: Type.STRING,
                                    description: "The name of the configuration parameter."
                                },
                                type: {
                                    type: Type.STRING,
                                    description: "The data type of the parameter (e.g., string, number, boolean)."
                                },
                                description: {
                                    type: Type.STRING,
                                    description: "A description of the parameter's purpose."
                                },
                                required: {
                                    type: Type.BOOLEAN,
                                    description: "Whether the parameter is mandatory for the feature."
                                }
                            },
                            required: ["name", "type", "description", "required"]
                        }
                    }
                },
                required: ["name", "description", "dependencies", "parameters"]
            }
        }
    },
    required: ["features"]
};


export const parseDocumentation = async (docText: string): Promise<KnowledgeGraph> => {
  try {
    const prompt = `
      You are an expert system architect specializing in payment systems. Your task is to analyze technical documentation and extract a structured knowledge graph of features, their dependencies, and their configuration parameters.

      Analyze the following documentation text and generate a JSON object representing the knowledge graph.

      The JSON object must conform to the provided schema. Each feature object must contain a name, description, a list of dependencies (by name), and a list of its configuration parameters.

      Documentation Text:
      ---
      ${docText}
      ---

      Provide ONLY the JSON object as your response. Do not include any other text, explanations, or markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Basic validation of the parsed structure
    if (parsedJson && Array.isArray(parsedJson.features)) {
      return parsedJson as KnowledgeGraph;
    } else {
      throw new Error("Parsed JSON does not match the expected KnowledgeGraph structure.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to parse documentation: ${error.message}`);
    }
    throw new Error("An unknown error occurred while parsing documentation.");
  }
};
