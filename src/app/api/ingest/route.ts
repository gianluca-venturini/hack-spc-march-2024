
export const dynamic = 'force-dynamic' // defaults to auto

export async function POST(request: Request) {
    const requestData = await request.json();
    console.log('Received a new question', requestData);
    const body = { message: 'Your questions have been received, we will answer it shortly. Thank you!', requestData };
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}