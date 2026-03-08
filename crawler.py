#!/usr/bin/env python3
"""
小红书热点采集器 - 采集探索页热门笔记数据
"""
import re
import json
import time
import random
import subprocess
import urllib.request
import urllib.error
from datetime import datetime

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
]

def fetch_explore_page():
    """Fetch xiaohongshu explore page and extract SSR data"""
    url = 'https://www.xiaohongshu.com/explore'
    headers = {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    }
    
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"❌ Failed to fetch explore page: {e}")
        return None
    
    # Extract __INITIAL_STATE__
    match = re.search(r'__INITIAL_STATE__\s*=\s*({.*?})\s*</script>', html, re.DOTALL)
    if not match:
        print("❌ No INITIAL_STATE found")
        return None
    
    raw = match.group(1).replace(':undefined', ':null')
    try:
        data = json.loads(raw)
        return data
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
        return None


def extract_notes(data):
    """Extract note data from SSR state"""
    feeds = data.get('feed', {}).get('feeds', [])
    notes = []
    
    for feed in feeds:
        note_card = feed.get('noteCard', {})
        if not note_card:
            continue
        
        # Extract basic info
        title = note_card.get('displayTitle', '')
        user_info = note_card.get('user', {})
        interact_info = note_card.get('interactInfo', {})
        cover = note_card.get('cover', {})
        
        # Parse likes count
        likes_str = interact_info.get('likedCount', '0')
        likes = parse_count(likes_str)
        
        note = {
            'id': feed.get('id', ''),
            'title': title,
            'type': note_card.get('type', 'normal'),
            'author': user_info.get('nickName', user_info.get('nickname', '未知')),
            'authorId': user_info.get('userId', ''),
            'authorAvatar': user_info.get('avatar', ''),
            'likes': likes,
            'likesDisplay': likes_str,
            'coverUrl': cover.get('urlDefault', cover.get('url', '')),
            'category': guess_category(title),
            'collectedAt': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        }
        notes.append(note)
    
    return notes


def parse_count(s):
    """Parse display count string to number"""
    if isinstance(s, (int, float)):
        return int(s)
    s = str(s).strip()
    if '万' in s:
        s = s.replace('万', '').replace('+', '').strip()
        try:
            return int(float(s) * 10000)
        except:
            return 0
    try:
        return int(s.replace('+', ''))
    except:
        return 0


def guess_category(title):
    """Guess category from title keywords"""
    title = title.lower()
    categories = {
        'beauty': ['化妆', '口红', '粉底', '护肤', '眼影', '美白', '防晒', '精华', '面膜', '遮瑕', '染发', '发型', '美甲'],
        'food': ['美食', '做饭', '菜', '吃', '火锅', '奶茶', '咖啡', '烘焙', '甜品', '餐厅', '探店', '食', '粥', '饭'],
        'travel': ['旅行', '旅游', '攻略', '景点', '酒店', '民宿', '自驾', '露营', '打卡', '海边'],
        'fashion': ['穿搭', 'ootd', '搭配', '裙', '外套', '鞋', '包包', '时尚', '显瘦', '潮流', '衣服', '工资.*买'],
        'lifestyle': ['生活', '收纳', '租房', '装修', '家居', '独居', '断舍离', '极简', '日常', 'vlog'],
        'tech': ['手机', '电脑', 'iphone', 'mac', '耳机', '平板', '数码', '拍照', '相机', 'app'],
        'fitness': ['健身', '减脂', '减肥', '瑜伽', '跑步', '运动', '体重', '塑形', '增肌'],
        'pets': ['猫', '狗', '宠物', '萌宠', '柯基', '布偶', '铲屎'],
        'education': ['考研', '学习', '英语', '雅思', '考试', '课程', '自律', '备考', '读书'],
        'entertainment': ['追剧', '电影', '综艺', '明星', '网剧', '追星', '演员', '剧']
    }
    
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in title:
                return cat
    return 'lifestyle'


def fetch_multiple_times(rounds=3, delay=5):
    """Fetch explore page multiple times to get more diverse notes"""
    all_notes = {}
    
    for i in range(rounds):
        print(f"📡 采集第 {i+1}/{rounds} 轮...")
        data = fetch_explore_page()
        if data:
            notes = extract_notes(data)
            for note in notes:
                if note['id'] and note['id'] not in all_notes:
                    all_notes[note['id']] = note
            print(f"  ✅ 获取 {len(notes)} 条，累计 {len(all_notes)} 条（去重）")
        
        if i < rounds - 1:
            wait = delay + random.uniform(0, 3)
            print(f"  ⏳ 等待 {wait:.1f}s...")
            time.sleep(wait)
    
    return list(all_notes.values())


