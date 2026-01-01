// ============================================================
// APIキー管理
// ============================================================

const API_KEY_STORAGE = 'gemini_api_key';

// APIキーの保存
function saveApiKey(apiKey) {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
}

// APIキーの取得
function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE);
}

// APIキーの削除
function clearApiKey() {
    localStorage.removeItem(API_KEY_STORAGE);
}

// モーダルの表示/非表示
function showModal() {
    document.getElementById('apiKeyModal').classList.add('show');
}

function hideModal() {
    document.getElementById('apiKeyModal').classList.remove('show');
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    const apiKey = getApiKey();
    
    // APIキーが保存されていない場合はモーダルを表示
    if (!apiKey) {
        showModal();
    }
    
    // 設定ボタンのクリックイベント
    document.getElementById('settingsBtn').addEventListener('click', function() {
        const currentKey = getApiKey();
        if (currentKey) {
            document.getElementById('apiKeyInput').value = currentKey;
        }
        showModal();
    });
    
    // APIキー表示/非表示の切り替え
    document.getElementById('toggleApiKeyVisibility').addEventListener('click', function() {
        const input = document.getElementById('apiKeyInput');
        if (input.type === 'password') {
            input.type = 'text';
            this.textContent = '🙈 非表示';
        } else {
            input.type = 'password';
            this.textContent = '👁️ 表示';
        }
    });
    
    // 保存ボタンのクリックイベント
    document.getElementById('saveApiKey').addEventListener('click', function() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            alert('APIキーを入力してください。');
            return;
        }
        
        // 簡単なバリデーション
        if (!apiKey.startsWith('AIza')) {
            alert('正しいGoogle Gemini APIキーを入力してください。\nAPIキーは "AIza" で始まります。');
            return;
        }
        
        saveApiKey(apiKey);
        alert('APIキーを保存しました! ✨');
        hideModal();
    });
    
    // 閉じるボタンのクリックイベント
    document.getElementById('closeModal').addEventListener('click', function() {
        hideModal();
    });
    
    // モーダル外クリックで閉じる
    document.getElementById('apiKeyModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideModal();
        }
    });
});

// ============================================================
// データ定義
// ============================================================

const kyuseiData = {
    '一白水星': { color: '白・黒', direction: '北', description: '柔軟で適応力があり、思慮深い性格です。水のように流れに身を任せながらも、内に強い意志を秘めています。' },
    '二黒土星': { color: '黄色・茶色', direction: '南西', description: '温かく包容力があり、努力家です。大地のように安定感があり、周囲から信頼されます。' },
    '三碧木星': { color: '青・緑', direction: '東', description: '成長意欲が旺盛で活発、行動力があります。若木のように伸びやかで、新しいことにチャレンジする精神を持っています。' },
    '四緑木星': { color: '緑・青緑', direction: '南東', description: '調和を大切にする社交家で、コミュニケーション能力に優れています。風のように爽やかで、人間関係を円滑にします。' },
    '五黄土星': { color: '黄色', direction: '中央', description: '強いリーダーシップと影響力を持ちます。中心に位置し、周囲を動かす力があります。' },
    '六白金星': { color: '白・金', direction: '北西', description: '責任感が強く完璧主義で、高い理想を持っています。金のように輝く品格と、強い意志を持っています。' },
    '七赤金星': { color: '赤・金', direction: '西', description: '社交的で人を惹きつける魅力があります。明るく楽しい雰囲気を作り出すのが得意です。' },
    '八白土星': { color: '白・茶色', direction: '北東', description: '意志が強く変化を起こす力があります。山のようにどっしりとした存在感と、改革の力を持っています。' },
    '九紫火星': { color: '紫・赤', direction: '南', description: '華やかで直感力が鋭く、芸術的センスに優れています。火のように情熱的で、人を照らす魅力があります。' }
};

