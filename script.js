/**
 * VidTap - Script JavaScript
 * Untuk menangani interaksi popup video YouTube, responsivitas, toggle tema, dan mengambil data video dari YouTube
 */

// ===== FUNGSI TOGGLE MENU MOBILE =====
function toggleMenu() {
    // Mengambil elemen navigasi dan search bar
    const navLinks = document.querySelector('.nav-links');
    const searchBar = document.querySelector('.search-bar');
    
    // Toggle class active untuk menampilkan/menyembunyikan elemen
    navLinks.classList.toggle('active');
    searchBar.classList.toggle('active');
}

// ===== FUNGSI TOGGLE TEMA =====
function initThemeToggle() {
    // Ambil elemen checkbox toggle tema
    const toggleSwitch = document.querySelector('#checkbox');
    
    if (!toggleSwitch) return; // Jika tidak ditemukan, exit
    
    // Fungsi untuk mengubah tema
    function switchTheme(e) {
        if (e.target.checked) {
            // Aktifkan light mode
            document.documentElement.classList.remove('dark-mode');
            document.documentElement.classList.add('light-mode');
            localStorage.setItem('theme', 'light'); // Simpan preferensi
        } else {
            // Aktifkan dark mode
            document.documentElement.classList.remove('light-mode');
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark'); // Simpan preferensi
        }
    }
    
    // Event listener untuk perubahan toggle tema
    toggleSwitch.addEventListener('change', switchTheme);
    
    // Cek preferensi tema pengguna sebelumnya
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    // Set posisi toggle berdasarkan tema
    toggleSwitch.checked = (currentTheme === 'light');
}

// ===== FUNGSI UNTUK MENGAMBIL DATA VIDEO YOUTUBE =====

/**
 * Fungsi utama untuk menginisialisasi dan mengambil data video YouTube
 */
function initYouTubeVideoCards() {
    // Ambil semua video card
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        // Ambil URL video
        const videoUrl = card.getAttribute('data-video');
        
        if (!videoUrl) return;
        
        // 1. Gunakan oEmbed API untuk mendapatkan judul dan thumbnail
        fetchOEmbedData(card, videoUrl);
        
        // 2. Set tampilan statistik secara manual atau acak (simulasi)
        setRandomStats(card);
        
        // 3. Set durasi video (dari localStorage jika ada, atau akan diupdate saat video diputar)
        const videoId = getYoutubeVideoId(videoUrl);
        const durationElement = card.querySelector('.duration');
        
        if (videoId && durationElement) {
            const savedDuration = localStorage.getItem(`video_duration_${videoId}`);
            if (savedDuration) {
                durationElement.textContent = savedDuration;
            }
        }
    });
}

/**
 * Fungsi untuk mengambil data dari oEmbed API YouTube
 */
function fetchOEmbedData(card, videoUrl) {
    // Buat URL oEmbed API
    const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
    
    // Lakukan permintaan API
    fetch(oEmbedUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Gagal mengambil data oEmbed');
            }
            return response.json();
        })
        .then(data => {
            // Update judul
            const titleElement = card.querySelector('.card-info h3');
            if (titleElement) titleElement.textContent = data.title;
            
            // Update nama channel
            const channelElement = card.querySelector('.channel');
            if (channelElement) channelElement.textContent = data.author_name;
            
            // Update thumbnail dengan resolusi yang lebih tinggi
            const thumbnailElement = card.querySelector('.thumbnail img');
            if (thumbnailElement) {
                // Ekstrak video ID
                const videoId = getYoutubeVideoId(videoUrl);
                // Gunakan thumbnail dengan resolusi tinggi
                thumbnailElement.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                
                // Fallback jika thumbnail resolusi tinggi tidak tersedia
                thumbnailElement.onerror = function() {
                    this.src = data.thumbnail_url;
                };
            }
        })
        .catch(error => {
            console.error('Error fetching YouTube oEmbed data:', error);
        });
}

/**
 * Fungsi untuk mengatur statistik tampilan secara manual/acak
 */
function setRandomStats(card) {
    // Statistik tayangan (simulasi atau data manual)
    const viewOptions = ['5.2K', '12K', '45K', '132K', '1.2M', '3.5M'];
    const randomView = viewOptions[Math.floor(Math.random() * viewOptions.length)];
    
    // Waktu upload (simulasi atau data manual)
    const timeOptions = [
        '2 jam yang lalu', 
        '5 jam yang lalu', 
        '1 hari yang lalu', 
        '3 hari yang lalu', 
        '1 minggu yang lalu', 
        '2 minggu yang lalu', 
        '1 bulan yang lalu'
    ];
    const randomTime = timeOptions[Math.floor(Math.random() * timeOptions.length)];
    
    // Update elemen statistik
    const statsElements = card.querySelectorAll('.stats span');
    if (statsElements.length >= 2) {
        statsElements[0].textContent = `${randomView} tayangan`;
        statsElements[1].textContent = randomTime;
    }
}

/**
 * Format durasi dari detik ke format MM:SS atau HH:MM:SS
 */
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Fungsi untuk mendapatkan durasi video dari YouTube Player API
 */
