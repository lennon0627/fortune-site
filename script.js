// ============================================================
// データ定義
// ============================================================

// プルダウンの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeDateSelects();
    initializeTimeSelects();
});

// ============================================================
// UIユーティリティ（アクセシビリティ / UX改善）
// ============================================================

const el = {
    form: null,
    error: null,
    year: null,
    month: null,
    day: null,
    hour: null,
    minute: null,
    name: null,
    genderRadios: null,
    genderOptions: null,
};

document.addEventListener('DOMContentLoaded', function() {
    // 参照をキャッシュ
    el.form = document.getElementById('fortuneForm');
    el.error = document.getElementById('formError');
    el.year = document.getElementById('birthYear');
    el.month = document.getElementById('birthMonth');
    el.day = document.getElementById('birthDay');
    el.hour = document.getElementById('birthHour');
    el.minute = document.getElementById('birthMinute');
    el.name = document.getElementById('name');
    el.genderRadios = document.querySelectorAll('input[name="gender"]');
    el.genderOptions = document.querySelectorAll('.gender-option');

    // 性別の見た目（:has を使わず JS でクラス付与）
    el.genderRadios.forEach(r => r.addEventListener('change', syncGenderCheckedUI));
    syncGenderCheckedUI();

    // URLパラメータ / LocalStorage から復元
    restoreInputsFromUrlOrStorage();
});

function setFormError(message, focusEl) {
    if (!el.error) return;
    el.error.textContent = message;
    el.error.classList.add('is-visible');
    if (focusEl && typeof focusEl.focus === 'function') {
        focusEl.focus({ preventScroll: true });
    }
    // 少し上にスクロールして見えるように
    const top = el.form?.getBoundingClientRect()?.top ?? 0;
    window.scrollTo({ top: window.scrollY + top - 20, behavior: 'smooth' });
}

function clearFormError() {
    if (!el.error) return;
    el.error.textContent = '';
    el.error.classList.remove('is-visible');
}

function syncGenderCheckedUI() {
    document.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('is-checked'));
    const checked = document.querySelector('input[name="gender"]:checked');
    if (checked) {
        const wrapper = checked.closest('.gender-option');
        if (wrapper) wrapper.classList.add('is-checked');
    }
}

function restoreInputsFromUrlOrStorage() {
    // 1) URLパラメータ優先
    const params = new URLSearchParams(location.search);
    const birth = params.get('birth');   // YYYY-MM-DD
    const time = params.get('time');     // HH:MM
    const gender = params.get('gender'); // male/female
    const name = params.get('name');

    if (birth) {
        const [y, m, d] = birth.split('-').map(v => parseInt(v, 10));
        if (y && m && d) {
            el.year.value = String(y);
            el.month.value = String(m);
            updateDayOptions();
            el.day.value = String(d);
        }
    }
    if (time) {
        const [hh, mm] = time.split(':');
        if (hh != null && mm != null) {
            el.hour.value = hh;
            el.minute.value = mm;
        }
    }
    if (gender === 'male' || gender === 'female') {
        const radio = document.querySelector(`input[name="gender"][value="${gender}"]`);
        if (radio) radio.checked = true;
        syncGenderCheckedUI();
    }
    if (name && el.name) el.name.value = name;

    // 2) URL指定がなければ LocalStorage
    if (!birth && !time && !gender && !name) {
        try {
            const saved = JSON.parse(localStorage.getItem('fortune:lastInputs') || 'null');
            if (saved?.birth) {
                const [y, m, d] = saved.birth.split('-').map(v => parseInt(v, 10));
                if (y && m && d) {
                    el.year.value = String(y);
                    el.month.value = String(m);
                    updateDayOptions();
                    el.day.value = String(d);
                }
            }
            if (saved?.time) {
                const [hh, mm] = saved.time.split(':');
                el.hour.value = hh;
                el.minute.value = mm;
            }
            if (saved?.gender) {
                const radio = document.querySelector(`input[name="gender"][value="${saved.gender}"]`);
                if (radio) radio.checked = true;
                syncGenderCheckedUI();
            }
            if (saved?.name && el.name) el.name.value = saved.name;
        } catch (_) {}
    }
}

function persistInputsToStorage(birthdate, birthtime, name, gender) {
    try {
        localStorage.setItem('fortune:lastInputs', JSON.stringify({
            birth: birthdate,
            time: birthtime || '',
            name: name || '',
            gender: gender || '',
            savedAt: Date.now()
        }));
    } catch (_) {}
}

function initializeDateSelects() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    
    // 年の選択肢を生成（1900年〜現在）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // 月の選択肢を生成
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    
    // 日の選択肢を生成（初期値は31日まで）
    updateDayOptions();
    
    // 年・月が変更されたら日の選択肢を更新
    yearSelect.addEventListener('change', updateDayOptions);
    monthSelect.addEventListener('change', updateDayOptions);
}

function updateDayOptions() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    
    const year = parseInt(yearSelect.value) || 2000;
    const month = parseInt(monthSelect.value) || 1;
    
    // 選択された年月の最終日を取得
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 現在選択されている日を保存
    const currentDay = parseInt(daySelect.value);
    
    // 日の選択肢をクリア
    daySelect.innerHTML = '<option value="">日</option>';
    
    // 新しい選択肢を生成
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
    
    // 以前選択されていた日が有効なら再選択
    if (currentDay && currentDay <= daysInMonth) {
        daySelect.value = currentDay;
    }
}

function initializeTimeSelects() {
    const hourSelect = document.getElementById('birthHour');
    const minuteSelect = document.getElementById('birthMinute');
    
    // 時の選択肢を生成
    for (let hour = 0; hour < 24; hour++) {
        const option = document.createElement('option');
        option.value = hour.toString().padStart(2, '0');
        option.textContent = hour;
        hourSelect.appendChild(option);
    }
    
    // 分の選択肢を生成（1分刻み）
    for (let minute = 0; minute < 60; minute++) {
        const option = document.createElement('option');
        option.value = minute.toString().padStart(2, '0');
        option.textContent = minute;
        minuteSelect.appendChild(option);
    }
}

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

// 十二支の定義
const etoNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const etoKanji = ['ね', 'うし', 'とら', 'う', 'たつ', 'み', 'うま', 'ひつじ', 'さる', 'とり', 'いぬ', 'い'];
const etoAnimals = ['ねずみ年', 'うし年', 'とら年', 'うさぎ年', 'たつ年', 'へび年', 'うま年', 'ひつじ年', 'さる年', 'とり年', 'いぬ年', 'いのしし年'];