const numerologyData = {
    1: { description: 'リーダーシップと独立心を持つ開拓者です。新しいことを始める力があり、自分の道を切り開いていきます。' },
    2: { description: '協調性と感受性を持つ平和主義者です。人との調和を大切にし、サポート役として力を発揮します。' },
    3: { description: '創造性と表現力に優れた楽天家です。明るく社交的で、人を楽しませる才能があります。' },
    4: { description: '安定と堅実さを重視する実務家です。コツコツと努力を重ね、確実に目標を達成します。' },
    5: { description: '自由と変化を求める冒険家です。好奇心旺盛で、新しい経験や出会いを楽しみます。' },
    6: { description: '愛と責任感を持つ奉仕者です。家族や仲間を大切にし、調和のある環境を作ります。' },
    7: { description: '知性と探究心を持つ思索家です。深く考え、真実を追求する姿勢を持っています。' },
    8: { description: '力と野心を持つ実現者です。物質的な成功を目指し、大きな目標を達成する力があります。' },
    9: { description: '博愛と理想を持つ完成者です。広い視野で物事を捉え、人類愛に満ちた行動をします。' },
    11: { description: 'マスターナンバー。直感力が鋭く、スピリチュアルな才能があります。インスピレーションを受け取る力があります。' },
    22: { description: 'マスターナンバー。大きな夢を実現する力があります。実務能力とビジョンを併せ持ちます。' }
};

const westernZodiacData = {
    '牡羊座': { emoji: '♈', description: '情熱的で行動力があり、リーダーシップを発揮します。チャレンジ精神旺盛で、新しいことに積極的です。' },
    '牡牛座': { emoji: '♉', description: '安定を好み、忍耐強く物事に取り組みます。美的センスがあり、心地よい環境を大切にします。' },
    '双子座': { emoji: '♊', description: 'コミュニケーション能力が高く、好奇心旺盛です。柔軟な思考で、多様な興味を持ちます。' },
    '蟹座': { emoji: '♋', description: '感受性が豊かで、家族や仲間を大切にします。共感力が高く、人の気持ちに寄り添います。' },
    '獅子座': { emoji: '♌', description: '堂々として自信があり、人を惹きつける魅力があります。創造性豊かで、表現力に優れています。' },
    '乙女座': { emoji: '♍', description: '几帳面で分析力があり、細部まで気を配ります。実用的で、役に立つことを好みます。' },
    '天秤座': { emoji: '♎', description: 'バランス感覚に優れ、調和を重視します。社交的で、美しいものを愛します。' },
    '蠍座': { emoji: '♏', description: '深い洞察力と情熱を持ち、物事の本質を見抜きます。集中力が高く、目標達成に向けて努力します。' },
    '射手座': { emoji: '♐', description: '自由を愛し、冒険心に満ちています。楽観的で、広い視野を持って行動します。' },
    '山羊座': { emoji: '♑', description: '責任感が強く、目標に向けて着実に進みます。忍耐強く、長期的な計画を立てるのが得意です。' },
    '水瓶座': { emoji: '♒', description: '独創的で革新的な考えを持ちます。個性を大切にし、人道的な視点で物事を見ます。' },
    '魚座': { emoji: '♓', description: '想像力豊かで感受性が強く、芸術的な才能があります。思いやり深く、人の痛みを理解します。' }
};

const goseiData = {
    '金のイルカ': { description: '明るく社交的で、人を楽しませる才能があります。チャレンジ精神旺盛で、新しいことに挑戦します。' },
    '銀のイルカ': { description: '柔軟性があり、環境に適応する力があります。感受性が豊かで、人の気持ちを理解します。' },
    '金の鳳凰': { description: '華やかで存在感があり、リーダーシップを発揮します。高い理想を持ち、それに向かって努力します。' },
    '銀の鳳凰': { description: '優雅で品格があり、美的センスに優れています。バランス感覚が良く、調和を大切にします。' },
    '金のインディアン': { description: '直感力が鋭く、自分の道を信じて進みます。独立心が強く、自由を大切にします。' },
    '銀のインディアン': { description: '観察力があり、状況を冷静に判断します。マイペースで、自分のリズムを大切にします。' },
    '金の時計': { description: '計画的で時間管理が得意です。責任感が強く、約束を守ります。' },
    '銀の時計': { description: '几帳面で細部まで気を配ります。分析力があり、効率的に物事を進めます。' },
    '金のカメレオン': { description: '適応力が高く、どんな環境でも力を発揮します。多才で、様々なことに興味を持ちます。' },
    '銀のカメレオン': { description: '柔軟な思考を持ち、変化を楽しみます。コミュニケーション能力に優れています。' },
    '金の羅針盤': { description: '目標を定めて着実に進む力があります。方向性を示すリーダーとして活躍します。' },
    '銀の羅針盤': { description: '探究心が強く、新しい知識を求めます。広い視野で物事を捉えます。' }
};

