
export const dynamic = 'force-dynamic' // defaults to auto
import { uuid } from 'uuidv4';
import { setKey } from '../clients/redis';

interface IngestQuestion {
    text: string;
}

export async function POST(request: Request) {
    const requestData: IngestQuestion = await request.json();
    console.log('Received a new question', requestData);
    setKey(uuid(), requestData.text);
    const body = { message: 'Your questions have been received, we will answer it shortly. Thank you!', requestData };
    return new Response(JSON.stringify(body), {
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}