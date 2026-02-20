/**
 * config.js — Application state, menu structure, and element cache.
 *
 * Single source of truth for the song library, navigation state,
 * playback settings, and all DOM references used across modules.
 */

import { elements } from './dom.js';

// ── Library ──────────────────────────────────────────────────

export let library = [];

export async function loadLibrary() {
    const response = await fetch('js/library.json');
    if (!response.ok) throw new Error(`Library load failed: ${response.status}`);
    const data = await response.json();
    library.length = 0;
    library.push(...data);
}

// ── Application State ────────────────────────────────────────

export const state = {
    queue: [],
    currentIndex: -1,
    history: [],
    currentMenuKey: 'main',
    selectedIndex: 0,
    scrollOffset: 0,
    isNowPlaying: false,
    lastRenderedMenuKey: null,
    shuffle: 'off',   // 'off' | 'songs'
    repeat: 'off'     // 'off' | 'one' | 'all'
};

// ── Setting Toggles ──────────────────────────────────────────

function toggleShuffle() {
    state.shuffle = state.shuffle === 'off' ? 'songs' : 'off';
}

function toggleRepeat() {
    const cycle = { off: 'one', one: 'all', all: 'off' };
    state.repeat = cycle[state.repeat];
}

function goToNowPlaying() {
    if (state.queue.length === 0) return;
    state.isNowPlaying = true;
}

// ── Menu Structure ───────────────────────────────────────────

export const menus = {
    main: {
        title: 'iPod',
        items: [
            { label: 'Music', submenu: 'music' },
            { label: 'Photos', disabled: true },
            { label: 'Extras', disabled: true },
            { label: 'Settings', submenu: 'settings' },
            { label: 'Shuffle Songs', actionName: 'shuffleAndPlay' },
            { label: 'Now Playing', action: goToNowPlaying }
        ]
    },
    music: {
        title: 'Music',
        items: [
            { label: 'Artists', submenu: 'artists' },
            { label: 'Albums', submenu: 'albums' },
            { label: 'Songs', submenu: 'songs' },
            { label: 'Playlists', disabled: true }
        ]
    },
    settings: {
        title: 'Settings',
        get items() {
            return [
                { label: 'Shuffle', value: state.shuffle === 'off' ? 'Off' : 'Songs', action: toggleShuffle },
                { label: 'Repeat', value: state.repeat === 'off' ? 'Off' : state.repeat === 'one' ? 'One' : 'All', action: toggleRepeat }
            ];
        }
    },
    artists: { title: 'Artists', dynamic: 'artists' },
    albums: { title: 'Albums', dynamic: 'albums' },
    songs: { title: 'Songs', dynamic: 'songs' }
};

// ── Element Cache ────────────────────────────────────────────
export { elements };
