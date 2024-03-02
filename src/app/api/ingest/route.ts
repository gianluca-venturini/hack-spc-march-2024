export const dynamic = "force-dynamic"; // defaults to auto
import { uuid } from "uuidv4";
import { setValue } from "../clients/redis";
import { QUESTION_PREFIX } from "@/constants";

export const runtime = "nodejs";
export const preferredRegion = "sfo1";
export const maxDuration = 300; // seconds

interface IngestQuestion {
  questionText: string;
}

export async function POST(request: Request) {
  const requestData: IngestQuestion = await request.json();
  console.log("Received a new question", requestData);
  setValue(`${QUESTION_PREFIX}${uuid()}`, requestData.questionText);
  const body = {
    message:
      "Your questions have been received, we will answer it shortly. Thank you!",
    requestData,
  };
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