// 節入り日時（二十四節気）の詳細データ
// 2026年の節入り日時（時間まで考慮）
const setsunyu2026 = [
    { month: 1, day: 6, hour: 0, minute: 50 },   // 小寒
    { month: 2, day: 4, hour: 6, minute: 27 },   // 立春（年の切り替わり）
    { month: 3, day: 6, hour: 6, minute: 31 },   // 啓蟄
    { month: 4, day: 5, hour: 5, minute: 48 },   // 清明
    { month: 5, day: 6, hour: 4, minute: 21 },   // 立夏
    { month: 6, day: 6, hour: 2, minute: 10 },   // 芒種
    { month: 7, day: 7, hour: 23, minute: 20 },  // 小暑
    { month: 8, day: 8, hour: 3, minute: 54 },   // 立秋
    { month: 9, day: 8, hour: 1, minute: 51 },   // 白露
    { month: 10, day: 8, hour: 22, minute: 47 }, // 寒露
    { month: 11, day: 7, hour: 19, minute: 4 },  // 立冬
    { month: 12, day: 7, hour: 13, minute: 17 }  // 大雪
];

// 西洋占星術の星座境界線（時間考慮版）
const zodiacBoundaries2026 = [
    { sign: '山羊座', endMonth: 1, endDay: 20, endHour: 4, endMinute: 1 },
    { sign: '水瓶座', endMonth: 2, endDay: 18, endHour: 18, endMinute: 13 },
    { sign: '魚座', endMonth: 3, endDay: 20, endHour: 17, endMinute: 33 },
    { sign: '牡羊座', endMonth: 4, endDay: 20, endHour: 4, endMinute: 56 },
    { sign: '牡牛座', endMonth: 5, endDay: 21, endHour: 4, endMinute: 9 },
    { sign: '双子座', endMonth: 6, endDay: 21, endHour: 12, endMinute: 24 },
    { sign: '蟹座', endMonth: 7, endDay: 23, endHour: 3, endMinute: 30 },
    { sign: '獅子座', endMonth: 8, endDay: 23, endHour: 10, endMinute: 26 },
    { sign: '乙女座', endMonth: 9, endDay: 23, endHour: 7, endMinute: 50 },
    { sign: '天秤座', endMonth: 10, endDay: 23, endHour: 17, endMinute: 15 },
    { sign: '蠍座', endMonth: 11, endDay: 22, endHour: 14, endMinute: 36 },
    { sign: '射手座', endMonth: 12, endDay: 22, endHour: 3, endMinute: 44 }
];

// 2026年の年運（年盤九星）
const year2026Kyusei = '七赤金星';

// 2026年の干支（丙午）
const year2026Eto = '午'; // 十二支のみ

// 九星の相生相剋関係
const kyuseiCompatibility = {
    '一白水星': { '一白水星': 0.7, '二黒土星': 0.5, '三碧木星': 0.8, '四緑木星': 0.8, '五黄土星': 0.5, '六白金星': 0.9, '七赤金星': 0.9, '八白土星': 0.5, '九紫火星': 0.6 },
    '二黒土星': { '一白水星': 0.5, '二黒土星': 0.7, '三碧木星': 0.5, '四緑木星': 0.5, '五黄土星': 0.8, '六白金星': 0.8, '七赤金星': 0.8, '八白土星': 0.8, '九紫火星': 0.9 },
    '三碧木星': { '一白水星': 0.8, '二黒土星': 0.5, '三碧木星': 0.7, '四緑木星': 0.8, '五黄土星': 0.5, '六白金星': 0.5, '七赤金星': 0.5, '八白土星': 0.5, '九紫火星': 0.9 },
    '四緑木星': { '一白水星': 0.8, '二黒土星': 0.5, '三碧木星': 0.8, '四緑木星': 0.7, '五黄土星': 0.5, '六白金星': 0.5, '七赤金星': 0.5, '八白土星': 0.5, '九紫火星': 0.9 },
    '五黄土星': { '一白水星': 0.5, '二黒土星': 0.8, '三碧木星': 0.5, '四緑木星': 0.5, '五黄土星': 0.7, '六白金星': 0.8, '七赤金星': 0.8, '八白土星': 0.8, '九紫火星': 0.9 },
    '六白金星': { '一白水星': 0.9, '二黒土星': 0.8, '三碧木星': 0.5, '四緑木星': 0.5, '五黄土星': 0.8, '六白金星': 0.7, '七赤金星': 0.8, '八白土星': 0.8, '九紫火星': 0.6 },
    '七赤金星': { '一白水星': 0.9, '二黒土星': 0.8, '三碧木星': 0.5, '四緑木星': 0.5, '五黄土星': 0.8, '六白金星': 0.8, '七赤金星': 0.7, '八白土星': 0.8, '九紫火星': 0.6 },
    '八白土星': { '一白水星': 0.5, '二黒土星': 0.8, '三碧木星': 0.5, '四緑木星': 0.5, '五黄土星': 0.8, '六白金星': 0.8, '七赤金星': 0.8, '八白土星': 0.7, '九紫火星': 0.9 },
    '九紫火星': { '一白水星': 0.6, '二黒土星': 0.9, '三碧木星': 0.9, '四緑木星': 0.9, '五黄土星': 0.9, '六白金星': 0.6, '七赤金星': 0.6, '八白土星': 0.9, '九紫火星': 0.7 }
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
    clearFormError();
    
    // プルダウンから値を取得
    const year = document.getElementById('birthYear').value;
    const month = document.getElementById('birthMonth').value;
    const day = document.getElementById('birthDay').value;
    const hour = document.getElementById('birthHour').value;
    const minute = document.getElementById('birthMinute').value;
    const name = document.getElementById('name').value;
    const gender = document.querySelector('input[name="gender"]:checked');
    
    // 必須項目のチェック
    if (!year || !month || !day) {
        setFormError('生年月日を選択してください。', el.year);
        return;
    }
    
    if (!gender) {
        setFormError('性別を選択してください。', document.getElementById('genderMale'));
        return;
    }
    
    // 時刻の入力チェック（片方だけ入力されている場合）
    if ((hour && !minute) || (!hour && minute)) {
        setFormError('出生時刻は「時」と「分」の両方を入力してください。不明な場合は両方とも空欄のままにしてください。', el.hour);
        return;
    }
    
    // 日付文字列を作成（YYYY-MM-DD形式）
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    
    // 時刻文字列を作成（HH:MM形式）
    let birthtime = '';
    if (hour && minute) {
        birthtime = `${hour}:${minute}`;
    }
    
    // 入力を保存（次回の利便性）
    persistInputsToStorage(birthdate, birthtime, name, gender.value);

    // ローディング表示
    showLoading();
    
    // 少し遅延を入れて計算開始（ローディング演出）
    setTimeout(() => {
        calculateFortune(birthdate, birthtime, name, gender.value);
        hideLoading();
    }, 800);
});

