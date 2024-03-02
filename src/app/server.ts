import OpenAI from 'openai';
import * as dotenv from "dotenv";
import * as fs from "fs";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

export async function testLLM() {
  const audioFilePath = "test.mp3";
  const audioFile = fs.createReadStream(audioFilePath);

  try {
    // const transcription = await openai.com({
    //   model: "whisper-1",
    //   file: audioFile,
    // });
    console.log('starting generating response...');
    const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: 'Say this is a test' }],
        stream: false,
    });
    console.log('done');

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error during transcription:", error);
  }
}