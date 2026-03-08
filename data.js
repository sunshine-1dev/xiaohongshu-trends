// Simulated data for Xiaohongshu trends
const CATEGORIES = {
    beauty: { name: '美妆', color: '#ec4899', icon: '💄' },
    food: { name: '美食', color: '#f97316', icon: '🍜' },
    travel: { name: '旅行', color: '#3b82f6', icon: '✈️' },
    fashion: { name: '穿搭', color: '#a855f7', icon: '👗' },
    lifestyle: { name: '生活', color: '#22c55e', icon: '🏠' },
    tech: { name: '数码', color: '#eab308', icon: '📱' },
    fitness: { name: '健身', color: '#ff2442', icon: '💪' },
    pets: { name: '萌宠', color: '#fb923c', icon: '🐱' },
    education: { name: '学习', color: '#60a5fa', icon: '📚' }
};

const USERNAMES = [
    '甜甜的小仙女', '美食猎人Lisa', '旅行日记本', '穿搭种草机', '生活小确幸',
    '数码小达人', '健身打卡girl', '猫咪铲屎官', '学习使我快乐', '化妆师Coco',
    '吃货本货', '背包客小李', '时尚博主Amy', '极简生活家', '科技测评师',
    '瑜伽小姐姐', '柴犬控', '考研加油站', '护肤心得', '烘焙日常',
    '环球旅行者', 'OOTD每日穿搭', '居家好物', '手机摄影师', 'Keep打卡',
    '猫奴日记', '英语学习笔记', '底妆教程', '减脂餐分享', '自驾游攻略'
];