function calculateFortune(birthdate, birthtime, name, gender) {
    const date = new Date(birthdate);
    
    // 1. 九星気学
    const kyusei = calculateKyusei(date);
    displayKyusei(kyusei);
    
    // 2. 数秘術
    const num = calculateNumerology(date);
    displayNumerology(num);
    
    // 3. 四柱推命（時間考慮版）
    const shichu = calculateShichu(date, birthtime);
    displayShichu(shichu);

    // 4. 西洋占星術（時間考慮版）
    const western = calculateWestern(date, birthtime);
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
    
    // 9. 干支
    const eto = calculateEto(date);

    // 表示切り替え
    document.querySelector('.fortune-card').style.display = 'none';
    document.getElementById('results').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 総合運勢
    displayTotal(kyusei, num, western, gosei, shichu, ziwei, tarot);
    
    // スコアリングと順位計算
    displayRanking(kyusei, num, western, gosei, shichu, ziwei, tarot, eto, gender);
    
    // コピー用テキストを生成
    generateCopyText(kyusei, num, western, gosei, shichu, ziwei, tarot, birthdate, birthtime, name, gender, eto);
}

// コピー用テキストを生成
function generateCopyText(kyusei, num, western, gosei, shichu, ziwei, tarot, birthdate, birthtime, name, gender, eto) {
    const kyuseiInfo = kyuseiData[kyusei];
    const numInfo = numerologyData[num];
    const westernInfo = westernZodiacData[western];
    const goseiInfo = goseiData[gosei];
    const ziweiInfo = ziweiData[ziwei];
    const tarotInfo = tarotData[tarot];
    const dominantElement = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1])[0];
    
    const genderText = gender === 'male' ? '男性' : '女性';
    
    // スコア計算
    const scores = calculateScores(kyusei, num, western, gosei, shichu, ziwei, tarot, eto, gender);
    const rawScore = scores.etoSign + scores.kyusei + scores.numerology + 
                     scores.western + scores.shichu + scores.gosei + scores.ziwei;
    const totalScore = normalizeScore(rawScore);
    const ranking = calculateRankingPosition(kyusei, num, western, gosei, shichu, ziwei, eto, totalScore);
    
    // 表示用のランキングテキスト
    let rankingText = '';
    if (ranking.percentile <= 1) {
        rankingText = 'トップクラス';
    } else if (ranking.percentile <= 80) {
        rankingText = `上位${Math.round(ranking.percentile)}%`;
    } else {
        rankingText = `下位${Math.round(100 - ranking.percentile)}%`;
    }
    
    let copyText = `【占い結果】2026年版\n`;
    if (name) {
        copyText += `お名前: ${name}\n`;
    }
    copyText += `性別: ${genderText}\n`;
    copyText += `生年月日: ${birthdate}`;
    if (birthtime) {
        copyText += ` ${birthtime}（時間考慮版）`;
    }
    copyText += `\n干支: ${eto}\n\n`;
    
    copyText += `━━━━━━━━━━━━━━━━━━━━\n`;
    copyText += `🌟 2026年総合運勢ランキング\n`;
    copyText += `干支×星座: ${eto} × ${western}\n\n`;
    copyText += `【スコア内訳】\n`;
    copyText += `干支×星座: ${scores.etoSign}点 / 15点\n`;
    copyText += `九星気学（年運）: ${scores.kyusei}点 / 20点\n`;
    copyText += `数秘術: ${scores.numerology}点 / 15点\n`;
    copyText += `西洋占星術: ${scores.western}点 / 15点\n`;
    copyText += `四柱推命: ${scores.shichu}点 / 25点\n`;
    copyText += `五星三心: ${scores.gosei}点 / 5点\n`;
    copyText += `紫微斗数: ${scores.ziwei}点 / 5点\n\n`;
    copyText += `総合得点: ${totalScore}点 / 100点\n`;
    copyText += `総合ランキング: ${rankingText}\n`;
    copyText += `運勢レベル: ${getStarRating(100 - ranking.percentile)}\n`;
    copyText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    copyText += `🌟 九星気学: ${kyusei}\n`;
    copyText += `${kyuseiInfo.description}\n`;
    copyText += `ラッキーカラー: ${kyuseiInfo.color}\n`;
    copyText += `ラッキー方位: ${kyuseiInfo.direction}\n`;
    copyText += `※2026年の年盤九星は${year2026Kyusei}です\n\n`;
    
    copyText += `🔢 数秘術: 運命数${num}\n`;
    copyText += `${numInfo.description}\n\n`;
    
    copyText += `🎋 四柱推命（節入り時間考慮版）\n`;
    copyText += `年柱: ${shichu.year.k}${shichu.year.s}\n`;
    copyText += `月柱: ${shichu.month.k}${shichu.month.s}\n`;
    copyText += `日柱: ${shichu.day.k}${shichu.day.s}\n`;
    if (shichu.time) {
        copyText += `時柱: ${shichu.time.k}${shichu.time.s}\n`;
    }
    copyText += `五行バランス: ${dominantElement[0]}が${dominantElement[1]}で最も強い\n`;
    
    // 空亡情報
    if (scores.kubouPenalty) {
        copyText += `⚠️ 2026年は空亡（天中殺）の年です。試練の年ですが、乗り越えれば大きな成長があります。\n`;
    }
    copyText += `\n`;
    
    copyText += `♈ 西洋占星術: ${western} ${westernInfo.emoji}`;
    if (birthtime) {
        copyText += `（時間考慮版）`;
    }
    copyText += `\n${westernInfo.description}\n\n`;
    
    copyText += `🎭 五星三心占い: ${gosei}\n`;
    copyText += `${goseiInfo.description}\n\n`;
    
    copyText += `🔯 カバラ占術: カバラ数${num}\n`;
    const kabbalahInfo = kabbalahData[num];
    copyText += `${kabbalahInfo.description}\n\n`;
    
    copyText += `🟣 紫微斗数: ${ziwei}\n`;
    copyText += `${ziweiInfo.description}\n\n`;
    
    copyText += `🃏 年運タロット（2026年）: ${tarot}\n`;
    copyText += `${tarotInfo.description}\n`;
    copyText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    copyText += `上記の占い結果を基に、私の運勢を詳しく教えてください。

【重要ポイント】
私の五行バランスでは「${dominantElement[0]}」が${dominantElement[1]}個で最も強く出ています。
この要素が私の性格、適職、人間関係、健康面にどう影響しているか、専門的な視点で分析してください。

【鑑定内容】
1.「これまでの人生」と「これからの人生」を、命式・数・星・方位の流れを統合して、人生の物語として伝えてください。
・人生の転機年
・天職・晩年運
・魂のテーマ(使命)

2. 2026年の運勢と月別バイオリズム(仕事・金運・吉方位)

3. 最終メッセージ`;
    
    document.getElementById('copyText').value = copyText;

    // 結果を保存
    try { localStorage.setItem('fortune:lastResult', copyText); } catch (_) {}
    
    // コピーボタンのイベントリスナー
    document.getElementById('copyBtn').onclick = function() {
        const textarea = document.getElementById('copyText');
        const textToCopy = textarea.value;
        // Clipboard API優先（https環境 / localhost で有効）
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(textToCopy).catch(() => {
                textarea.select();
                document.execCommand('copy');
            });
        } else {
            textarea.select();
            document.execCommand('copy');
        }
        
        // ボタンのテキストを一時的に変更
        const originalText = this.innerHTML;
        this.innerHTML = '✅ コピーしました!';
        this.style.background = 'linear-gradient(135deg, #34a853 0%, #0f9d58 100%)';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.background = '';
        }, 2000);
    };
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
    
    // 出生時刻の取得（時間単位の判定のため）
    let birthHour = 12; // デフォルトは正午
    let birthMinute = 0;
    if (birthtime) {
        const timeParts = birthtime.split(':');
        birthHour = parseInt(timeParts[0]);
        birthMinute = parseInt(timeParts[1]) || 0;
    }

    // 年柱（立春で切り替わる - 時間考慮）
    let ty = y;
    const risshun = setsunyu2026[1]; // 立春
    if (m < risshun.month || 
        (m === risshun.month && d < risshun.day) ||
        (m === risshun.month && d === risshun.day && 
         (birthHour < risshun.hour || (birthHour === risshun.hour && birthMinute < risshun.minute)))) {
        ty--;
    }
    
    const yIdx = (ty - 4) % 60;
    const yK = jikkan[yIdx % 10];
    const yS = junishi[yIdx % 12];

    // 月柱（節入りで切り替わる - 時間考慮）
    let adjustedMonth = m;
    let adjustedYear = ty; // 月柱計算用の年（節入り調整済み）
    
    // 節入り前かチェック（時間まで考慮）
    const setsunya = setsunyu2026[m - 1];
    if (d < setsunya.day || 
        (d === setsunya.day && 
         (birthHour < setsunya.hour || (birthHour === setsunya.hour && birthMinute < setsunya.minute)))) {
        // 節入り前なので前月扱い
        adjustedMonth = m - 1;
        if (adjustedMonth === 0) {
            adjustedMonth = 12;
            adjustedYear--; // 12月になる場合は年も前年にする
        }
    }
    
    // 月柱の地支
    const mSIdx = (adjustedMonth % 12);
    const mS = junishi[mSIdx];
    
    // 月柱の天干（調整後の年の天干から算出）
    const adjustedYIdx = (adjustedYear - 4) % 60;
    const startK = ((adjustedYIdx % 5) * 2 + 2) % 10;
    const mK = jikkan[(startK + (mSIdx - 2 + 12) % 12) % 10];

    // 日柱
    const days = Math.floor((date - new Date(1900, 0, 1)) / 86400000);
    const dIdx = (days + 10) % 60;
    const dK = jikkan[dIdx % 10];
    const dS = junishi[dIdx % 12];

    // 時柱
    let tK = '', tS = '';
    if (birthtime) {
        const tIdx = Math.floor((birthHour + 1) / 2) % 12;
        tS = junishi[tIdx];
        tK = jikkan[((dIdx % 5) * 2 + tIdx) % 10];
    }

    // 五行集計（時間不明の場合は時柱を除外）
    const counts = { '木':0, '火':0, '土':0, '金':0, '水':0 };
    if (birthtime) {
        // 時間あり：8要素で計算
        [yK, yS, mK, mS, dK, dS, tK, tS].forEach(c => {
            for(let g in gogyou) {
                if(gogyou[g].includes(c)) counts[g]++;
            }
        });
    } else {
        // 時間なし：6要素（年月日の干支のみ）で計算
        [yK, yS, mK, mS, dK, dS].forEach(c => {
            for(let g in gogyou) {
                if(gogyou[g].includes(c)) counts[g]++;
            }
        });
    }

    return { 
        year: {k:yK, s:yS}, 
        month: {k:mK, s:mS}, 
        day: {k:dK, s:dS}, 
        time: tK ? {k:tK, s:tS} : null, 
        elements: counts 
    };
}

