import { NextResponse } from "next/server";
import { toFile } from "openai";
import { openaiClient } from "../clients/openai";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "File blob is required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const fetchTranscription = async () =>
      await openaiClient.audio.transcriptions.create({
        model: "whisper-1",
        response_format: "json",
        file: await toFile(buffer, file.name, { type: file.type }),
      });

    // const fetchWithTimout = withTimeout(fetchTranscription, 5000);
    // const fetchTranscriptionWithRetry = withRetry(fetchWithTimout, {
    //   maxAttemps: 3,
    //   delayMs: 1000,
    // });

    // call opeanai api for whister speech to text
    const result = await fetchTranscription().catch((error) => {
      console.error("OpenAI Whister SST call failed.", error);
    });

    if (result) {
      console.log("result", result.text);

      return new Response(result.text, {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    }
    return NextResponse.json(
      { error: "Failed to transcribe audio." },
      { status: 500 }
    );
  } catch (error) {
    console.error("api/stt/POST failed.", error);
    return NextResponse.json(
      { error: "Failed to transcribe audio." },
      { status: 500 }
    );
  }
}
