import { NextResponse } from 'next/server';

export async function POST() {
    const version = process.env.META_GRAPH_VERSION || 'v19.0';
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const currentToken = process.env.META_ACCESS_TOKEN;

    if (!appId || !appSecret || !currentToken) {
        console.error('Missing META_APP_ID, META_APP_SECRET, or META_ACCESS_TOKEN');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    // https://graph.facebook.com/{version}/oauth/access_token?grant_type=fb_exchange_token&client_id=...&client_secret=...&fb_exchange_token=...
    const url = `https://graph.facebook.com/${version}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${currentToken}`;

    try {
        // Making a GET request to the Graph API endpoint as per documentation for token exchange
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Meta Token Refresh Error:', data.error);
            return NextResponse.json(
                { error: data.error.message || 'Meta API Error' },
                { status: response.status }
            );
        }

        // Return the new token info
        return NextResponse.json({
            access_token: data.access_token,
            expires_in: data.expires_in,
            expires_at: data.expires_in ? Date.now() + (data.expires_in * 1000) : undefined,
            token_type: data.token_type,
            note: 'IMPORTANT: Production must store this token in a DB or secret store. Environment variables cannot be updated at runtime.'
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