// ============================================================
// 空亡（天中殺）の計算
// ============================================================

function calculateKubou(dayK, dayS) {
    // 日柱の天干・地支から空亡を算出
    const kIdx = jikkan.indexOf(dayK);
    const sIdx = junishi.indexOf(dayS);
    
    if (kIdx === -1 || sIdx === -1) {
        return []; // 計算不可
    }
    
    // 日柱の干支番号から空亡の地支を計算
    const no = (sIdx - kIdx + 12) % 12;
    const kubou1 = junishi[(no + 10) % 12];
    const kubou2 = junishi[(no + 11) % 12];
    
    return [kubou1, kubou2];
}

// 2026年が空亡の年かチェック
function isKubouYear(shichu) {
    const kubou = calculateKubou(shichu.day.k, shichu.day.s);
    return kubou.includes(year2026Eto);
}

function calculateWestern(date, birthtime) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 出生時刻の取得
    let birthHour = 12; // デフォルトは正午
    let birthMinute = 0;
    if (birthtime) {
        const timeParts = birthtime.split(':');
        birthHour = parseInt(timeParts[0]);
        birthMinute = parseInt(timeParts[1]) || 0;
    }
    
    // 2026年の星座境界線データを使用（時間考慮）
    // 境界日の場合は時間で判定
    for (let i = 0; i < zodiacBoundaries2026.length; i++) {
        const boundary = zodiacBoundaries2026[i];
        const nextBoundary = zodiacBoundaries2026[(i + 1) % zodiacBoundaries2026.length];
        
        // 現在の星座の範囲内かチェック
        if (month < boundary.endMonth || 
            (month === boundary.endMonth && day < boundary.endDay) ||
            (month === boundary.endMonth && day === boundary.endDay && 
             (birthHour < boundary.endHour || 
              (birthHour === boundary.endHour && birthMinute < boundary.endMinute)))) {
            // この星座の範囲内
            return boundary.sign;
        }
    }
    
    // 年末（山羊座の範囲）
    return '山羊座';
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
    // getMonth()は0始まりなので+1する
    const index = (date.getFullYear() + (date.getMonth() + 1) + date.getDate()) % stars.length;
    return stars[index];
}

