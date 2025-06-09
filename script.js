// Sample video data with real Dailymotion oembed examples
        const videosData = [
            
            {
                id: 1,
                title: "Beautiful Nature Documentary - Wildlife Around the World",
                description: "Explore the stunning beauty of nature in this comprehensive documentary featuring wildlife from different continents. Witness the majesty of animals in their natural habitats.",
                category: "education",
                platform: "youtube",
                videoId: "sTSA_sWGM44",
                duration: "15:30",
                views: "2.1M",
                thumbnail: "https://img.youtube.com/vi/sTSA_sWGM44/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/sTSA_sWGM44?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            },
            {
                id: 2,
                title: "Epic Gaming Montage - Best Moments Compilation",
                description: "Watch the most incredible gaming moments compiled into one epic montage. Featuring the best plays, clutch moments, and amazing skills from various games.",
                category: "gaming",
                platform: "dailymotion",
                videoId: "x7u8vh2",
                duration: "8:45",
                views: "856K",
                thumbnail: "https://s1.dmcdn.net/v/Teken1XJKDzcGrjmT/x1080",
                embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7u8vh2?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
            },
            {
                id: 3,
                title: "Relaxing Ambient Music Mix - Study & Work Focus",
                description: "Perfect ambient music mix for studying, working, or meditation. Carefully curated tracks to help you focus and maintain productivity throughout your day.",
                category: "music",
                platform: "youtube",
                videoId: "jfKfPfyJRdk",
                duration: "2:15:30",
                views: "5.3M",
                thumbnail: "https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            },
            {
                id: 4,
                title: "Latest Tech Trends 2024 - Comprehensive Review",
                description: "Stay ahead of the curve with our comprehensive review of the latest technology trends for 2024. From AI innovations to breakthrough gadgets and emerging platforms.",
                category: "technology",
                platform: "dailymotion",
                videoId: "x7tgbdu", 
                duration: "12:20",
                views: "1.8M",
                thumbnail: "https://s2.dmcdn.net/v/Teken1XJKDzcGrjmT/x1080",
                embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7tgbdu?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
            },
            {
                id: 5,
                title: "Stand-Up Comedy Special - Hilarious Performance",
                description: "Get ready to laugh until your sides hurt with this incredible stand-up comedy performance. Featuring witty observations and hilarious stories that will keep you entertained.",
                category: "entertainment",
                platform: "youtube",
                videoId: "bbfy05y5Ukw",
                duration: "45:15",
                views: "3.7M",
                thumbnail: "https://img.youtube.com/vi/bbfy05y5Ukw/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/bbfy05y5Ukw?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            },
            {
                id: 6,
                title: "Football Champions League Highlights",  
                description: "Relive the most exciting moments from the Champions League with this comprehensive highlight reel. Spectacular goals, amazing saves, and unforgettable celebrations.",
                category: "sports",
                platform: "dailymotion",
                videoId: "x7o2k4g",
                duration: "25:40",
                views: "4.2M",
                thumbnail: "https://s1.dmcdn.net/v/Tgken1XJKDzcGrjmT/x1080",
                embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7o2k4g?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
            },
            {
                id: 7,
                title: "Professional Cooking Masterclass - Advanced Techniques",
                description: "Learn professional cooking techniques from world-class chefs. Master the art of fine dining with step-by-step instructions for complex dishes and presentation.",
                category: "education",
                platform: "youtube",
                videoId: "qeMFqkcPYcg",
                duration: "32:10",
                views: "2.9M",
                thumbnail: "https://img.youtube.com/vi/qeMFqkcPYcg/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/qeMFqkcPYcg?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            },
            {
                id: 8,
                title: "Electronic Dance Music Festival Mix 2024",
                description: "The hottest EDM tracks from 2024 mixed into one incredible set. Perfect for workouts, parties, or whenever you need high-energy music to pump you up.",
                category: "music",
                platform: "dailymotion",
                videoId: "x7m3k5f",
                duration: "1:15:30",
                views: "6.1M",
                thumbnail: "https://s2.dmcdn.net/v/Thken1XJKDzcGrjmT/x1080",
                embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7m3k5f?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
            },
            {
                id: 9,
                title: "Minecraft Building Tutorial - Epic Castle Design",
                description: "Learn how to build an incredible medieval castle in Minecraft with this detailed tutorial. Includes interior design tips and advanced building techniques.",
                category: "gaming",
                platform: "youtube",
                videoId: "dQw4w9WgXcQ",
                duration: "28:45",
                views: "1.5M",
                thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
                embedHtml: '<iframe width="100%" height="500" src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>'
            },
            {
                id: 10,
                title: "Space Exploration Documentary - Mars Mission 2024",
                description: "Discover the latest developments in space exploration and the ambitious Mars mission planned for 2024. Featuring interviews with astronauts and scientists.",
                category: "education",
                platform: "dailymotion",
                videoId: "x7p9k2h",
                duration: "42:20",
                views: "3.4M",
                thumbnail: "https://s1.dmcdn.net/v/Tjken1XJKDzcGrjmT/x1080",
                embedHtml: '<iframe width="100%" height="500" src="https://www.dailymotion.com/embed/video/x7p9k2h?autoplay=1" frameborder="0" allow="autoplay; web-share" allowfullscreen></iframe>'
            },

            
        ];

        let currentVideos = [...videosData];
        let currentCategory = 'all';

        // DOM Elements
        const videoGrid = document.getElementById('videoGrid');
        const modal = document.getElementById('videoModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalCategory = document.getElementById('modalCategory');
        const modalPlatform = document.getElementById('modalPlatform');
        const modalViews = document.getElementById('modalViews');
        const modalDurationTime = document.getElementById('modalDurationTime');
        const videoPlayer = document.getElementById('videoPlayer');
        const closeModal = document.getElementById('closeModal');
        const themeToggle = document.getElementById('themeToggle');
        const searchInput = document.getElementById('searchInput');
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const mobileNav = document.getElementById('mobileNav');

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            renderVideos(currentVideos);
            setupEventListeners();
            initializeTheme();
        });

        // Setup Event Listeners
        function setupEventListeners() {
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', handleFilterClick);
            });

            // Modal close
            closeModal.addEventListener('click', closeVideoModal);
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeVideoModal();
                }
            });

            // Theme toggle
            themeToggle.addEventListener('click', toggleTheme);

            // Search
            searchInput.addEventListener('input', handleSearch);

            // Mobile menu toggle
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);

            // Navigation links
            document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Remove active class from all links
                    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => 
                        l.classList.remove('active')
                    );
                    
                    // Add active class to clicked link
                    this.classList.add('active');
                    
                    // Find corresponding link in mobile/desktop nav
                    const linkText = this.textContent.trim();
                    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(l => {
                        if (l.textContent.trim() === linkText) {
                            l.classList.add('active');
                        }
                    });
                    
                    // Close mobile menu if open
                    mobileNav.classList.remove('active');
                });
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeVideoModal();
                    mobileNav.classList.remove('active');
                }
                if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    searchInput.focus();
                }
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', function(e) {
                if (!mobileMenuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                    mobileNav.classList.remove('active');
                }
            });
        }

        // Render Videos
        function renderVideos(videos) {
            if (videos.length === 0) {
                videoGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                        <i class="fas fa-video-slash" style="font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.5; color: var(--accent);"></i>
                        <h3 style="margin-bottom: 1rem; color: var(--text-primary);">No videos found</h3>
                        <p>Try adjusting your search criteria or browse different categories.</p>
                    </div>
                `;
                return;
            }

            videoGrid.innerHTML = videos.map((video, index) => `
                <div class="video-card" onclick="openVideoModal(${video.id})" style="animation-delay: ${index * 0.1}s">
                    <div class="video-thumbnail" style="background-image: url('${video.thumbnail}');">
                        <div class="platform-badge platform-${video.platform}">
                            <i class="fab fa-${video.platform === 'youtube' ? 'youtube' : 'dailymotion'}"></i>
                            ${video.platform}
                        </div>
                        <button class="play-button">
                            <i class="fas fa-play"></i>
                        </button>
                        <div class="video-duration">${video.duration}</div>
                    </div>
                    <div class="video-info">
                        <h3 class="video-title">${video.title}</h3>
                        <p class="video-description">${video.description}</p>
                        <div class="video-meta">
                            <span class="category-tag">${video.category}</span>
                            <div class="video-stats">
                                <span><i class="fas fa-eye"></i> ${video.views}</span>
                                <span><i class="fas fa-clock"></i> ${video.duration}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Trigger animations
            setTimeout(() => {
                document.querySelectorAll('.video-card').forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animationPlayState = 'running';
                    }, index * 100);
                });
            }, 100);
        }

        // Filter Videos
        function handleFilterClick(e) {
            const category = e.target.dataset.category;
            currentCategory = category;

            // Update active button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            // Filter videos
            if (category === 'all') {
                currentVideos = [...videosData];
            } else {
                currentVideos = videosData.filter(video => video.category === category);
            }

            // Apply search filter if active
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm) {
                currentVideos = currentVideos.filter(video => 
                    video.title.toLowerCase().includes(searchTerm) ||
                    video.description.toLowerCase().includes(searchTerm) ||
                    video.category.toLowerCase().includes(searchTerm)
                );
            }

            renderVideos(currentVideos);
        }

        // Search Videos
        function handleSearch(e) {
            const searchTerm = e.target.value.toLowerCase();
            
            let filteredVideos = [...videosData];
            
            // Apply category filter
            if (currentCategory !== 'all') {
                filteredVideos = filteredVideos.filter(video => video.category === currentCategory);
            }
            
            // Apply search filter
            if (searchTerm) {
                filteredVideos = filteredVideos.filter(video => 
                    video.title.toLowerCase().includes(searchTerm) ||
                    video.description.toLowerCase().includes(searchTerm) ||
                    video.category.toLowerCase().includes(searchTerm)
                );
            }
            
            currentVideos = filteredVideos;
            renderVideos(currentVideos);
        }

        // Open Video Modal
        function openVideoModal(videoId) {
            const video = videosData.find(v => v.id === videoId);
            if (!video) return;

            modalTitle.textContent = video.title;
            modalDescription.textContent = video.description;
            modalCategory.textContent = video.category;
            modalPlatform.innerHTML = `<i class="fab fa-${video.platform === 'youtube' ? 'youtube' : 'dailymotion'}"></i> ${video.platform}`;
            modalViews.innerHTML = `<i class="fas fa-eye"></i> ${video.views} views`;
            modalDurationTime.textContent = video.duration;
            
            // Load video with loading animation
            videoPlayer.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <p>Loading video...</p>
                </div>
            `;
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Simulate loading delay and then show video
            setTimeout(() => {
                videoPlayer.innerHTML = video.embedHtml;
            }, 1500);
        }

        // Close Video Modal
        function closeVideoModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            videoPlayer.innerHTML = ''; // Stop video playback
        }

        // Toggle Mobile Menu
        function toggleMobileMenu() {
            mobileNav.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            
            if (mobileNav.classList.contains('active')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        }

        // Theme Management
        function initializeTheme() {
            const savedTheme = localStorage.getItem('vidtapz_theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }

        function toggleTheme() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('vidtapz_theme', newTheme);
            updateThemeIcon(newTheme);
            
            // Add smooth transition effect
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }

        function updateThemeIcon(theme) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Utility Functions for real oembed APIs (for future implementation)
        async function fetchYouTubeOembed(videoUrl) {
            try {
                const response = await fetch(`https://www.youtube.com/oembed?url=${videoUrl}&format=json`);
                return await response.json();
            } catch (error) {
                console.error('Error fetching YouTube oembed:', error);
                return null;
            }
        }

        async function fetchDailymotionOembed(videoUrl) {
            try {
                const response = await fetch(`https://www.dailymotion.com/services/oembed?url=${videoUrl}&format=json`);
                return await response.json();
            } catch (error) {
                console.error('Error fetching Dailymotion oembed:', error);
                return null;
            }
        }

        // Lazy loading for thumbnails
        function initializeLazyLoading() {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const thumbnail = entry.target;
                        const src = thumbnail.dataset.src;
                        if (src) {
                            thumbnail.style.backgroundImage = `url(${src})`;
                            thumbnail.classList.add('loaded');
                            observer.unobserve(thumbnail);
                        }
                    }
                });
            });

            document.querySelectorAll('.video-thumbnail[data-src]').forEach(thumbnail => {
                imageObserver.observe(thumbnail);
            });
        }

        // Enhanced search with debouncing
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Replace the search event listener with debounced version
        const debouncedSearch = debounce(handleSearch, 300);
        searchInput.addEventListener('input', debouncedSearch);

        // Add keyboard navigation for video grid
        document.addEventListener('keydown', function(e) {
            const videoCards = document.querySelectorAll('.video-card');
            const focusedElement = document.activeElement;
            const currentIndex = Array.from(videoCards).indexOf(focusedElement);

            switch(e.key) {
                case 'ArrowRight':
                    if (currentIndex >= 0 && currentIndex < videoCards.length - 1) {
                        videoCards[currentIndex + 1].focus();
                        e.preventDefault();
                    }
                    break;
                case 'ArrowLeft':
                    if (currentIndex > 0) {
                        videoCards[currentIndex - 1].focus();
                        e.preventDefault();
                    }
                    break;
                case 'Enter':
                    if (focusedElement.classList.contains('video-card')) {
                        focusedElement.click();
                        e.preventDefault();
                    }
                    break;
            }
        });

        // Make video cards focusable for keyboard navigation
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                document.querySelectorAll('.video-card').forEach(card => {
                    card.setAttribute('tabindex', '0');
                    card.style.outline = 'none';
                    
                    card.addEventListener('focus', function() {
                        this.style.transform = 'translateY(-8px)';
                        this.style.boxShadow = '0 12px 40px var(--shadow-lg)';
                    });
                    
                    card.addEventListener('blur', function() {
                        this.style.transform = '';
                        this.style.boxShadow = '';
                    });
                });
            }, 500);
        });

        // Performance optimization: Virtual scrolling for large datasets
        function initializeVirtualScrolling() {
            let isLoading = false;
            let page = 1;
            const itemsPerPage = 12;

            window.addEventListener('scroll', () => {
                if (isLoading) return;

                const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
                
                if (scrollTop + clientHeight >= scrollHeight - 1000) {
                    loadMoreVideos();
                }
            });

            function loadMoreVideos() {
                if (currentVideos.length >= videosData.length) return;
                
                isLoading = true;
                
                // Simulate API call delay
                setTimeout(() => {
                    const startIndex = page * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const newVideos = videosData.slice(startIndex, endIndex);
                    
                    currentVideos = [...currentVideos, ...newVideos];
                    renderVideos(currentVideos);
                    
                    page++;
                    isLoading = false;
                }, 1000);
            }
        }

        // Initialize additional features
        document.addEventListener('DOMContentLoaded', function() {
            // Add loading states
            const style = document.createElement('style');
            style.textContent = `
                .video-card.loading {
                    opacity: 0.7;
                    pointer-events: none;
                }
                
                .video-card.loading::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shimmer 1.5s infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `;
            document.head.appendChild(style);
        });

        

        // Error handling for video loading
        function handleVideoError(videoId) {
            const errorHtml = `
                <div class="loading" style="background-color: var(--error); color: white;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Unable to load video</p>
                    <button onclick="retryVideoLoad(${videoId})" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; border-radius: 4px; background: white; color: var(--error); cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
            videoPlayer.innerHTML = errorHtml;
        }

        function retryVideoLoad(videoId) {
            openVideoModal(videoId);
        }

        // Analytics and tracking (placeholder for future implementation)
        function trackVideoView(videoId) {
            console.log(`Video viewed: ${videoId}`);
            // Implement your analytics tracking here
        }

        function trackSearch(searchTerm) {
            console.log(`Search performed: ${searchTerm}`);
            // Implement your search analytics here
        }
        

        // Export functions for potential module usage
        window.VidtapzApp = {
            openVideoModal,
            closeVideoModal,
            toggleTheme,
            handleSearch: debouncedSearch,
            trackVideoView,
            trackSearch
        };

        // Tambahkan di akhir script.js
// Function untuk mendukung plugin sistem
function initializePlugins() {
    // Check if additional videos are available
    if (window.VidtapzExtensions) {
        console.log('VidtapzExtensions loaded successfully');
    }
    
    // Auto-load from JSON if available
    const jsonFiles = [
        'videos-additional.json',
        'videos-custom.json'
    ];
    
    jsonFiles.forEach(file => {
        if (window.VidtapzExtensions && window.VidtapzExtensions.loadVideoFromJSON) {
            window.VidtapzExtensions.loadVideoFromJSON(file);
        }
    });
}

// Panggil setelah DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializePlugins, 500);
});
