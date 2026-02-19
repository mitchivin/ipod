/**
 * player.js — Playback engine: queue management, track control, and audio events.
 *
 * Handles playing songs, next/prev navigation, shuffle (Fisher-Yates),
 * repeat modes, marquee text detection, artwork loading with placeholder,
 * and progress bar updates.
 */

import { library, state, elements } from './config.js';
import { updateHeaderIcons, renderMenu } from './ui.js';

// ── Queue & Playback ─────────────────────────────────────────

export function playQueue(queue, startIndex = 0) {
    state.queue = queue;
    state.currentIndex = startIndex;
    playCurrent();
}

export function shuffleAndPlay() {
    state.shuffle = 'songs';
    const shuffled = fisherYatesShuffle([...library]);
    playQueue(shuffled, 0);
}

/** Fisher-Yates (Knuth) shuffle — unbiased O(n). */
function fisherYatesShuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ── Play Current Track ───────────────────────────────────────

export function playCurrent() {
    const song = state.queue[state.currentIndex];
    if (!song) return;

    state.isNowPlaying = true;

    // Update text metadata
    const titleEl = elements.nowPlayingScreen.querySelector('.title');
    const artistEl = elements.nowPlayingScreen.querySelector('.artist');
    const albumEl = elements.nowPlayingScreen.querySelector('.album');

    titleEl.innerText = song.title;
    artistEl.innerText = song.artist;
    albumEl.innerText = song.album;

    // Marquee detection — scroll text that overflows its container
    setupMarquee([titleEl, artistEl, albumEl]);

    // Track counter
    elements.nowPlayingScreen.querySelector('.track-count').innerText =
        `${state.currentIndex + 1} of ${state.queue.length}`;

    // Rating stars
    const ratingEl = elements.nowPlayingScreen.querySelector('.rating');
    ratingEl.innerHTML = '';
    for (let i = 0; i < (song.rating || 0); i++) {
        const star = document.createElement('span');
        star.className = 'star-icon';
        star.innerText = '★';
        ratingEl.appendChild(star);
    }

    // Artwork — lazy load with placeholder
    loadArtwork(song.artwork);

    // Audio
    if (song.src) {
        elements.audio.src = song.src;
        elements.audio.play().catch(err => console.warn('Playback blocked:', err));
    } else {
        console.warn(`No audio source for "${song.title}"`);
    }

    updateHeaderIcons();
    renderMenu();
}

// ── Artwork Loader ───────────────────────────────────────────

function loadArtwork(src) {
    const container = elements.nowPlayingScreen.querySelector('.artwork-container');
    const img = container.querySelector('img');

    container.classList.add('loading');
    img.classList.remove('loaded');

    const resolved = src || '';
    if (!resolved) {
        // No artwork — keep placeholder visible
        img.src = '';
        return;
    }

    const probe = new Image();
    probe.onload = () => {
        img.src = resolved;
        img.classList.add('loaded');
        container.classList.remove('loading');
    };
    probe.onerror = () => {
        img.src = '';
        container.classList.remove('loading');
    };
    probe.src = resolved;
}

// ── Marquee Detection ────────────────────────────────────────

const MARQUEE_SPEED = 30; // px/sec

function setupMarquee(elements) {
    elements.forEach(el => {
        el.classList.remove('animate-marquee');
        el.style.removeProperty('--marquee-overflow');
        el.style.removeProperty('--marquee-duration');

        requestAnimationFrame(() => {
            // Temporarily measure natural width
            const saved = el.style.cssText;
            el.style.display = 'inline-block';
            el.style.width = 'auto';
            el.style.textOverflow = 'clip';

            const overflow = el.scrollWidth - el.parentElement.clientWidth;

            el.style.cssText = saved;

            if (overflow > 2) {
                const scrollDuration = overflow / MARQUEE_SPEED;
                const totalDuration = Math.max(6, scrollDuration / 0.3);
                el.style.setProperty('--marquee-overflow', `${overflow}px`);
                el.style.setProperty('--marquee-duration', `${totalDuration}s`);
                el.classList.add('animate-marquee');
            }
        });
    });
}

// ── Track Navigation ─────────────────────────────────────────

export function nextTrack() {
    if (state.shuffle === 'songs' && state.queue.length > 1) {
        let next;
        do {
            next = Math.floor(Math.random() * state.queue.length);
        } while (next === state.currentIndex);
        state.currentIndex = next;
    } else {
        state.currentIndex = (state.currentIndex + 1) % state.queue.length;
    }
    playCurrent();
}

export function prevTrack() {
    if (elements.audio.currentTime > 3) {
        elements.audio.currentTime = 0;
    } else if (state.currentIndex > 0) {
        state.currentIndex--;
        playCurrent();
    } else if (state.repeat === 'all') {
        state.currentIndex = state.queue.length - 1;
        playCurrent();
    }
}

function onTrackEnded() {
    if (state.repeat === 'one') {
        elements.audio.currentTime = 0;
        elements.audio.play().catch(err => console.warn('Replay blocked:', err));
    } else {
        nextTrack();
    }
}

// ── Time Formatting ──────────────────────────────────────────

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// ── Audio Event Listeners ────────────────────────────────────

elements.audio.addEventListener('timeupdate', () => {
    if (!state.isNowPlaying) return;
    const { currentTime, duration } = elements.audio;
    elements.progressBar.style.width = `${(currentTime / duration) * 100 || 0}%`;
    elements.currentTimeLabel.innerText = formatTime(currentTime);
    elements.remainingTimeLabel.innerText = '-' + formatTime(duration - currentTime);
});

elements.audio.addEventListener('ended', onTrackEnded);
elements.audio.addEventListener('play', updateHeaderIcons);
elements.audio.addEventListener('pause', updateHeaderIcons);
