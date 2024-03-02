import { deleteAll } from '../clients/redis';

export async function GET(request: Request) {
    deleteAll();
    return new Response('', {
        status: 200,
    });
}