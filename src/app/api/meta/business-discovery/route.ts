import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
        return NextResponse.json(
            { error: 'Query parameter "username" is required' },
            { status: 400 }
        );
    }

    const version = process.env.META_GRAPH_VERSION || 'v19.0';
    const igBusinessUserId = process.env.META_IG_BUSINESS_USER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!igBusinessUserId || !accessToken) {
        console.error('Missing META_IG_BUSINESS_USER_ID or META_ACCESS_TOKEN');
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    // Construct the fields parameter
    // fields=business_discovery.username({username}){id,username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count,media.limit(12){id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp}}
    const fields = `business_discovery.username(${username}){id,username,name,biography,website,profile_picture_url,followers_count,follows_count,media_count,media.limit(12){id,caption,media_type,media_url,permalink,like_count,comments_count,timestamp}}`;

    const url = `https://graph.facebook.com/${version}/${igBusinessUserId}?fields=${fields}&access_token=${accessToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('Meta API Error:', data.error);
            return NextResponse.json(
                { error: data.error.message || 'Meta API Error' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
