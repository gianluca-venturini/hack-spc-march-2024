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

export async function GET(request: Request) {
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
        You are summarizing the user questions from a crowd.
        The response will be in json format \`{ question: '' }\`.
        Only if you haven't asked this question before, ask it, otherwise return \`{ noop: true }\`.
        You want to use a friendly tone asking the shortest possible question.
        Ask the most popular question.
        ${questionsAsked.length > 0 ? `Don't repeat the following questions: \n${questionsAsked.map(q => `- ${q}`).join('\n')}` : ""}
    `;
    console.log(systemPrompt);

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
            // ...questions.map(question => ({ role: 'user' as const, content: question })),
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
    const parsedContent = JSON.parse(content);

    if (parsedContent.noop === true) {
        console.log('No new question');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }

    const newQuestion = parsedContent.question;

    console.log('newQuestion:', newQuestion);

    await setValue(`${QUESTION_ASKED_PREFIX}${uuid()}`, newQuestion);

    return new Response(newQuestion, {
        status: 200,
    });

}
