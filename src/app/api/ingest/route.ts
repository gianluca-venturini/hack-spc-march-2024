
export const dynamic = 'force-dynamic' // defaults to auto

export async function POST(request: Request) {
    return new Response('Your questions have been received, we will answer it shortly. Thankyou!', { status: 200 });
}