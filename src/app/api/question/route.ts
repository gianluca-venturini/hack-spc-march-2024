import { uuid } from "uuidv4";
import { getValuesByPrefix, setValue } from "../clients/redis";
import { NO_CONTENT_HEADER, NO_QUESTION_HEADER, QUESTION_ASKED_PREFIX, QUESTION_PREFIX } from "@/constants";
import { openaiClient } from "../clients/openai";

export const runtime = "nodejs";
export const preferredRegion = "sfo1";
export const maxDuration = 10; // seconds

/** Function to fetch questions from Redis */
async function fetchQuestions() {

  const questions: string[] = await getValuesByPrefix(QUESTION_PREFIX);
  const questionsAsked: string[] = await getValuesByPrefix(QUESTION_ASKED_PREFIX);
  return { questions, questionsAsked };
}

interface Params {
    transcript: string;
}

export async function POST(request: Request) {
    const requestData: Params = await request.json();
    const { questions, questionsAsked } = await fetchQuestions();
    if (questions.length === 0) {
        return new Response("", {
            status: 200,
            headers: {
                [NO_CONTENT_HEADER]: "true",
            },
        });
    }

    console.log("Questions:", questions);
    console.log("Questions asked:", questionsAsked);

    const systemPrompt = `
You are summarizing the user questions from the crowd attending a talk.
The response will be in json format \`{ questions: [{ question: string, exclude: boolean }] }\`.
You want to use a friendly tone asking simple short questions. Summarize similar questions in a single question. Ask the most popular not answered and not asked questions first. Don't ask too many questions at once.
===========
Flag all the questions with \`exclude: true\` already mentioned in the following text:
\`\`\`
${questionsAsked.map(q => `- ${q}`).join('\n')}

${requestData.transcript ?? ''}
\`\`\`
===========
Next the user questions:
`;
    console.log('systemPrompt\n', systemPrompt);
    console.log('questions\n', questions.join("\n"));

    const response = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        // model: "gpt-3.5-turbo-0125",
        response_format: { "type": "json_object" },
        messages: [
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user" as const, content: questions.join("\n") },
        ],
        stream: false,
    });

    const content = response.choices[0].message.content;
    console.log('content', content);

    if (content === null) {
        console.log('Content is null');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }
    const parsedContent: { questions: [{ question: string; exclude: boolean}]} = JSON.parse(content);

    if (parsedContent.questions.filter(q => q.exclude === true).length === 0) {
        console.log('No new question');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }

    const newQuestion = parsedContent.questions.find(q => q.exclude === false)?.question;

    if (newQuestion === null || newQuestion === undefined) {
        console.log('New question is null?');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }

    console.log('newQuestion:', newQuestion);

    await setValue(`${QUESTION_ASKED_PREFIX}${uuid()}`, newQuestion);

    return new Response(newQuestion, {
        status: 200,
    });

}
