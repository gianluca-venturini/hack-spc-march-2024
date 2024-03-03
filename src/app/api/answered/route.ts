import { uuid } from "uuidv4";
import { getValuesByPrefix, setValue } from "../clients/redis";
import { NO_CONTENT_HEADER, NO_QUESTION_HEADER, QUESTION_ASKED_PREFIX, QUESTION_PREFIX } from "@/constants";
import { openaiClient } from "../clients/openai";

export const runtime = "nodejs";
export const preferredRegion = "sfo1";
export const maxDuration = 10; // seconds

interface Params {
    transcript: string;
    question: string;
}

export async function POST(request: Request) {
    const requestData: Params = await request.json();
    if (!requestData.transcript) {
        return new Response(JSON.stringify({ answered: false }), {
            status: 200,
            headers: {
                [NO_CONTENT_HEADER]: "true",
            },
        });
    }

    console.log("Transcript:", requestData.transcript);
    console.log("Question:", requestData.question);

    const systemPrompt = `
You are trying to understand if a question has been answered by the user.
Respond in JSON with \`{ answered: true }\` if the question has been answered.
Respond in JSON  with \`{ answered: false }\` if the question has NOT been answered.
Here the text:
${requestData.transcript}
`;
    console.log('systemPrompt\n', systemPrompt);

    const response = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        // model: "gpt-3.5-turbo-0125",
        response_format: { "type": "json_object" },
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user" as const, content: requestData.question },
        ],
        stream: false,
    });

    const content = response.choices[0].message.content;
    console.log('content', content);

    if (content === null) {
        console.log('Content is null');
        return new Response(JSON.stringify({ answered: false }), {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }
    const parsedContent: { answered: boolean } = JSON.parse(content);

    return new Response(JSON.stringify(parsedContent), {
        status: 200,
        headers: {
            [NO_QUESTION_HEADER]: "true",
        },
    });
}
