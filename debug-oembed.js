const https = require('https');
const fs = require('fs');
const path = require('path');

// Manually read .env.local
let token = process.env.META_ACCESS_TOKEN;
if (!token) {
    try {
        const envPath = path.resolve(__dirname, '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/META_ACCESS_TOKEN=(.+)/);
        if (match && match[1]) {
            token = match[1].trim();
        }
    } catch (e) {
        console.error("Could not read .env.local");
    }
}

if (!token) {
    console.error("No META_ACCESS_TOKEN found.");
    process.exit(1);
}

const checkOembed = () => {
    // Using a known robust public post URL.
    const url = "https://www.instagram.com/p/C3sH8_8Lr_9/";

    const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${token}`;

    console.log("Testing OEmbed...");
    console.log("URL:", oembedUrl.replace(token, 'REDACTED'));

    https.get(oembedUrl, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            console.log("Status:", res.statusCode);
            console.log("Body:", data);
        });
    }).on('error', (e) => {
        console.error("Error:", e);
    });
};

checkOembed();