const kabbalahData = {
    1: { description: '始まりと創造の数。独立心が強く、新しいことを始める力があります。リーダーシップを発揮します。' },
    2: { description: '調和とバランスの数。協調性があり、人との関係を大切にします。サポート役として輝きます。' },
    3: { description: '表現と創造の数。芸術的才能があり、コミュニケーション能力に優れています。' },
    4: { description: '安定と基盤の数。堅実で信頼できる存在です。コツコツと努力を重ねます。' },
    5: { description: '変化と自由の数。冒険心があり、新しい経験を求めます。柔軟性に富んでいます。' },
    6: { description: '愛と責任の数。家族や仲間を大切にし、調和のある環境を作ります。' },
    7: { description: '神秘と知恵の数。深い洞察力があり、真実を追求します。スピリチュアルな面に興味があります。' },
    8: { description: '力と成功の数。物質的な豊かさを手にする力があります。野心的で目標達成に向けて努力します。' },
    9: { description: '完成と博愛の数。広い視野を持ち、人類愛に満ちています。精神的な成長を遂げます。' },
    11: { description: 'マスターナンバー。直感力が鋭く、スピリチュアルな才能があります。インスピレーションを受け取る力があります。' },
    22: { description: 'マスターナンバー。大きな夢を実現する力があります。実務能力とビジョンを併せ持ちます。' }
};

const ziweiData = {
    '紫微星': { description: '帝王の星。リーダーシップがあり、人を統率する力があります。高貴で品格があります。' },
    '天機星': { description: '知恵の星。頭の回転が速く、戦略的思考に優れています。計画を立てるのが得意です。' },
    '太陽星': { description: '光輝く星。明るく活発で、人を照らす存在です。正義感が強く、リーダーシップがあります。' },
    '武曲星': { description: '武勇の星。決断力があり、困難を乗り越える力があります。実行力に優れています。' },
    '天同星': { description: '福徳の星。温和で人当たりが良く、平和を愛します。幸運に恵まれやすい星です。' },
    '廉貞星': { description: '華麗な星。魅力的で人を惹きつける力があります。情熱的で、感情豊かです。' },
    '天府星': { description: '財庫の星。豊かさと安定をもたらします。管理能力があり、蓄財に長けています。' },
    '太陰星': { description: '月の星。優しく思いやりがあり、感受性が豊かです。内面的な美しさを持っています。' },
    '貪狼星': { description: '欲望の星。野心的で、目標達成に向けて努力します。多才で、様々なことに興味を持ちます。' },
    '巨門星': { description: '口舌の星。コミュニケーション能力があり、説得力があります。分析力に優れています。' },
    '天相星': { description: '宰相の星。サポート役として優れており、人を助ける力があります。調整能力に長けています。' },
    '天梁星': { description: '福寿の星。年長者のような落ち着きがあり、人に慕われます。保護する力があります。' },
    '七殺星': { description: '勇猛の星。勇敢で行動力があり、困難に立ち向かいます。独立心が強いです。' },
    '破軍星': { description: '開拓の星。変革を起こす力があり、新しいことに挑戦します。破壊と創造の力を持っています。' }
};

