
export const dynamic = 'force-dynamic' // defaults to auto
import { uuid } from 'uuidv4';
import { setValue } from '../clients/redis';
import { AVATAR_PREFIX } from '@/constants';

interface IngestAvatar {
    avatarSignedURL: string;
}

export async function POST(request: Request) {
    const requestData: IngestAvatar = await request.json();
    console.log('Received a new avatar', requestData);
    setValue(`${AVATAR_PREFIX}${uuid()}`, requestData.text);
    const body = { message: 'Your avatar have been received, Thank you!', requestData };
    return new Response(JSON.stringify(body), {
        status: 201,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}