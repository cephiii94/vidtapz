function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const searchBar = document.querySelector('.search-bar');
    
    navLinks.classList.toggle('active');
    searchBar.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', function() {
const popup = document.getElementById('videoPopup');
const popupVideo = popup.querySelector('video');
const popupTitle = popup.querySelector('.popup-title');
const closeButton = popup.querySelector('.popup-close');

// Fungsi untuk mengambil video ID dari URL YouTube
function getYoutubeVideoId(url) {
const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
const match = url.match(regExp);
return (match && match[2].length === 11) ? match[2] : null;
}

// Fungsi untuk membuka popup
function openPopup(videoUrl, title, fullViewUrl) {
const videoId = getYoutubeVideoId(videoUrl);
if (videoId) {
    popupIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    popupTitle.textContent = title;
    popup.style.display = 'block';
    
    // Set URL untuk tombol full view
    const fullViewButton = popup.querySelector('.full-view-button');
    fullViewButton.onclick = function() {
        window.location.href = fullViewUrl;
    }
}
}

// Fungsi untuk menutup popup
function closePopup() {
popup.style.display = 'none';
popupIframe.src = '';
}

// Event listener untuk tombol close
closeButton.addEventListener('click', closePopup);

// Event listener untuk menutup popup ketika mengklik overlay
popup.addEventListener('click', function(e) {
if (e.target === popup) {
    closePopup();
}
});

// Tambahkan event listener untuk semua video card
const videoCards = document.querySelectorAll('.video-card');
videoCards.forEach(card => {
card.addEventListener('click', function(e) {
    e.preventDefault();
    const videoUrl = this.getAttribute('data-video');
    const videoTitle = this.querySelector('.card-info h3').textContent;
    const fullViewUrl = this.href;
    openPopup(videoUrl, videoTitle, fullViewUrl);
});
});
});