const tarotData = {
    '愚者': { description: '新しい冒険の始まり。純粋な心で、自由に人生を楽しむ年になります。' },
    '魔術師': { description: '創造と実現の年。あなたの才能や技術を活かし、目標を達成できます。' },
    '女教皇': { description: '直感と知恵の年。内なる声に耳を傾け、深い洞察を得られます。' },
    '女帝': { description: '豊かさと創造の年。愛情に恵まれ、実り多い一年になります。' },
    '皇帝': { description: '安定と権威の年。リーダーシップを発揮し、確固たる基盤を築きます。' },
    '教皇': { description: '伝統と学びの年。精神的な成長があり、導きを受けられます。' },
    '恋人': { description: '選択と調和の年。重要な決断をし、良い関係性を築きます。' },
    '戦車': { description: '勝利と前進の年。強い意志で目標に向かい、成功を収めます。' },
    '力': { description: '勇気と忍耐の年。内なる強さを発揮し、困難を乗り越えます。' },
    '隠者': { description: '内省と探求の年。自分自身を見つめ直し、真実を見つけます。' },
    '運命の輪': { description: '変化と転機の年。新しいサイクルが始まり、チャンスが訪れます。' },
    '正義': { description: 'バランスと公正の年。正しい判断をし、調和を保ちます。' },
    '吊るされた男': { description: '視点の転換の年。新しい見方で物事を捉え、成長します。' },
    '死神': { description: '変容と再生の年。終わりと始まりがあり、新しい自分に生まれ変わります。' },
    '節制': { description: '調和と統合の年。バランスを保ち、安定した生活を送ります。' },
    '悪魔': { description: '誘惑と執着の年。欲望に気をつけ、自由を取り戻すことが課題です。' },
    '塔': { description: '突然の変化の年。古いものが崩れ、新しい基盤を築きます。' },
    '星': { description: '希望とインスピレーションの年。夢に向かって進み、光が見えてきます。' },
    '月': { description: '直感と潜在意識の年。不安もありますが、内なる声を信じることが大切です。' },
    '太陽': { description: '成功と喜びの年。明るい未来が開け、幸せに満ちた一年になります。' },
    '審判': { description: '目覚めと再生の年。新しいステージに進み、使命を果たします。' },
    '世界': { description: '完成と達成の年。目標を達成し、満足感を得られます。新しいサイクルの準備も整います。' }
};

// 四柱推命用定数
const jikkan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const junishi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const gogyou = {
    '木': ['甲', '乙', '寅', '卯'],
    '火': ['丙', '丁', '巳', '午'],
    '土': ['戊', '己', '辰', '戌', '丑', '未'],
    '金': ['庚', '辛', '申', '酉'],
    '水': ['壬', '癸', '子', '亥']
};

// ============================================================
// メインロジック
// ============================================================

document.getElementById('fortuneForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const birthdate = document.getElementById('birthdate').value;
    const birthtime = document.getElementById('birthtime').value;
    const name = document.getElementById('name').value;
    calculateFortune(birthdate, birthtime, name);
});

function calculateFortune(birthdate, birthtime, name) {
    const date = new Date(birthdate);
    
    // 1. 九星気学
    const kyusei = calculateKyusei(date);
    displayKyusei(kyusei);
    
    // 2. 数秘術
    const num = calculateNumerology(date);
    displayNumerology(num);
    
    // 3. 四柱推命
    const shichu = calculateShichu(date, birthtime);
    displayShichu(shichu);

    // 4. 西洋占星術
    const western = calculateWestern(date);
    displayWestern(western);

    // 5. 五星三心
    const gosei = calculateGosei(date);
    displayGosei(gosei);

    // 6. カバラ
    displayKabbalah(num);

    // 7. 紫微斗数
    const ziwei = calculateZiwei(date, birthtime);
    displayZiwei(ziwei);

    // 8. タロット
    const tarot = calculateTarot(date);
    displayTarot(tarot);

    // 表示切り替え
    document.querySelector('.fortune-card').style.display = 'none';
    document.getElementById('results').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 総合運勢（テンプレートベース）
    displayTotal(kyusei, num, western, gosei, shichu, ziwei, tarot);
}

