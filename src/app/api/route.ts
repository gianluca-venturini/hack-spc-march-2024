
export const dynamic = 'force-dynamic' // defaults to auto

export async function GET(request: Request) {
    return new Response('Lololal', { status: 200 });
}