function calculateTarot(date) {
    const cards = Object.keys(tarotData);
    
    // 年運タロット：生年月日 + 占う年（2026年）で計算
    const currentYear = 2026;
    const dateStr = date.getFullYear().toString() + 
                    (date.getMonth() + 1).toString() + 
                    date.getDate().toString() +
                    currentYear.toString();
    
    // 数秘術的に数字を足していく
    let sum = 0;
    for (let char of dateStr) {
        sum += parseInt(char);
    }
    
    // 1桁になるまで足す（ただし11, 22はそのまま）
    while (sum > 22 && sum !== 11 && sum !== 22) {
        let newSum = 0;
        for (let char of sum.toString()) {
            newSum += parseInt(char);
        }
        sum = newSum;
    }
    
    // タロットカードのインデックスに変換
    const index = sum % cards.length;
    return cards[index];
}

// 干支を計算
function calculateEto(date) {
    const year = date.getFullYear();
    // 1900年は子年（ねずみ年）を起点とする
    const etoIndex = (year - 1900) % 12;
    return etoAnimals[etoIndex];
}

// ============================================================
// スコアリングシステム（改善版）
// ============================================================

// 各占術のスコアを計算
function calculateScores(kyusei, num, western, gosei, shichu, ziwei, tarot, eto, gender) {
    const scores = {
        etoSign: calculateEtoSignScore(eto, western),           // 15点
        kyusei: calculateKyuseiScore(kyusei),                   // 20点（年運考慮）
        numerology: calculateNumerologyScore(num),               // 15点
        western: calculateWesternScore(western),                 // 15点
        shichu: calculateShichuScore(shichu, gender),           // 25点（最重要）
        gosei: calculateGoseiScore(gosei),                      // 5点
        ziwei: calculateZiweiScore(ziwei)                       // 5点
    };
    
    // 空亡（天中殺）チェック - 2026年が空亡の年なら減点
    if (isKubouYear(shichu)) {
        scores.shichu = Math.max(10, scores.shichu - 3); // 3点減点（最低10点）
        scores.kubouPenalty = true; // 空亡フラグ
    } else {
        scores.kubouPenalty = false;
    }
    
    return scores;
}

// 干支×星座スコア（15点満点）
function calculateEtoSignScore(eto, western) {
    // 干支と星座の相性マトリックス（簡易版）
    const compatibility = {
        'ねずみ年': { '牡羊座': 13, '牡牛座': 11, '双子座': 14, '蟹座': 12, '獅子座': 13, '乙女座': 10, '天秤座': 13, '蠍座': 11, '射手座': 14, '山羊座': 15, '水瓶座': 13, '魚座': 12 },
        'うし年': { '牡羊座': 10, '牡牛座': 15, '双子座': 11, '蟹座': 13, '獅子座': 12, '乙女座': 14, '天秤座': 13, '蠍座': 13, '射手座': 10, '山羊座': 14, '水瓶座': 11, '魚座': 13 },
        'とら年': { '牡羊座': 15, '牡牛座': 12, '双子座': 13, '蟹座': 11, '獅子座': 14, '乙女座': 11, '天秤座': 13, '蠍座': 12, '射手座': 15, '山羊座': 10, '水瓶座': 13, '魚座': 12 },
        'うさぎ年': { '牡羊座': 12, '牡牛座': 13, '双子座': 13, '蟹座': 14, '獅子座': 11, '乙女座': 13, '天秤座': 15, '蠍座': 13, '射手座': 12, '山羊座': 11, '水瓶座': 14, '魚座': 15 },
        'たつ年': { '牡羊座': 14, '牡牛座': 11, '双子座': 13, '蟹座': 12, '獅子座': 15, '乙女座': 12, '天秤座': 13, '蠍座': 14, '射手座': 13, '山羊座': 13, '水瓶座': 13, '魚座': 11 },
        'へび年': { '牡羊座': 13, '牡牛座': 14, '双子座': 12, '蟹座': 13, '獅子座': 12, '乙女座': 15, '天秤座': 13, '蠍座': 15, '射手座': 11, '山羊座': 13, '水瓶座': 12, '魚座': 14 },
        'うま年': { '牡羊座': 15, '牡牛座': 11, '双子座': 14, '蟹座': 12, '獅子座': 15, '乙女座': 11, '天秤座': 13, '蠍座': 12, '射手座': 14, '山羊座': 11, '水瓶座': 13, '魚座': 13 },
        'ひつじ年': { '牡羊座': 11, '牡牛座': 13, '双子座': 13, '蟹座': 15, '獅子座': 12, '乙女座': 13, '天秤座': 14, '蠍座': 13, '射手座': 12, '山羊座': 13, '水瓶座': 13, '魚座': 15 },
        'さる年': { '牡羊座': 13, '牡牛座': 12, '双子座': 15, '蟹座': 11, '獅子座': 14, '乙女座': 13, '天秤座': 13, '蠍座': 12, '射手座': 14, '山羊座': 12, '水瓶座': 15, '魚座': 11 },
        'とり年': { '牡羊座': 13, '牡牛座': 14, '双子座': 12, '蟹座': 13, '獅子座': 13, '乙女座': 15, '天秤座': 14, '蠍座': 13, '射手座': 12, '山羊座': 14, '水瓶座': 13, '魚座': 13 },
        'いぬ年': { '牡羊座': 14, '牡牛座': 13, '双子座': 13, '蟹座': 15, '獅子座': 13, '乙女座': 13, '天秤座': 14, '蠍座': 13, '射手座': 13, '山羊座': 13, '水瓶座': 14, '魚座': 14 },
        'いのしし年': { '牡羊座': 12, '牡牛座': 13, '双子座': 13, '蟹座': 14, '獅子座': 12, '乙女座': 13, '天秤座': 13, '蠍座': 15, '射手座': 13, '山羊座': 13, '水瓶座': 13, '魚座': 15 }
    };
    
    return compatibility[eto][western] || 12;
}

