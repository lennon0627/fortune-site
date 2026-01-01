// 九星気学データ
const kyuseiData = {
    '一白水星': {
        color: '白・黒',
        direction: '北',
        description: '静かな水の流れのように、柔軟で適応力があります。思慮深く、周囲の状況を読む力に優れています。',
        traits: '知性的で洞察力が高く、人の心を理解する力があります。'
    },
    '二黒土星': {
        color: '黄色・茶色',
        direction: '南西',
        description: '大地のように温かく包容力があります。コツコツと努力を重ね、信頼を築いていくタイプです。',
        traits: '誠実で忍耐強く、周囲から慕われる存在です。'
    },
    '三碧木星': {
        color: '青・緑',
        direction: '東',
        description: '若木のように成長意欲が旺盛で、活発なエネルギーに満ちています。新しいことにチャレンジする勇気があります。',
        traits: '明るく元気で、周囲を活気づける存在です。'
    },
    '四緑木星': {
        color: '緑・青緑',
        direction: '南東',
        description: 'そよ風のように爽やかで、人との調和を大切にします。コミュニケーション能力が高く、人気者です。',
        traits: '社交的で優しく、多くの人から愛される魅力があります。'
    },
    '五黄土星': {
        color: '黄色',
        direction: '中央',
        description: '中心にある強いエネルギーを持ち、リーダーシップがあります。困難を乗り越える強さを持っています。',
        traits: 'パワフルで影響力が強く、周囲を引っ張る力があります。'
    },
    '六白金星': {
        color: '白・金',
        direction: '北西',
        description: '天の気を受けた高貴な存在で、責任感が強く、完璧主義です。目標に向かって真っ直ぐ進みます。',
        traits: '気品があり、理想が高く、リーダーとしての素質があります。'
    },
    '七赤金星': {
        color: '赤・金',
        direction: '西',
        description: '秋の実りのように豊かで、社交的です。楽しいことが好きで、人を惹きつける魅力があります。',
        traits: '明るく陽気で、コミュニケーション能力に優れています。'
    },
    '八白土星': {
        color: '白・茶色',
        direction: '北東',
        description: '山のようにどっしりと安定しており、強い意志を持っています。変化や改革を起こす力があります。',
        traits: '真面目で粘り強く、大きな目標を達成する力があります。'
    },
    '九紫火星': {
        color: '紫・赤',
        direction: '南',
        description: '太陽のように輝く存在で、華やかさがあります。直感力が鋭く、芸術的センスに優れています。',
        traits: '情熱的で魅力的、美的センスに優れています。'
    }
};

// 数秘術データ
const numerologyData = {
    1: {
        name: 'リーダー',
        description: '独立心が強く、パイオニア精神に溢れています。新しいことを始める力があり、目標に向かって突き進みます。',
        traits: ['リーダーシップ', '独創性', '決断力', '自信', '先駆者精神']
    },
    2: {
        name: '調和者',
        description: '協調性があり、周囲との調和を大切にします。繊細で優しく、人の気持ちを理解する力があります。',
        traits: ['協調性', '思いやり', '感受性', '外交的', 'パートナーシップ']
    },
    3: {
        name: 'クリエイター',
        description: '創造性が豊かで、表現力があります。明るく社交的で、人を楽しませる才能があります。',
        traits: ['創造性', '表現力', '楽観的', 'コミュニケーション能力', '芸術的']
    },
    4: {
        name: 'ビルダー',
        description: '堅実で責任感が強く、コツコツと努力を重ねます。安定を求め、確実に目標を達成します。',
        traits: ['堅実性', '組織力', '忍耐力', '責任感', '実用的']
    },
    5: {
        name: '冒険家',
        description: '自由を愛し、変化を楽しみます。好奇心旺盛で、多様な経験を求めます。',
        traits: ['自由', '冒険心', '適応力', '好奇心', '多才']
    },
    6: {
        name: '奉仕者',
        description: '愛情深く、人の世話をすることに喜びを感じます。調和とバランスを大切にします。',
        traits: ['愛情', '責任感', '調和', '癒し', '奉仕精神']
    },
    7: {
        name: '探求者',
        description: '知識と真実を求める探求者です。内面的で精神性が高く、分析力に優れています。',
        traits: ['知性', '直感', '分析力', '精神性', '探求心']
    },
    8: {
        name: 'パワー',
        description: '力強く、物質的な成功を手にする力があります。野心的で、大きな目標を達成します。',
        traits: ['野心', '実行力', 'リーダーシップ', '成功', '物質的豊かさ']
    },
    9: {
        name: '完成者',
        description: '人道的で、世界をより良くしたいという願いがあります。寛容で慈悲深い心を持っています。',
        traits: ['人道主義', '寛容', '理想主義', '直感', '完成']
    },
    11: {
        name: 'マスター直感',
        description: '高い直感力とスピリチュアルな感性を持っています。インスピレーションを人々に与えます。',
        traits: ['直感', 'スピリチュアル', 'インスピレーション', '理想主義', 'カリスマ']
    },
    22: {
        name: 'マスタービルダー',
        description: '大きな夢を現実にする力があります。実践的でありながら、ビジョナリーです。',
        traits: ['実現力', 'ビジョン', '実践性', 'リーダーシップ', '構築力']
    },
    33: {
        name: 'マスター教師',
        description: '無条件の愛と奉仕の精神を持っています。人々を癒し、導く使命があります。',
        traits: ['愛', '奉仕', '癒し', '教育', 'スピリチュアリティ']
    }
};