// ============================================================
// 計算関数
// ============================================================

function calculateKyusei(date) {
    let year = date.getFullYear();
    if (date.getMonth() < 1 || (date.getMonth() === 1 && date.getDate() < 4)) year--;
    
    const kyuseiList = ['九紫火星','一白水星','二黒土星','三碧木星','四緑木星','五黄土星','六白金星','七赤金星','八白土星'];
    let index = (10 - (year - 1900) % 9) % 9;
    return kyuseiList[index === 0 ? 0 : index];
}

function calculateNumerology(date) {
    const dateStr = date.getFullYear().toString() + 
                    (date.getMonth() + 1).toString() + 
                    date.getDate().toString();
    let sum = 0;
    for (let char of dateStr) {
        sum += parseInt(char);
    }
    while (sum > 11 && sum !== 22) {
        let newSum = 0;
        for (let char of sum.toString()) {
            newSum += parseInt(char);
        }
        sum = newSum;
    }
    return sum;
}

function calculateShichu(date, birthtime) {
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    // 年柱
    let ty = y;
    if (m < 2 || (m === 2 && d < 4)) ty--;
    const yIdx = (ty - 4) % 60;
    const yK = jikkan[yIdx % 10];
    const yS = junishi[yIdx % 12];

    // 月柱
    const mSIdx = (m % 12);
    const mS = junishi[mSIdx];
    const startK = ((yIdx % 5) * 2 + 2) % 10;
    const mK = jikkan[(startK + (mSIdx - 2 + 12) % 12) % 10];

    // 日柱
    const days = Math.floor((date - new Date(1900, 0, 1)) / 86400000);
    const dIdx = (days + 10) % 60;
    const dK = jikkan[dIdx % 10];
    const dS = junishi[dIdx % 12];

    // 時柱
    let tK = '', tS = '';
    if (birthtime) {
        const h = parseInt(birthtime.split(':')[0]);
        const tIdx = Math.floor((h + 1) / 2) % 12;
        tS = junishi[tIdx];
        tK = jikkan[((dIdx % 5) * 2 + tIdx) % 10];
    }

    // 五行集計
    const counts = { '木':0, '火':0, '土':0, '金':0, '水':0 };
    [yK, yS, mK, mS, dK, dS, tK, tS].forEach(c => {
        for(let g in gogyou) {
            if(gogyou[g].includes(c)) counts[g]++;
        }
    });

    return { 
        year: {k:yK, s:yS}, 
        month: {k:mK, s:mS}, 
        day: {k:dK, s:dS}, 
        time: tK ? {k:tK, s:tS} : null, 
        elements: counts 
    };
}

function calculateWestern(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '牡羊座';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '牡牛座';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座';
    if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '蟹座';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '獅子座';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '乙女座';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座';
    if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '蠍座';
    if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '山羊座';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座';
    return '魚座';
}

function calculateGosei(date) {
    const year = date.getFullYear();
    const types = [
        '金のイルカ', '銀のイルカ', '金の鳳凰', '銀の鳳凰',
        '金のインディアン', '銀のインディアン', '金の時計', '銀の時計',
        '金のカメレオン', '銀のカメレオン', '金の羅針盤', '銀の羅針盤'
    ];
    return types[year % 12];
}

function calculateZiwei(date, birthtime) {
    const stars = Object.keys(ziweiData);
    const index = (date.getFullYear() + date.getMonth() + date.getDate()) % stars.length;
    return stars[index];
}

function calculateTarot(date) {
    const cards = Object.keys(tarotData);
    const lifePathNum = calculateNumerology(date);
    const index = lifePathNum % cards.length;
    return cards[index];
}

// ============================================================
// 表示関数
// ============================================================

function displayKyusei(star) {
    document.getElementById('kyuseiStar').innerHTML = `<strong>${star}</strong>`;
    document.getElementById('kyuseiDesc').textContent = kyuseiData[star].description;
    document.getElementById('kyuseiColor').textContent = kyuseiData[star].color;
    document.getElementById('kyuseiDirection').textContent = kyuseiData[star].direction;
}

