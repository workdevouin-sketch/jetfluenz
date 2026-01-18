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
        return NextResponse.json(
            { error: 'Server configuration error' },
            { status: 500 }
        );
    }

    const fields = `business_discovery.username(${username}){id,username,followers_count,media_count,media.limit(100){id,caption,media_type,like_count,comments_count,timestamp}}`;
    const url = `https://graph.facebook.com/${version}/${igBusinessUserId}?fields=${fields}&access_token=${accessToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            return NextResponse.json(
                { error: data.error.message || 'Meta API Error' },
                { status: response.status }
            );
        }

        const businessDiscovery = data.business_discovery;
        if (!businessDiscovery) {
            return NextResponse.json({ error: 'User not found or restricted' }, { status: 404 });
        }

        const followers = businessDiscovery.followers_count || 1; // Avoid division by zero
        const mediaList = businessDiscovery.media?.data || [];
        const mediaCount = mediaList.length;

        if (mediaCount === 0) {
            return NextResponse.json({
                engagement_rate: "0%",
                conversation_rate: 0,
                avg_image_likes: 0,
                format_efficiency: "N/A",
                posting_frequency: "0 Days"
            });
        }

        // --- Metrics Calculation ---

        let totalLikes = 0;
        let totalComments = 0;

        // Format Specifics
        let videoCount = 0;
        let videoEngagement = 0;

        let imageCount = 0;
        let imageLikes = 0;
        let imageEngagement = 0;

        // Dates for frequency
        const timestamps = mediaList.map((m: any) => new Date(m.timestamp).getTime());
        const newestDate = Math.max(...timestamps);
        const oldestDate = Math.min(...timestamps);

        mediaList.forEach((media: any) => {
            const likes = media.like_count || 0;
            const comments = media.comments_count || 0;
            const engagement = likes + comments;

            totalLikes += likes;
            totalComments += comments;

            if (media.media_type === 'VIDEO') {
                videoCount++;
                videoEngagement += engagement;
            } else if (media.media_type === 'IMAGE' || media.media_type === 'CAROUSEL_ALBUM') {
                // Treating Carousel as Image for generalized 'Image' stats if needed, 
                // strictly 'IMAGE' type check for "Avg Image Likes"
                if (media.media_type === 'IMAGE') {
                    imageCount++;
                    imageLikes += likes;
                    imageEngagement += engagement;
                } else {
                    // Include Carousels in 'image-like' comparison or separate?
                    // For simple "Video vs Image" efficiency, usually bucket non-videos together or strictly images.
                    // Let's bucket CAROUSEL into Image group for efficiency comparison, 
                    // BUT for "Avg. Image Likes" strictly use IMAGE type as per name.
                    imageCount++; // Counting valid static/album posts
                    imageLikes += likes;
                    imageEngagement += engagement;
                }
            }
        });

        // 1. Engagement Rate: ((Avg Engagement per post) / Followers) * 100
        // NOTE: If followers_count is 0 or missing from API, this will inflate the rate (defaults to denominator 1).
        const avgEngagementPerPost = (totalLikes + totalComments) / mediaCount;
        const engagementRate = ((avgEngagementPerPost / followers) * 100).toFixed(2) + '%';

        // 2. Conversation Rate: Avg Comments per post
        const conversationRate = (totalComments / mediaCount).toFixed(1); // e.g. 1.7

        // 3. Avg Image Likes
        // Including CAROUSEL_ALBUM as they are image-based carousels
        const strictImages = mediaList.filter((m: any) => m.media_type === 'IMAGE' || m.media_type === 'CAROUSEL_ALBUM');
        const strictImageLikes = strictImages.reduce((sum: number, m: any) => sum + (m.like_count || 0), 0);
        const avgImageLikes = strictImages.length > 0
            ? (strictImageLikes / strictImages.length).toFixed(1) // Changed to 1 decimal for consistency
            : 0;

        // 4. Format Efficiency
        const avgVideoEng = videoCount > 0 ? videoEngagement / videoCount : 0;
        const avgImageEng = imageCount > 0 ? imageEngagement / imageCount : 0;

        let formatEfficiency = "Equal";
        if (avgVideoEng > avgImageEng) formatEfficiency = "Video > Image";
        else if (avgImageEng > avgVideoEng) formatEfficiency = "Image > Video";

        // 5. Posting Frequency
        // (Newest - Oldest) / (Count - 1)
        let postingFrequency = "0 Days";
        if (mediaCount > 1) {
            const diffTime = Math.abs(newestDate - oldestDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            const avgDays = diffDays / (mediaCount - 1);
            postingFrequency = avgDays.toFixed(1) + " Days";
        }

        return NextResponse.json({
            engagement_rate: engagementRate,
            conversation_rate: Number(conversationRate),
            avg_image_likes: Number(avgImageLikes),
            format_efficiency: formatEfficiency,
            posting_frequency: postingFrequency,
            // Raw metrics for frontend calculation (more accurate with profile follower count)
            total_likes: totalLikes,
            total_comments: totalComments,
            media_count: mediaCount,
            followers_used: followers
        });

    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