// 十干
const jikkan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 十二支
const junishi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
// 五行
const gogyou = {
    '木': ['甲', '乙', '寅', '卯'],
    '火': ['丙', '丁', '巳', '午'],
    '土': ['戊', '己', '辰', '戌', '丑', '未'],
    '金': ['庚', '辛', '申', '酉'],
    '水': ['壬', '癸', '子', '亥']
};

// フォーム送信
document.getElementById('fortuneForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const birthdate = document.getElementById('birthdate').value;
    const birthtime = document.getElementById('birthtime').value;
    const name = document.getElementById('name').value;
    
    if (!birthdate) {
        alert('生年月日を入力してください');
        return;
    }
    
    calculateFortune(birthdate, birthtime, name);
});

function calculateFortune(birthdate, birthtime, name) {
    const date = new Date(birthdate);
    
    // 九星気学
    const kyusei = calculateKyusei(date);
    displayKyusei(kyusei);
    
    // 数秘術
    const numerology = calculateNumerology(date, name);
    displayNumerology(numerology);
    
    // 四柱推命
    const shichu = calculateShichu(date, birthtime);
    displayShichu(shichu);
    
    // 総合運勢
    displayTotalFortune(kyusei, numerology, shichu);
    
    // 結果を表示
    document.querySelector('.fortune-card').style.display = 'none';
    document.getElementById('results').classList.remove('hidden');
    
    // スクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 九星気学計算
function calculateKyusei(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // 2月3日以前は前年として扱う
    let targetYear = year;
    if (month <= 1 || (month === 2 && date.getDate() < 4)) {
        targetYear--;
    }
    
    // 九星の計算（簡易版）
    const kyuseiList = [
        '一白水星', '二黒土星', '三碧木星', '四緑木星', '五黄土星',
        '六白金星', '七赤金星', '八白土星', '九紫火星'
    ];
    
    // 計算式: (11 - (西暦年 % 9)) % 9
    const index = (11 - (targetYear % 9)) % 9;
    
    return kyuseiList[index];
}

function displayKyusei(star) {
    const data = kyuseiData[star];
    document.getElementById('kyuseiStar').textContent = star;
    document.getElementById('kyuseiDesc').textContent = data.description + ' ' + data.traits;
    document.getElementById('kyuseiColor').textContent = data.color;
    document.getElementById('kyuseiDirection').textContent = data.direction;
}

// 数秘術計算
function calculateNumerology(date, name) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 生年月日の数字を合計
    let sum = 0;
    const dateStr = `${year}${month}${day}`;
    for (let char of dateStr) {
        sum += parseInt(char);
    }
    
    // マスターナンバーチェック
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        const digits = sum.toString().split('');
        sum = digits.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    
    return sum;
}

function displayNumerology(number) {
    const data = numerologyData[number];
    document.getElementById('numerologyNumber').textContent = number;
    document.getElementById('numerologyDesc').innerHTML = `
        <strong>${data.name}の数</strong><br>
        ${data.description}
    `;
    
    const traitsHtml = '<ul>' + data.traits.map(t => `<li>${t}</li>`).join('') + '</ul>';
    document.getElementById('numerologyTraits').innerHTML = traitsHtml;
}

