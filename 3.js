// Generated Video Collection - VidTapz
// Total Videos: 1
// Generated: 9/6/2025, 13.14.22

const videoCollection = [
  {
    id: 1749446062178,
    url: "https://youtu.be/JdK_Y_yKBjw?si=7KWXly-oHQ0GyL4w",
    title: "Sample YouTube Video",
    description: "This is a sample YouTube video description fetched automatically.",
    thumbnail: "https://via.placeholder.com/320x180?text=YouTube+Video",
    category: "Gaming",
    duration: "1",
    views: "1",
    platform: "YouTube",
    addedAt: "2025-06-09T05:14:22.178Z"
  }
];

// Helper functions
function getVideosByCategory(category) {
    return videoCollection.filter(video => video.category === category);
}

function getVideosByPlatform(platform) {
    return videoCollection.filter(video => video.platform === platform);
}

function searchVideos(query) {
    return videoCollection.filter(video => 
        video.title.toLowerCase().includes(query.toLowerCase()) ||
        video.description.toLowerCase().includes(query.toLowerCase())
    );
}

// Statistics
const stats = {
    total: 1,
    youtube: 1,
    dailymotion: 0,
    categories: {
  "Gaming": 1
}
};

console.log('Video Collection loaded:', stats);