function generatePosts() {
    const posts = [];
    const titles = {
        beauty: [
            '2026春季最火口红色号！这5支闭眼入不踩雷',
            '油皮亲妈！这款粉底液真的绝了 持妆12小时',
            '新手化妆必看！10分钟日常妆容教程',
            '黄皮显白发色推荐！染完同事都问我去哪做的',
            '眼影盘测评｜花西子vs完美日记 到底谁更值',
            '敏感肌护肤清单 用了3年的真心推荐',
            '素颜霜合集｜懒人必备 涂完直接出门',
            '遮瑕膏大横评！痘印、黑眼圈一次搞定'
        ],
        food: [
            '在家做米其林！零失败黑松露意面教程',
            '2026网红奶茶自制配方 比外面好喝100倍',
            '减脂期也能吃的炸鸡！空气炸锅版本超绝',
            '日式便当教程🍱 带饭上班被同事羡慕哭',
            '广州探店｜人均50吃到扶墙的粤菜馆',
            '一周早餐不重样｜每天5分钟搞定',
            '火锅底料测评｜海底捞vs大红袍vs名扬',
            '露营咖啡教程☕ 户外也要喝精品咖啡'
        ],
        travel: [
            '西藏自驾全攻略！318川藏线避坑指南',
            '日本樱花季🌸 2026最全赏樱地图',
            '云南小众秘境！99%的人都不知道的古村',
            '泰国清迈7天花费3000！穷游攻略来了',
            '新疆独库公路自驾｜此生必走一次的天路',
            '厦门3天2夜攻略 本地人推荐的路线',
            '冰岛极光之旅🌌 最全拍摄技巧分享',
            '成都周边露营地推荐 带帐篷说走就走'
        ],
        fashion: [
            '春季胶囊衣橱｜10件单品搞定30套搭配',
            '小个子女生穿搭法则！显高10cm不是梦',
            '2026早春流行趋势 这3个颜色必须有',
            '通勤穿搭一周不重样｜上班族必看',
            '平价饰品合集！均价30让你精致翻倍',
            '梨形身材穿搭指南 遮肉显瘦全靠它',
            '男生春季穿搭｜干净清爽的日系风格',
            '毕业照穿搭推荐 拍出人生最美证件照'
        ],
        lifestyle: [
            '独居女生的30个幸福感小物件',
            '极简收纳术！38㎡小公寓住出豪宅感',
            '每天坚持5个习惯 我的生活彻底改变了',
            '租房改造前后对比！花了500块焕然一新',
            '时间管理方法论｜从月薪5k到年薪50w',
            '周末宅家一整天vlog 慢节奏的快乐',
            '副业推荐！适合上班族的5个赚钱方式',
            '搬家打包技巧 这些东西千万别扔'
        ],
        tech: [
            'iPhone 18 Pro深度体验一个月 真实感受',
            '2026年最值得买的平板电脑TOP5',
            '新款MacBook Air M5评测 性能飞跃',
            '千元TWS耳机横评｜音质性价比之王是它',
            '智能家居全屋方案 花3000块打造科幻感',
            'Switch 2首发开箱！游戏体验如何',
            'NAS入门指南｜小白也能搭建私有云',
            '手机摄影技巧 夜景模式拍出单反效果'
        ],
        fitness: [
            '帕梅拉30天挑战 我的身材变化记录',
            '跑步入门完全指南 从0到5公里',
            '居家HIIT训练｜20分钟燃脂500大卡',
            '减脂不减肌！正确的饮食搭配方案',
            '瑜伽开肩开髋序列 办公室久坐必练',
            '增肌餐食谱分享 每天蛋白质摄入计划',
            '晨跑vs夜跑 到底什么时间运动最好',
            '体态矫正训练 圆肩驼背一个月改善'
        ],
        pets: [
            '布偶猫饲养全攻略 新手必看',
            '带狗狗去露营！宠物友好营地推荐',
            '猫咪驱虫时间表 一张图看懂',
            '金毛幼犬训练日记 从拆家到乖宝宝',
            '养猫一年花了多少钱？详细账单公开',
            '仓鼠笼造景教程 给鼠鼠一个小花园',
            '柯基犬日常vlog 屁股真的太可爱了',
            '流浪猫救助记录 从皮包骨到圆滚滚'
        ],
        education: [
            '考研英语85分经验帖 方法比努力重要',
            'AI时代必学的5个技能 不被淘汰指南',
            '雅思7.5备考心得 从5.5到高分的逆袭',
            'Python入门到精通 我推荐这条学习路线',
            '高效记笔记方法 一个月读完20本书',
            '公务员考试上岸经验 备考时间线分享',
            '自学设计入门 从零开始的UI/UX之路',
            '留学申请时间线 2026fall申请全攻略'
        ]
    };

    const categoryKeys = Object.keys(titles);
    let id = 1;

    categoryKeys.forEach(cat => {
        titles[cat].forEach((title, i) => {
            const likes = Math.floor(Math.random() * 50000) + 1000;
            const collects = Math.floor(likes * (0.3 + Math.random() * 0.5));
            const comments = Math.floor(likes * (0.05 + Math.random() * 0.15));
            
            posts.push({
                id: id++,
                title,
                category: cat,
                author: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
                likes,
                collects,
                comments,
                shares: Math.floor(comments * (0.2 + Math.random() * 0.5)),
                time: generateRandomTime(),
                isVideo: Math.random() > 0.6,
                commentList: generateComments(5 + Math.floor(Math.random() * 10))
            });
        });
    });

    return posts.sort((a, b) => b.likes - a.likes);
}