function displayNumerology(num) {
    document.getElementById('numerologyNumber').innerHTML = `<strong>運命数: ${num}</strong>`;
    document.getElementById('numerologyDesc').textContent = numerologyData[num].description;
}

function displayShichu(shichu) {
    let pillarsHtml = `
        <div class="pillar-row">
            <div class="pillar-label">年柱:</div>
            <div class="pillar-value">${shichu.year.k}${shichu.year.s}</div>
            <div class="pillar-label">月柱:</div>
            <div class="pillar-value">${shichu.month.k}${shichu.month.s}</div>
        </div>
        <div class="pillar-row">
            <div class="pillar-label">日柱:</div>
            <div class="pillar-value">${shichu.day.k}${shichu.day.s}</div>
    `;
    
    if (shichu.time) {
        pillarsHtml += `
            <div class="pillar-label">時柱:</div>
            <div class="pillar-value">${shichu.time.k}${shichu.time.s}</div>
        `;
    }
    pillarsHtml += '</div>';
    
    document.getElementById('shichuPillars').innerHTML = pillarsHtml;
    
    let elementsHtml = '<div class="element-bars">';
    for (let elem in shichu.elements) {
        const count = shichu.elements[elem];
        const width = (count / 8) * 100;
        elementsHtml += `
            <div class="element-item">
                <span class="element-name">${elem}:</span>
                <div class="element-bar">
                    <div class="element-fill" style="width: ${width}%"></div>
                </div>
                <span class="element-count">${count}</span>
            </div>
        `;
    }
    elementsHtml += '</div>';
    document.getElementById('shichuElements').innerHTML = elementsHtml;
    
    const dominant = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1])[0][0];
    document.getElementById('shichuDesc').textContent = 
        `五行では${dominant}の気が強く、バランスの取れた命式です。`;
}

function displayWestern(sign) {
    const data = westernZodiacData[sign];
    document.getElementById('westernSign').innerHTML = 
        `<strong>${data.emoji} ${sign}</strong>`;
    document.getElementById('westernDesc').textContent = data.description;
}

function displayGosei(type) {
    document.getElementById('goseiType').innerHTML = `<strong>${type}</strong>`;
    document.getElementById('goseiDesc').textContent = goseiData[type].description;
}

function displayKabbalah(num) {
    document.getElementById('kabbalahNumber').innerHTML = `<strong>カバラ数: ${num}</strong>`;
    document.getElementById('kabbalahDesc').textContent = kabbalahData[num].description;
}

function displayZiwei(star) {
    document.getElementById('ziweiStar').innerHTML = `<strong>${star}</strong>`;
    document.getElementById('ziweiDesc').textContent = ziweiData[star].description;
}

function displayTarot(card) {
    document.getElementById('tarotCard').innerHTML = `<strong>${card}</strong>`;
    document.getElementById('tarotDesc').textContent = tarotData[card].description;
}

// ============================================================
// 総合運勢テンプレート
// ============================================================

