import { NextApiRequest, NextApiResponse } from 'next/types';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { createClient, RedisClientType } from 'redis';
import {NextResponse} from "next/server";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
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

    let questions: string[] = [
    "What is your name?",
    "How old are you?",
    "Where are you from?"
];
  return questions;
}


// export async function testLLM() {

//   try {
//     // const transcription = await openai.com({
//     //   model: "whisper-1",
//     //   file: audioFile,
//     // });
//     console.log('starting generating response...');
//     const stream = await openai.chat.completions.create({
//         // model: 'gpt-4-turbo-preview',
//         model: 'gpt-3.5-turbo-0125',
//         messages: [{ role: 'user', content: 'Give me the first chapter of the divine commedy' }],
//         stream: true,
//     });
//     console.log('done');

//     return response.choices[0].message.content;
//   } catch (error) {
//     console.error("Error during transcription:", error);
//   }
// }

export async function GET(request: Request) {
    const questions = await fetchQuestions();
    if (questions.length === 0) {
        return new Response('', {
            status: 200,
            headers: {
                [NO_CONTENT_HEADER]: 'true'
            }
        });
    }

    const response = await openai.chat.completions.create({
        // model: 'gpt-4-turbo-preview',
        model: 'gpt-3.5-turbo-0125',
        messages: [{ role: 'user', content: 'Summarize the following questions' + questions.join("\n") }],
        stream: true,
    });

    const stream = OpenAIStream(response);
 
    return new StreamingTextResponse(stream);
}