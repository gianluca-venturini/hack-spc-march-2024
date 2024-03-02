import { NextApiRequest, NextApiResponse } from 'next/types';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import {NextResponse} from "next/server";
import { getValuesByPrefix } from '../clients/redis';
import { NO_CONTENT_HEADER, QUESTION_PREFIX } from '@/constants';

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

    let questions: string[] = await getValuesByPrefix(QUESTION_PREFIX);
    return questions;
}

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
        messages: [
            { role: 'system', content: 'Summarize the following questions' },
            { role: 'user', content: questions.join("\n") }
        ],
        stream: true,
    });

    const stream = OpenAIStream(response);
 
    return new StreamingTextResponse(stream);
}