const fortuneTemplates = {
    kyuseiTraits: {
        '一白水星': { trait: '柔軟性と適応力', year: '流れに身を任せながらも、内なる意志を大切にする' },
        '二黒土星': { trait: '包容力と努力', year: '周囲の信頼を得て、安定した基盤を築く' },
        '三碧木星': { trait: '成長意欲と行動力', year: '新しいチャレンジで大きく飛躍する' },
        '四緑木星': { trait: '調和と社交性', year: '人間関係が開運の鍵となる' },
        '五黄土星': { trait: 'リーダーシップと影響力', year: '周囲を導く立場で力を発揮する' },
        '六白金星': { trait: '責任感と完璧主義', year: '高い理想の実現に向けて着実に前進する' },
        '七赤金星': { trait: '社交性と魅力', year: '人との出会いが幸運を呼び込む' },
        '八白土星': { trait: '意志の強さと変革力', year: '大きな変化を起こし、新たなステージへ進む' },
        '九紫火星': { trait: '直感力と芸術性', year: '情熱を注げることで輝きを放つ' }
    },
    
    numerologyTraits: {
        1: { trait: 'リーダーシップ', advice: '自分を信じて新しい道を切り開いてください' },
        2: { trait: '協調性', advice: '人との調和を大切にすることで道が開けます' },
        3: { trait: '創造性', advice: '表現力を活かして周囲を明るく照らしましょう' },
        4: { trait: '堅実さ', advice: 'コツコツと積み重ねることが成功への鍵です' },
        5: { trait: '自由と変化', advice: '新しい経験を恐れず、柔軟に対応しましょう' },
        6: { trait: '愛と責任', advice: '大切な人との絆を深めることで幸せが訪れます' },
        7: { trait: '探究心', advice: '深く考え、真実を追求する姿勢が実を結びます' },
        8: { trait: '実現力', advice: '野心的な目標に向かって力強く進んでください' },
        9: { trait: '博愛', advice: '広い視野で物事を捉え、人に尽くすことで運が開けます' },
        11: { trait: '直感力', advice: 'スピリチュアルな感性を信じて行動しましょう' },
        22: { trait: 'ビジョン', advice: '大きな夢を実現する力があなたにはあります' }
    },
    
    westernTraits: {
        '牡羊座': '情熱的に前進',
        '牡牛座': '安定を築きながら',
        '双子座': '柔軟に対応',
        '蟹座': '感情を大切に',
        '獅子座': '堂々と輝き',
        '乙女座': '細やかに配慮',
        '天秤座': 'バランスを保ち',
        '蠍座': '深く洞察し',
        '射手座': '自由に冒険',
        '山羊座': '着実に登り',
        '水瓶座': '革新的に',
        '魚座': '想像力豊かに'
    },
    
    goseiAdvice: {
        '金のイルカ': 'チャレンジ精神を大切にすることで、予想以上の成果が得られます。',
        '銀のイルカ': '柔軟な姿勢が幸運を引き寄せます。環境の変化を楽しんでください。',
        '金の鳳凰': '華やかな場面で活躍できる年です。自信を持って前に出ましょう。',
        '銀の鳳凰': '優雅さと品格を保ちながら、目標に向かって進んでください。',
        '金のインディアン': '直感を信じて行動することで、良い結果が得られます。',
        '銀のインディアン': 'マイペースを保ちながら、着実に前進していきましょう。',
        '金の時計': '計画的に物事を進めることで、大きな成功を手にできます。',
        '銀の時計': '細部への配慮が、予想外の評価につながります。',
        '金のカメレオン': 'どんな状況でも力を発揮できる年です。自信を持ってください。',
        '銀のカメレオン': '変化を楽しみながら、新しい可能性を探ってください。',
        '金の羅針盤': '明確な目標を持つことで、確実に前進できます。',
        '銀の羅針盤': '探究心を活かして、新しい知識や経験を積んでください。'
    },
    
    seasonalMessages: [
        { season: '春', message: '新しい出会いやチャンスが訪れる時期です。積極的に行動しましょう' },
        { season: '初夏', message: '活動的になれる時期です。エネルギーを存分に発揮してください' },
        { season: '夏', message: '情熱を燃やせることに集中できる時期です。思い切って挑戦しましょう' },
        { season: '秋', message: 'これまでの努力が実を結ぶ時期です。成果を楽しみましょう' },
        { season: '晩秋', message: '収穫の時期です。感謝の気持ちを大切にしてください' },
        { season: '冬', message: '内省と準備の時期です。来年に向けて力を蓄えてください' }
    ]
};

