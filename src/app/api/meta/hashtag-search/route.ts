import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json(
            { error: 'Query parameter "q" is required' },
            { status: 400 }
        );
    }

    // Clean the query (remove # if present)
    const hashtag = query.replace('#', '').trim();

    const version = process.env.META_GRAPH_VERSION || 'v19.0';
    const igBusinessUserId = process.env.META_IG_BUSINESS_USER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!igBusinessUserId || !accessToken) {
        return NextResponse.json(
            { error: 'Server configuration error: Missing META credentials' },
            { status: 500 }
        );
    }

    try {
        // 1. Search for Hashtag ID
        const searchUrl = `https://graph.facebook.com/${version}/ig_hashtag_search?user_id=${igBusinessUserId}&q=${hashtag}&access_token=${accessToken}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.error) {
            console.error('Meta API Error (Hashtag Search):', searchData.error);
            return NextResponse.json({ error: searchData.error.message }, { status: 400 });
        }

        if (!searchData.data || searchData.data.length === 0) {
            return NextResponse.json({ data: [] }); // No hashtag found
        }

        const hashtagId = searchData.data[0].id;



        // STRATEGY (FINAL):
        // Privacy restrictions prevent retrieving the Username directly from Hashtag Search 
        // and using OEmbed requires specific App Review permissions which are missing.
        // We will return the Media/Post data as "leads" so the user can click through.

        const mediaUrl = `https://graph.facebook.com/${version}/${hashtagId}/top_media?user_id=${igBusinessUserId}&fields=id,media_type,comments_count,like_count,permalink,media_url,caption&limit=18&access_token=${accessToken}`;

        const mediaRes = await fetch(mediaUrl);
        const mediaData = await mediaRes.json();

        if (mediaData.error) {
            console.error('Meta API Error (Top Media):', mediaData.error);
            return NextResponse.json({ error: mediaData.error.message }, { status: 400 });
        }

        const initialMediaList = mediaData.data || [];

        const results = initialMediaList.map((m: any) => {
            // Calculate Post Engagement Rate relative to... nothing (we don't have followers).
            // Just show raw engagement or 'Best Performing'.
            const engagement = (m.like_count || 0) + (m.comments_count || 0);

            return {
                id: m.id,
                username: null, // Hidden by Privacy
                name: "Instagram User",
                followers_count: 0,
                followers_display: "---",
                er: engagement, // Sending raw engagement number instead of %
                is_eng_raw: true,
                profile_picture_url: null,
                region: "Global",
                niche: hashtag,
                media_url: m.media_url,
                permalink: m.permalink,
                caption: m.caption || "",
                is_anonymous: true
            };
        });

        // If results empty
        if (results.length === 0) {
            return NextResponse.json({ data: [] });
        }

        return NextResponse.json({ data: results });

    } catch (error) {
        console.error('SERVER ERROR:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function formatFollowers(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}
