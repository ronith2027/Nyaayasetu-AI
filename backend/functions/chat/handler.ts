import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { nyayaSetuChatPrompt } from "../../../shared/prompts/chatPrompt";

const dynamoClient = new DynamoDBClient({});
const bedrockClient = new BedrockRuntimeClient({});

export const handler = async (event: any) => {
    try {
        const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
        const { user_query, retrieved_legal_chunks } = body;

        if (!user_query) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing user_query" })
            };
        }

        const systemPrompt = nyayaSetuChatPrompt;

        const contextStr = retrieved_legal_chunks ?
            (Array.isArray(retrieved_legal_chunks) ? retrieved_legal_chunks.join("\\n") : retrieved_legal_chunks) :
            "";

        // Replacing the template tags with actual content
        // Even though it's typically injected via variables in bedrock or string replace,
        // we'll replace the text since the prompt has "LEGAL CONTEXT: {retrieved_legal_chunks}"
        // and "USER QUESTION: {user_query}" format.
        const promptString = systemPrompt
            .replace("{retrieved_legal_chunks}", contextStr)
            .replace("{user_query}", user_query);

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 900,
            temperature: 0.2,
            top_p: 0.9,
            messages: [
                {
                    role: "user",
                    content: [{ type: "text", text: promptString }]
                }
            ]
        };

        const command = new InvokeModelCommand({
            contentType: "application/json",
            accept: "application/json",
            modelId: "anthropic.claude-v2", // using a standard claude model
            body: JSON.stringify(payload)
        });

        const response = await bedrockClient.send(command);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const modelOutput = responseBody.content?.[0]?.text || responseBody.completion || "";

        // VALIDATION REQUIREMENTS (Lambda Layer)
        // After model response:
        // Parse JSON strictly.
        let parsedResponse;
        try {
            // Find the JSON object starting and ending index. Sometimes it returns markdown code blocks.
            const jsonStart = modelOutput.indexOf('{');
            const jsonEnd = modelOutput.lastIndexOf('}');
            if (jsonStart === -1 || jsonEnd === -1) {
                throw new Error("No JSON found in response");
            }
            const rawJson = modelOutput.substring(jsonStart, jsonEnd + 1);
            parsedResponse = JSON.parse(rawJson);
        } catch (parseError) {
            // If parsing fails -> reject response
            console.error("Failed to parse JSON strictly", parseError, modelOutput);
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid model response format" })
            };
        }

        // Ensure all required fields exist.
        const requiredFields = [
            "summary",
            "legal_basis",
            "steps",
            "documents_required",
            "government_authority",
            "confidence_score"
        ];

        for (const field of requiredFields) {
            if (parsedResponse[field] === undefined) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Missing required field: ${field}` })
                };
            }
        }

        // Ensure confidence_score is numeric between 0 and 1.
        if (typeof parsedResponse.confidence_score !== "number" ||
            parsedResponse.confidence_score < 0 ||
            parsedResponse.confidence_score > 1) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Invalid confidence_score" })
            };
        }

        // If confidence_score < 0.5 -> store in flagged_responses table.
        if (parsedResponse.confidence_score < 0.5) {
            const putCommand = new PutItemCommand({
                TableName: "flagged_responses",
                Item: {
                    "id": { S: Date.now().toString() + Math.random().toString(36).substring(2, 6) },
                    "user_query": { S: user_query },
                    "response": { S: JSON.stringify(parsedResponse) },
                    "timestamp": { S: new Date().toISOString() }
                }
            });
            await dynamoClient.send(putCommand);
        }

        // Never render raw model output to frontend.
        // Ensure we only return the parsed sanitized JSON
        const safeOutput = {
            summary: parsedResponse.summary,
            legal_basis: parsedResponse.legal_basis,
            steps: Array.isArray(parsedResponse.steps) ? parsedResponse.steps : [],
            documents_required: Array.isArray(parsedResponse.documents_required) ? parsedResponse.documents_required : [],
            government_authority: parsedResponse.government_authority,
            confidence_score: parsedResponse.confidence_score
        };

        return {
            statusCode: 200,
            body: JSON.stringify(safeOutput)
        };

    } catch (error: any) {
        console.error("Chat Handler Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || "Internal Server Error" })
        };
    }
};
