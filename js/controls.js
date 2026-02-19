/**
 * controls.js — Click wheel input, button binding, and boot sequence.
 *
 * Translates pointer events on the click wheel into menu scrolling
 * or playback scrubbing (when on Now Playing). Binds physical buttons
 * to their corresponding actions and boots the app on load.
 */

import { state, elements, loadLibrary } from './config.js';
import { renderMenu, switchMenu, resolveMenu } from './ui.js';
import * as player from './player.js';

// ── Scroll State ─────────────────────────────────────────────

let isDragging = false;
let hasScrolled = false;
let lastAngle = 0;
let totalRotation = 0;
let lastMoveTime = 0;

const ROTATION_THRESHOLD = 25;  // Degrees per menu step
const SCROLL_DEAD_ZONE = 5;     // Min rotation to count as scroll (vs. tap)

export function resetScrollState() {
    totalRotation = 0;
    lastMoveTime = 0;
    state.scrollOffset = 0;
}

// ── Angle Calculation ────────────────────────────────────────

function getAngle(e) {
    const rect = elements.controlWheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
}

// ── Scroll Processing ────────────────────────────────────────

function processScroll() {
    if (!isDragging) {
        totalRotation = 0;
        return;
    }

    // Now Playing: scroll wheel scrubs playback position
    if (state.isNowPlaying) {
        if (Math.abs(totalRotation) >= ROTATION_THRESHOLD) {
            const { duration, currentTime } = elements.audio;
            if (duration && isFinite(duration)) {
                const step = duration * 0.02; // 2% per notch
                elements.audio.currentTime = totalRotation > 0
                    ? Math.min(currentTime + step, duration)
                    : Math.max(currentTime - step, 0);
            }
            totalRotation += totalRotation > 0 ? -ROTATION_THRESHOLD : ROTATION_THRESHOLD;

            if (Math.abs(totalRotation) >= ROTATION_THRESHOLD) {
                requestAnimationFrame(processScroll);
                return;
            }
        }
        return;
    }

    // Menu: scroll wheel navigates items
    if (Math.abs(totalRotation) >= ROTATION_THRESHOLD) {
        const items = resolveMenu(state.currentMenuKey).items;

        if (totalRotation > 0) {
            state.selectedIndex = Math.min(state.selectedIndex + 1, items.length - 1);
        } else {
            state.selectedIndex = Math.max(state.selectedIndex - 1, 0);
        }

        totalRotation += totalRotation > 0 ? -ROTATION_THRESHOLD : ROTATION_THRESHOLD;
        renderMenu(elements.menuPrimary);

        if (Math.abs(totalRotation) >= ROTATION_THRESHOLD) {
            requestAnimationFrame(processScroll);
            return;
        }
    }
}

// ── Pointer Events (Click Wheel) ─────────────────────────────

elements.controlWheel.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isDragging = true;
    hasScrolled = false;
    lastMoveTime = Date.now();
    lastAngle = getAngle(e);
    totalRotation = 0;
    elements.controlWheel.setPointerCapture(e.pointerId);
});

elements.controlWheel.addEventListener('pointermove', (e) => {
    if (!isDragging) return;

    const now = Date.now();
    const currentAngle = getAngle(e);

    // Reset if too much time since last move (avoids stale jumps)
    if (now - lastMoveTime > 150) {
        lastAngle = currentAngle;
        totalRotation = 0;
        lastMoveTime = now;
        return;
    }

    let delta = currentAngle - lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Reject impossible jumps (finger teleporting across wheel)
    if (Math.abs(delta) > 60) {
        lastAngle = currentAngle;
        lastMoveTime = now;
        return;
    }

    totalRotation += delta;
    lastAngle = currentAngle;
    lastMoveTime = now;

    if (Math.abs(totalRotation) > SCROLL_DEAD_ZONE) hasScrolled = true;

    processScroll();
});

elements.controlWheel.addEventListener('pointerup', () => {
    isDragging = false;
    totalRotation = 0;
});

// ── Button Binding ───────────────────────────────────────────

function bindButton(el, action, rockClass = null) {
    el.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        el.classList.add('pressed');
        if (rockClass) elements.controlWheel.classList.add(rockClass);
    });

    const release = (e) => {
        if (!el.classList.contains('pressed')) return;
        el.classList.remove('pressed');
        if (rockClass) elements.controlWheel.classList.remove(rockClass);
        if (!hasScrolled && action) {
            action();
            totalRotation = 0;
            hasScrolled = false;
            lastAngle = getAngle(e);
        }
    };

    elements.controlWheel.addEventListener('pointerup', release);
}

// ── Actions ──────────────────────────────────────────────────

const selectAction = () => {
    if (state.isNowPlaying) return;
    const items = resolveMenu(state.currentMenuKey).items;
    const item = items[state.selectedIndex];
    if (item.disabled) return;

    if (item.submenu) {
        state.history.push({ menu: state.currentMenuKey, index: state.selectedIndex });
        switchMenu(item.submenu, 'forward', 0);
    } else if (item.action) {
        item.action();
        renderMenu(elements.menuPrimary);
    } else if (item.actionName === 'shuffleAndPlay') {
        player.shuffleAndPlay();
    }
};

const backAction = () => {
    if (state.isNowPlaying) {
        state.isNowPlaying = false;
        renderMenu(elements.menuPrimary);
        return;
    }
    if (state.history.length > 0) {
        const prev = state.history.pop();
        switchMenu(prev.menu, 'backward', prev.index);
    }
};

// ── Button Wiring ────────────────────────────────────────────

bindButton(elements.midButton, selectAction);
bindButton(elements.menuButton, backAction, 'rock-menu');
bindButton(elements.nextButton, player.nextTrack, 'rock-next');
bindButton(elements.prevButton, player.prevTrack, 'rock-prev');
bindButton(elements.playPauseButton, () => {
    if (elements.audio.paused) elements.audio.play();
    else elements.audio.pause();
}, 'rock-play-pause');

// ── Boot ─────────────────────────────────────────────────────

loadLibrary().then(() => {
    renderMenu(elements.menuPrimary);
});