def generate_js_data(notes):
    """Generate JavaScript data file from crawled notes"""
    # Sort by likes
    notes.sort(key=lambda x: x['likes'], reverse=True)
    
    # Category stats
    cat_counts = {}
    for n in notes:
        cat_counts[n['category']] = cat_counts.get(n['category'], 0) + 1
    
    # Generate keywords from titles
    keywords = extract_keywords(notes)
    
    js = f"""// 小红书真实热点数据 - 采集时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// 数据来源: 小红书探索页 SSR 数据
// 共采集 {len(notes)} 条热门笔记

const CRAWLED_DATA = {{
    crawledAt: "{datetime.now().isoformat()}",
    totalNotes: {len(notes)},
    notes: {json.dumps(notes, ensure_ascii=False, indent=2)},
    categoryStats: {json.dumps(cat_counts, ensure_ascii=False, indent=2)},
    keywords: {json.dumps(keywords, ensure_ascii=False, indent=2)}
}};
"""
    return js


def extract_keywords(notes):
    """Extract keywords from note titles"""
    import re
    
    # Common stop words
    stop_words = set('的了是在不我有就人都也这个你她他们它要会到说去做没可以么还好被让和跟想看很多大小')
    
    word_freq = {}
    for note in notes:
        # Simple Chinese word extraction (2-4 char patterns)
        words = re.findall(r'[\u4e00-\u9fff]{2,4}', note['title'])
        for w in words:
            if w[0] not in stop_words and w not in stop_words:
                word_freq[w] = word_freq.get(w, 0) + 1
    
    # Get top keywords
    sorted_kw = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:30]
    
    colors = ['#ff2442', '#ec4899', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#fb923c', '#60a5fa']
    
    keywords = []
    max_freq = sorted_kw[0][1] if sorted_kw else 1
    for text, freq in sorted_kw:
        weight = min(5, max(1, int(freq / max_freq * 5) + 1))
        keywords.append({
            'text': text,
            'weight': weight,
            'color': random.choice(colors),
            'count': freq
        })
    
    return keywords


def upload_to_github(js_content, notes):
    """Upload data to GitHub repo"""
    import base64
    
    token = subprocess.run(["gh", "auth", "token"], capture_output=True, text=True).stdout.strip()
    repo = "sunshine-1dev/xiaohongshu-trends"
    
    def api(method, path, data=None):
        url = f"https://api.github.com{path}"
        body = json.dumps(data).encode() if data else None
        req = urllib.request.Request(url, data=body, method=method)
        req.add_header("Authorization", f"token {token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    
    # Get current state
    ref = api("GET", f"/repos/{repo}/git/ref/heads/main")
    current_sha = ref["object"]["sha"]
    commit = api("GET", f"/repos/{repo}/git/commits/{current_sha}")
    tree_sha = commit["tree"]["sha"]
    
    # Create blob for data.js
    b64 = base64.b64encode(js_content.encode()).decode()
    blob = api("POST", f"/repos/{repo}/git/blobs", {"content": b64, "encoding": "base64"})
    
    # Create tree
    tree = api("POST", f"/repos/{repo}/git/trees", {
        "base_tree": tree_sha,
        "tree": [{"path": "data.js", "mode": "100644", "type": "blob", "sha": blob["sha"]}]
    })
    
    # Create commit
    new_commit = api("POST", f"/repos/{repo}/git/commits", {
        "message": f"📊 update: crawled {len(notes)} notes at {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "tree": tree["sha"],
        "parents": [current_sha]
    })
    
    # Update ref
    api("PATCH", f"/repos/{repo}/git/refs/heads/main", {"sha": new_commit["sha"]})
    print(f"✅ Uploaded to GitHub: {new_commit['sha'][:8]}")


def main():
    print("📕 小红书热点采集器启动")
    print("=" * 50)
    
    # Crawl
    notes = fetch_multiple_times(rounds=3, delay=5)
    
    if not notes:
        print("❌ 未采集到任何数据")
        return
    
    print(f"\n📊 采集完成! 共 {len(notes)} 条笔记")
    print(f"📂 类别分布:")
    cat_counts = {}
    for n in notes:
        cat_counts[n['category']] = cat_counts.get(n['category'], 0) + 1
    for cat, count in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {cat}: {count}")
    
    print(f"\n🔥 热门笔记 Top 5:")
    notes.sort(key=lambda x: x['likes'], reverse=True)
    for i, n in enumerate(notes[:5]):
        print(f"  {i+1}. [{n['likesDisplay']}赞] {n['title']}")
    
    # Generate JS
    js_content = generate_js_data(notes)
    
    # Save locally
    with open('/tmp/xiaohongshu-trends/data.js', 'w') as f:
        f.write(js_content)
    print(f"\n💾 本地保存: /tmp/xiaohongshu-trends/data.js")
    
    # Upload to GitHub
    print("\n📤 上传到 GitHub...")
    try:
        upload_to_github(js_content, notes)
    except Exception as e:
        print(f"❌ Upload failed: {e}")


if __name__ == '__main__':
    main()
