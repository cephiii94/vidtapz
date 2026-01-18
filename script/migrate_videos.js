const fs = require('fs');
const https = require('https');

const categories = {
    'music': [
        "https://www.youtube.com/watch?v=ENjrJ_zyeUc",
        "https://www.youtube.com/watch?v=dwfPhdnnlEw",
        "https://www.youtube.com/watch?v=BahC2CxQzD0",
        "https://www.youtube.com/watch?v=xsqqEGaRyAg",
        "https://www.youtube.com/watch?v=7SqNVv98e8Q",
        "https://www.youtube.com/watch?v=l2mI4vL95kU",
        "https://www.youtube.com/watch?v=IpFX2vq8HKw",
        "https://www.youtube.com/watch?v=52nfjRzIaj8",
        "https://www.youtube.com/watch?v=yz5LSofl1qA"
    ],
    'education': [
        "https://www.youtube.com/watch?v=4HrweW4IqJc",
        "https://www.youtube.com/watch?v=eQv10AP5BG0"
    ],
    'dakwah': [
        "https://www.youtube.com/watch?v=sX-kePnlgy4",
        "https://www.youtube.com/watch?v=J5ky4ofT-d0"
    ],
    'sports': [
        "https://www.youtube.com/watch?v=ZVcTW3COX7g",
        "https://www.youtube.com/watch?v=ao9Sw4Wy-Ug"
    ],
    'gaming': [
        "https://www.youtube.com/watch?v=RQ3V5nqdiDw",
        "https://www.youtube.com/watch?v=cMZ1KKGdVmI"
    ],
    'entertainment': [
        "https://www.youtube.com/watch?v=BckYxKfK4U8",
        "https://www.youtube.com/watch?v=jtuBSL5yQdM"
    ],
    'news': [
        "https://www.youtube.com/watch?v=6203wdh_qZY",
        "https://www.youtube.com/watch?v=bYAiIRAPRqk"
    ]
};

const fetchOEmbed = (url) => {
    return new Promise((resolve, reject) => {
        const videoIdMatch = url.match(/v=([^&]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            console.error(`Skipping invalid URL: ${url}`);
            resolve(null);
            return;
        }
        
        // Clean URL just in case
        const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;

        https.get(oembedUrl, (res) => {
            if (res.statusCode !== 200) {
                console.warn(`Failed to fetch ${cleanUrl}: Status ${res.statusCode}`);
                // Fallback for failed fetch to keep the video in the list
                resolve({
                    id: `yt_${videoId}`,
                    title: `Video ${videoId}`,
                    description: "Description not available",
                    thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                    platform: "youtube",
                    videoId: videoId,
                    embedUrl: `https://www.youtube.com/embed/${videoId}`,
                    author: "Unknown"
                });
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({
                        id: `yt_${videoId}`,
                        title: json.title,
                        description: `Video YouTube: ${json.title}`,
                        thumbnail: json.thumbnail_url ? json.thumbnail_url.replace('hqdefault', 'maxresdefault') : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                        platform: "youtube",
                        videoId: videoId,
                        embedUrl: `https://www.youtube.com/embed/${videoId}`,
                        author: json.author_name
                    });
                } catch (e) {
                    console.error('Error parsing JSON', e);
                    resolve(null);
                }
            });
        }).on('error', (e) => {
            console.error(`Error fetching ${oembedUrl}`, e);
            resolve(null);
        });
    });
};

const run = async () => {
    const allVideos = [];
    
    for (const [category, urls] of Object.entries(categories)) {
        console.log(`Processing category: ${category}`);
        for (const url of urls) {
            const videoData = await fetchOEmbed(url);
            if (videoData) {
                videoData.category = category;
                allVideos.push(videoData);
                process.stdout.write('.');
            }
        }
        console.log('\n');
    }

    const output = { videos: allVideos };
    fs.writeFileSync('c:\\VSCODE\\vidtapz\\script\\videos.json', JSON.stringify(output, null, 2));
    console.log(`Successfully wrote ${allVideos.length} videos to videos.json`);
};

run();
