import { NextApiRequest, NextApiResponse } from "next/types";
import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextResponse } from "next/server";
import { getValuesByPrefix } from "../clients/redis";
import { NO_CONTENT_HEADER, QUESTION_PREFIX } from "@/constants";

export const runtime = "nodejs";
export const preferredRegion = "sfo1";
export const maxDuration = 10; // seconds

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

// Connect to redis!!!! @teo
// const redisClient: RedisClientType = createClient({
//   url: 'redis://localhost:6379', // Your Redis URL
// });
// await redisClient.connect();

// Function to fetch questions from Redis
async function fetchQuestions(): Promise<string[]> {
  // Assuming questions are stored in a list called "questions"
  // const questions = await redisClient.lRange("questions", 0, -1);

  // questions is a list of questions

  let questions: string[] = await getValuesByPrefix(QUESTION_PREFIX);
  return questions;
}

export async function GET(request: Request) {
  const questions = await fetchQuestions();
  if (questions.length === 0) {
    return new Response("", {
      status: 200,
      headers: {
        [NO_CONTENT_HEADER]: "true",
      },
    });
  }

  console.log("Questions:", questions);

  const response = await openai.chat.completions.create({
    // model: 'gpt-4-turbo-preview',
    model: "gpt-3.5-turbo-0125",
    messages: [
      {
        role: "system",
        content: `
                You are summarizing the user questions from a crowd.
                You want to use a friendly tone asking the shortest possible question.
                Ask the most popular question.
            `,
      },
      { role: "user" as const, content: questions.join("\n") },
      // ...questions.map(question => ({ role: 'user' as const, content: question })),
    ],
    stream: false,
  });

  return new Response(response.choices[0].message.content, {
    status: 200,
  });

}
