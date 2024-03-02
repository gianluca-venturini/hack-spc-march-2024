import { deleteAll } from '../clients/redis';

export async function GET(request: Request) {
    deleteAll();
}