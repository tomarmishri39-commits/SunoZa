/* ==========================================================================
   SUNOZA — Listen • Discover • Enjoy ♡
   Multi-Language & Mood Music Discovery + Authentication (iTunes Search API)
   ========================================================================== */

(() => {
  'use strict';

  const STORAGE_KEYS = {
    FAVOURITES: 'sunoza_favourites_v1',
    RECENT: 'sunoza_recent_v1',
    HISTORY: 'sunoza_search_history_v1',
    VOLUME: 'sunoza_volume_v1',
    USERS: 'sunoza_users_v1',
    SESSION: 'sunoza_session_v1',
  };

  const POPULAR_ARTISTS = [
    { name: 'Arijit Singh', tag: 'Hindi • Soulful' },
    { name: 'Shreya Ghoshal', tag: 'Hindi • Melodic' },
    { name: 'Jubin Nautiyal', tag: 'Hindi • Romantic' },
    { name: 'Sonu Nigam', tag: 'Hindi • Classic' },
    { name: 'Neha Kakkar', tag: 'Hindi • Party' },
    { name: 'Atif Aslam', tag: 'Hindi • Acoustic' },
    { name: 'Armaan Malik', tag: 'Hindi • Pop' },
    { name: 'Diljit Dosanjh', tag: 'Punjabi • Global' },
    { name: 'AP Dhillon', tag: 'Punjabi • Synth' },
    { name: 'Karan Aujla', tag: 'Punjabi • Hip-Hop' },
    { name: 'Sidhu Moose Wala', tag: 'Punjabi • Rap' },
    { name: 'Pawan Singh', tag: 'Bhojpuri • Folk' },
    { name: 'Khesari Lal Yadav', tag: 'Bhojpuri • Hits' },
    { name: 'Shilpi Raj', tag: 'Bhojpuri • Duets' },
    { name: 'Ritesh Pandey', tag: 'Bhojpuri • Pop' },
    { name: 'Masoom Sharma', tag: 'Haryanvi • Beats' },
    { name: 'KD', tag: 'Haryanvi • Rap' },
    { name: 'Sapna Choudhary', tag: 'Haryanvi • Dance' },
    { name: 'Taylor Swift', tag: 'English • Pop' },
    { name: 'Ed Sheeran', tag: 'English • Acoustic' },
    { name: 'Justin Bieber', tag: 'English • Pop' },
    { name: 'The Weeknd', tag: 'English • Synthwave' },
    { name: 'BTS', tag: 'Global • K-Pop' },
  ];

  const LANGUAGE_CONFIG = {
    All: { label: 'All Languages', desc: 'Global & Indian mix', queries: ['Arijit Singh', 'The Weeknd', 'Diljit Dosanjh'], country: 'IN' },
    Hindi: { label: 'Hindi', desc: 'Bollywood & Indie', queries: ['Arijit Singh', 'Shreya Ghoshal', 'Jubin Nautiyal'], country: 'IN' },
    English: { label: 'English', desc: 'Global Pop & R&B', queries: ['Taylor Swift', 'The Weeknd', 'Ed Sheeran'], country: 'US' },
    Punjabi: { label: 'Punjabi', desc: 'Bhangra & Urban', queries: ['Diljit Dosanjh', 'Karan Aujla', 'AP Dhillon'], country: 'IN' },
    Bhojpuri: { label: 'Bhojpuri', desc: 'Folk & Regional', queries: ['Pawan Singh', 'Khesari Lal Yadav', 'Shilpi Raj'], country: 'IN' },
    Haryanvi: { label: 'Haryanvi', desc: 'Desi Beats & Rap', queries: ['Masoom Sharma', 'Sapna Choudhary', 'KD'], country: 'IN' },
    Maithili: { label: 'Maithili', desc: 'Regional Folk', queries: ['Maithili Thakur', 'Maithili song'], country: 'IN', strictlyCheckLang: true },
    Magahi: { label: 'Magahi', desc: 'Regional Folk', queries: ['Magahi song', 'Magahi folk'], country: 'IN', strictlyCheckLang: true },
  };

  const MOOD_CONFIG = {
    Happy: {
      emoji: '😊',
      label: 'Happy',
      desc: 'Feel-good, upbeat & joyful hits',
      queries: ['Badtameez Dil', 'Gallan Goodiyaan', 'Happy Pharrell Williams'],
    },
    Sad: {
      emoji: '🌧️',
      label: 'Sad',
      desc: 'Heartfelt, emotional & soulful melodies',
      queries: ['Tum Hi Ho Arijit Singh', 'Channa Mereya', 'Someone Like You Adele'],
    },
    Excited: {
      emoji: '⚡',
      label: 'Excited',
      desc: 'High-energy party & dance anthems',
      queries: ['Kala Chashma', 'Blinding Lights The Weeknd', 'Kar Gayi Chull'],
    },
    Motivational: {
      emoji: '🔥',
      label: 'Motivational',
      desc: 'Inspiring, workout & hustle tracks',
      queries: ['Zinda Bhaag Milkha', 'Chak De India', 'Believer Imagine Dragons'],
    },
    Devotional: {
      emoji: '🙏',
      label: 'Devotional',
      desc: 'Peaceful bhajans, mantras & aartis',
      queries: ['Hanuman Chalisa Gulshan Kumar', 'Achyutam Keshavam', 'Gayatri Mantra'],
    },
  };

  const state = {
    activeView: 'home',
    activeLanguage: 'All',
    activeMood: 'Happy',
    trending: [],
    recommended: [],
    newReleases: [],
    exploreTracks: [],
    moodTracks: [],
    searchResults: [],
    favourites: loadStorage(STORAGE_KEYS.FAVOURITES, []),
    recent: loadStorage(STORAGE_KEYS.RECENT, []),
    searchHistory: loadStorage(STORAGE_KEYS.HISTORY, []),
    users: loadStorage(STORAGE_KEYS.USERS, []),
    currentUser: loadStorage(STORAGE_KEYS.SESSION, null),
    authMode: 'login', // 'login' | 'signup'
    queue: [],
    currentIndex: -1,
    currentTrack: null,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'off',
    volume: Number(loadStorage(STORAGE_KEYS.VOLUME, 0.8)),
    isMuted: false,
    searchDebounceTimer: null,
  };

  const el = {
    sidebar: document.getElementById('sidebar'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),
    openSidebarBtn: document.getElementById('openSidebarBtn'),
    closeSidebarBtn: document.getElementById('closeSidebarBtn'),
    navItems: document.querySelectorAll('.nav-item'),
    pageViews: document.querySelectorAll('.page-view'),
    favCountBadge: document.getElementById('favCountBadge'),
    queueCountBadge: document.getElementById('queueCountBadge'),
    sidebarLangList: document.getElementById('sidebarLangList'),
    homeLangCards: document.getElementById('homeLangCards'),
    homeMoodCards: document.getElementById('homeMoodCards'),
    moodTabs: document.getElementById('moodTabs'),
    moodBanner: document.getElementById('moodBanner'),
    moodGrid: document.getElementById('moodGrid'),
    exploreLangTabs: document.getElementById('exploreLangTabs'),
    exploreStatusBar: document.getElementById('exploreStatusBar'),
    exploreGrid: document.getElementById('exploreGrid'),
    trendingGrid: document.getElementById('trendingGrid'),
    trendingStatusLabel: document.getElementById('trendingStatusLabel'),
    popularArtistsGrid: document.getElementById('popularArtistsGrid'),
    recentlyPlayedSection: document.getElementById('recentlyPlayedSection'),
    recentlyPlayedGrid: document.getElementById('recentlyPlayedGrid'),
    clearRecentBtn: document.getElementById('clearRecentBtn'),
    recommendedGrid: document.getElementById('recommendedGrid'),
    refreshRecommendedBtn: document.getElementById('refreshRecommendedBtn'),
    newReleasesGrid: document.getElementById('newReleasesGrid'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    searchHistoryDropdown: document.getElementById('searchHistoryDropdown'),
    searchHistoryList: document.getElementById('searchHistoryList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    searchResultsHeading: document.getElementById('searchResultsHeading'),
    searchResultsSub: document.getElementById('searchResultsSub'),
    quickSearchTags: document.getElementById('quickSearchTags'),
    searchStateContainer: document.getElementById('searchStateContainer'),
    searchResultsGrid: document.getElementById('searchResultsGrid'),
    favouritesGrid: document.getElementById('favouritesGrid'),
    favouritesEmpty: document.getElementById('favouritesEmpty'),
    favouritesSub: document.getElementById('favouritesSub'),
    playAllFavsBtn: document.getElementById('playAllFavsBtn'),
    queueDrawer: document.getElementById('queueDrawer'),
    openQueueBtn: document.getElementById('openQueueBtn'),
    playerQueueToggleBtn: document.getElementById('playerQueueToggleBtn'),
    closeQueueBtn: document.getElementById('closeQueueBtn'),
    clearQueueBtn: document.getElementById('clearQueueBtn'),
    queueNowPlaying: document.getElementById('queueNowPlaying'),
    queueList: document.getElementById('queueList'),
    audio: document.getElementById('audioPlayer'),
    playerArt: document.getElementById('playerArt'),
    playerTitle: document.getElementById('playerTitle'),
    playerArtist: document.getElementById('playerArtist'),
    playerLikeBtn: document.getElementById('playerLikeBtn'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    repeatBtn: document.getElementById('repeatBtn'),
    repeatOneBadge: document.getElementById('repeatOneBadge'),
    progressSlider: document.getElementById('progressSlider'),
    currentTimeLabel: document.getElementById('currentTimeLabel'),
    totalTimeLabel: document.getElementById('totalTimeLabel'),
    muteBtn: document.getElementById('muteBtn'),
    volHighIcon: document.getElementById('volHighIcon'),
    volMuteIcon: document.getElementById('volMuteIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    heroPlayTrendingBtn: document.getElementById('heroPlayTrendingBtn'),
    heroExploreBtn: document.getElementById('heroExploreBtn'),
    heroExploreMoodBtn: document.getElementById('heroExploreMoodBtn'),
    heroKicker: document.getElementById('heroKicker'),
    topbarFavBtn: document.getElementById('topbarFavBtn'),
    toastContainer: document.getElementById('toastContainer'),
    openAuthBtn: document.getElementById('openAuthBtn'),
    userProfileChip: document.getElementById('userProfileChip'),
    userAvatarBadge: document.getElementById('userAvatarBadge'),
    userNameLabel: document.getElementById('userNameLabel'),
    logoutBtn: document.getElementById('logoutBtn'),
    authModal: document.getElementById('authModal'),
    closeAuthBtn: document.getElementById('closeAuthBtn'),
    authTabLogin: document.getElementById('authTabLogin'),
    authTabSignup: document.getElementById('authTabSignup'),
    authForm: document.getElementById('authForm'),
    authNameField: document.getElementById('authNameField'),
    authNameInput: document.getElementById('authNameInput'),
    authEmailInput: document.getElementById('authEmailInput'),
    authPasswordInput: document.getElementById('authPasswordInput'),
    togglePasswordBtn: document.getElementById('togglePasswordBtn'),
    authErrorMsg: document.getElementById('authErrorMsg'),
    authSubmitBtn: document.getElementById('authSubmitBtn'),
    authModalTitle: document.getElementById('authModalTitle'),
  };

  function loadStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage errors gracefully
    }
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function formatMillis(ms) {
    if (!ms || !Number.isFinite(ms)) return '0:30';
    return formatTime(ms / 1000);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3600);
  }

  function normalizeTrack(item) {
    const artwork = item.artworkUrl100
      ? item.artworkUrl100.replace('100x100bb', '400x400bb')
      : 'assets/favicon.svg';
    return {
      id: String(item.trackId || `${item.trackName}-${item.artistName}`),
      title: item.trackName || 'Unknown Track',
      artist: item.artistName || 'Unknown Artist',
      album: item.collectionName || 'Single',
      artwork,
      previewUrl: item.previewUrl || null,
      durationMs: item.trackTimeMillis || 30000,
      genre: item.primaryGenreName || 'Music',
      trackViewUrl: item.trackViewUrl || '',
    };
  }

  async function searchItunes(term, { limit = 16, country = 'IN' } = {}) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&country=${country}&limit=${limit}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API returned status ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.results) ? data.results.map(normalizeTrack) : [];
  }

  // -----------------------------
  // Authentication Logic
  // -----------------------------
  function updateAuthUI() {
    if (state.currentUser) {
      el.openAuthBtn.classList.add('hidden');
      el.userProfileChip.classList.remove('hidden');
      el.userNameLabel.textContent = state.currentUser.name;
      el.userAvatarBadge.textContent = state.currentUser.name.charAt(0).toUpperCase();
      el.heroKicker.textContent = `WELCOME BACK, ${state.currentUser.name.toUpperCase()} • LISTEN • DISCOVER • ENJOY ♡`;
    } else {
      el.openAuthBtn.classList.remove('hidden');
      el.userProfileChip.classList.add('hidden');
      el.heroKicker.textContent = 'LISTEN • DISCOVER • ENJOY ♡';
    }
  }

  function setAuthMode(mode) {
    state.authMode = mode;
    const isSignup = mode === 'signup';
    el.authTabLogin.classList.toggle('active', !isSignup);
    el.authTabSignup.classList.toggle('active', isSignup);
    el.authNameField.classList.toggle('hidden', !isSignup);
    el.authSubmitBtn.textContent = isSignup ? 'Create Account' : 'Log In';
    el.authModalTitle.textContent = isSignup ? 'Join SUNOZA' : 'Welcome Back to SUNOZA';
    el.authErrorMsg.classList.add('hidden');
  }

  function openAuthModal(mode = 'login') {
    setAuthMode(mode);
    el.authModal.classList.remove('hidden');
  }

  function closeAuthModal() {
    el.authModal.classList.add('hidden');
    el.authErrorMsg.classList.add('hidden');
    el.authForm.reset();
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    const email = el.authEmailInput.value.trim().toLowerCase();
    const password = el.authPasswordInput.value;
    const name = el.authNameInput.value.trim();

    if (!email || !email.includes('@')) {
      showAuthError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      showAuthError('Password must be at least 6 characters.');
      return;
    }

    if (state.authMode === 'signup') {
      if (!name) {
        showAuthError('Please enter your full name.');
        return;
      }
      if (state.users.some((u) => u.email === email)) {
        showAuthError('An account with this email already exists. Please log in.');
        return;
      }
      const newUser = { name, email, password };
      state.users.push(newUser);
      saveStorage(STORAGE_KEYS.USERS, state.users);
      state.currentUser = { name, email };
      saveStorage(STORAGE_KEYS.SESSION, state.currentUser);
      updateAuthUI();
      closeAuthModal();
      showToast(`Account created! Welcome to SUNOZA, ${name} ♡`);
    } else {
      const matched = state.users.find((u) => u.email === email && u.password === password);
      if (!matched) {
        showAuthError('Invalid email or password. Need an account? Switch to Sign Up.');
        return;
      }
      state.currentUser = { name: matched.name, email: matched.email };
      saveStorage(STORAGE_KEYS.SESSION, state.currentUser);
      updateAuthUI();
      closeAuthModal();
      showToast(`Welcome back, ${matched.name}!`);
    }
  }

  function showAuthError(msg) {
    el.authErrorMsg.textContent = msg;
    el.authErrorMsg.classList.remove('hidden');
  }

  function logoutUser() {
    state.currentUser = null;
    saveStorage(STORAGE_KEYS.SESSION, null);
    updateAuthUI();
    showToast('You have logged out of SUNOZA.');
  }

  // -----------------------------
  // Navigation & Views
  // -----------------------------
  function switchView(viewName) {
    state.activeView = viewName;
    el.pageViews.forEach((v) => v.classList.toggle('active', v.id === `view-${viewName}`));
    el.navItems.forEach((btn) => btn.classList.toggle('active', btn.dataset.view === viewName));
    closeSidebar();

    if (viewName === 'favourites') {
      renderFavourites();
    } else if (viewName === 'explore' && state.exploreTracks.length === 0) {
      loadLanguageCatalogue(state.activeLanguage);
    } else if (viewName === 'mood' && state.moodTracks.length === 0) {
      loadMoodCatalogue(state.activeMood);
    }
  }

  function openSidebar() {
    el.sidebar.classList.add('open');
    el.sidebarBackdrop.classList.add('open');
  }

  function closeSidebar() {
    el.sidebar.classList.remove('open');
    el.sidebarBackdrop.classList.remove('open');
  }

  function toggleQueueDrawer(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !el.queueDrawer.classList.contains('open');
    el.queueDrawer.classList.toggle('open', next);
    el.queueDrawer.setAttribute('aria-hidden', String(!next));
  }

  // -----------------------------
  // Rendering Helpers
  // -----------------------------
  function renderSkeletons(container, count = 6) {
    container.innerHTML = Array.from({ length: count })
      .map(() => '<div class="skeleton-card"></div>')
      .join('');
  }

  function isFavourite(trackId) {
    return state.favourites.some((t) => t.id === trackId);
  }

  function createSongCard(track, listContext = []) {
    const liked = isFavourite(track.id);
    const isCurrent = state.currentTrack && state.currentTrack.id === track.id;
    const playable = Boolean(track.previewUrl);

    const card = document.createElement('article');
    card.className = `song-card${isCurrent ? ' playing' : ''}`;
    card.dataset.trackId = track.id;

    card.innerHTML = `
      <div class="art-wrap">
        <img src="${escapeHtml(track.artwork)}" alt="${escapeHtml(track.title)} artwork" loading="lazy" />
        <span class="preview-tag ${playable ? '' : 'unavailable'}">${playable ? '30s Preview' : 'Unavailable'}</span>
        <button class="card-play-fab" aria-label="Play ${escapeHtml(track.title)}" title="${playable ? 'Play preview' : 'Preview unavailable'}">
          ${isCurrent && state.isPlaying
            ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>'}
        </button>
      </div>
      <div class="song-title" title="${escapeHtml(track.title)}">${escapeHtml(track.title)}</div>
      <div class="song-artist" title="${escapeHtml(track.artist)}">${escapeHtml(track.artist)}</div>
      <div class="song-album" title="${escapeHtml(track.album)}">${escapeHtml(track.album)}</div>
      <div class="song-card-footer">
        <div class="card-action-group">
          <button class="icon-btn heart-btn ${liked ? 'liked' : ''}" aria-label="${liked ? 'Remove from favourites' : 'Add to favourites'}" title="${liked ? 'Unlike' : 'Like'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="icon-btn add-queue-btn" aria-label="Add to queue" title="Add to queue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
        <span class="duration-badge">${formatMillis(track.durationMs)}</span>
      </div>
    `;

    const handlePlay = (e) => {
      e.stopPropagation();
      if (isCurrent) togglePlayPause();
      else playTrack(track, listContext);
    };

    card.querySelector('.card-play-fab').addEventListener('click', handlePlay);
    card.querySelector('.art-wrap').addEventListener('click', handlePlay);
    card.querySelector('.heart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavourite(track);
    });
    card.querySelector('.add-queue-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToQueue(track);
    });

    return card;
  }

  function renderSongGrid(container, tracks) {
    container.innerHTML = '';
    tracks.forEach((track) => container.appendChild(createSongCard(track, tracks)));
  }

  function renderPopularArtists() {
    el.popularArtistsGrid.innerHTML = '';
    POPULAR_ARTISTS.forEach((artist) => {
      const initials = artist.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
      const btn = document.createElement('button');
      btn.className = 'artist-card';
      btn.innerHTML = `
        <div class="artist-avatar">${escapeHtml(initials)}</div>
        <div class="artist-name">${escapeHtml(artist.name)}</div>
        <div class="artist-tag">${escapeHtml(artist.tag)}</div>
      `;
      btn.addEventListener('click', () => {
        el.searchInput.value = artist.name;
        el.clearSearchBtn.classList.remove('hidden');
        switchView('search');
        executeSearch(artist.name);
      });
      el.popularArtistsGrid.appendChild(btn);
    });
  }

  function renderMoodSections() {
    el.homeMoodCards.innerHTML = '';
    el.moodTabs.innerHTML = '';

    Object.keys(MOOD_CONFIG).forEach((moodKey) => {
      const cfg = MOOD_CONFIG[moodKey];

      const card = document.createElement('button');
      card.className = 'mood-card';
      card.innerHTML = `
        <span class="mood-emoji">${cfg.emoji}</span>
        <div class="mood-title">${escapeHtml(cfg.label)}</div>
        <div class="mood-desc">${escapeHtml(cfg.desc)}</div>
      `;
      card.addEventListener('click', () => {
        selectMood(moodKey);
        switchView('mood');
      });
      el.homeMoodCards.appendChild(card);

      const pill = document.createElement('button');
      pill.className = `filter-pill${state.activeMood === moodKey ? ' active' : ''}`;
      pill.textContent = `${cfg.emoji} ${cfg.label}`;
      pill.dataset.mood = moodKey;
      pill.addEventListener('click', () => selectMood(moodKey));
      el.moodTabs.appendChild(pill);
    });
  }

  function selectMood(moodKey) {
    state.activeMood = moodKey;
    document.querySelectorAll('#moodTabs .filter-pill').forEach((pill) => {
      pill.classList.toggle('active', pill.dataset.mood === moodKey);
    });
    loadMoodCatalogue(moodKey);
  }

  async function loadMoodCatalogue(moodKey) {
    const cfg = MOOD_CONFIG[moodKey] || MOOD_CONFIG.Happy;
    el.moodBanner.innerHTML = `${cfg.emoji} <strong>${escapeHtml(cfg.label)} Mood:</strong> ${escapeHtml(cfg.desc)}`;
    renderSkeletons(el.moodGrid, 8);

    try {
      const batches = await Promise.all(cfg.queries.map((q) => searchItunes(q, { limit: 6, country: 'IN' })));
      const merged = [];
      const seen = new Set();
      batches.flat().forEach((track) => {
        if (!seen.has(track.id)) {
          seen.add(track.id);
          merged.push(track);
        }
      });

      state.moodTracks = merged;
      if (merged.length === 0) {
        el.moodGrid.innerHTML = '';
        el.moodBanner.textContent = `No ${cfg.label} songs found right now.`;
        return;
      }
      renderSongGrid(el.moodGrid, merged);
    } catch (err) {
      el.moodGrid.innerHTML = '';
      el.moodBanner.textContent = `Could not load ${cfg.label} mood tracks: ${err.message}`;
    }
  }

  function renderLanguageSections() {
    const langs = Object.keys(LANGUAGE_CONFIG);
    el.homeLangCards.innerHTML = '';
    el.exploreLangTabs.innerHTML = '';

    langs.forEach((lang) => {
      const cfg = LANGUAGE_CONFIG[lang];
      if (lang !== 'All') {
        const card = document.createElement('button');
        card.className = 'lang-card';
        card.innerHTML = `
          <div class="lang-card-name">${escapeHtml(cfg.label)}</div>
          <div class="lang-card-sub">${escapeHtml(cfg.desc)}</div>
        `;
        card.addEventListener('click', () => {
          selectLanguage(lang);
          switchView('explore');
        });
        el.homeLangCards.appendChild(card);
      }

      const pill = document.createElement('button');
      pill.className = `filter-pill${state.activeLanguage === lang ? ' active' : ''}`;
      pill.textContent = cfg.label;
      pill.addEventListener('click', () => selectLanguage(lang));
      el.exploreLangTabs.appendChild(pill);
    });
  }

  function selectLanguage(lang) {
    state.activeLanguage = lang;
    document.querySelectorAll('#sidebarLangList .lang-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.lang === lang);
    });
    document.querySelectorAll('#exploreLangTabs .filter-pill').forEach((pill) => {
      pill.classList.toggle('active', pill.textContent === LANGUAGE_CONFIG[lang].label);
    });
    loadLanguageCatalogue(lang);
  }

  // -----------------------------
  // Favourites & Recently Played
  // -----------------------------
  function toggleFavourite(track) {
    const idx = state.favourites.findIndex((t) => t.id === track.id);
    if (idx >= 0) {
      state.favourites.splice(idx, 1);
      showToast(`Removed "${track.title}" from Favourites`);
    } else {
      state.favourites.unshift(track);
      showToast(`Added "${track.title}" to Favourites ♡`);
    }
    saveStorage(STORAGE_KEYS.FAVOURITES, state.favourites);
    updateFavBadgesAndCards();
  }

  function updateFavBadgesAndCards() {
    el.favCountBadge.textContent = String(state.favourites.length);
    document.querySelectorAll('.song-card').forEach((card) => {
      const id = card.dataset.trackId;
      const btn = card.querySelector('.heart-btn');
      if (btn) btn.classList.toggle('liked', isFavourite(id));
    });
    if (state.currentTrack) {
      el.playerLikeBtn.classList.toggle('liked', isFavourite(state.currentTrack.id));
    }
    if (state.activeView === 'favourites') renderFavourites();
  }

  function renderFavourites() {
    const hasFavs = state.favourites.length > 0;
    el.favouritesEmpty.classList.toggle('hidden', hasFavs);
    el.playAllFavsBtn.classList.toggle('hidden', !hasFavs);
    el.favouritesSub.textContent = hasFavs
      ? `${state.favourites.length} saved song${state.favourites.length === 1 ? '' : 's'} in your library.`
      : 'Your liked songs are saved locally in your browser.';
    renderSongGrid(el.favouritesGrid, state.favourites);
  }

  function addRecentlyPlayed(track) {
    state.recent = [track, ...state.recent.filter((t) => t.id !== track.id)].slice(0, 12);
    saveStorage(STORAGE_KEYS.RECENT, state.recent);
    renderRecentlyPlayed();
  }

  function renderRecentlyPlayed() {
    if (state.recent.length === 0) {
      el.recentlyPlayedSection.classList.add('hidden');
      return;
    }
    el.recentlyPlayedSection.classList.remove('hidden');
    renderSongGrid(el.recentlyPlayedGrid, state.recent);
  }

  // -----------------------------
  // Search & Search History
  // -----------------------------
  function saveSearchHistory(query) {
    const clean = query.trim();
    if (!clean) return;
    state.searchHistory = [clean, ...state.searchHistory.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 8);
    saveStorage(STORAGE_KEYS.HISTORY, state.searchHistory);
    renderSearchHistory();
  }

  function renderSearchHistory() {
    if (state.searchHistory.length === 0) {
      el.searchHistoryList.innerHTML = '<span class="section-meta">No recent searches yet</span>';
      return;
    }
    el.searchHistoryList.innerHTML = '';
    state.searchHistory.forEach((term) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'history-item';
      btn.textContent = term;
      btn.addEventListener('click', () => {
        el.searchInput.value = term;
        el.clearSearchBtn.classList.remove('hidden');
        el.searchHistoryDropdown.classList.add('hidden');
        switchView('search');
        executeSearch(term);
      });
      el.searchHistoryList.appendChild(btn);
    });
  }

  function renderQuickSearchTags() {
    const samples = ['Arijit Singh', 'Taylor Swift', 'Diljit Dosanjh', 'Pawan Singh', 'Masoom Sharma', 'The Weeknd', 'BTS', 'Hanuman Chalisa'];
    el.quickSearchTags.innerHTML = '';
    samples.forEach((tag) => {
      const btn = document.createElement('button');
      btn.className = 'filter-pill';
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        el.searchInput.value = tag;
        el.clearSearchBtn.classList.remove('hidden');
        switchView('search');
        executeSearch(tag);
      });
      el.quickSearchTags.appendChild(btn);
    });
  }

  async function executeSearch(query) {
    const clean = query.trim();
    if (!clean) return;

    saveSearchHistory(clean);
    el.searchResultsHeading.textContent = `Results for "${clean}"`;
    el.searchResultsSub.textContent = 'Searching live legal music catalogue...';
    el.searchStateContainer.innerHTML = '';
    renderSkeletons(el.searchResultsGrid, 8);

    try {
      let tracks = await searchItunes(clean, { limit: 24, country: 'IN' });
      if (tracks.length === 0) {
        tracks = await searchItunes(clean, { limit: 24, country: 'US' });
      }

      state.searchResults = tracks;
      if (tracks.length === 0) {
        el.searchResultsGrid.innerHTML = '';
        el.searchResultsSub.textContent = 'No matching tracks found.';
        el.searchStateContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">♫</div>
            <h3>No songs found for "${escapeHtml(clean)}"</h3>
            <p>The legal iTunes catalogue returned no results for this query. Try a partial artist name, song title, or pick a popular artist above.</p>
          </div>
        `;
        return;
      }

      const playableCount = tracks.filter((t) => t.previewUrl).length;
      el.searchResultsSub.textContent = `Found ${tracks.length} tracks (${playableCount} with playable 30s previews).`;
      renderSongGrid(el.searchResultsGrid, tracks);
    } catch (err) {
      el.searchResultsGrid.innerHTML = '';
      el.searchResultsSub.textContent = 'Unable to reach the music catalogue.';
      el.searchStateContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠</div>
          <h3>Search Connection Error</h3>
          <p>Could not fetch songs right now (${escapeHtml(err.message)}). Please check your internet connection and try again.</p>
          <button id="retrySearchBtn" class="btn-primary">Retry Search</button>
        </div>
      `;
      const retryBtn = document.getElementById('retrySearchBtn');
      if (retryBtn) retryBtn.addEventListener('click', () => executeSearch(clean));
    }
  }

  async function loadLanguageCatalogue(lang) {
    const cfg = LANGUAGE_CONFIG[lang] || LANGUAGE_CONFIG.All;
    el.exploreStatusBar.classList.add('hidden');
    renderSkeletons(el.exploreGrid, 8);

    try {
      const batches = await Promise.all(
        cfg.queries.map((q) => searchItunes(q, { limit: 8, country: cfg.country }))
      );
      const merged = [];
      const seen = new Set();
      batches.flat().forEach((track) => {
        if (!seen.has(track.id)) {
          seen.add(track.id);
          merged.push(track);
        }
      });

      if (merged.length === 0) {
        state.exploreTracks = [];
        el.exploreGrid.innerHTML = '';
        el.exploreStatusBar.classList.remove('hidden');
        el.exploreStatusBar.innerHTML = `
          <strong>${escapeHtml(cfg.label)} Catalogue Unavailable:</strong> No verified ${escapeHtml(cfg.label)} tracks were returned by the iTunes Search API. We never show fake songs—try Bhojpuri, Hindi, or Punjabi instead.
        `;
        return;
      }

      if (cfg.strictlyCheckLang) {
        el.exploreStatusBar.classList.remove('hidden');
        el.exploreStatusBar.innerHTML = `
          Showing available ${escapeHtml(cfg.label)} results from the iTunes Search API. Regional catalogue coverage may be limited; you can also explore Bhojpuri or Hindi.
        `;
      }

      state.exploreTracks = merged;
      renderSongGrid(el.exploreGrid, merged);
    } catch (err) {
      el.exploreGrid.innerHTML = '';
      el.exploreStatusBar.classList.remove('hidden');
      el.exploreStatusBar.textContent = `Could not load ${cfg.label} catalogue: ${err.message}`;
    }
  }

  // -----------------------------
  // Audio Player & Queue Engine
  // -----------------------------
  function playTrack(track, contextList = []) {
    if (!track.previewUrl) {
      showToast(`"${track.title}" has no playable preview in the iTunes catalogue. Try another track!`, 'error');
      return;
    }

    if (contextList.length > 0) {
      const playableList = contextList.filter((t) => Boolean(t.previewUrl));
      state.queue = playableList.length > 0 ? playableList : [track];
    } else if (!state.queue.some((t) => t.id === track.id)) {
      state.queue.push(track);
    }

    state.currentIndex = state.queue.findIndex((t) => t.id === track.id);
    if (state.currentIndex === -1) {
      state.queue.unshift(track);
      state.currentIndex = 0;
    }

    state.currentTrack = track;
    el.audio.src = track.previewUrl;
    el.audio.volume = state.isMuted ? 0 : state.volume;

    el.playerArt.src = track.artwork;
    el.playerTitle.textContent = track.title;
    el.playerArtist.textContent = `${track.artist} • ${track.album}`;
    el.playerLikeBtn.classList.toggle('liked', isFavourite(track.id));

    el.audio.play()
      .then(() => {
        state.isPlaying = true;
        updatePlayerUI();
        addRecentlyPlayed(track);
      })
      .catch(() => {
        state.isPlaying = false;
        updatePlayerUI();
        showToast('Playback could not start automatically. Click Play to listen.', 'error');
      });

    renderQueue();
    highlightActiveCards();
  }

  function togglePlayPause() {
    if (!state.currentTrack) {
      if (state.trending.length > 0) {
        const firstPlayable = state.trending.find((t) => t.previewUrl);
        if (firstPlayable) playTrack(firstPlayable, state.trending);
      } else {
        showToast('Pick any song to start listening!');
      }
      return;
    }

    if (el.audio.paused) {
      el.audio.play()
        .then(() => {
          state.isPlaying = true;
          updatePlayerUI();
        })
        .catch(() => showToast('Unable to resume playback.', 'error'));
    } else {
      el.audio.pause();
      state.isPlaying = false;
      updatePlayerUI();
    }
  }

  function playNext() {
    if (state.queue.length === 0) return;
    if (state.isShuffle && state.queue.length > 1) {
      let randIdx = Math.floor(Math.random() * state.queue.length);
      if (randIdx === state.currentIndex) randIdx = (randIdx + 1) % state.queue.length;
      playTrack(state.queue[randIdx]);
      return;
    }

    const nextIdx = state.currentIndex + 1;
    if (nextIdx < state.queue.length) {
      playTrack(state.queue[nextIdx]);
    } else if (state.repeatMode === 'all') {
      playTrack(state.queue[0]);
    } else {
      state.isPlaying = false;
      updatePlayerUI();
    }
  }

  function playPrev() {
    if (state.queue.length === 0) return;
    if (el.audio.currentTime > 3) {
      el.audio.currentTime = 0;
      return;
    }
    const prevIdx = state.currentIndex - 1;
    if (prevIdx >= 0) {
      playTrack(state.queue[prevIdx]);
    } else if (state.repeatMode === 'all') {
      playTrack(state.queue[state.queue.length - 1]);
    }
  }

  function addToQueue(track) {
    if (!track.previewUrl) {
      showToast(`"${track.title}" has no playable preview to queue.`, 'error');
      return;
    }
    if (!state.queue.some((t) => t.id === track.id)) {
      state.queue.push(track);
      renderQueue();
      showToast(`Added "${track.title}" to Play Queue`);
    } else {
      showToast(`"${track.title}" is already in the queue`);
    }
  }

  function renderQueue() {
    el.queueCountBadge.textContent = String(state.queue.length);
    if (state.currentTrack) {
      el.queueNowPlaying.innerHTML = `
        <div class="queue-item active">
          <img src="${escapeHtml(state.currentTrack.artwork)}" alt="" />
          <div class="queue-item-meta">
            <div class="queue-item-title">${escapeHtml(state.currentTrack.title)}</div>
            <div class="queue-item-artist">${escapeHtml(state.currentTrack.artist)}</div>
          </div>
        </div>
      `;
    } else {
      el.queueNowPlaying.innerHTML = '<p class="section-meta">Nothing playing right now.</p>';
    }

    if (state.queue.length === 0) {
      el.queueList.innerHTML = '<p class="section-meta">Queue is empty. Add songs using + on any card.</p>';
      return;
    }

    el.queueList.innerHTML = '';
    state.queue.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = `queue-item${idx === state.currentIndex ? ' active' : ''}`;
      item.innerHTML = `
        <img src="${escapeHtml(track.artwork)}" alt="" />
        <div class="queue-item-meta">
          <div class="queue-item-title">${escapeHtml(track.title)}</div>
          <div class="queue-item-artist">${escapeHtml(track.artist)}</div>
        </div>
        <button class="icon-btn" aria-label="Remove from queue" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        playTrack(track);
      });

      item.querySelector('button').addEventListener('click', (e) => {
        e.stopPropagation();
        state.queue.splice(idx, 1);
        if (idx < state.currentIndex) state.currentIndex -= 1;
        renderQueue();
      });

      el.queueList.appendChild(item);
    });
  }

  function updatePlayerUI() {
    el.playIcon.classList.toggle('hidden', state.isPlaying);
    el.pauseIcon.classList.toggle('hidden', !state.isPlaying);
    highlightActiveCards();
  }

  function highlightActiveCards() {
    document.querySelectorAll('.song-card').forEach((card) => {
      const isCurrent = state.currentTrack && card.dataset.trackId === state.currentTrack.id;
      card.classList.toggle('playing', Boolean(isCurrent));
      const fab = card.querySelector('.card-play-fab');
      if (fab) {
        fab.innerHTML = isCurrent && state.isPlaying
          ? '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,4 20,12 6,20"/></svg>';
      }
    });
  }

  async function loadHomeSections() {
    renderSkeletons(el.trendingGrid, 6);
    renderSkeletons(el.recommendedGrid, 6);
    renderSkeletons(el.newReleasesGrid, 6);

    try {
      const [trendingA, trendingB, recTracks, newTracks] = await Promise.all([
        searchItunes('Arijit Singh', { limit: 6, country: 'IN' }),
        searchItunes('The Weeknd', { limit: 6, country: 'US' }),
        searchItunes('Diljit Dosanjh', { limit: 8, country: 'IN' }),
        searchItunes('Taylor Swift', { limit: 8, country: 'US' }),
      ]);

      state.trending = [...trendingA.slice(0, 4), ...trendingB.slice(0, 4)];
      state.recommended = recTracks;
      state.newReleases = newTracks;

      el.trendingStatusLabel.textContent = 'Live previews powered by iTunes';
      renderSongGrid(el.trendingGrid, state.trending);
      renderSongGrid(el.recommendedGrid, state.recommended);
      renderSongGrid(el.newReleasesGrid, state.newReleases);
    } catch {
      el.trendingStatusLabel.textContent = 'Offline / API unreachable';
      showToast('Could not load live home tracks. Check your connection.', 'error');
    }
  }

  async function refreshRecommended() {
    const picks = ['Shreya Ghoshal', 'Karan Aujla', 'Ed Sheeran', 'Pawan Singh', 'Jubin Nautiyal', 'BTS'];
    const pick = picks[Math.floor(Math.random() * picks.length)];
    renderSkeletons(el.recommendedGrid, 6);
    try {
      const tracks = await searchItunes(pick, { limit: 8, country: 'IN' });
      state.recommended = tracks;
      renderSongGrid(el.recommendedGrid, tracks);
      showToast(`Refreshed mix with ${pick}`);
    } catch {
      showToast('Could not refresh recommendations right now.', 'error');
    }
  }

  function bindEvents() {
    el.navItems.forEach((btn) => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    document.querySelectorAll('[data-jump-view]').forEach((btn) => {
      btn.addEventListener('click', () => switchView(btn.dataset.jumpView));
    });

    el.topbarFavBtn.addEventListener('click', () => switchView('favourites'));
    el.heroExploreBtn.addEventListener('click', () => switchView('explore'));
    el.heroExploreMoodBtn.addEventListener('click', () => switchView('mood'));
    el.heroPlayTrendingBtn.addEventListener('click', () => {
      const first = state.trending.find((t) => t.previewUrl);
      if (first) playTrack(first, state.trending);
      else showToast('Trending tracks are still loading...');
    });

    // Auth Events
    el.openAuthBtn.addEventListener('click', () => openAuthModal('login'));
    el.closeAuthBtn.addEventListener('click', closeAuthModal);
    el.authModal.addEventListener('click', (e) => {
      if (e.target === el.authModal) closeAuthModal();
    });
    el.authTabLogin.addEventListener('click', () => setAuthMode('login'));
    el.authTabSignup.addEventListener('click', () => setAuthMode('signup'));
    el.authForm.addEventListener('submit', handleAuthSubmit);
    el.logoutBtn.addEventListener('click', logoutUser);
    el.togglePasswordBtn.addEventListener('click', () => {
      const isPass = el.authPasswordInput.type === 'password';
      el.authPasswordInput.type = isPass ? 'text' : 'password';
      el.togglePasswordBtn.textContent = isPass ? 'Hide' : 'Show';
    });

    // Mobile Sidebar
    el.openSidebarBtn.addEventListener('click', openSidebar);
    el.closeSidebarBtn.addEventListener('click', closeSidebar);
    el.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Sidebar Language Chips
    el.sidebarLangList.addEventListener('click', (e) => {
      const chip = e.target.closest('.lang-chip');
      if (!chip) return;
      selectLanguage(chip.dataset.lang);
      switchView('explore');
    });

    // Search
    el.searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      el.searchHistoryDropdown.classList.add('hidden');
      switchView('search');
      executeSearch(el.searchInput.value);
    });

    el.searchInput.addEventListener('focus', () => {
      renderSearchHistory();
      el.searchHistoryDropdown.classList.remove('hidden');
    });

    el.searchInput.addEventListener('input', () => {
      const val = el.searchInput.value.trim();
      el.clearSearchBtn.classList.toggle('hidden', val.length === 0);
      clearTimeout(state.searchDebounceTimer);
      if (val.length >= 2) {
        state.searchDebounceTimer = setTimeout(() => {
          switchView('search');
          executeSearch(val);
        }, 550);
      }
    });

    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      el.clearSearchBtn.classList.add('hidden');
      el.searchInput.focus();
    });

    el.clearHistoryBtn.addEventListener('click', () => {
      state.searchHistory = [];
      saveStorage(STORAGE_KEYS.HISTORY, []);
      renderSearchHistory();
    });

    document.addEventListener('click', (e) => {
      if (!el.searchForm.contains(e.target)) el.searchHistoryDropdown.classList.add('hidden');
    });

    // Favourites & Recent
    el.playAllFavsBtn.addEventListener('click', () => {
      const first = state.favourites.find((t) => t.previewUrl);
      if (first) playTrack(first, state.favourites);
      else showToast('No playable previews in Favourites.', 'error');
    });

    el.clearRecentBtn.addEventListener('click', () => {
      state.recent = [];
      saveStorage(STORAGE_KEYS.RECENT, []);
      renderRecentlyPlayed();
      showToast('Cleared Recently Played history');
    });

    el.refreshRecommendedBtn.addEventListener('click', refreshRecommended);

    // Queue Drawer
    el.openQueueBtn.addEventListener('click', () => toggleQueueDrawer());
    el.playerQueueToggleBtn.addEventListener('click', () => toggleQueueDrawer());
    el.closeQueueBtn.addEventListener('click', () => toggleQueueDrawer(false));
    el.clearQueueBtn.addEventListener('click', () => {
      state.queue = state.currentTrack ? [state.currentTrack] : [];
      state.currentIndex = state.currentTrack ? 0 : -1;
      renderQueue();
      showToast('Cleared upcoming queue');
    });

    // Player Controls
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    el.nextBtn.addEventListener('click', playNext);
    el.prevBtn.addEventListener('click', playPrev);

    el.playerLikeBtn.addEventListener('click', () => {
      if (state.currentTrack) toggleFavourite(state.currentTrack);
      else showToast('Play a song first to like it!');
    });

    el.shuffleBtn.addEventListener('click', () => {
      state.isShuffle = !state.isShuffle;
      el.shuffleBtn.classList.toggle('active', state.isShuffle);
      showToast(state.isShuffle ? 'Shuffle On' : 'Shuffle Off');
    });

    el.repeatBtn.addEventListener('click', () => {
      const modes = ['off', 'all', 'one'];
      state.repeatMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
      el.repeatBtn.classList.toggle('active', state.repeatMode !== 'off');
      el.repeatOneBadge.classList.toggle('hidden', state.repeatMode !== 'one');
      el.repeatBtn.title = `Repeat: ${state.repeatMode}`;
      showToast(`Repeat: ${state.repeatMode.toUpperCase()}`);
    });

    el.audio.addEventListener('loadedmetadata', () => {
      el.totalTimeLabel.textContent = formatTime(el.audio.duration);
    });

    el.audio.addEventListener('timeupdate', () => {
      if (!el.audio.duration) return;
      el.progressSlider.value = String((el.audio.currentTime / el.audio.duration) * 100);
      el.currentTimeLabel.textContent = formatTime(el.audio.currentTime);
    });

    el.audio.addEventListener('ended', () => {
      if (state.repeatMode === 'one') {
        el.audio.currentTime = 0;
        el.audio.play();
      } else {
        playNext();
      }
    });

    el.audio.addEventListener('error', () => {
      state.isPlaying = false;
      updatePlayerUI();
      showToast('Audio stream failed to load. Skipping or try another song.', 'error');
    });

    el.progressSlider.addEventListener('input', () => {
      if (!el.audio.duration) return;
      el.audio.currentTime = (Number(el.progressSlider.value) / 100) * el.audio.duration;
    });

    el.volumeSlider.value = String(state.volume);
    el.audio.volume = state.volume;

    el.volumeSlider.addEventListener('input', () => {
      state.volume = Number(el.volumeSlider.value);
      state.isMuted = state.volume === 0;
      el.audio.volume = state.volume;
      saveStorage(STORAGE_KEYS.VOLUME, state.volume);
      el.volHighIcon.classList.toggle('hidden', state.isMuted);
      el.volMuteIcon.classList.toggle('hidden', !state.isMuted);
    });

    el.muteBtn.addEventListener('click', () => {
      state.isMuted = !state.isMuted;
      el.audio.volume = state.isMuted ? 0 : state.volume;
      el.volHighIcon.classList.toggle('hidden', state.isMuted);
      el.volMuteIcon.classList.toggle('hidden', !state.isMuted);
    });
  }

  function init() {
    updateAuthUI();
    renderPopularArtists();
    renderMoodSections();
    renderLanguageSections();
    renderQuickSearchTags();
    renderRecentlyPlayed();
    renderSearchHistory();
    renderQueue();
    updateFavBadgesAndCards();
    bindEvents();
    loadHomeSections();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
