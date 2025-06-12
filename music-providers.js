// music-providers.js
window.MUSIC_PROVIDERS = {
    spotify: {
        name: 'Spotify',
        baseUrl: 'https://open.spotify.com/',
        oembedUrl: 'https://open.spotify.com/oembed',
        patterns: [
            /^https:\/\/open\.spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/,
            /^https:\/\/spotify\.link\/([a-zA-Z0-9]+)/
        ],
        extractId: (url) => {
            const match = url.match(/\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
            return match ? { type: match[1], id: match[2] } : null;
        },
        getEmbedUrl: (url) => {
            const match = url.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
            return match ? `https://open.spotify.com/embed/${match[1]}/${match[2]}` : null;
        }
    },
    
    soundcloud: {
        name: 'SoundCloud',
        baseUrl: 'https://soundcloud.com/',
        oembedUrl: 'https://soundcloud.com/oembed',
        patterns: [
            /^https:\/\/(soundcloud\.com|snd\.sc)\/.+/
        ],
        extractId: (url) => url,
        getEmbedUrl: (url) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`
    },
    
    bandcamp: {
        name: 'Bandcamp',
        baseUrl: 'https://bandcamp.com/',
        oembedUrl: 'https://bandcamp.com/api/oembed',
        patterns: [
            /^https:\/\/[a-zA-Z0-9-]+\.bandcamp\.com\/(track|album)\/.+/
        ],
        extractId: (url) => url,
        getEmbedUrl: (url) => {
            // Bandcamp embed URL varies, use oEmbed response
            return url;
        }
    },
    
    deezer: {
        name: 'Deezer',
        baseUrl: 'https://www.deezer.com/',
        oembedUrl: null, // Deezer doesn't have public oEmbed
        patterns: [
            /^https:\/\/www\.deezer\.com\/(track|album|playlist)\/(\d+)/
        ],
        extractId: (url) => {
            const match = url.match(/\/(track|album|playlist)\/(\d+)/);
            return match ? { type: match[1], id: match[2] } : null;
        },
        getEmbedUrl: (url) => {
            const match = url.match(/\/(track|album|playlist)\/(\d+)/);
            return match ? `https://widget.deezer.com/widget/dark/${match[1]}/${match[2]}` : null;
        }
    },
    
    applemusic: {
        name: 'Apple Music',
        baseUrl: 'https://music.apple.com/',
        oembedUrl: null, // Apple Music doesn't have public oEmbed
        patterns: [
            /^https:\/\/music\.apple\.com\/[a-z]{2}\/(album|song|playlist)\/[^\/]+\/(\d+)/
        ],
        extractId: (url) => url,
        getEmbedUrl: (url) => {
            // Apple Music embeds require special handling
            return `https://embed.music.apple.com${url.replace('https://music.apple.com', '')}`;
        }
    }
};
