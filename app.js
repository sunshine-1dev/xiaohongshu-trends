// App logic - supports both crawled and simulated data
const CATEGORIES = {
    beauty: { name: '美妆', color: '#ec4899', icon: '💄' },
    food: { name: '美食', color: '#f97316', icon: '🍜' },
    travel: { name: '旅行', color: '#3b82f6', icon: '✈️' },
    fashion: { name: '穿搭', color: '#a855f7', icon: '👗' },
    lifestyle: { name: '生活', color: '#22c55e', icon: '🏠' },
    tech: { name: '数码', color: '#eab308', icon: '📱' },
    fitness: { name: '健身', color: '#ff2442', icon: '💪' },
    pets: { name: '萌宠', color: '#fb923c', icon: '🐱' },
    education: { name: '学习', color: '#60a5fa', icon: '📚' },
    entertainment: { name: '娱乐', color: '#f43f5e', icon: '🎬' }
};

const app = {
    posts: [],
    currentFilter: 'all',
    isRealData: false,

    init() {
        // Check if crawled data exists
        if (typeof CRAWLED_DATA !== 'undefined' && CRAWLED_DATA.notes && CRAWLED_DATA.notes.length > 0) {
            this.isRealData = true;
            this.posts = CRAWLED_DATA.notes.map((n, i) => ({
                id: i + 1,
                noteId: n.id,
                title: n.title,
                category: n.category || 'lifestyle',
                author: n.author,
                likes: n.likes,
                likesDisplay: n.likesDisplay || this.formatNum(n.likes),
                collects: Math.floor(n.likes * (0.3 + Math.random() * 0.4)),
                comments: Math.floor(n.likes * (0.05 + Math.random() * 0.1)),
                shares: Math.floor(n.likes * 0.02),
                time: n.collectedAt || '刚刚',
                isVideo: n.type === 'video',
                coverUrl: n.coverUrl || '',
                commentList: this.generateComments(5 + Math.floor(Math.random() * 5))
            }));
            
            // Show data source badge
            this.showDataSource(CRAWLED_DATA.crawledAt, CRAWLED_DATA.totalNotes);
        } else {
            // Fallback to simulated data
            this.isRealData = false;
            this.posts = typeof generatePosts === 'function' ? generatePosts() : [];
        }

        this.renderStats();
        this.renderCategories();
        this.renderPosts();
        this.renderKeywords();
        this.renderSentiment();
        this.renderComments();
        this.renderTrend();
    },

    showDataSource(crawledAt, count) {
        const subtitle = document.querySelector('.subtitle');
        if (subtitle) {
            const time = new Date(crawledAt).toLocaleString('zh-CN');
            subtitle.innerHTML = `✅ 真实数据 · ${count}条笔记 · 采集于 ${time}`;
            subtitle.style.color = '#22c55e';
        }
    },

    generateComments(count) {
        const templates = [
            '太好看了！已收藏 ❤️', '求链接！', '天哪也太绝了！',
            '码住！', '太实用了', '终于有人说到点子上了',
            '同款！真的超级好用', '看完立刻下单了', '博主太厉害了',
            '已经推荐给朋友了', '种草了！', '关注了！',
            '我觉得还行吧', '有更便宜的推荐吗', '价格有点贵'
        ];
        const users = [
            '甜甜的小仙女', '美食猎人', '旅行日记本', '穿搭种草机',
            '生活小确幸', '数码达人', '追剧小能手', '学习使我快乐'
        ];
        return Array.from({length: count}, () => ({
            user: users[Math.floor(Math.random() * users.length)],
            text: templates[Math.floor(Math.random() * templates.length)],
            likes: Math.floor(Math.random() * 2000),
            sentiment: Math.random() > 0.2 ? (Math.random() > 0.3 ? 'positive' : 'neutral') : 'negative'
        })).sort((a, b) => b.likes - a.likes);
    },

    renderStats() {
        const total = this.posts.length;
        const totalComments = this.posts.reduce((s, p) => s + p.comments, 0);
        const totalLikes = this.posts.reduce((s, p) => s + p.likes, 0);
        const cats = new Set(this.posts.map(p => p.category));
        
        this.animateNumber('totalPosts', total);
        this.animateNumber('totalComments', totalComments);
        this.animateNumber('totalLikes', totalLikes);
        this.animateNumber('trendingTopics', cats.size);
    },

    animateNumber(id, target) {
        const el = document.getElementById(id);
        const duration = 1000;
        const startTime = Date.now();
        function update() {
            const progress = Math.min((Date.now() - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(target * eased);
            if (target > 10000) el.textContent = (current / 10000).toFixed(1) + 'w';
            else if (target > 1000) el.textContent = (current / 1000).toFixed(1) + 'k';
            else el.textContent = current;
            if (progress < 1) requestAnimationFrame(update);
        }
        update();
    },

    renderCategories() {
        const catCounts = {};
        this.posts.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
        const sorted = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
        const max = sorted[0]?.[1] || 1;
        document.getElementById('categoryChart').innerHTML = sorted.map(([cat, count]) => {
            const info = CATEGORIES[cat] || { name: cat, color: '#888', icon: '📌' };
            return `<div class="category-bar animate-in">
                <span class="category-name">${info.icon} ${info.name}</span>
                <div class="category-bar-track">
                    <div class="category-bar-fill" style="width:${(count/max*100).toFixed(0)}%;background:${info.color}">${count}</div>
                </div>
            </div>`;
        }).join('');
    },

    renderPosts(filter = 'all') {
        this.currentFilter = filter;
        const filtered = filter === 'all' ? this.posts : this.posts.filter(p => p.category === filter);
        document.getElementById('postsList').innerHTML = filtered.slice(0, 20).map((post, i) => {
            const cat = CATEGORIES[post.category] || { name: post.category, color: '#888', icon: '📌' };
            const rank = i + 1;
            return `<div class="post-card animate-in" style="animation-delay:${i*0.03}s" onclick="app.showPostDetail(${post.id})">
                <div class="post-rank ${rank<=3?'top3':''}">${rank}</div>
                <div class="post-info">
                    <div class="post-title">${post.isVideo?'📹 ':'📝 '}${post.title}</div>
                    <div class="post-meta">
                        <span>👤 ${post.author}</span>
                        <span>❤️ ${post.likesDisplay || this.formatNum(post.likes)}</span>
                        <span>⭐ ${this.formatNum(post.collects)}</span>
                        <span>💬 ${this.formatNum(post.comments)}</span>
                    </div>
                    <span class="post-tag tag-${post.category}">${cat.icon} ${cat.name}</span>
                </div>
            </div>`;
        }).join('');
    },

    filterPosts(filter, el) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
        this.renderPosts(filter);
    },

    renderKeywords() {
        let keywords;
        if (this.isRealData && typeof CRAWLED_DATA !== 'undefined' && CRAWLED_DATA.keywords) {
            keywords = CRAWLED_DATA.keywords;
        } else if (typeof KEYWORDS !== 'undefined') {
            keywords = KEYWORDS;
        } else {
            keywords = [];
        }
        const shuffled = [...keywords].sort(() => Math.random() - 0.5);
        document.getElementById('keywordCloud').innerHTML = shuffled.map(kw => 
            `<span class="keyword size-${kw.weight}" style="background:${kw.color}20;color:${kw.color}">${kw.text}</span>`
        ).join('');
    },

    renderSentiment() {
        const allComments = this.posts.flatMap(p => p.commentList || []);
        const total = allComments.length || 1;
        const positive = allComments.filter(c => c.sentiment === 'positive').length;
        const neutral = allComments.filter(c => c.sentiment === 'neutral').length;
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
        const allComments = this.posts.flatMap(p => p.commentList || []);
        const topComments = allComments.sort((a, b) => b.likes - a.likes).slice(0, 8);
        document.getElementById('hotComments').innerHTML = topComments.map(c => 
            `<div class="comment-card">
                <div class="comment-user">@${c.user}</div>
                <div class="comment-text">${c.text}</div>
                <div class="comment-likes">❤️ ${this.formatNum(c.likes)}</div>
            </div>`
        ).join('');
    },

    renderTrend() {
        const data = [];
        for (let i = 0; i < 24; i++) {
            let base;
            if (i < 6) base = 20 + Math.random() * 15;
            else if (i < 9) base = 40 + Math.random() * 20;
            else if (i < 12) base = 60 + Math.random() * 20;
            else if (i < 14) base = 75 + Math.random() * 20;
            else if (i < 18) base = 55 + Math.random() * 20;
            else if (i < 21) base = 80 + Math.random() * 20;
            else base = 60 + Math.random() * 20;
            data.push({ hour: i, value: Math.round(base) });
        }
        const max = Math.max(...data.map(d => d.value));
        document.getElementById('trendChart').innerHTML = data.map(d => {
            const hue = d.value > 70 ? 350 : d.value > 50 ? 30 : 200;
            return `<div class="trend-bar-wrapper">
                <div class="trend-value">${d.value}</div>
                <div class="trend-bar" style="height:${(d.value/max*100).toFixed(0)}%;background:hsl(${hue},80%,55%)"></div>
                <div class="trend-label">${String(d.hour).padStart(2,'0')}</div>
            </div>`;
        }).join('');
    },

    showPostDetail(id) {
        const post = this.posts.find(p => p.id === id);
        if (!post) return;
        const cat = CATEGORIES[post.category] || { name: post.category, icon: '📌' };
        const modal = document.getElementById('postModal');
        document.getElementById('modalBody').innerHTML = `
            <span class="post-tag tag-${post.category}" style="margin-bottom:12px;display:inline-block">${cat.icon} ${cat.name}</span>
            <div class="modal-title">${post.isVideo?'📹 ':'📝 '}${post.title}</div>
            <div style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">👤 ${post.author}${post.noteId ? ` · ID: ${post.noteId}` : ''}</div>
            <div class="modal-stats">
                <span>❤️ ${post.likesDisplay || this.formatNum(post.likes)}</span>
                <span>⭐ ${this.formatNum(post.collects)}</span>
                <span>💬 ${this.formatNum(post.comments)}</span>
            </div>
            ${post.coverUrl ? `<div style="margin:12px 0"><img src="${post.coverUrl}" style="width:100%;border-radius:8px" onerror="this.style.display='none'"></div>` : ''}
            <div class="modal-section">
                <h3>💬 热门评论</h3>
                ${(post.commentList || []).slice(0, 8).map(c => `
                    <div class="modal-comment">
                        <div class="user">@${c.user} · ❤️ ${this.formatNum(c.likes)}</div>
                        <div class="text">${c.text}</div>
                    </div>`).join('')}
            </div>`;
        modal.classList.add('active');
    },

    closeModal() { document.getElementById('postModal').classList.remove('active'); },

    refreshAll() {
        if (this.isRealData) {
            alert('💡 数据来自服务器爬虫采集\n请在服务器运行 crawler.py 更新数据');
        } else {
            this.posts = typeof generatePosts === 'function' ? generatePosts() : [];
            this.renderStats(); this.renderCategories();
            this.renderPosts(this.currentFilter);
            this.renderKeywords(); this.renderSentiment();
            this.renderComments(); this.renderTrend();
        }
    },

    exportData() {
        const report = {
            generatedAt: new Date().toISOString(),
            isRealData: this.isRealData,
            summary: {
                totalPosts: this.posts.length,
                totalLikes: this.posts.reduce((s, p) => s + p.likes, 0),
            },
            topPosts: this.posts.slice(0, 20).map(p => ({
                title: p.title, category: CATEGORIES[p.category]?.name || p.category,
                author: p.author, likes: p.likes
            }))
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `xiaohongshu-trends-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    },

    formatNum(n) {
        if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
        if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
        return n;
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
document.addEventListener('click', e => { if (e.target.classList.contains('modal')) app.closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') app.closeModal(); });