// 九星気学スコア（20点満点）- 年運係数を導入
function calculateKyuseiScore(kyusei) {
    // 基本点（各九星の基本的な強さ）
    const baseScores = {
        '一白水星': 14,
        '二黒土星': 13,
        '三碧木星': 15,
        '四緑木星': 16,
        '五黄土星': 12,
        '六白金星': 15,
        '七赤金星': 14,
        '八白土星': 13,
        '九紫火星': 17
    };
    
    // 2026年の年盤九星（七赤金星）との相性係数
    const yearCompatibility = kyuseiCompatibility[kyusei][year2026Kyusei];
    
    // 基本点 × 年運係数 = 最終スコア
    const baseScore = baseScores[kyusei] || 14;
    const finalScore = Math.round(baseScore * yearCompatibility);
    
    return Math.min(finalScore, 20); // 最大20点
}

// 数秘術スコア（15点満点）
function calculateNumerologyScore(num) {
    const scores = {
        1: 13, 2: 11, 3: 13, 4: 10, 5: 12,
        6: 13, 7: 11, 8: 14, 9: 13, 11: 15, 22: 15
    };
    return scores[num] || 11;
}

// 西洋占星術スコア（15点満点）- 2026年の運勢
function calculateWesternScore(western) {
    // 2026年の星座運勢
    const scores = {
        '牡羊座': 13, '牡牛座': 12, '双子座': 14, '蟹座': 13,
        '獅子座': 14, '乙女座': 12, '天秤座': 13, '蠍座': 12,
        '射手座': 14, '山羊座': 11, '水瓶座': 13, '魚座': 13
    };
    return scores[western] || 12;
}

// 四柱推命スコア（25点満点）- 最重要 + 性別考慮
function calculateShichuScore(shichu, gender) {
    // 五行バランスでスコア計算
    const elements = shichu.elements;
    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    
    if (total === 0) return 15; // デフォルト値
    
    // バランスが良いほど高得点（中和思想）
    let balance = 0;
    for (let elem in elements) {
        const ratio = elements[elem] / total;
        // 理想は各20%なので、20%に近いほど良い
        const deviation = Math.abs(0.2 - ratio);
        balance += (0.2 - deviation) * 5; // 偏差が小さいほど高得点
    }
    
    // バランススコアを25点満点に換算
    let balanceScore = Math.max(0, balance * 20);
    
    // 性別による重み付け調整
    if (gender === 'male') {
        // 男性：火・金が強いとプラス補正
        const fireRatio = elements['火'] / total;
        const metalRatio = elements['金'] / total;
        if (fireRatio > 0.25 || metalRatio > 0.25) {
            balanceScore += 1; // +1点
        }
    } else if (gender === 'female') {
        // 女性：水・木が強いとプラス補正
        const waterRatio = elements['水'] / total;
        const woodRatio = elements['木'] / total;
        if (waterRatio > 0.25 || woodRatio > 0.25) {
            balanceScore += 1; // +1点
        }
    }
    
    return Math.min(Math.round(balanceScore), 25);
}

// 五星三心スコア（5点満点）
function calculateGoseiScore(gosei) {
    const scores = {
        '金のイルカ': 4, '銀のイルカ': 3, '金の鳳凰': 5, '銀の鳳凰': 4,
        '金のインディアン': 4, '銀のインディアン': 3, '金の時計': 3, '銀の時計': 3,
        '金のカメレオン': 4, '銀のカメレオン': 3, '金の羅針盤': 4, '銀の羅針盤': 3
    };
    return scores[gosei] || 3;
}

