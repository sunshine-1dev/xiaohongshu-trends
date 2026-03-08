// App logic
const app = {
    posts: [],
    currentFilter: 'all',

    init() {
        this.posts = generatePosts();
        this.renderStats();
        this.renderCategories();
        this.renderPosts();
        this.renderKeywords();
        this.renderSentiment();
        this.renderComments();
        this.renderTrend();
    },

    renderStats() {
        const total = this.posts.length;
        const totalComments = this.posts.reduce((s, p) => s + p.comments, 0);
        const totalLikes = this.posts.reduce((s, p) => s + p.likes, 0);
        
        this.animateNumber('totalPosts', total);
        this.animateNumber('totalComments', totalComments);
        this.animateNumber('totalLikes', totalLikes);
        this.animateNumber('trendingTopics', Object.keys(CATEGORIES).length);
    },

    animateNumber(id, target) {
        const el = document.getElementById(id);
        const duration = 1000;
        const start = 0;
        const startTime = Date.now();

        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (target - start) * eased);
            
            if (target > 10000) {
                el.textContent = (current / 10000).toFixed(1) + 'w';
            } else if (target > 1000) {
                el.textContent = (current / 1000).toFixed(1) + 'k';
            } else {
                el.textContent = current;
            }
            
            if (progress < 1) requestAnimationFrame(update);
        }
        update();
    },

    renderCategories() {
        const catCounts = {};
        this.posts.forEach(p => {
            catCounts[p.category] = (catCounts[p.category] || 0) + 1;
        });

        const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
        const max = sorted[0][1];
        const chart = document.getElementById('categoryChart');
        
        chart.innerHTML = sorted.map(([cat, count]) => {
            const info = CATEGORIES[cat];
            const width = (count / max * 100).toFixed(0);
            return `
                <div class="category-bar animate-in">
                    <span class="category-name">${info.icon} ${info.name}</span>
                    <div class="category-bar-track">
                        <div class="category-bar-fill" style="width: ${width}%; background: ${info.color}">
                            ${count}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderPosts(filter = 'all') {
        this.currentFilter = filter;
        const filtered = filter === 'all' ? this.posts : this.posts.filter(p => p.category === filter);
        const list = document.getElementById('postsList');
        
        list.innerHTML = filtered.slice(0, 20).map((post, i) => {
            const cat = CATEGORIES[post.category];
            const rank = i + 1;
            return `
                <div class="post-card animate-in" style="animation-delay: ${i * 0.03}s" onclick="app.showPostDetail(${post.id})">
                    <div class="post-rank ${rank <= 3 ? 'top3' : ''}">${rank}</div>
                    <div class="post-info">
                        <div class="post-title">${post.isVideo ? '📹 ' : '📝 '}${post.title}</div>
                        <div class="post-meta">
                            <span>👤 ${post.author}</span>
                            <span>❤️ ${this.formatNum(post.likes)}</span>
                            <span>⭐ ${this.formatNum(post.collects)}</span>
                            <span>💬 ${this.formatNum(post.comments)}</span>
                            <span>🕐 ${post.time}</span>
                        </div>
                        <span class="post-tag tag-${post.category}">${cat.icon} ${cat.name}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    filterPosts(filter, el) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        this.renderPosts(filter);
    },

    renderKeywords() {
        const cloud = document.getElementById('keywordCloud');
        // Shuffle keywords
        const shuffled = [...KEYWORDS].sort(() => Math.random() - 0.5);
        
        cloud.innerHTML = shuffled.map(kw => `
            <span class="keyword size-${kw.weight}" 
                  style="background: ${kw.color}20; color: ${kw.color}"
                  onclick="app.searchKeyword('${kw.text}')">
                ${kw.text}
            </span>
        `).join('');
    },

    renderSentiment() {
        const allComments = this.posts.flatMap(p => p.commentList);
        const total = allComments.length;
        const positive = allComments.filter(c => c.sentiment === 'positive').length;
        const neutral = allComments.filter(c => c.sentiment === 'neutral').length;
        const negative = total - positive - neutral;

        const posP = (positive / total * 100).toFixed(0);
        const neuP = (neutral / total * 100).toFixed(0);
        const negP = (100 - posP - neuP);

        document.getElementById('sentimentPositive').style.width = posP + '%';
        document.getElementById('sentimentNeutral').style.width = neuP + '%';
        document.getElementById('sentimentNegative').style.width = negP + '%';
        document.getElementById('posPercent').textContent = posP + '%';
        document.getElementById('neuPercent').textContent = neuP + '%';
        document.getElementById('negPercent').textContent = negP + '%';
    },

    renderComments() {
        const allComments = this.posts.flatMap(p => p.commentList);
        const topComments = allComments.sort((a, b) => b.likes - a.likes).slice(0, 8);
        const container = document.getElementById('hotComments');

        container.innerHTML = topComments.map(c => `
            <div class="comment-card">
                <div class="comment-user">@${c.user}</div>
                <div class="comment-text">${c.text}</div>
                <div class="comment-likes">❤️ ${this.formatNum(c.likes)}</div>
            </div>
        `).join('');
    },

    renderTrend() {
        const data = generateTrendData();
        const max = Math.max(...data.map(d => d.value));
        const chart = document.getElementById('trendChart');

        chart.innerHTML = data.map(d => {
            const height = (d.value / max * 100).toFixed(0);
            const hue = d.value > 70 ? 350 : d.value > 50 ? 30 : 200;
            return `
                <div class="trend-bar-wrapper">
                    <div class="trend-value">${d.value}</div>
                    <div class="trend-bar" style="height: ${height}%; background: hsl(${hue}, 80%, 55%)"></div>
                    <div class="trend-label">${String(d.hour).padStart(2, '0')}</div>
                </div>
            `;
        }).join('');
    },

    showPostDetail(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;

        const cat = CATEGORIES[post.category];
        const modal = document.getElementById('postModal');
        const body = document.getElementById('modalBody');

        body.innerHTML = `
            <span class="post-tag tag-${post.category}" style="margin-bottom: 12px; display: inline-block">${cat.icon} ${cat.name}</span>
            <div class="modal-title">${post.isVideo ? '📹 ' : '📝 '}${post.title}</div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px">
                👤 ${post.author} · ${post.time}
            </div>
            <div class="modal-stats">
                <span>❤️ ${this.formatNum(post.likes)} 点赞</span>
                <span>⭐ ${this.formatNum(post.collects)} 收藏</span>
                <span>💬 ${post.comments} 评论</span>
                <span>🔗 ${post.shares} 分享</span>
            </div>
            <div class="modal-section">
                <h3>📊 互动数据分析</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px">
                    <div style="padding: 10px; background: var(--bg); border-radius: 8px; text-align: center">
                        <div style="font-size: 20px; font-weight: 700; color: var(--red)">${(post.collects / post.likes * 100).toFixed(1)}%</div>
                        <div style="font-size: 12px; color: var(--text-secondary)">收藏率</div>
                    </div>
                    <div style="padding: 10px; background: var(--bg); border-radius: 8px; text-align: center">
                        <div style="font-size: 20px; font-weight: 700; color: var(--blue)">${(post.comments / post.likes * 100).toFixed(1)}%</div>
                        <div style="font-size: 12px; color: var(--text-secondary)">评论率</div>
                    </div>
                </div>
            </div>
            <div class="modal-section">
                <h3>💬 热门评论 (${post.commentList.length})</h3>
                ${post.commentList.slice(0, 8).map(c => `
                    <div class="modal-comment">
                        <div class="user">@${c.user} · ❤️ ${this.formatNum(c.likes)}</div>
                        <div class="text">${c.text}</div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.classList.add('active');
    },

    closeModal() {
        document.getElementById('postModal').classList.remove('active');
    },

    refreshAll() {
        this.posts = generatePosts();
        this.renderStats();
        this.renderCategories();
        this.renderPosts(this.currentFilter);
        this.renderKeywords();
        this.renderSentiment();
        this.renderComments();
        this.renderTrend();
    },

    exportData() {
        const report = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalPosts: this.posts.length,
                totalLikes: this.posts.reduce((s, p) => s + p.likes, 0),
                totalComments: this.posts.reduce((s, p) => s + p.comments, 0),
                totalCollects: this.posts.reduce((s, p) => s + p.collects, 0)
            },
            topPosts: this.posts.slice(0, 20).map(p => ({
                title: p.title,
                category: CATEGORIES[p.category].name,
                author: p.author,
                likes: p.likes,
                collects: p.collects,
                comments: p.comments
            })),
            categoryDistribution: Object.entries(
                this.posts.reduce((acc, p) => {
                    acc[CATEGORIES[p.category].name] = (acc[CATEGORIES[p.category].name] || 0) + 1;
                    return acc;
                }, {})
            ).sort((a, b) => b[1] - a[1])
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xiaohongshu-trends-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },

    searchKeyword(keyword) {
        alert(`🔍 搜索关键词: "${keyword}"\n\n提示: 接入真实API后可以根据关键词采集相关笔记`);
    },

    formatNum(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n;
    }
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Close modal on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        app.closeModal();
    }
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') app.closeModal();
});
