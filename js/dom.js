/**
 * dom.js — Centralized DOM element access for iPod app.
 */

export const elements = {
    menuView: null,
    menuSlider: null,
    menuPrimary: null,
    menuSecondary: null,
    headerTitle: null,
    playIcon: null,
    nowPlayingScreen: null,
    audio: null,
    progressBar: null,
    currentTimeLabel: null,
    remainingTimeLabel: null,
    allTimeLabels: null,
    screenContainer: null,
    controlWheel: null,
    midButton: null,
    menuButton: null,
    nextButton: null,
    prevButton: null,
    playPauseButton: null
};

export function initDom() {
    elements.menuView = document.getElementById('menu-view');
    elements.menuSlider = document.getElementById('menu-slider');
    elements.menuPrimary = document.getElementById('menu-primary');
    elements.menuSecondary = document.getElementById('menu-secondary');
    elements.headerTitle = document.querySelector('#ipod-header .header-left');
    elements.playIcon = document.querySelector('.header-icon-play');
    elements.nowPlayingScreen = document.getElementById('now-playing');
    elements.audio = document.getElementById('ipod-audio');
    elements.progressBar = document.querySelector('.progress-fill');
    elements.currentTimeLabel = document.querySelector('.time-label.current');
    elements.remainingTimeLabel = document.querySelector('.remaining');
    elements.allTimeLabels = document.querySelectorAll('.time-label');
    elements.screenContainer = document.getElementById('screen-container');
    elements.controlWheel = document.getElementById('control-wheel');
    elements.midButton = document.getElementById('mid-button');
    elements.menuButton = document.getElementById('menu');
    elements.nextButton = document.getElementById('next');
    elements.prevButton = document.getElementById('prev');
    elements.playPauseButton = document.getElementById('play-pause');

    return elements;
}
