// ==========================================
// 1. 定数・データ定義
// ==========================================
const jikkan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const junishi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const gogyouMap = {
    '木': ['甲', '乙', '寅', '卯'], '火': ['丙', '丁', '巳', '午'],
    '土': ['戊', '己', '辰', '戌', '丑', '未'], '金': ['庚', '辛', '申', '酉'],
    '水': ['壬', '癸', '子', '亥']
};

// ==========================================
// 2. 初期化処理
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initSelects();
    document.getElementById('fortuneForm').addEventListener('submit', handleFortune);
});

function initSelects() {
    const y = document.getElementById('birthYear'), m = document.getElementById('birthMonth'), d = document.getElementById('birthDay');
    for (let i = 2026; i >= 1920; i--) y.add(new Option(i, i));
    for (let i = 1; i <= 12; i++) m.add(new Option(i, i));
    for (let i = 1; i <= 31; i++) d.add(new Option(i, i));
    const h = document.getElementById('birthHour'), min = document.getElementById('birthMinute');
    for (let i = 0; i < 24; i++) h.add(new Option(i, i));
    for (let i = 0; i < 60; i++) min.add(new Option(i, i));
}

// ==========================================
// 3. メインロジック
// ==========================================
async function handleFortune(e) {
    e.preventDefault();
    const data = {
        year: parseInt(document.getElementById('birthYear').value),
        month: parseInt(document.getElementById('birthMonth').value),
        day: parseInt(document.getElementById('birthDay').value),
        hour: document.getElementById('birthHour').value,
        name: document.getElementById('name').value,
        gender: document.querySelector('input[name="gender"]:checked').value
    };

    const seed = data.year + data.month + data.day + data.name;
    const shichu = calculateShichu(data);
    const score = calculateScore(shichu, data);

    renderResults(shichu, score, data, seed);
}

// 改善4: 四柱推命の重み付け
function calculateShichu(d) {
    // 簡易万年暦ロジック（実際はライブラリ推奨だが汎用化）
    const baseDate = new Date(1900, 0, 31);
    const targetDate = new Date(d.year, d.month - 1, d.day);
    const diffDays = Math.floor((targetDate - baseDate) / 86400000);

    const dIdx = (diffDays + 10) % 60;
    const dK = jikkan[dIdx % 10], dS = junishi[dIdx % 12];
    const mS = junishi[(d.month + 1) % 12]; // 簡易月支

    const counts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    [dK, dS, mS].forEach((c, idx) => {
        for (let g in gogyouMap) {
            if (gogyouMap[g].includes(c)) {
                // 改善4: 月支（idx=2）を2倍の重みに
                counts[g] += (idx === 2) ? 2 : 1;
            }
        }
    });
    return { pillars: `${dK}${dS}`, counts };
}

// 改善6: スコアの適正化 (30-100)
function calculateScore(shichu, d) {
    let raw = 50 + (shichu.counts['木'] * 5); // 簡易計算
    return Math.min(100, Math.max(30, raw));
}

// 改善5: 決定的な文章生成
function getDeterministicText(seed, array) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    return array[Math.abs(hash) % array.length];
}

function renderResults(shichu, score, data, seed) {
    document.getElementById('results').classList.remove('hidden');
    
    // レーダーチャート描画（Chart.js）
    const ctx = document.getElementById('gogyouChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['木', '火', '土', '金', '水'],
            datasets: [{
                label: '五行バランス',
                data: Object.values(shichu.counts),
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea'
            }]
        }
    });

    document.getElementById('totalScoreDisplay').innerText = score + "点";
    
    const messages = [
        "今年は「開拓」の年です。新しい一歩が大きな実りを生みます。",
        "「調和」が鍵となる年です。周囲との協力を惜しまないでください。",
        "「結実」の時期です。これまでの努力が形になります。"
    ];
    document.getElementById('totalFortune').innerHTML = `<p>${getDeterministicText(seed, messages)}</p>`;
    
    // コピーテキスト生成
    document.getElementById('copyText').value = `【鑑定結果】\n生年月日: ${data.year}/${data.month}/${data.day}\n運勢スコア: ${score}\n五行: ${JSON.stringify(shichu.counts)}`;
}