function getVideoDurationFromPlayer(videoId, durationElement) {
    // Cek jika YouTube API tersedia
    if (typeof YT !== 'undefined' && YT.Player) {
        new YT.Player('popupIframe', {
            videoId: videoId,
            events: {
                'onReady': function(event) {
                    // Dapatkan durasi dalam detik
                    const durationInSeconds = event.target.getDuration();
                    // Format durasi
                    const formattedDuration = formatDuration(durationInSeconds);
                    
                    // Update elemen durasi
                    if (durationElement) durationElement.textContent = formattedDuration;
                    
                    // Simpan durasi di localStorage untuk penggunaan berikutnya
                    localStorage.setItem(`video_duration_${videoId}`, formattedDuration);
                }
            }
        });
    }
}

// ===== FUNGSI VIDEO POPUP =====
function initVideoPopup() {
    // Cek apakah elemen popup ada di halaman
    const popup = document.getElementById('videoPopup');
    if (!popup) return; // Jika tidak ditemukan, exit
    
    const popupIframe = document.getElementById('popupIframe');
    const popupTitle = popup.querySelector('.popup-title');
    const closeButton = popup.querySelector('.popup-close');
    
    // Fungsi untuk memeriksa apakah perangkat adalah mobile
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }
    
    // Fungsi untuk mengambil ID video dari URL YouTube
    function getYoutubeVideoId(url) {
        // Regex untuk ekstrak ID video dari berbagai format URL YouTube
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        // Mengembalikan ID video jika format valid
        return (match && match[2].length === 11) ? match[2] : null;
    }
    
    // Fungsi untuk membuka popup video
    function openPopup(videoUrl, title, fullViewUrl) {
        // Dapatkan ID video YouTube
        const videoId = getYoutubeVideoId(videoUrl);
        
        // Jika perangkat mobile, langsung arahkan ke halaman full view
        if (isMobileDevice()) {
            window.location.href = fullViewUrl;
            return; // Hentikan eksekusi fungsi
        }
        
        // Jika ID video ditemukan dan bukan mobile
        if (videoId) {
            // Cek apakah durasi sudah disimpan di localStorage
            const savedDuration = localStorage.getItem(`video_duration_${videoId}`);
            
            // Temukan elemen durasi di kartu video terkait
            const videoCard = document.querySelector(`[data-video="${videoUrl}"]`);
            const durationElement = videoCard ? videoCard.querySelector('.duration') : null;
            
            // Jika durasi sudah disimpan, gunakan nilai tersebut
            if (savedDuration && durationElement) {
                durationElement.textContent = savedDuration;
            }
            
            // Set src iframe dengan embed YouTube, autoplay, dan enablejsapi
            popupIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1`;
            
            // Tambahkan ID untuk player API
            popupIframe.id = 'popupIframe';
            
            // Set judul video
            popupTitle.textContent = title;
            
            // Tampilkan popup
            popup.style.display = 'block';
            
            // Set URL dan event untuk tombol full view
            const fullViewButton = popup.querySelector('.full-view-button');
            fullViewButton.onclick = function() {
                window.location.href = fullViewUrl;
            };
            
            // Tambahkan YouTube Player API untuk mendapatkan durasi jika belum ada
            if (!savedDuration && durationElement) {
                // Load YouTube Player API jika belum dimuat
                if (!window.YT) {
                    const tag = document.createElement('script');
                    tag.src = 'https://www.youtube.com/iframe_api';
                    const firstScriptTag = document.getElementsByTagName('script')[0];
                    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    
                    window.onYouTubeIframeAPIReady = function() {
                        getVideoDurationFromPlayer(videoId, durationElement);
                    };
                } else {
                    getVideoDurationFromPlayer(videoId, durationElement);
                }
            }
        }
    }
    
    // Fungsi untuk menutup popup
    function closePopup() {
        // Sembunyikan popup
        popup.style.display = 'none';
        // Kosongkan src iframe untuk berhenti memutar video
        popupIframe.src = '';
    }
    
    // Tambahkan event listener untuk tombol close
    closeButton.addEventListener('click', closePopup);
    
    // Event listener untuk menutup popup ketika mengklik overlay
    popup.addEventListener('click', function(e) {
        if (e.target === popup) {
            closePopup();
        }
    });
    
    // Tambahkan event listener untuk tombol escape untuk menutup popup
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popup.style.display === 'block') {
            closePopup();
        }
    });
    
    // Tambahkan event listener untuk semua video card
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Mencegah default action dari link
            e.preventDefault();
            
            // Ambil data dari elemen
            const videoUrl = this.getAttribute('data-video');
            const videoTitle = this.querySelector('.card-info h3').textContent;
            
            // Ambil URL untuk full view (ambil dari href jika elemen adalah <a>)
            const fullViewUrl = this.href || this.getAttribute('data-full-view') || '/';
            
            // Buka popup dengan data yang didapat
            openPopup(videoUrl, videoTitle, fullViewUrl);
        });
    });
    
    // Tambahkan event listener untuk perubahan ukuran layar
    window.addEventListener('resize', function() {
        // Jika tampilan berubah menjadi mobile dan popup sedang terbuka
        if (isMobileDevice() && popup.style.display === 'block') {
            // Tutup popup karena pada mobile tidak menampilkan popup
            closePopup();
        }
    });
    
    // Ekspos fungsi-fungsi untuk digunakan di tempat lain
    window.getYoutubeVideoId = getYoutubeVideoId;
    window.isMobileDevice = isMobileDevice;
    window.openPopup = openPopup;
    window.closePopup = closePopup;
}

// Menjalankan kode setelah DOM selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi toggle tema
    initThemeToggle();
    
    // Inisialisasi popup video
    initVideoPopup();
    
    // Inisialisasi data video YouTube
    initYouTubeVideoCards();
    
    // Load YouTube Player API jika belum dimuat
    if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
});