// 四柱推命計算
function calculateShichu(date, birthtime) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 年柱
    const yearIndex = (year - 4) % 60;
    const yearKan = jikkan[yearIndex % 10];
    const yearShi = junishi[yearIndex % 12];
    
    // 月柱（簡易計算）
    const monthKan = jikkan[(year * 2 + month) % 10];
    const monthShi = junishi[(month + 1) % 12];
    
    // 日柱（簡易計算）
    const daysSince = Math.floor((date - new Date(1900, 0, 1)) / (1000 * 60 * 60 * 24));
    const dayIndex = daysSince % 60;
    const dayKan = jikkan[dayIndex % 10];
    const dayShi = junishi[dayIndex % 12];
    
    // 時柱
    let timeKan = '';
    let timeShi = '';
    if (birthtime) {
        const [hour] = birthtime.split(':').map(Number);
        const timeIndex = Math.floor((hour + 1) / 2) % 12;
        timeShi = junishi[timeIndex];
        timeKan = jikkan[(dayIndex * 2 + timeIndex) % 10];
    }
    
    // 五行分析
    const elements = analyzeElements(yearKan, yearShi, monthKan, monthShi, dayKan, dayShi, timeKan, timeShi);
    
    return {
        year: { kan: yearKan, shi: yearShi },
        month: { kan: monthKan, shi: monthShi },
        day: { kan: dayKan, shi: dayShi },
        time: birthtime ? { kan: timeKan, shi: timeShi } : null,
        elements: elements
    };
}

function analyzeElements(yearKan, yearShi, monthKan, monthShi, dayKan, dayShi, timeKan, timeShi) {
    const elementCount = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    const chars = [yearKan, yearShi, monthKan, monthShi, dayKan, dayShi];
    if (timeKan) chars.push(timeKan, timeShi);
    
    for (let element in gogyou) {
        for (let char of chars) {
            if (gogyou[element].includes(char)) {
                elementCount[element]++;
            }
        }
    }
    
    return elementCount;
}

function displayShichu(shichu) {
    // 四柱表示
    let pillarsHtml = `
        <div class="pillar">
            <span class="pillar-label">年柱</span>
            <span class="pillar-value">${shichu.year.kan}${shichu.year.shi}</span>
        </div>
        <div class="pillar">
            <span class="pillar-label">月柱</span>
            <span class="pillar-value">${shichu.month.kan}${shichu.month.shi}</span>
        </div>
        <div class="pillar">
            <span class="pillar-label">日柱</span>
            <span class="pillar-value">${shichu.day.kan}${shichu.day.shi}</span>
        </div>
    `;
    
    if (shichu.time) {
        pillarsHtml += `
            <div class="pillar">
                <span class="pillar-label">時柱</span>
                <span class="pillar-value">${shichu.time.kan}${shichu.time.shi}</span>
            </div>
        `;
    }
    
    document.getElementById('shichuPillars').innerHTML = pillarsHtml;
    
    // 五行バランス表示
    let elementsHtml = '';
    const elementNames = { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' };
    for (let element in shichu.elements) {
        if (shichu.elements[element] > 0) {
            elementsHtml += `<div class="element ${elementNames[element]}">${element}: ${shichu.elements[element]}</div>`;
        }
    }
    document.getElementById('shichuElements').innerHTML = elementsHtml;
    
    // 五行分析
    const dominantElement = Object.keys(shichu.elements).reduce((a, b) => 
        shichu.elements[a] > shichu.elements[b] ? a : b
    );
    
    const elementDesc = {
        '木': '成長と発展のエネルギーが強く、創造的で柔軟性があります。',
        '火': '情熱とエネルギーに満ち、積極的で明るい性格です。',
        '土': '安定と信頼のエネルギーを持ち、誠実で責任感があります。',
        '金': '正義感が強く、理性的で完璧主義的な面があります。',
        '水': '知恵と柔軟性を持ち、適応力に優れています。'
    };
    
    document.getElementById('shichuDesc').innerHTML = `
        あなたの命式では<strong>「${dominantElement}」</strong>のエネルギーが強く表れています。<br>
        ${elementDesc[dominantElement]}
    `;
}

// 総合運勢
function displayTotalFortune(kyusei, numerology, shichu) {
    const kyuseiName = kyusei;
    const numerologyName = numerologyData[numerology].name;
    
    const fortuneText = `
        あなたは<strong>${kyuseiName}</strong>の持つ柔軟性と、
        数秘術<strong>${numerology}番（${numerologyName}）</strong>の特性を併せ持っています。
        四柱推命では命式のバランスから、総合的に調和の取れた運勢を持っていることが分かります。<br><br>
        
        <strong>今日からできるアドバイス：</strong><br>
        ${kyuseiData[kyusei].direction}の方角を意識すると運気がアップします。
        ${kyuseiData[kyusei].color}の色を身につけると、さらに良い運気を引き寄せるでしょう。
        あなたの持つ${numerologyName}としての資質を活かし、周囲との調和を大切にしながら、
        自分らしく進んでいくことが開運への鍵となります。✨
    `;
    
    document.getElementById('totalFortune').innerHTML = fortuneText;
}

// リセット
function resetForm() {
    document.querySelector('.fortune-card').style.display = 'block';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('fortuneForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