// 紫微斗数スコア（5点満点）
function calculateZiweiScore(ziwei) {
    const scores = {
        '紫微星': 5, '天機星': 4, '太陽星': 5, '武曲星': 4, '天同星': 4,
        '廉貞星': 3, '天府星': 4, '太陰星': 3, '貪狼星': 4, '巨門星': 3,
        '天相星': 4, '天梁星': 4, '七殺星': 3, '破軍星': 3
    };
    return scores[ziwei] || 3;
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
// ランキング表示
// ============================================================

function displayRanking(kyusei, num, western, gosei, shichu, ziwei, tarot, eto, gender) {
    // スコア計算
    const scores = calculateScores(kyusei, num, western, gosei, shichu, ziwei, tarot, eto, gender);
    const rawScore = scores.etoSign + scores.kyusei + scores.numerology + 
                     scores.western + scores.shichu + scores.gosei + scores.ziwei;
    
    // スコアを正規化（50-100点の範囲）
    const totalScore = normalizeScore(rawScore);
    
    // 干支×星座の組み合わせ表示
    document.getElementById('etoSignCombo').innerHTML = 
        `<strong>干支×星座：${eto} × ${western}</strong>`;
    
    // スコア内訳
    let scoreHtml = `
        <div class="score-item">
            <span class="score-label">干支×星座</span>
            <span class="score-value">${scores.etoSign}点 / 15点</span>
        </div>
        <div class="score-item">
            <span class="score-label">九星気学（年運）</span>
            <span class="score-value">${scores.kyusei}点 / 20点</span>
        </div>
        <div class="score-item">
            <span class="score-label">数秘術</span>
            <span class="score-value">${scores.numerology}点 / 15点</span>
        </div>
        <div class="score-item">
            <span class="score-label">西洋占星術</span>
            <span class="score-value">${scores.western}点 / 15点</span>
        </div>
        <div class="score-item">
            <span class="score-label">四柱推命</span>
            <span class="score-value">${scores.shichu}点 / 25点</span>
        </div>
        <div class="score-item">
            <span class="score-label">五星三心</span>
            <span class="score-value">${scores.gosei}点 / 5点</span>
        </div>
        <div class="score-item">
            <span class="score-label">紫微斗数</span>
            <span class="score-value">${scores.ziwei}点 / 5点</span>
        </div>
    `;
    document.getElementById('scoreBreakdown').innerHTML = scoreHtml;
    
    // 総合得点（正規化後）
    document.getElementById('totalScoreDisplay').innerHTML = `
        <div class="score-max">総合得点</div>
        <span class="score-number">${totalScore}</span>
        <div class="score-max">/ 100点</div>
    `;
    
    // パーセンタイル計算（上位◯%）
    const ranking = calculateRankingPosition(kyusei, num, western, gosei, shichu, ziwei, eto, totalScore);
    
    // 表示用のテキストを生成
    let rankingText = '';
    
    if (ranking.percentile <= 1) {
        rankingText = `<strong style="color: #d4af37;">トップクラス</strong>（最高レベル）`;
    } else if (ranking.percentile <= 5) {
        rankingText = `<strong style="color: #d4af37;">上位${Math.round(ranking.percentile)}%</strong>（最高レベル）`;
    } else if (ranking.percentile <= 20) {
        rankingText = `<strong style="color: #e17055;">上位${Math.round(ranking.percentile)}%</strong>（優秀）`;
    } else if (ranking.percentile <= 50) {
        rankingText = `<strong style="color: #667eea;">上位${Math.round(ranking.percentile)}%</strong>（良好）`;
    } else if (ranking.percentile <= 80) {
        rankingText = `<strong>上位${Math.round(ranking.percentile)}%</strong>（平均的）`;
    } else {
        rankingText = `<strong>下位${Math.round(100 - ranking.percentile)}%</strong>（要注意）`;
    }
    
    document.getElementById('rankingPosition').innerHTML = `総合ランキング：${rankingText}`;
    
    // 運勢レベル（星評価）
    const stars = getStarRating(100 - ranking.percentile);
    let message = getFortuneMessage(100 - ranking.percentile);
    
    // 空亡（天中殺）の場合は警告メッセージを追加
    if (scores.kubouPenalty) {
        message += '<br><br><strong style="color: #e74c3c;">⚠️ 2026年は空亡（天中殺）の年です</strong><br>試練の年ですが、乗り越えれば大きな成長があります。慎重な行動を心がけましょう。';
    }
    
    document.getElementById('fortuneLevel').innerHTML = `
        <div class="star-rating">${stars}</div>
        <div class="fortune-message">${message}</div>
    `;
}

// 144パターンの中での順位を計算（改善版 - 全パターン正確計算 + 正規化）
function calculateRankingPosition(kyusei, num, western, gosei, shichu, ziwei, eto, myScore) {
    // 全144パターン（12干支 × 12星座）のスコアを計算
    const allScores = [];
    
    // 各九星の出現確率を考慮した代表値
    const kyuseiSamples = Object.keys(kyuseiData);
    const numSamples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22];
    const goseiSamples = Object.keys(goseiData);
    const ziweiSamples = Object.keys(ziweiData);
    
    for (let e of etoAnimals) {
        for (let w of Object.keys(westernZodiacData)) {
            // この組み合わせの代表的なスコアを計算
            
            // 干支×星座スコア（確定値）
            const etoSignScore = calculateEtoSignScore(e, w);
            
            // 九星気学スコア（この干支×星座の組み合わせで最も多い九星の平均）
            let kyuseiScoreSum = 0;
            for (let k of kyuseiSamples) {
                kyuseiScoreSum += calculateKyuseiScore(k);
            }
            const avgKyuseiScore = Math.round(kyuseiScoreSum / kyuseiSamples.length);
            
            // 数秘術スコア（平均）
            let numScoreSum = 0;
            for (let n of numSamples) {
                numScoreSum += calculateNumerologyScore(n);
            }
            const avgNumScore = Math.round(numScoreSum / numSamples.length);
            
            // 西洋占星術スコア（確定値）
            const westernScore = calculateWesternScore(w);
            
            // 四柱推命スコア（平均的なバランス = 16点程度）
            const avgShichuScore = 16;
            
            // 五星三心スコア（平均）
            let goseiScoreSum = 0;
            for (let g of goseiSamples) {
                goseiScoreSum += calculateGoseiScore(g);
            }
            const avgGoseiScore = Math.round(goseiScoreSum / goseiSamples.length);
            
            // 紫微斗数スコア（平均）
            let ziweiScoreSum = 0;
            for (let z of ziweiSamples) {
                ziweiScoreSum += calculateZiweiScore(z);
            }
            const avgZiweiScore = Math.round(ziweiScoreSum / ziweiSamples.length);
            
            const rawScore = etoSignScore + avgKyuseiScore + avgNumScore + westernScore + 
                            avgShichuScore + avgGoseiScore + avgZiweiScore;
            
            // スコアを正規化
            const score = normalizeScore(rawScore);
            
            allScores.push({
                eto: e,
                western: w,
                score: score
            });
        }
    }
    
    // スコアで降順ソート
    allScores.sort((a, b) => b.score - a.score);
    
    // 自分より上位の人数を数える
    let betterCount = 0;
    for (let i = 0; i < allScores.length; i++) {
        if (allScores[i].score > myScore) {
            betterCount++;
        } else {
            break;
        }
    }
    
    // 上位から何%の位置にいるか（0-100の範囲）
    // 0% = 最上位、100% = 最下位
    const percentileFromTop = (betterCount / allScores.length) * 100;
    
    return { 
        position: betterCount + 1, 
        percentile: percentileFromTop 
    };
}

// 星評価を取得
function getStarRating(percentile) {
    if (percentile >= 90) return '★★★★★';
    if (percentile >= 70) return '★★★★☆';
    if (percentile >= 50) return '★★★☆☆';
    if (percentile >= 30) return '★★☆☆☆';
    return '★☆☆☆☆';
}

