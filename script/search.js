document.addEventListener('DOMContentLoaded', async () => { // Jadikan event listener ini async
    // --- KONFIGURASI ---
    const YOUTUBE_API_KEY = 'MASUKKAN_API_KEY_ANDA_DISINI'; 
    const CACHE_DURATION_HOURS = 5;
    // -------------------

    const searchInput = document.getElementById('mainSearchInput');
    const searchBtn = document.getElementById('mainSearchBtn');
    const resultsGrid = document.getElementById('searchResultsGrid');
    const loadingIndicator = document.getElementById('loading');
    const noResultsIndicator = document.getElementById('noResults');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    let localVideos = [];

    // --- PERBAIKAN: Nonaktifkan pencarian saat inisialisasi ---
    searchInput.disabled = true;
    searchBtn.disabled = true;
    searchInput.placeholder = 'Menyiapkan video lokal...';
    // ----------------------------------------------------

    const fetchVideoDetails = async (youtubeUrl, category) => {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
        try {
            const response = await fetch(oembedUrl);
            if (!response.ok) return null;
            const data = await response.json();
            const videoId = new URL(youtubeUrl).searchParams.get('v');
            return {
                videoId: videoId,
                title: data.title,
                thumbnail: data.thumbnail_url.replace('hqdefault.jpg', 'maxresdefault.jpg'),
                author: data.author_name,
                isLocal: true
            };
        } catch (error) {
            console.error(`Error fetching oEmbed for ${youtubeUrl}:`, error);
            return null;
        }
    };

    const initializeLocalVideos = async () => {
        console.log('🔍 Initializing local video data...');
        const categories = {
            'music': window.VIDTAPZ_URLS_MUSIC || [],
            'gaming': window.VIDTAPZ_URLS_GAMING || [],
            'education': window.VIDTAPZ_URLS_EDUCATION || [],
            'dakwah': window.VIDTAPZ_URLS_DAKWAH || [],
            'sports': window.VIDTAPZ_URLS_SPORTS || [],
        };

        const fetchPromises = [];
        for (const category in categories) {
            for (const url of categories[category]) {
                fetchPromises.push(fetchVideoDetails(url, category));
            }
        }
        
        const results = await Promise.all(fetchPromises);
        localVideos = results.filter(video => video !== null);
        console.log(`✅ ${localVideos.length} local videos loaded and processed.`);
    };

    const performSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) return;

        showLoading(true);
        resultsGrid.innerHTML = '';

        const localResults = localVideos.filter(video => 
            video.title.toLowerCase().includes(query) ||
            video.author.toLowerCase().includes(query)
        );

        if (localResults.length > 0) {
            console.log(`✅ Found ${localResults.length} results from local playlist.`);
            displayResults(localResults);
            showLoading(false);
            return;
        }

        console.log('...No local results found. Searching on YouTube API.');
        const cachedResults = getFromCache(query);

        if (cachedResults) {
            console.log('✅ Displaying results from cache.');
            displayResults(cachedResults);
        } else {
            if (YOUTUBE_API_KEY === 'MASUKKAN_API_KEY_ANDA_DISINI' || !YOUTUBE_API_KEY) {
                console.warn('YouTube API Key not set. Search will be limited to local videos.');
                showNoResults(true);
                showLoading(false);
                return;
            }
            try {
                const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=20`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const formattedResults = data.items.map(item => ({
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel: item.snippet.channelTitle,
                        isLocal: false
                    }));
                    saveToCache(query, formattedResults);
                    displayResults(formattedResults);
                } else {
                    showNoResults(true);
                }
            } catch (error) {
                console.error('Error fetching from YouTube API:', error);
                showNoResults(true);
            }
        }
        showLoading(false);
    };

    const displayResults = (videos) => {
        if (!videos || videos.length === 0) {
            showNoResults(true);
            return;
        }
        showNoResults(false);
        resultsGrid.innerHTML = videos.map(video => `
            <div class="video-card" onclick="playVideo('${video.videoId}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                    <div class="play-overlay"><i class="fas fa-play"></i></div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <p class="video-description">
                        by ${video.channel || video.author}
                        ${video.isLocal ? '<span class="vidtapz-pick-badge">Vidtapz Pick</span>' : ''}
                    </p>
                </div>
            </div>
        `).join('');
    };

    const saveToCache = (key, data) => {
        const cacheItem = { timestamp: new Date().getTime(), data: data };
        localStorage.setItem(`yt_search_${key}`, JSON.stringify(cacheItem));
    };
    const getFromCache = (key) => {
        const itemStr = localStorage.getItem(`yt_search_${key}`);
        if (!itemStr) return null;
        const item = JSON.parse(itemStr);
        const now = new Date().getTime();
        const cacheAge = (now - item.timestamp) / (1000 * 60 * 60);
        if (cacheAge > CACHE_DURATION_HOURS) {
            localStorage.removeItem(`yt_search_${key}`);
            return null;
        }
        return item.data;
    };
    const showLoading = (isLoading) => {
        loadingIndicator.style.display = isLoading ? 'flex' : 'none';
        if (isLoading) showNoResults(false);
    };
    const showNoResults = (isShown) => {
        noResultsIndicator.style.display = isShown ? 'flex' : 'none';
    };
    
    const applyTheme = () => {
        const theme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    };
    const toggleTheme = () => {
        let theme = localStorage.getItem('theme') || 'light';
        theme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        applyTheme();
    };
    themeToggleBtn.addEventListener('click', toggleTheme);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // --- Inisialisasi ---
    applyTheme();
    await initializeLocalVideos(); // Tunggu sampai semua video lokal siap

    // --- PERBAIKAN: Aktifkan kembali pencarian setelah siap ---
    searchInput.disabled = false;
    searchBtn.disabled = false;
    searchInput.placeholder = 'Search for music, gaming, tutorials...';
    console.log('✅ Initialization complete. Search is ready.');
    // ---------------------------------------------------------
});

function playVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}
