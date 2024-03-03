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
The response will be in json format \`{ questions: [{ question: string }] }\`.
The questions should be posed in question form ending with a question mark.
You want to use a friendly tone asking simple short questions. Summarize similar questions in a single question.
Ask the most popular questions first. Don't ask too many questions at once.

For example, with the following questions:
- What is your favorite car?
- What is your favorite car brand?
- What is your favorite automobile brand and model?

You should output:
{ questions: [{ question: 'What is your favorite brand and model of car?' }] }

===========
Don't ask anything contained in the following questions:
\`\`\`
${questionsAsked.map(q => `- ${q}`).join('\n')}
\`\`\`
===========
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
            { role: "user" as const, content: 'Here the user questions:\n' + questions.join("\n") },
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
    const parsedContent: { questions: [{ question: string }]} = JSON.parse(content);

    if (!parsedContent.questions) {
        console.log('No question');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }

    const response2 = await openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        // model: "gpt-3.5-turbo-0125",
        response_format: { "type": "json_object" },
        messages: [
            {
                role: "system",
                content: `
Determine if a question has been asked before and output in the JSON in the format \`{ questions: [{ question: string, answered: boolean }] }\`
You should respond with \`{ questions: [{ question: 'question1', answered: true }] }\` if a similar question has been asked before.
You should respond with \`{ questions: [{ question: 'question1', answered: false }] }\` if it has been NEVER been asked before.
These are the questions that have been asked:
\`\`\`
${questionsAsked.map(q => `- ${q}`).join('\n')}
\`\`\`
                `,
            },
            { role: "user" as const, content: 'Here the questions:\n' + parsedContent.questions.map(q => q.question).join("\n") },
        ],
        stream: false,
    });

    const content2 = response2.choices[0].message.content;
    const parsedContent2: { questions: [{ question: string, answered: boolean }]} = JSON.parse(content2);
    console.log('parsedContent2', parsedContent2);

    if (!parsedContent2.questions) {
        console.log('No new question -- all asked before');
        return new Response("", {
            status: 200,
            headers: {
                [NO_QUESTION_HEADER]: "true",
            },
        });
    }

    const newQuestion = parsedContent2.questions.find(q => !q.answered === true)?.question;

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
