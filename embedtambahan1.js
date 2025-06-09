// VidTapz Video Collection - Additional Videos
// Generated on: 2025-06-09T04:58:11.363Z
// Total videos: 1

const videoTambahan = [
    {
        id: 1,
        title: "Educational Content",
        description: "Best gaming moments compilation",
        category: "gaming",
        platform: "youtube",
        videoId: "JdK_Y_yKBjw",
        duration: "1",
        views: "1",
        thumbnail: "https://img.youtube.com/vi/JdK_Y_yKBjw/hqdefault.jpg",
        embedHtml: '<iframe width=\"100%\" height=\"500\" src=\"https://www.youtube.com/embed/JdK_Y_yKBjw?autoplay=1\" frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>'
    },
];

// Otomatis tambah ke videosData yang sudah ada
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof videosData !== 'undefined') {
            // Cek duplikasi berdasarkan ID
            const existingIds = videosData.map(v => v.id);
            const newVideos = videoTambahan.filter(video => 
                !existingIds.includes(video.id)
            );
            
            if (newVideos.length > 0) {
                videosData.push(...newVideos);
                currentVideos = [...videosData];
                if (typeof renderVideos === 'function') {
                    renderVideos(currentVideos);
                }
                console.log(`Added ${newVideos.length} new videos`);
            }
        }
    }, 100);
});