async function displayTotal(kyusei, num, western, gosei, shichu, ziwei, tarot) {
    console.log('総合運勢を生成中...', { kyusei, num, western, gosei });
    
    // ローディング表示
    document.getElementById('totalFortune').innerHTML = '<p style="text-align: center; color: #764ba2; font-weight: bold; animation: pulse 1.5s infinite;">✨ AIが総合運勢を鑑定中...</p>';
    
    try {
        console.log('🔍 API呼び出し開始');
        
        // localStorageからAPIキーを取得
        const GEMINI_API_KEY = getApiKey();
        
        if (!GEMINI_API_KEY) {
            throw new Error('APIキーが設定されていません。右上の⚙️ボタンからAPIキーを設定してください。');
        }
        
        // 各占術の結果情報を収集
        const kyuseiInfo = kyuseiData[kyusei];
        const numInfo = numerologyData[num];
        const westernInfo = westernZodiacData[western];
        const goseiInfo = goseiData[gosei];
        const ziweiInfo = ziweiData[ziwei];
        const tarotInfo = tarotData[tarot];
        
        // 四柱推命の五行分析
        const dominantElement = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1])[0];
        
        // AIへのプロンプト作成
        const prompt = `以下の占い結果を基に、2026年の総合運勢を温かみのある文章で書いてください。

【占い結果】
- 九星気学: ${kyusei} - ${kyuseiInfo.description}
  ラッキーカラー: ${kyuseiInfo.color}、方位: ${kyuseiInfo.direction}
  
- 数秘術: ${num} - ${numInfo.description}

- 四柱推命: 年柱${shichu.year.k}${shichu.year.s}、月柱${shichu.month.k}${shichu.month.s}、日柱${shichu.day.k}${shichu.day.s}
  五行バランス: ${dominantElement[0]}が${dominantElement[1]}で最も強い
  
- 西洋占星術: ${western} ${westernInfo.emoji} - ${westernInfo.description}

- 五星三心: ${gosei} - ${goseiInfo.description}

- 紫微斗数: ${ziwei} - ${ziweiInfo.description}

- 2026年のタロット: ${tarot} - ${tarotInfo.description}

【要件】
1. 親しみやすく、前向きな文章で書いてください
2. 具体的なアドバイスを含めてください
3. 2026年の運勢の流れや特徴的な時期について触れてください
4. 開運のヒントや注意点も盛り込んでください
5. HTML形式で、段落は<p>タグで囲み、重要な部分は<strong>タグで強調してください
6. 絵文字(✨、🌟など)を適度に使って華やかにしてください
7. 文章は400-600文字程度で、読みやすい長さにしてください`;

        console.log('📤 Google Gemini APIにリクエスト送信中...');
        
        // Google Gemini APIを呼び出し (gemini-proモデルを使用)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.9,
                    maxOutputTokens: 1500,
                }
            })
        });

        console.log('📥 レスポンス受信:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API エラーレスポンス:', errorText);
            
            // APIキーエラーの場合
            if (response.status === 400 || response.status === 401) {
                throw new Error('APIキーが正しくありません。右上の⚙️ボタンから正しいAPIキーを設定してください。');
            }
            
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ レスポンスデータ:', data);
        
        // レスポンスから文章を取得
        let fortune = '';
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
            const parts = data.candidates[0].content.parts;
            fortune = parts.map(part => part.text).join('');
            console.log('📝 生成された文章:', fortune.substring(0, 100) + '...');
        } else {
            console.warn('⚠️ 予期しないレスポンス形式:', data);
        }
        
        // 生成された文章を表示
        document.getElementById('totalFortune').innerHTML = fortune || '<p>総合運勢の生成に失敗しました。もう一度お試しください。</p>';
        console.log('✨ 総合運勢の生成完了');
        
    } catch (error) {
        console.error('❌ 総合運勢生成エラー:', error);
        console.error('❌ エラー詳細:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // ユーザーにエラー詳細を表示
        document.getElementById('totalFortune').innerHTML = `
            <p style="color: #f5576c; font-weight: bold;">総合運勢の生成中にエラーが発生しました</p>
            <p style="font-size: 0.95em; color: #666; margin-top: 10px;">${error.message}</p>
            <p style="font-size: 0.9em; color: #999; margin-top: 15px;">💡 右上の⚙️ボタンからGoogle Gemini APIキーを設定できます</p>
        `;
    }
}

function resetForm() {
    location.reload();
}
