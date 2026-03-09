/* ============================================
   小红书热点趋势 - JavaScript
   ============================================ */

(function () {
    'use strict';

    // ---------- State ----------
    let allFeeds = [];
    let currentFilter = 'all';

    // ---------- DOM ----------
    const $ = (sel) => document.querySelector(sel);
    const waterfall = $('#waterfall');
    const loading = $('#loading');
    const empty = $('#empty');
    const searchInput = $('#searchInput');
    const searchBtn = $('#searchBtn');
    const themeToggle = $('#themeToggle');
    const modalOverlay = $('#modalOverlay');
    const modalBody = $('#modalBody');
    const modalClose = $('#modalClose');
    const feedCountEl = $('#feedCount');
    const lastUpdatedEl = $('#lastUpdated');

    // ---------- Theme ----------
    function initTheme() {
        const saved = localStorage.getItem('xhs-theme');
        if (saved) {
            document.documentElement.setAttribute('data-theme', saved);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('xhs-theme', next);
    }

    // ---------- Data ----------
    async function loadData() {
        try {
            const resp = await fetch('data.json?t=' + Date.now());
            if (!resp.ok) throw new Error('Failed to fetch data');
            const data = await resp.json();
            allFeeds = data.feeds || [];
            feedCountEl.textContent = allFeeds.length;
            lastUpdatedEl.textContent = data.lastUpdated || '-';
            loading.style.display = 'none';
            renderCards(allFeeds);
        } catch (err) {
            console.error('Load error:', err);
            loading.innerHTML = '<p style="color:var(--red)">⚠️ 数据加载失败，请刷新重试</p>';
        }
    }

    // ---------- Image proxy ----------
    function proxyImg(url) {
        if (!url) return 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="%23f0f0f0"><rect width="300" height="300"/><text x="50%" y="50%" fill="%23ccc" text-anchor="middle" dy=".3em" font-size="40">📕</text></svg>');
        // Replace http with https for mixed-content
        return url.replace(/^http:\/\//, 'https://');
    }

    // ---------- Render ----------
    function renderCards(feeds) {
        waterfall.innerHTML = '';
        empty.style.display = feeds.length ? 'none' : 'block';

        feeds.forEach((feed, idx) => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.animationDelay = `${idx * 0.04}s`;
            card.setAttribute('data-id', feed.id);
            card.setAttribute('data-type', feed.type);

            const aspectRatio = (feed.coverHeight && feed.coverWidth)
                ? (feed.coverHeight / feed.coverWidth * 100).toFixed(1)
                : '133';

            const typeLabel = feed.type === 'video' ? '🎬 视频' : '📷 图文';
            const typeClass = feed.type === 'video' ? 'video' : 'normal';

            card.innerHTML = `
                <div class="card-cover" style="padding-bottom:${aspectRatio}%">
                    <img src="${proxyImg(feed.coverUrl)}"
                         alt="${escHtml(feed.title)}"
                         loading="lazy"
                         style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover"
                         onerror="this.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'300\\' height=\\'300\\' fill=\\'%23f0f0f0\\'><rect width=\\'300\\' height=\\'300\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23ccc\\' text-anchor=\\'middle\\' dy=\\'.3em\\' font-size=\\'40\\'>📕</text></svg>')">
                    <span class="card-type ${typeClass}">${typeLabel}</span>
                </div>
                <div class="card-body">
                    <div class="card-title">${escHtml(feed.title || '无标题')}</div>
                    <div class="card-meta">
                        <div class="card-author">
                            <img class="card-avatar" src="${proxyImg(feed.avatar)}" alt="" loading="lazy"
                                 onerror="this.style.background='var(--border)';this.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'22\\' height=\\'22\\'><circle cx=\\'11\\' cy=\\'11\\' r=\\'11\\' fill=\\'%23ddd\\'/></svg>')">
                            <span class="card-nickname">${escHtml(feed.nickname)}</span>
                        </div>
                        <span class="card-likes">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            ${escHtml(feed.likedCount)}
                        </span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openModal(feed));
            waterfall.appendChild(card);
        });
    }

    function escHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ---------- Filter ----------
    function applyFilter() {
        let filtered = allFeeds;
        if (currentFilter !== 'all') {
            filtered = filtered.filter(f => f.type === currentFilter);
        }
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            filtered = filtered.filter(f =>
                (f.title || '').toLowerCase().includes(query) ||
                (f.nickname || '').toLowerCase().includes(query)
            );
        }
        renderCards(filtered);
    }

    // ---------- Search ----------
    function handleSearch() {
        const query = searchInput.value.trim();
        if (!query) {
            applyFilter();
            return;
        }
        // First try local filter
        applyFilter();
        // If no results locally, offer to search on XHS
        const localResults = allFeeds.filter(f =>
            (f.title || '').toLowerCase().includes(query.toLowerCase()) ||
            (f.nickname || '').toLowerCase().includes(query.toLowerCase())
        );
        if (localResults.length === 0) {
            empty.innerHTML = `
                <div class="empty-icon">🔍</div>
                <p>本地没有匹配 "${escHtml(query)}" 的内容</p>
                <a href="https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(query)}" 
                   target="_blank" rel="noopener"
                   style="display:inline-block;margin-top:16px;padding:10px 24px;background:var(--red);color:white;border-radius:20px;text-decoration:none;font-weight:600">
                    去小红书搜索 →
                </a>
            `;
            empty.style.display = 'block';
        }
    }

    // ---------- Modal ----------
    function openModal(feed) {
        const xhsUrl = `https://www.xiaohongshu.com/explore/${feed.id}`;
        const searchUrl = `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(feed.title || '')}`;
        const typeLabel = feed.type === 'video' ? '🎬 视频笔记' : '📷 图文笔记';

        modalBody.innerHTML = `
            <img class="modal-cover" src="${proxyImg(feed.coverUrl)}" alt="${escHtml(feed.title)}"
                 onerror="this.style.display='none'">
            <div class="modal-content">
                <div class="modal-title">${escHtml(feed.title || '无标题')}</div>
                <div class="modal-author-row">
                    <img class="modal-avatar" src="${proxyImg(feed.avatar)}" alt=""
                         onerror="this.style.background='var(--border)'">
                    <div class="modal-author-info">
                        <div class="modal-nickname">${escHtml(feed.nickname)}</div>
                        <div class="modal-type-badge">${typeLabel}</div>
                    </div>
                </div>
                <div class="modal-stats">
                    <div class="modal-stat">
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span class="count">${escHtml(feed.likedCount)}</span> 赞
                    </div>
                </div>
                <div class="modal-actions">
                    <a class="modal-btn primary" href="${xhsUrl}" target="_blank" rel="noopener">
                        📕 在小红书查看
                    </a>
                    <a class="modal-btn secondary" href="${searchUrl}" target="_blank" rel="noopener">
                        🔍 搜索相关
                    </a>
                </div>
            </div>
        `;

        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ---------- Events ----------
    themeToggle.addEventListener('click', toggleTheme);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    searchInput.addEventListener('input', () => {
        if (!searchInput.value.trim()) applyFilter();
    });
    searchBtn.addEventListener('click', handleSearch);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            applyFilter();
        });
    });

    // ---------- Init ----------
    initTheme();
    loadData();
})();
