// embedtambahan.js - Tambah video baru tanpa ubah script.js

// Video tambahan baru
const videoTambahan = [
    {
        id: 11,
        title: "Video Baru 1",
        description: "Deskripsi video baru",
        category: "education",
        platform: "youtube", 
        videoId: "dQw4w9WgXcQ",
        duration: "3:30",
        views: "1M",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
    },
    {
        id: 12,
        title: "Video Baru 2", 
        description: "Video tambahan lainnya",
        category: "music",
        platform: "dailymotion",
        videoId: "x7u8vh2", 
        duration: "5:15",
        views: "500K",
        thumbnail: "https://s1.dmcdn.net/v/Teken1XJKDzcGrjmT/x1080",
        embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7u8vh2?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
    }
];

// Otomatis tambah ke videosData yang sudah ada
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (typeof videosData !== 'undefined') {
            videosData.push(...videoTambahan);
            currentVideos = [...videosData];
            if (typeof renderVideos === 'function') {
                renderVideos(currentVideos);
            }
        }
    }, 100);
});
