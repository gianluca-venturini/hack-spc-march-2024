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

    const result = await fetchTranscription().catch((error) => {
      console.error("OpenAI Whisper SST call failed.", error);
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