// 運勢メッセージを取得
function getFortuneMessage(percentile) {
    if (percentile >= 90) return '最高運勢！素晴らしい一年になります';
    if (percentile >= 70) return '上位30%！とても良い運勢です';
    if (percentile >= 50) return '中位！バランスの取れた運勢です';
    if (percentile >= 30) return 'やや注意！慎重な行動を心がけましょう';
    return '困難な年ですが、乗り越えれば成長できます';
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

function displayTotal(kyusei, num, western, gosei, shichu, ziwei, tarot) {
    console.log('総合運勢を生成中...', { kyusei, num, western, gosei });
    
    // ローディング表示
    document.getElementById('totalFortune').innerHTML = '<p style="text-align: center; color: #764ba2; font-weight: bold; animation: pulse 1.5s infinite;">✨ 総合運勢を鑑定中...</p>';
    
    // 少し遅延を入れて鑑定している感を出す
    setTimeout(() => {
        // 各占術の結果情報を収集
        const kyuseiInfo = kyuseiData[kyusei];
        const numInfo = numerologyData[num];
        const westernInfo = westernZodiacData[western];
        const goseiInfo = goseiData[gosei];
        const ziweiInfo = ziweiData[ziwei];
        const tarotInfo = tarotData[tarot];
        
        // 四柱推命の五行分析
        const dominantElement = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1])[0];
        
        // ランダム要素の配列
        const openings = [
            `あなたの運命には、<strong>${kyusei}</strong>の持つ神秘的な力と、運命数<strong>${num}</strong>が示す特別な使命が宿っています。`,
            `<strong>${kyusei}</strong>として生まれたあなたには、運命数<strong>${num}</strong>が授けた独自の才能があります。`,
            `運命数<strong>${num}</strong>と<strong>${kyusei}</strong>の組み合わせは、あなたの人生に特別な意味をもたらします。`,
            `<strong>${kyusei}</strong>の性質と運命数<strong>${num}</strong>の力が、あなたの中で美しく調和しています。`
        ];
        
        const yearForecasts = [
            `2026年は年運タロット「<strong>${tarot}</strong>」が示すように、${tarotInfo.description}`,
            `今年の年運タロット「<strong>${tarot}</strong>」が現れたあなたには、${tarotInfo.description}`,
            `<strong>${western}</strong> ${westernInfo.emoji}として迎える2026年、年運タロット「<strong>${tarot}</strong>」の力が加わることで、${tarotInfo.description}`,
            `2026年、${westernInfo.description}年運タロット「<strong>${tarot}</strong>」が示すように、${tarotInfo.description}`
        ];
        
        const elements = [
            `四柱推命では<strong>${dominantElement[0]}</strong>の気が強く現れており、バランスの取れた運気の流れを持っています。`,
            `<strong>${dominantElement[0]}</strong>の要素が際立つあなたの命式は、安定した運気の基盤を示しています。`,
            `五行では<strong>${dominantElement[0]}</strong>が優勢で、調和のとれた運命の流れが見られます。`
        ];
        
        const advice = [
            `<strong>${gosei}</strong>の特性を活かし、${goseiInfo.description}この一年は、その魅力を存分に発揮できるでしょう。`,
            `五星三心の<strong>${gosei}</strong>として、${goseiInfo.description}この個性を大切にしてください。`,
            `<strong>${gosei}</strong>の力を信じて進むことで、予想以上の成果が得られます。`
        ];
        
        const ziweiFortune = [
            `紫微斗数の<strong>${ziwei}</strong>は、${ziweiInfo.description}この星の力を借りて、大きな飛躍が期待できます。`,
            `<strong>${ziwei}</strong>の加護を受けるあなたは、${ziweiInfo.description}チャンスを確実につかむことができるでしょう。`,
            `<strong>${ziwei}</strong>が示すように、${ziweiInfo.description}運命の流れに身を任せてください。`
        ];
        
        const conclusions = [
            `${kyuseiInfo.color}を身につけ、${kyuseiInfo.direction}の方位を意識することで、さらに運気が高まります。2026年は、あなたらしさを大切にしながら、新しい可能性にも目を向けていってください！✨`,
            `ラッキーカラーの${kyuseiInfo.color}と、幸運の方位${kyuseiInfo.direction}が、あなたの人生をサポートします。自分を信じて、輝かしい一年を過ごしましょう！🌟`,
            `${kyuseiInfo.color}を取り入れ、${kyuseiInfo.direction}を意識することで、幸運の波に乗れます。この一年が、あなたにとって最高の年になりますように！💫`,
            `${kyuseiInfo.direction}の方位と${kyuseiInfo.color}の色が、あなたに幸運を運んできます。素晴らしい2026年になることを願っています！✨`
        ];
        
        // ランダムに組み合わせて総合運勢を生成
        const fortune = `
            <p>${openings[Math.floor(Math.random() * openings.length)]}</p>
            <p><strong>2026年の展望:</strong> ${yearForecasts[Math.floor(Math.random() * yearForecasts.length)]}</p>
            <p>${elements[Math.floor(Math.random() * elements.length)]} ${ziweiFortune[Math.floor(Math.random() * ziweiFortune.length)]}</p>
            <p><strong>開運のヒント:</strong> ${advice[Math.floor(Math.random() * advice.length)]}</p>
            <p>${conclusions[Math.floor(Math.random() * conclusions.length)]}</p>
        `;
        
        document.getElementById('totalFortune').innerHTML = fortune;
        console.log('✨ 総合運勢の生成完了');
    }, 1000);
}

function resetForm() {
    location.reload();
}

// ============================================================
// ローディング演出
// ============================================================

function showLoading() {
    // ローディングオーバーレイを作成
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">鑑定中...</div>
            <div class="loading-subtext">8種類の占術で詳しく分析しています ✨</div>
        </div>
    `;
    document.body.appendChild(loadingOverlay);
    
    // フェードイン
    setTimeout(() => {
        loadingOverlay.style.opacity = '1';
    }, 10);
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
}

// ============================================================
// スコア正規化
// ============================================================

function normalizeScore(rawScore) {
    // 理論上の最小値と最大値
    const minPossible = 15 + 10 + 10 + 11 + 10 + 3 + 3; // 62点
    const maxPossible = 15 + 20 + 15 + 15 + 25 + 5 + 5; // 100点
    
    // 正規化（50-100点の範囲に収める）
    const normalized = 50 + ((rawScore - minPossible) / (maxPossible - minPossible)) * 50;
    
    return Math.round(Math.max(50, Math.min(100, normalized)));
}
