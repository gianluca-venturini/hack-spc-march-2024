import { NextApiRequest, NextApiResponse } from 'next/types';
import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai'

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

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

export async function GET(request: NextApiRequest, res: NextApiResponse) {
    const response = await openai.chat.completions.create({
        // model: 'gpt-4-turbo-preview',
        model: 'gpt-3.5-turbo-0125',
        messages: [{ role: 'user', content: 'Give me the first chapter of the divine commedy' }],
        stream: true,
    });

    const stream = OpenAIStream(response);
 
    return new StreamingTextResponse(stream);
}