function generateRandomTime() {
    const hours = Math.floor(Math.random() * 24);
    const mins = Math.floor(Math.random() * 60);
    if (hours === 0) return `${mins}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    return `1天前`;
}

function generateComments(count) {
    const templates = [
        '太好看了！已收藏 ❤️',
        '求链接！在哪里买的？',
        '天哪也太绝了吧！',
        '码住！周末就去试试',
        '这也太实用了 马上安排',
        '终于有人说到点子上了',
        '拍得好好看 是什么滤镜呀',
        '同款！真的超级好用',
        '看完立刻下单了 期待效果',
        '博主太厉害了 学到了',
        '已经推荐给朋友了',
        '这个价格也太香了吧',
        '求更多分享！等更新',
        '做了同款 效果真的很好',
        '谢谢分享 非常有帮助！',
        '第一次见到这种做法 涨知识了',
        '好想去！已经加入心愿清单了',
        '笑死我了哈哈哈哈',
        '这不就是我本人吗',
        '手残党表示也能学会 开心',
        '关注了！期待更多内容',
        '试了一下真的有效！感谢博主',
        '建议全网推广！',
        '这个真的性价比超高',
        '种草了种草了！',
        '终于等到有人测评这个了',
        '我觉得还行吧 没有那么夸张',
        '个人觉得一般般',
        '有更便宜的替代品推荐吗',
        '价格有点贵了 观望中'
    ];

    const comments = [];
    for (let i = 0; i < count; i++) {
        comments.push({
            user: USERNAMES[Math.floor(Math.random() * USERNAMES.length)],
            text: templates[Math.floor(Math.random() * templates.length)],
            likes: Math.floor(Math.random() * 2000),
            sentiment: Math.random() > 0.2 ? (Math.random() > 0.3 ? 'positive' : 'neutral') : 'negative'
        });
    }
    return comments.sort((a, b) => b.likes - a.likes);
}

const KEYWORDS = [
    { text: '春季穿搭', weight: 5, color: '#a855f7' },
    { text: '减脂餐', weight: 4, color: '#22c55e' },
    { text: '日本旅行', weight: 5, color: '#3b82f6' },
    { text: 'iPhone18', weight: 4, color: '#eab308' },
    { text: '口红推荐', weight: 5, color: '#ec4899' },
    { text: '露营', weight: 3, color: '#22c55e' },
    { text: '空气炸锅', weight: 4, color: '#f97316' },
    { text: '考研', weight: 3, color: '#60a5fa' },
    { text: '帕梅拉', weight: 4, color: '#ff2442' },
    { text: '布偶猫', weight: 3, color: '#fb923c' },
    { text: '收纳', weight: 2, color: '#22c55e' },
    { text: '副业', weight: 3, color: '#eab308' },
    { text: 'OOTD', weight: 4, color: '#a855f7' },
    { text: '极简', weight: 2, color: '#22c55e' },
    { text: '显白', weight: 3, color: '#ec4899' },
    { text: '318川藏', weight: 4, color: '#3b82f6' },
    { text: 'Python', weight: 2, color: '#60a5fa' },
    { text: '奶茶', weight: 3, color: '#f97316' },
    { text: '瑜伽', weight: 3, color: '#ff2442' },
    { text: '智能家居', weight: 2, color: '#eab308' },
    { text: '粉底液', weight: 3, color: '#ec4899' },
    { text: '独居', weight: 2, color: '#22c55e' },
    { text: 'Switch2', weight: 3, color: '#eab308' },
    { text: '雅思', weight: 2, color: '#60a5fa' },
    { text: '柯基', weight: 2, color: '#fb923c' },
    { text: '樱花季', weight: 4, color: '#ec4899' },
    { text: '时间管理', weight: 2, color: '#22c55e' },
    { text: '平板推荐', weight: 2, color: '#eab308' },
    { text: '胶囊衣橱', weight: 3, color: '#a855f7' },
    { text: '咖啡', weight: 2, color: '#f97316' }
];

function generateTrendData() {
    const data = [];
    for (let i = 0; i < 24; i++) {
        // Simulate typical social media usage pattern
        let base;
        if (i >= 0 && i < 6) base = 20 + Math.random() * 15;      // Night low
        else if (i >= 6 && i < 9) base = 40 + Math.random() * 20;  // Morning rise
        else if (i >= 9 && i < 12) base = 60 + Math.random() * 20; // Morning peak
        else if (i >= 12 && i < 14) base = 75 + Math.random() * 20; // Lunch peak
        else if (i >= 14 && i < 18) base = 55 + Math.random() * 20; // Afternoon
        else if (i >= 18 && i < 21) base = 80 + Math.random() * 20; // Evening peak
        else base = 60 + Math.random() * 20;                         // Late evening
        
        data.push({
            hour: i,
            value: Math.round(base)
        });
    }
    return data;
}
