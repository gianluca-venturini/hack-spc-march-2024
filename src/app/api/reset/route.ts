import { deleteAll } from '../clients/redis';

export async function POST(request: Request) {
    deleteAll();
    return new Response('', {
        status: 200,
    });
}