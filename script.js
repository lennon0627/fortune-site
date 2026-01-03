// ============================================================
// 定数定義（スコア配分の定数化）
// ============================================================

const SCORE_CONFIG = {
    ETO_TAROT: { min: 15, max: 15 },      // 干支×タロット
    KYUSEI_WESTERN: { min: 10, max: 20 }, // 九星×西洋占星術
    NUMEROLOGY: { min: 10, max: 15 },     // 数秘術
    GOSEI: { min: 11, max: 15 },          // 五星三心
    SHICHU: { min: 10, max: 25 },         // 四柱推命
    KABBALAH: { min: 3, max: 5 },         // カバラ
    ZIWEI: { min: 3, max: 5 }             // 紫微斗数
};

// スコア計算の最小値と最大値
const SCORE_MIN = Object.values(SCORE_CONFIG).reduce((sum, v) => sum + v.min, 0);
const SCORE_MAX = Object.values(SCORE_CONFIG).reduce((sum, v) => sum + v.max, 0);

// ============================================================
// 二十四節気の定義と計算
// ============================================================

/**
 * 二十四節気の定義
 * 立春を起点とした各節気の太陽黄経
 */
const SOLAR_TERMS = {
    1: { name: '小寒', longitude: 285 },
    2: { name: '立春', longitude: 315 },  // 年の始まり
    3: { name: '啓蟄', longitude: 345 },
    4: { name: '清明', longitude: 15 },
    5: { name: '立夏', longitude: 45 },
    6: { name: '芒種', longitude: 75 },
    7: { name: '小暑', longitude: 105 },
    8: { name: '立秋', longitude: 135 },
    9: { name: '白露', longitude: 165 },
    10: { name: '寒露', longitude: 195 },
    11: { name: '立冬', longitude: 225 },
    12: { name: '大雪', longitude: 255 }
};

/**
 * より正確な立春（二十四節気）の計算
 * 
 * 参考：海上保安庁天文計算式
 * 立春 = 2月4日前後、太陽黄経315度
 * 
 * @param {number} year - 西暦年
 * @returns {Date} 立春の日時
 */
function calculateAccurateRisshun(year) {
    // 簡易的な計算式（誤差±1日程度）
    // より正確には天体力学計算が必要だが、ここでは実用的な近似式を使用
    
    // 1900年からの経過年数
    const y = year - 1900;
    
    // 立春の平均回帰年（約365.242日周期）を考慮
    // 1900年2月4日 18:05 を基準
    const baseDay = 4;
    const baseHour = 18;
    const baseMinute = 5;
    
    // 年による変動を計算（うるう年の影響）
    const yearOffset = (y * 0.242194) % 1;
    const dayOffset = Math.floor(yearOffset * 24); // 時間単位のオフセット
    
    // うるう年補正
    const leapYearCorrection = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? -1 : 0;
    
    // 最終的な日時を計算
    let day = baseDay;
    let hour = baseHour + dayOffset;
    
    // 時間のオーバーフロー処理
    if (hour >= 24) {
        day += Math.floor(hour / 24);
        hour = hour % 24;
    }
    
    // 実際の年による微調整（1900-2100年の範囲で有効）
    if (year >= 2000) {
        const centuryOffset = Math.floor((year - 2000) / 4) * (-1);
        hour += centuryOffset;
        if (hour < 0) {
            day--;
            hour += 24;
        }
    }
    
    return new Date(year, 1, day + leapYearCorrection, hour, baseMinute, 0);
}

/**
 * 特定の月の節入り時刻を計算
 * 
 * @param {number} year - 西暦年
 * @param {number} month - 月（1-12）
 * @returns {Date} 節入り時刻
 */
function calculateSetsunyu(year, month) {
    // 立春を基準に各節気を計算
    const risshun = calculateAccurateRisshun(year);
    
    // 各月の節気までの精密な平均日数
    // 地球の公転軌道は楕円のため、季節によって節気間の日数は変動する
    // これらの値は太陽黄経に基づく平均的な日数を反映
    const solarTermDays = {
        1: -30,   // 小寒（前年12月下旬）
        2: 0,     // 立春（2月初旬）
        3: 31,    // 啓蟄（3月初旬）※精密化：30→31
        4: 61,    // 清明（4月初旬）※精密化：60→61
        5: 91,    // 立夏（5月初旬）
        6: 122,   // 芒種（6月初旬）
        7: 153,   // 小暑（7月初旬）※精密化：152→153
        8: 185,   // 立秋（8月初旬）※精密化：183→185（重要）
        9: 216,   // 白露（9月初旬）※精密化：213→216
        10: 246,  // 寒露（10月初旬）※精密化：244→246
        11: 277,  // 立冬（11月初旬）※精密化：274→277
        12: 307   // 大雪（12月初旬）※精密化：305→307
    };
    
    const daysOffset = solarTermDays[month];
    const setsunyu = new Date(risshun.getTime());
    setsunyu.setDate(setsunyu.getDate() + daysOffset);
    
    return setsunyu;
}

// ============================================================
// データ定義
// ============================================================

// 五星三心占い - 年ごとの基準値テーブル（1930年〜2025年）
const goseiYearBase = {
    1930: 30, 1931: 31, 1932: 32, 1933: 33, 1934: 34, 1935: 35, 1936: 36, 1937: 37, 1938: 38, 1939: 39,
    1940: 40, 1941: 41, 1942: 42, 1943: 43, 1944: 44, 1945: 45, 1946: 46, 1947: 47, 1948: 48, 1949: 49,
    1950: 50, 1951: 51, 1952: 52, 1953: 53, 1954: 54, 1955: 55, 1956: 56, 1957: 57, 1958: 58, 1959: 59,
    1960: 0,  1961: 1,  1962: 2,  1963: 3,  1964: 4,  1965: 5,  1966: 6,  1967: 7,  1968: 8,  1969: 9,
    1970: 10, 1971: 11, 1972: 12, 1973: 13, 1974: 14, 1975: 15, 1976: 16, 1977: 17, 1978: 18, 1979: 19,
    1980: 20, 1981: 21, 1982: 22, 1983: 23, 1984: 24, 1985: 25, 1986: 26, 1987: 27, 1988: 28, 1989: 29,
    1990: 30, 1991: 31, 1992: 32, 1993: 33, 1994: 34, 1995: 35, 1996: 36, 1997: 37, 1998: 38, 1999: 39,
    2000: 40, 2001: 41, 2002: 42, 2003: 43, 2004: 44, 2005: 45, 2006: 46, 2007: 47, 2008: 48, 2009: 49,
    2010: 50, 2011: 51, 2012: 52, 2013: 53, 2014: 54, 2015: 55, 2016: 56, 2017: 57, 2018: 58, 2019: 59,
    2020: 0,  2021: 1,  2022: 2,  2023: 3,  2024: 4,  2025: 5,  2026: 6,  2027: 7,  2028: 8,  2029: 9
};

// 五星三心占い - 月ごとの加算値テーブル（1月〜12月）
const goseiMonthAdd = {
    1: 29,  2: 0,   3: 30,  4: 1,   5: 31,  6: 23,
    7: 32,  8: 3,   9: 33,  10: 4,  11: 34, 12: 5
};

// プルダウンの初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeDateSelects();
    initializeTimeSelects();
});

function initializeDateSelects() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    
    // 年の選択肢を生成（1900年〜現在の年まで - 未来日を制限）
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
    
    // 現在の日付を取得（未来日チェック用）
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    // 現在選択されている日を保存
    const currentDayValue = parseInt(daySelect.value);
    
    // 日の選択肢をクリア
    daySelect.innerHTML = '<option value="">日</option>';
    
    // 新しい選択肢を生成
    let maxDay = daysInMonth;
    
    // 未来日の制限：現在の年月と同じ場合は今日まで
    if (year === currentYear && month === currentMonth) {
        maxDay = Math.min(daysInMonth, currentDay);
    } else if (year === currentYear && month > currentMonth) {
        // 現在の年で未来の月は選択不可
        maxDay = 0;
    } else if (year > currentYear) {
        // 未来の年は選択不可
        maxDay = 0;
    }
    
    for (let day = 1; day <= maxDay; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
    
    // 以前選択されていた日が有効なら再選択
    if (currentDayValue && currentDayValue <= maxDay) {
        daySelect.value = currentDayValue;
    }
    
    // 未来日が選択された場合の警告表示
    const existingWarning = document.getElementById('future-date-warning');
    if (existingWarning) {
        existingWarning.remove();
    }
    
    if (maxDay === 0) {
        const warning = document.createElement('p');
        warning.id = 'future-date-warning';
        warning.style.cssText = 'color: #f44336; font-size: 0.85em; margin-top: 5px;';
        warning.textContent = '⚠️ 未来の日付は選択できません';
        daySelect.parentElement.appendChild(warning);
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
    '一白水星': { color: '白・黒', direction: '北', luckyFood: '魚介類・水菜', luckyAction: '水辺の散歩', description: '柔軟で適応力があり、思慮深い性格です。水のように流れに身を任せながらも、内に強い意志を秘めています。' },
    '二黒土星': { color: '黄色・茶色', direction: '南西', luckyFood: '根菜・玄米', luckyAction: '土いじり', description: '温かく包容力があり、努力家です。大地のように安定感があり、周囲から信頼されます。' },
    '三碧木星': { color: '青・緑', direction: '東', luckyFood: '新鮮な野菜・果物', luckyAction: '朝のウォーキング', description: '成長意欲が旺盛で活発、行動力があります。若木のように伸びやかで、新しいことにチャレンジする精神を持っています。' },
    '四緑木星': { color: '緑・青緑', direction: '南東', luckyFood: '葉物野菜・ハーブティー', luckyAction: '友人との会話', description: '調和を大切にする社交家で、コミュニケーション能力に優れています。風のように爽やかで、人間関係を円滑にします。' },
    '五黄土星': { color: '黄色', direction: '中央', luckyFood: 'カレー・スパイス料理', luckyAction: 'リーダーシップ発揮', description: '強いリーダーシップと影響力を持ちます。中心に位置し、周囲を動かす力があります。' },
    '六白金星': { color: '白・金', direction: '北西', luckyFood: '白米・大根', luckyAction: '整理整頓', description: '責任感が強く完璧主義で、高い理想を持っています。金のように輝く品格と、強い意志を持っています。' },
    '七赤金星': { color: '赤・金', direction: '西', luckyFood: 'ワイン・チョコレート', luckyAction: 'パーティー参加', description: '社交的で人を惹きつける魅力があります。明るく楽しい雰囲気を作り出すのが得意です。' },
    '八白土星': { color: '白・茶色', direction: '北東', luckyFood: '山の幸・きのこ', luckyAction: '登山・ハイキング', description: '意志が強く変化を起こす力があります。山のようにどっしりとした存在感と、改革の力を持っています。' },
    '九紫火星': { color: '紫・赤', direction: '南', luckyFood: '辛い料理・トマト', luckyAction: '芸術鑑賞', description: '華やかで直感力が鋭く、芸術的センスに優れています。火のように情熱的で、人を照らす魅力があります。' }
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
    '愚者': { description: '新しい冒険の始まりを示します。純粋な心で未知の世界に飛び込む勇気が与えられます。' },
    '魔術師': { description: '創造力と実現力が最高潮に達します。望むものを形にする力があります。' },
    '女教皇': { description: '直感と内なる知恵が高まります。静かに内省する時間が重要です。' },
    '女帝': { description: '豊かさと創造性に満ちた年になります。愛情を注ぐことで幸せが訪れます。' },
    '皇帝': { description: '安定と秩序をもたらす力があります。リーダーシップを発揮する年です。' },
    '教皇': { description: '伝統と知恵を大切にする年です。学びと成長の機会に恵まれます。' },
    '恋人': { description: '重要な選択と深い絆の年です。心の繋がりが幸運を呼びます。' },
    '戦車': { description: '強い意志で前進する年です。目標達成に向けて突き進む力があります。' },
    '力': { description: '内なる強さと優しさで困難を乗り越えます。忍耐が実を結びます。' },
    '隠者': { description: '自己探求と内省の年です。深い洞察力が得られます。' },
    '運命の輪': { description: '大きな転機と幸運の訪れを示します。チャンスを逃さないでください。' },
    '正義': { description: 'バランスと公正さが重要な年です。誠実な行動が報われます。' },
    '吊られた男': { description: '視点を変えることで新しい発見があります。試練は成長の機会です。' },
    '死神': { description: '終わりと新しい始まりの年です。変化を恐れず受け入れてください。' },
    '節制': { description: '調和とバランスが幸運を呼びます。中庸の道が成功への鍵です。' },
    '悪魔': { description: '欲望と向き合う年です。執着を手放すことで自由が得られます。' },
    '塔': { description: '突然の変化がありますが、それは必要な浄化です。新たな基盤を築けます。' },
    '星': { description: '希望と癒しの年です。夢に向かって進む勇気が与えられます。' },
    '月': { description: '直感と想像力が高まります。不安を乗り越えて真実を見つけます。' },
    '太陽': { description: '喜びと成功に満ちた年です。自信を持って輝いてください。' },
    '審判': { description: '過去の総決算と新生の年です。重要な決断が訪れます。' },
    '世界': { description: '完成と達成の年です。大きな目標が実現する可能性があります。' }
};

// 干支の配列
const etoList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 十干の配列
const jikkanList = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 十二支の配列（時刻用）
const shiList = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行の定義
const gogyou = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
    '寅': '木', '卯': '木',
    '巳': '火', '午': '火',
    '辰': '土', '丑': '土', '未': '土', '戌': '土',
    '申': '金', '酉': '金',
    '子': '水', '亥': '水'
};

// ============================================================
// 節入り前後の判定と注釈を返す（改善版）
// ============================================================

/**
 * 節入り前後の判定と注釈を返す
 * 
 * @param {Date} birthDate - 誕生日時
 * @param {number} birthYear - 誕生年
 * @param {number} birthMonth - 誕生月
 * @param {number} birthDay - 誕生日
 * @returns {string} 注釈テキスト
 */
function getSetsuniriNote(birthDate, birthYear, birthMonth, birthDay) {
    // 立春前後（2月3日〜5日）の場合のみ詳細な注釈を表示
    if (birthMonth === 2 && birthDay >= 3 && birthDay <= 5) {
        const risshun = calculateAccurateRisshun(birthYear);
        const risshunStr = `${risshun.getMonth() + 1}月${risshun.getDate()}日 ${risshun.getHours()}時${risshun.getMinutes()}分頃`;
        
        return `<div class="setsuniri-note">
            <strong>⚠️ 節入り判定</strong><br>
            ${birthYear}年の立春は<strong>${risshunStr}</strong>です。<br>
            立春前に生まれた場合は前年の干支として計算されます。<br>
            ※出生時刻が不明な場合、より正確な鑑定をご希望の方は専門家にご相談ください。
        </div>`;
    }
    
    // その他の月で節入り付近の場合も軽い注釈
    const setsunyu = calculateSetsunyu(birthYear, birthMonth);
    const setsunDay = setsunyu.getDate();
    
    if (Math.abs(birthDay - setsunDay) <= 1) {
        const termName = SOLAR_TERMS[birthMonth]?.name || '節気';
        return `<div class="setsuniri-note" style="background: #e3f2fd; border-color: #2196f3; color: #1565c0;">
            <strong>📅 ${termName}付近</strong><br>
            節入り日付近にお生まれの方は、月柱の計算に影響がある場合があります。
        </div>`;
    }
    
    return '';
}

// ============================================================
// 九星気学の計算
// ============================================================

/**
 * 数値の各桁を足して1桁になるまで繰り返す
 */
function sumDigits(num) {
    let sum = num;
    while (sum >= 10) {
        let temp = 0;
        while (sum > 0) {
            temp += sum % 10;
            sum = Math.floor(sum / 10);
        }
        sum = temp;
    }
    if (sum === 0) sum = 9;
    return sum;
}

/**
 * 九星気学の計算（正確版）
 * 西暦の各桁を足して1桁になるまで繰り返し、その値から九星を決定
 */
function calculateKyusei(year, month, day) {
    // 正確な立春判定
    const risshun = calculateAccurateRisshun(year);
    const birthDate = new Date(year, month - 1, day);
    
    // 立春前の場合は前年として計算
    const calcYear = birthDate < risshun ? year - 1 : year;
    
    // 西暦の各桁を足して1桁になるまで繰り返す
    let digitSum = sumDigits(calcYear);
    
    const kyuseiOrder = [
        '一白水星', '二黒土星', '三碧木星', '四緑木星', '五黄土星',
        '六白金星', '七赤金星', '八白土星', '九紫火星'
    ];
    
    // 九星のインデックスを計算
    let index;
    if (digitSum === 9) {
        index = 8; // 九紫火星
    } else {
        index = (10 - digitSum) % 9;
    }
    
    console.log('九星気学計算:', { year, calcYear, digitSum, index, result: kyuseiOrder[index] });
    
    return kyuseiOrder[index];
}

// ============================================================
// 数秘術の計算
// ============================================================

function calculateNumerology(year, month, day) {
    let sum = year + month + day;
    while (sum > 11 && sum !== 22) {
        sum = String(sum).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    return sum;
}

// ============================================================
// 西洋占星術の計算
// ============================================================

function calculateWesternZodiac(month, day) {
    const zodiacDates = [
        { sign: '山羊座', end: [1, 19] },
        { sign: '水瓶座', end: [2, 18] },
        { sign: '魚座', end: [3, 20] },
        { sign: '牡羊座', end: [4, 19] },
        { sign: '牡牛座', end: [5, 20] },
        { sign: '双子座', end: [6, 21] },
        { sign: '蟹座', end: [7, 22] },
        { sign: '獅子座', end: [8, 22] },
        { sign: '乙女座', end: [9, 22] },
        { sign: '天秤座', end: [10, 23] },
        { sign: '蠍座', end: [11, 22] },
        { sign: '射手座', end: [12, 21] },
        { sign: '山羊座', end: [12, 31] }
    ];
    
    for (let i = 0; i < zodiacDates.length; i++) {
        const [endMonth, endDay] = zodiacDates[i].end;
        if (month < endMonth || (month === endMonth && day <= endDay)) {
            return zodiacDates[i].sign;
        }
    }
    return '山羊座';
}

// ============================================================
// 五星三心占いの計算
// ============================================================

function calculateGosei(year, month, day, gender) {
    // 年の基準値を取得
    let yearBase = goseiYearBase[year];
    
    // 年がテーブルの範囲外の場合、60年周期で循環
    if (yearBase === undefined) {
        console.warn(`五星三心: ${year}年はテーブル範囲外です。60年周期で近似値を使用します。`);
        const normalizedYear = 1930 + ((year - 1930) % 60);
        yearBase = goseiYearBase[normalizedYear] || 0;
    }
    
    // 月の加算値を取得
    const monthAdd = goseiMonthAdd[month] || 0;
    
    // テーブル値 = (年の基準値 + 月の加算値) % 60
    const tableValue = (yearBase + monthAdd) % 60;
    
    // 運命数 = (テーブル値 + 日) % 60
    const unmeiNumber = (tableValue + day) % 60;
    
    // 運命数からタイプを判定
    // 0または51-60: イルカ, 1-10: 羅針盤, 11-20: 時計, 
    // 21-30: 鳳凰, 31-40: インディアン, 41-50: カメレオン
    let type;
    if (unmeiNumber === 0 || (unmeiNumber >= 51 && unmeiNumber <= 60)) {
        type = 'イルカ';
    } else if (unmeiNumber >= 1 && unmeiNumber <= 10) {
        type = '羅針盤';
    } else if (unmeiNumber >= 11 && unmeiNumber <= 20) {
        type = '時計';
    } else if (unmeiNumber >= 21 && unmeiNumber <= 30) {
        type = '鳳凰';
    } else if (unmeiNumber >= 31 && unmeiNumber <= 40) {
        type = 'インディアン';
    } else if (unmeiNumber >= 41 && unmeiNumber <= 50) {
        type = 'カメレオン';
    } else {
        type = 'イルカ';
    }
    
    // 金・銀の判定: 西暦が偶数なら「金」、奇数なら「銀」
    const metalType = year % 2 === 0 ? '金' : '銀';
    
    const result = `${metalType}の${type}`;
    
    console.log('五星三心計算:', {
        year, month, day,
        yearBase, monthAdd, tableValue, unmeiNumber,
        type, metalType, result
    });
    
    return result;
}

// ============================================================
// 四柱推命の計算（厳密版）
// ============================================================

/**
 * ユリウス通日の計算
 * 天文学的計算の基準となる日数
 */
function calculateJulianDayNumber(year, month, day) {
    console.log('ユリウス日計算 入力:', { year, month, day });
    
    let y = year;
    let m = month;
    
    if (m <= 2) {
        y -= 1;
        m += 12;
    }
    
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jdn = Math.floor(365.25 * (y + 4716)) + 
           Math.floor(30.6001 * (m + 1)) + 
           day + b - 1524.5;
    
    console.log('ユリウス日計算 結果:', jdn);
    return jdn;
}

/**
 * 空亡（天中殺）の計算
 * 
 * 空亡は「日柱の干支（天干と地支の組み合わせ）」によって決まる
 * 例：甲子(きのえね)と丙子(ひのえね)は同じ「子」だが空亡が異なる
 * 
 * @param {string} dayKan - 日柱の天干
 * @param {string} dayShi - 日柱の地支
 * @returns {Array} 空亡の地支2つ
 */
function calculateKubou(dayKan, dayShi) {
    const kanIndex = jikkanList.indexOf(dayKan); // 0-9
    const shiIndex = etoList.indexOf(dayShi);    // 0-11
    
    // エラーハンドリング
    if (kanIndex === -1 || shiIndex === -1) {
        console.error('空亡計算エラー: 無効な干支:', { dayKan, dayShi });
        return ['--', '--'];
    }
    
    // (12 + 地支の番号 - 天干の番号) % 12 で、その旬の始まりの番号を出す
    let base = (12 + shiIndex - kanIndex) % 12;
    
    // 空亡は旬ごとに決まる
    // 甲子旬(base=0)→戌亥空亡、甲戌旬(base=10)→申酉空亡...
    const kubouList = ['戌亥', '申酉', '午未', '辰巳', '寅卯', '子丑'];
    const kubouIndex = Math.floor(base / 2);
    
    return kubouList[kubouIndex] ? kubouList[kubouIndex].split('') : ['--', '--'];
}

/**
 * 大運の計算
 * 人生の10年ごとの運勢の流れ
 */
function calculateTaiun(year, month, day, yearKan, yearShi) {
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    // 大運の開始年齢を個人別に計算
    // 本来は「誕生から次の節入り日までの日数÷3」で決まる
    let taiunStart;
    try {
        const birthDate = new Date(year, month - 1, day);
        const currentMonthSetsunyu = calculateSetsunyu(year, month);
        
        // 誕生日が節入り後の場合は次の月の節入りを使う
        let nextSetsunyu;
        if (birthDate >= currentMonthSetsunyu) {
            // 次の月の節入りを取得（12月の場合は翌年1月）
            const nextMonth = month === 12 ? 1 : month + 1;
            const nextYear = month === 12 ? year + 1 : year;
            nextSetsunyu = calculateSetsunyu(nextYear, nextMonth);
        } else {
            nextSetsunyu = currentMonthSetsunyu;
        }
        
        // 誕生日から次の節入り日までの日数
        const diffTime = Math.abs(nextSetsunyu - birthDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // 日数を3で割って開始年齢を計算（四捨五入）
        taiunStart = Math.round(diffDays / 3);
        
        // 0歳や極端に大きい年齢を防ぐ
        taiunStart = Math.max(1, Math.min(taiunStart, 10));
        
        console.log('大運開始年齢計算:', { birthDate, nextSetsunyu, diffDays, taiunStart });
    } catch (error) {
        console.error('大運開始年齢の計算エラー:', error);
        taiunStart = 8; // エラー時は従来の8歳
    }
    
    if (age < taiunStart) {
        return {
            current: '初年運',
            description: 'まだ大運期に入っていません'
        };
    }
    
    // 現在の大運期数
    const taiunNumber = Math.floor((age - taiunStart) / 10);
    
    // 大運の干支を計算（月柱から順次変化）
    const taiunKanIndex = (jikkanList.indexOf(yearKan) + taiunNumber + 1) % 10;
    const taiunShiIndex = (etoList.indexOf(yearShi) + taiunNumber + 1) % 12;
    
    const taiunKanshi = jikkanList[taiunKanIndex] + etoList[taiunShiIndex];
    const startAge = taiunStart + (taiunNumber * 10);
    const endAge = startAge + 9;
    
    return {
        current: taiunKanshi,
        period: `${startAge}歳〜${endAge}歳`,
        number: taiunNumber + 1,
        description: `第${taiunNumber + 1}大運期（${taiunKanshi}）`,
        taiunStart: taiunStart  // 開始年齢も返す
    };
}

function calculateShichu(year, month, day, hour = 12, minute = 0) {
    // デバッグ: 入力値を確認
    console.log('calculateShichu 入力値:', { year, month, day, hour, minute });
    console.log('型チェック:', {
        yearType: typeof year,
        monthType: typeof month,
        dayType: typeof day,
        hourType: typeof hour,
        minuteType: typeof minute
    });
    
    // 正確な立春判定
    const risshun = calculateAccurateRisshun(year);
    const birthDate = new Date(year, month - 1, day, hour, minute);
    
    // 立春前の場合は前年として計算
    const calcYear = birthDate < risshun ? year - 1 : year;
    
    // 年柱（干支）- より正確な計算
    const yearKan = jikkanList[(calcYear - 4) % 10];
    const yearShi = etoList[(calcYear - 4) % 12];
    
    // 月柱 - 節入りを正確に考慮
    const setsunyu = calculateSetsunyu(year, month);
    let calcMonth = month;
    
    // 節入り前かどうかを判定
    if (birthDate < setsunyu) {
        calcMonth = month === 1 ? 12 : month - 1;
    }
    
    // 月柱の天干は年干から計算（五虎遁）
    const yearKanIndex = jikkanList.indexOf(yearKan);
    const monthKanBase = [2, 4, 6, 8, 0]; // 甲年の正月から始まる天干（丙寅）
    const monthKanIndex = (monthKanBase[yearKanIndex % 5] + (calcMonth - 1) * 2) % 10;
    const monthKan = jikkanList[monthKanIndex];
    const monthShi = etoList[(calcMonth + 1) % 12];
    
    // 日柱 - ユリウス通日を使用した正確な計算
    console.log('ユリウス日計算前:', { year, month, day, hour });
    let jdn = calculateJulianDayNumber(year, month, day);
    console.log('ユリウス日計算結果:', jdn);
    
    // ユリウス日を整数化してインデックス計算
    let jdnInt = Math.floor(jdn);
    
    // 【重要】23時以降（子の刻）は翌日の日柱として扱う
    if (hour >= 23) {
        jdnInt += 1;
        console.log('23時以降のため日柱を翌日に繰り上げ:', jdnInt);
    }
    
    const dayKanIndex = (jdnInt + 9) % 10;  // 基準日からの干支計算
    const dayShiIndex = (jdnInt + 1) % 12;
    const dayKan = jikkanList[dayKanIndex];
    const dayShi = etoList[dayShiIndex];
    console.log('日柱計算結果:', { jdnInt, dayKan, dayShi, dayKanIndex, dayShiIndex });
    
    // 時柱 - 子の刻（23-1時）の日跨ぎ処理を正確に
    let hourIndex;
    if (hour >= 23) {
        // 23時以降は翌日の子の刻
        hourIndex = 0;
    } else if (hour < 1) {
        // 0時台は前日の子の刻
        hourIndex = 0;
    } else {
        // 通常の時間帯
        hourIndex = Math.floor((hour + 1) / 2);
    }
    
    // 時柱の天干は日干から計算（五鼠遁）
    const dayKanIndex2 = jikkanList.indexOf(dayKan);
    const hourKanBase = [0, 2, 4, 6, 8]; // 甲日の子時から始まる天干（甲子）
    const hourKanIndex = (hourKanBase[dayKanIndex2 % 5] + hourIndex * 2) % 10;
    const hourKan = jikkanList[hourKanIndex];
    const hourShi = shiList[hourIndex];
    
    // 五行のカウント
    const elements = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    [yearKan, yearShi, monthKan, monthShi, dayKan, dayShi, hourKan, hourShi].forEach(char => {
        if (gogyou[char]) {
            elements[gogyou[char]]++;
        }
    });
    
    // デバッグログ
    console.log('四柱推命計算:', {
        year: yearKan + yearShi,
        month: monthKan + monthShi,
        day: dayKan + dayShi,
        hour: hourKan + hourShi,
        dayShi: dayShi
    });
    
    // 空亡の計算（日干と日支の組み合わせで判定）
    const kubou = calculateKubou(dayKan, dayShi);
    
    // 大運の計算（10年ごとの運勢の流れ）
    const taiunInfo = calculateTaiun(calcYear, month, day, yearKan, yearShi);
    
    return {
        year: yearKan + yearShi,
        month: monthKan + monthShi,
        day: dayKan + dayShi,
        hour: hourKan + hourShi,
        elements: elements,
        kubou: kubou,
        taiun: taiunInfo,
        note: `立春: ${risshun.getMonth() + 1}/${risshun.getDate()} ${risshun.getHours()}:${String(risshun.getMinutes()).padStart(2, '0')}`
    };
}

// ============================================================
// カバラ数秘術の計算
// ============================================================

function calculateKabbalah(year, month, day) {
    // 数秘術と同じアルゴリズムを使用
    return calculateNumerology(year, month, day);
}

// ============================================================
// 紫微斗数の計算
// ============================================================

function calculateZiwei(year, month, day, hour = 12) {
    const stars = Object.keys(ziweiData);
    const birthDate = new Date(year, month - 1, day, hour);
    const baseDate = new Date(1900, 0, 1);
    const daysDiff = Math.floor((birthDate - baseDate) / (1000 * 60 * 60 * 24));
    const hourIndex = Math.floor((hour + 1) % 24 / 2);
    const index = (daysDiff + hourIndex) % stars.length;
    
    return stars[index];
}

// ============================================================
// 年運タロットの計算
// ============================================================

function calculateYearTarot(year, month, day) {
    const cards = Object.keys(tarotData);
    const targetYear = 2026;
    
    // 生年月日と対象年を組み合わせて計算
    let sum = targetYear + year + month + day;
    while (sum >= cards.length) {
        sum = String(sum).split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
    }
    
    return cards[sum % cards.length];
}

// ============================================================
// 干支の取得
// ============================================================

function getEto(year, month, day) {
    // 正確な立春判定
    const risshun = calculateAccurateRisshun(year);
    const birthDate = new Date(year, month - 1, day);
    
    // 立春前の場合は前年として計算
    const calcYear = birthDate < risshun ? year - 1 : year;
    
    return etoList[(calcYear - 4) % 12];
}

// ============================================================
// 総合スコアの計算（定数を使用）
// ============================================================

function calculateTotalScore(birthYear, kyusei, numerology, western, gosei, shichu, kabbalah, ziwei, tarot) {
    // 生まれ年の干支を取得（スコア計算には使用しないが、参考情報として保持）
    const birthEto = getEto(birthYear, 2, 4);
    
    // 1. 干支×タロットの相性（15点固定）
    const etoTarotScore = SCORE_CONFIG.ETO_TAROT.min;
    
    // 2. 九星×西洋占星術の組み合わせ（10-20点）
    const kyuseiWesternCombos = {
        '一白水星': { '蟹座': 20, '蠍座': 18, '魚座': 19, '牡牛座': 15, '乙女座': 16 },
        '二黒土星': { '牡牛座': 20, '乙女座': 19, '山羊座': 18, '蟹座': 15 },
        '三碧木星': { '牡羊座': 20, '獅子座': 19, '射手座': 18, '双子座': 16, '水瓶座': 17 },
        '四緑木星': { '双子座': 20, '天秤座': 19, '水瓶座': 18, '牡羊座': 16 },
        '五黄土星': { '山羊座': 20, '牡牛座': 18, '乙女座': 17, '獅子座': 16 },
        '六白金星': { '天秤座': 20, '水瓶座': 19, '双子座': 18, '牡牛座': 15 },
        '七赤金星': { '獅子座': 20, '射手座': 19, '牡羊座': 18, '双子座': 16 },
        '八白土星': { '山羊座': 20, '牡牛座': 19, '乙女座': 18, '蠍座': 16 },
        '九紫火星': { '牡羊座': 20, '獅子座': 19, '射手座': 18, '天秤座': 16 }
    };
    const kyuseiWesternScore = kyuseiWesternCombos[kyusei]?.[western] || 12;
    
    // 3. 数秘術（10-15点）
    const numerologyScores = {
        1: 15, 2: 12, 3: 14, 4: 11, 5: 13,
        6: 12, 7: 11, 8: 14, 9: 13, 11: 15, 22: 15
    };
    const numerologyScore = numerologyScores[numerology] || 10;
    
    // 4. 五星三心（11-15点）
    const goseiScores = {
        '金のイルカ': 15, '銀のイルカ': 13, '金の鳳凰': 14, '銀の鳳凰': 13,
        '金のインディアン': 14, '銀のインディアン': 12, '金の時計': 13, '銀の時計': 12,
        '金のカメレオン': 15, '銀のカメレオン': 13, '金の羅針盤': 14, '銀の羅針盤': 12
    };
    const goseiScore = goseiScores[gosei] || 11;
    
    // 5. 四柱推命の五行バランス（10-25点）
    const elementValues = Object.values(shichu.elements);
    const maxElement = Math.max(...elementValues);
    const minElement = Math.min(...elementValues);
    const balance = maxElement - minElement;
    const shichuScore = Math.max(10, 25 - balance * 2);
    
    // 6. カバラ（3-5点）
    const kabbalahScore = kabbalah === 11 || kabbalah === 22 ? 5 : 
                          kabbalah === 1 || kabbalah === 9 ? 4 : 3;
    
    // 7. 紫微斗数（3-5点）
    const ziweiScores = {
        '紫微星': 5, '天機星': 4, '太陽星': 5, '武曲星': 4,
        '天同星': 5, '廉貞星': 4, '天府星': 5, '太陰星': 4,
        '貪狼星': 4, '巨門星': 3, '天相星': 4, '天梁星': 5,
        '七殺星': 4, '破軍星': 3
    };
    const ziweiScore = ziweiScores[ziwei] || 3;
    
    // 合計
    const rawScore = etoTarotScore + kyuseiWesternScore + numerologyScore + 
                     goseiScore + shichuScore + kabbalahScore + ziweiScore;
    
    return {
        etoTarot: etoTarotScore,
        kyuseiWestern: kyuseiWesternScore,
        numerology: numerologyScore,
        gosei: goseiScore,
        shichu: shichuScore,
        kabbalah: kabbalahScore,
        ziwei: ziweiScore,
        raw: rawScore,
        normalized: normalizeScore(rawScore)
    };
}

// ============================================================
// ランキング計算
// ============================================================

function calculateRanking(score) {
    const totalCombinations = 144;
    
    // スコアから決定的に順位を計算（同じスコアなら必ず同じ順位）
    // 線形マッピング: スコア100→1位、スコア60→144位
    const rank = Math.round(totalCombinations - ((score - 60) / 40) * (totalCombinations - 1));
    
    // 1-144の範囲に収める
    return Math.max(1, Math.min(totalCombinations, rank));
}

function getFortuneLevel(score) {
    if (score >= 90) return { stars: '★★★★★', message: '最高の大吉運！' };
    if (score >= 85) return { stars: '★★★★☆', message: '大吉運です' };
    if (score >= 80) return { stars: '★★★★', message: '吉運に恵まれています' };
    if (score >= 75) return { stars: '★★★☆', message: '良い運気です' };
    if (score >= 70) return { stars: '★★★', message: '安定した運気' };
    if (score >= 65) return { stars: '★★☆', message: '平穏な運気' };
    return { stars: '★★', message: '努力が実る年' };
}

// ============================================================
// フォーム送信処理
// ============================================================

document.getElementById('fortuneForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // ボタンを無効化（連打防止）
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    
    // 入力値の取得
    const year = parseInt(document.getElementById('birthYear').value);
    const month = parseInt(document.getElementById('birthMonth').value);
    const day = parseInt(document.getElementById('birthDay').value);
    const hourValue = document.getElementById('birthHour').value;
    const minuteValue = document.getElementById('birthMinute').value;
    const hour = hourValue ? parseInt(hourValue) : 12;
    const minute = minuteValue ? parseInt(minuteValue) : 0;
    
    // デバッグ: 取得した値を確認
    console.log('フォームから取得した値:', {
        year,
        month,
        day,
        hour,
        minute,
        yearRaw: document.getElementById('birthYear').value,
        monthRaw: document.getElementById('birthMonth').value,
        dayRaw: document.getElementById('birthDay').value
    });
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const name = document.getElementById('name').value.trim() || 'あなた';
    
    // バリデーション
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('バリデーションエラー:', { year, month, day });
        alert('生年月日を正しく入力してください');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        return;
    }
    
    // 未来日チェック
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (birthDate > today) {
        alert('未来の日付は選択できません');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        submitBtn.style.cursor = 'pointer';
        return;
    }
    
    // ローディング表示
    showLoading();
    
    // 少し遅延させて演出
    setTimeout(() => {
        try {
            // 各占術の計算
            const kyusei = calculateKyusei(year, month, day);
            const numerology = calculateNumerology(year, month, day);
            const western = calculateWesternZodiac(month, day);
            const gosei = calculateGosei(year, month, day, gender);
            const shichu = calculateShichu(year, month, day, hour, minute);
            const kabbalah = calculateKabbalah(year, month, day);
            const ziwei = calculateZiwei(year, month, day, hour);
            const tarot = calculateYearTarot(year, month, day);
            
            // 干支を取得
            const birthEto = getEto(year, month, day);
            
            // 結果を表示
            displayResults(name, kyusei, numerology, western, gosei, shichu, kabbalah, ziwei, tarot, birthEto, year, month, day, hour, minute);
            
            // フォームを非表示にして結果を表示
            document.querySelector('.fortune-card').style.display = 'none';
            document.getElementById('results').classList.remove('hidden');
            
            // 結果セクションまでスクロール
            setTimeout(() => {
                document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
        } catch (error) {
            console.error('占い計算エラー:', error);
            alert('占いの計算中にエラーが発生しました。もう一度お試しください。');
        } finally {
            // ローディング非表示
            hideLoading();
            
            // ボタンを有効化（念のため）
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    }, 1500);
});

// ============================================================
// 結果表示
// ============================================================

function displayResults(name, kyusei, num, western, gosei, shichu, kabbalah, ziwei, tarot, birthEto, birthYear, birthMonth, birthDay, birthHour, birthMinute) {
    // 九星気学
    const kyuseiInfo = kyuseiData[kyusei];
    document.getElementById('kyuseiStar').textContent = kyusei;
    document.getElementById('kyuseiDesc').innerHTML = kyuseiInfo.description;
    document.getElementById('kyuseiColor').textContent = kyuseiInfo.color;
    document.getElementById('kyuseiDirection').textContent = kyuseiInfo.direction;
    
    // ラッキーアイテムを追加表示
    document.querySelector('.lucky-info').innerHTML = `
        <div class="luck-item">ラッキーカラー: <span>${kyuseiInfo.color}</span></div>
        <div class="luck-item">ラッキー方位: <span>${kyuseiInfo.direction}</span></div>
        <div class="luck-item">ラッキーフード: <span>${kyuseiInfo.luckyFood}</span></div>
        <div class="luck-item">ラッキーアクション: <span>${kyuseiInfo.luckyAction}</span></div>
    `;
    
    // 数秘術
    document.getElementById('numerologyNumber').textContent = `運命数: ${num}`;
    document.getElementById('numerologyDesc').innerHTML = numerologyData[num].description;
    
    // 四柱推命（厳密版）
    const birthDateTime = new Date(birthYear, birthMonth - 1, birthDay, birthHour, birthMinute);
    const setsuniriNote = getSetsuniriNote(birthDateTime, birthYear, birthMonth, birthDay);
    
    // 大運情報の表示
    let taiunDisplay = '';
    if (shichu.taiun) {
        const taiunStartInfo = shichu.taiun.taiunStart 
            ? `<span style="font-size: 0.85em; color: #999;">（${shichu.taiun.taiunStart}歳から大運開始）</span>`
            : '';
        taiunDisplay = `
            <div class="taiun-display">
                <strong>📈 大運（10年運）:</strong> ${shichu.taiun.description} ${taiunStartInfo}<br>
                <span style="font-size: 0.9em; color: #666;">現在の運勢周期: ${shichu.taiun.period}</span>
            </div>
        `;
    }
    
    document.getElementById('shichuPillars').innerHTML = `
        ${setsuniriNote}
        <div class="pillar-row">
            <span class="pillar-label">年柱:</span>
            <span class="pillar-value">${shichu.year}</span>
            <span class="pillar-label">月柱:</span>
            <span class="pillar-value">${shichu.month}</span>
        </div>
        <div class="pillar-row">
            <span class="pillar-label">日柱:</span>
            <span class="pillar-value">${shichu.day}</span>
            <span class="pillar-label">時柱:</span>
            <span class="pillar-value">${shichu.hour}</span>
        </div>
        ${birthHour >= 23 ? '<p style="font-size: 0.85em; color: #ff9800; margin: 10px 0; padding: 8px; background: rgba(255, 152, 0, 0.1); border-left: 3px solid #ff9800;">ℹ️ 23時以降生まれのため、日柱は翌日の干支で計算されています。</p>' : ''}
        ${taiunDisplay}
        <div class="kubou-display">
            <strong>空亡（天中殺）:</strong> ${shichu.kubou && Array.isArray(shichu.kubou) ? shichu.kubou.join('・') : '--・--'}
            <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                ※空亡は運気の空白期間で、慎重な行動が求められる時期を示します
            </p>
        </div>
        <div style="text-align: right; font-size: 0.85em; color: #999; margin-top: 10px;">
            ${shichu.note || ''}
        </div>
    `;
    
    // 五行バランスの表示
    displayElements(shichu.elements);
    
    // 西洋占星術
    const westernInfo = westernZodiacData[western];
    document.getElementById('westernSign').textContent = `${western} ${westernInfo.emoji}`;
    document.getElementById('westernDesc').innerHTML = westernInfo.description;
    
    // 五星三心占い
    document.getElementById('goseiType').textContent = gosei;
    document.getElementById('goseiDesc').innerHTML = goseiData[gosei].description + 
        '<div style="margin-top: 15px; padding: 12px; background: rgba(76, 175, 80, 0.1); border: 2px solid #4CAF50; border-radius: 8px;">' +
        '<p style="font-size: 0.9em; color: #2E7D32; font-weight: bold; margin: 0 0 8px 0;">✓ 運命数テーブルを使用した正確な計算</p>' +
        '<p style="font-size: 0.85em; color: #666; line-height: 1.6; margin: 0;">' +
        '本アプリの五星三心占いは、<strong>運命数（1-60）テーブルを使用した正確な計算</strong>を行っています。<br>' +
        '西暦の偶数/奇数で金・銀を判定し、運命数の範囲でタイプを決定する標準的な方式を採用しています。<br>' +
        '<span style="font-size: 0.8em; color: #999;">※1930-2029年に対応。範囲外の年は60年周期で近似値を使用します。</span>' +
        '</p>' +
        '</div>';
    
    // カバラ占術
    document.getElementById('kabbalahNumber').textContent = `運命数: ${kabbalah}`;
    document.getElementById('kabbalahDesc').innerHTML = kabbalahData[kabbalah].description;
    
    // 紫微斗数
    document.getElementById('ziweiStar').textContent = ziwei;
    document.getElementById('ziweiDesc').innerHTML = ziweiData[ziwei].description;
    
    // 年運タロット
    document.getElementById('tarotCard').textContent = tarot;
    document.getElementById('tarotDesc').innerHTML = tarotData[tarot].description;
    
    // 総合運勢
    displayTotal(name, kyusei, num, western, gosei, shichu, ziwei, tarot);
    
    // ランキング表示
    displayRanking(name, birthYear, birthEto, western, kyusei, num, gosei, shichu, kabbalah, ziwei, tarot);
    
    // コピー用テキスト生成
    generateCopyText(name, birthYear, birthMonth, birthDay, birthHour, birthMinute, kyusei, num, western, gosei, shichu, kabbalah, ziwei, tarot, birthEto);
}

// ============================================================
// 五行バランス表示（バーとレーダーチャート）
// ============================================================

function displayElements(elements) {
    const elementOrder = ['木', '火', '土', '金', '水'];
    const maxCount = Math.max(...Object.values(elements));
    
    let html = '<div class="element-bars">';
    elementOrder.forEach(element => {
        const count = elements[element];
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
        html += `
            <div class="element-item">
                <span class="element-name">${element}</span>
                <div class="element-bar">
                    <div class="element-fill" style="width: 0%" data-width="${percentage}%"></div>
                </div>
                <span class="element-count">${count}</span>
            </div>
        `;
    });
    html += '</div>';
    
    document.getElementById('shichuElements').innerHTML = html;
    
    // アニメーション付きでバーを伸ばす
    setTimeout(() => {
        document.querySelectorAll('.element-fill').forEach(fill => {
            fill.style.width = fill.dataset.width;
        });
    }, 100);
    
    // レーダーチャートを描画
    setTimeout(() => {
        drawRadarChart(elements);
    }, 500);
    
    // リサイズ時に再描画（デバウンス処理付き）
    let resizeTimer;
    const resizeHandler = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            drawRadarChart(elements);
        }, 250);
    };
    
    // 既存のリスナーを削除してから追加（重複防止）
    window.removeEventListener('resize', resizeHandler);
    window.addEventListener('resize', resizeHandler);
}

function drawRadarChart(elements) {
    const canvas = document.getElementById('gogyouRadarChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Retina対応とレスポンシブ対応
    const dpr = window.devicePixelRatio || 1;
    const container = canvas.parentElement;
    const size = Math.min(container.clientWidth, 300); // 最大300px
    
    // CSSサイズを設定
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // 実際のキャンバスサイズをRetina対応
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    
    // スケーリング（setTransformで累算を防ぐ）
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY) - 40;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, size, size);
    
    // 背景色（より透過）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(0, 0, size, size);
    
    const elementOrder = ['木', '火', '土', '金', '水'];
    const maxCount = Math.max(...Object.values(elements), 4);
    const angleStep = (Math.PI * 2) / 5;
    
    // グリッド線を描画（強調）
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.3)';
    ctx.lineWidth = 1;
    
    for (let level = 1; level <= 4; level++) {
        ctx.beginPath();
        for (let i = 0; i <= 5; i++) {
            const angle = angleStep * i - Math.PI / 2;
            const r = (radius / 4) * level;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // 軸線を描画
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 5; i++) {
        const angle = angleStep * i - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
    }
    
    // データポイントを描画
    ctx.beginPath();
    ctx.fillStyle = 'rgba(118, 75, 162, 0.3)';
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.8)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i <= 5; i++) {
        const element = elementOrder[i % 5];
        const value = elements[element];
        const angle = angleStep * i - Math.PI / 2;
        const r = (radius / maxCount) * value;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // データポイントに円を描画
    ctx.fillStyle = 'rgba(102, 126, 234, 1)';
    for (let i = 0; i < 5; i++) {
        const element = elementOrder[i];
        const value = elements[element];
        const angle = angleStep * i - Math.PI / 2;
        const r = (radius / maxCount) * value;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // ラベルを描画（ツールチップ風）
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const labelDescriptions = {
        '木': '木(成長)',
        '火': '火(情熱)',
        '土': '土(安定)',
        '金': '金(決断)',
        '水': '水(知恵)'
    };
    
    for (let i = 0; i < 5; i++) {
        const element = elementOrder[i];
        const angle = angleStep * i - Math.PI / 2;
        const labelRadius = radius + 25;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        
        ctx.fillText(labelDescriptions[element], x, y);
    }
}

// ============================================================
// 総合運勢の生成（名前を活用）
// ============================================================

const fortuneTemplates = {
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
    }
};

function displayTotal(userName, kyusei, num, western, gosei, shichu, ziwei, tarot) {
    console.log('総合運勢を生成中...', { userName, kyusei, num, western, gosei });
    
    // ローディング表示
    document.getElementById('totalFortune').innerHTML = '<p style="text-align: center; color: #764ba2; font-weight: bold; animation: pulse 1.5s infinite;">✨ 総合運勢を鑑定中...</p>';
    
    // 少し遅延を入れて鑑定している感を出す
    setTimeout(() => {
        const kyuseiInfo = kyuseiData[kyusei];
        const numInfo = numerologyData[num];
        const westernInfo = westernZodiacData[western];
        const goseiInfo = goseiData[gosei];
        const ziweiInfo = ziweiData[ziwei];
        const tarotInfo = tarotData[tarot];
        
        const dominantElement = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1])[0];
        
        // 五行バランスに基づいたパーソナライズされたアドバイス
        const elementAdvice = {
            '木': {
                strong: 'あなたは「木」のエネルギーが強く、成長意欲と創造性に満ちています。新しいことに挑戦する力がある反面、時には柔軟性を持って周囲と協調することも大切です。',
                weak: '「木」のエネルギーが少なめなので、積極性を高めることで運気が上昇します。植物を育てたり、緑の多い場所で過ごすと良いでしょう。'
            },
            '火': {
                strong: 'あなたは「火」のエネルギーが強く、情熱的で行動力があります。明るく人を惹きつける魅力がある反面、時には冷静さを保ち、心身の休息を大切にしましょう。',
                weak: '「火」のエネルギーが少なめなので、積極的に人と交流し、明るい色を取り入れると運気が高まります。太陽の光を浴びることも効果的です。'
            },
            '土': {
                strong: 'あなたは「土」のエネルギーが強く、安定感と信頼性があります。着実に物事を進める力がある反面、変化を恐れず新しいことにも挑戦すると、さらに運気が開けます。',
                weak: '「土」のエネルギーが少なめなので、規則正しい生活と地に足のついた行動を心がけると良いでしょう。陶芸や園芸などもおすすめです。'
            },
            '金': {
                strong: 'あなたは「金」のエネルギーが強く、決断力と正義感があります。物事を明確に判断する力がある反面、時には柔軟な対応や感情的な配慮も意識すると人間関係が円滑になります。',
                weak: '「金」のエネルギーが少なめなので、整理整頓や計画性を高めると運気が上がります。金属製のアクセサリーを身につけるのも良いでしょう。'
            },
            '水': {
                strong: 'あなたは「水」のエネルギーが強く、知恵と柔軟性に優れています。状況に応じて変化できる力がある反面、時には意志を強く持ち、流されすぎないよう注意しましょう。',
                weak: '「水」のエネルギーが少なめなので、学びや知識を深めることで運気が高まります。水辺で過ごしたり、水分補給を意識するのも効果的です。'
            }
        };
        
        // 最も多い五行と最も少ない五行を特定
        const sortedElements = Object.entries(shichu.elements).sort((a, b) => b[1] - a[1]);
        const strongestElement = sortedElements[0];
        const weakestElement = sortedElements[sortedElements.length - 1];
        
        // バランスの良し悪しを判定
        const isBalanced = strongestElement[1] - weakestElement[1] <= 2;
        
        let gogyouAdvice;
        if (isBalanced) {
            gogyouAdvice = `五行のバランスが非常に良く、調和のとれた運気を持っています。このバランスを保つことで、さらなる幸運を引き寄せることができるでしょう。`;
        } else {
            gogyouAdvice = elementAdvice[strongestElement[0]].strong;
            if (weakestElement[1] === 0) {
                gogyouAdvice += ` また、${elementAdvice[weakestElement[0]].weak}`;
            }
        }
        
        const openings = [
            `${userName}さんの運命には、<strong>${kyusei}</strong>の持つ神秘的な力と、運命数<strong>${num}</strong>が示す特別な使命が宿っています。`,
            `<strong>${kyusei}</strong>として生まれた${userName}さんには、運命数<strong>${num}</strong>が授けた独自の才能があります。`,
            `${userName}さんは運命数<strong>${num}</strong>と<strong>${kyusei}</strong>の組み合わせにより、特別な人生の意味を持っています。`,
            `<strong>${kyusei}</strong>の性質と運命数<strong>${num}</strong>の力が、${userName}さんの中で美しく調和しています。`
        ];
        
        const yearForecasts = [
            `2026年は年運タロット「<strong>${tarot}</strong>」が示すように、${tarotInfo.description}`,
            `${userName}さんの今年の年運タロット「<strong>${tarot}</strong>」が現れました。${tarotInfo.description}`,
            `<strong>${western}</strong> ${westernInfo.emoji}として迎える2026年、年運タロット「<strong>${tarot}</strong>」の力が加わることで、${tarotInfo.description}`,
            `${userName}さんの2026年、${westernInfo.description}年運タロット「<strong>${tarot}</strong>」が示すように、${tarotInfo.description}`
        ];
        
        const elements = [
            `${userName}さんの四柱推命では<strong>${dominantElement[0]}</strong>の気が強く現れており、バランスの取れた運気の流れを持っています。`,
            `<strong>${dominantElement[0]}</strong>の要素が際立つ${userName}さんの命式は、安定した運気の基盤を示しています。`,
            `五行では<strong>${dominantElement[0]}</strong>が優勢で、${userName}さんには調和のとれた運命の流れが見られます。`
        ];
        
        const advice = [
            `<strong>${gosei}</strong>の特性を活かし、${goseiInfo.description}${userName}さんはこの一年、その魅力を存分に発揮できるでしょう。`,
            `五星三心の<strong>${gosei}</strong>として、${goseiInfo.description}${userName}さん、この個性を大切にしてください。`,
            `${userName}さんは<strong>${gosei}</strong>の力を信じて進むことで、予想以上の成果が得られます。`
        ];
        
        const ziweiFortune = [
            `紫微斗数の<strong>${ziwei}</strong>は、${ziweiInfo.description}${userName}さんはこの星の力を借りて、大きな飛躍が期待できます。`,
            `<strong>${ziwei}</strong>の加護を受ける${userName}さんは、${ziweiInfo.description}チャンスを確実につかむことができるでしょう。`,
            `${userName}さんには<strong>${ziwei}</strong>が示すように、${ziweiInfo.description}運命の流れに身を任せてください。`
        ];
        
        const conclusions = [
            `${userName}さん、${kyuseiInfo.color}を身につけ、${kyuseiInfo.direction}の方位を意識することで、さらに運気が高まります。2026年は、あなたらしさを大切にしながら、新しい可能性にも目を向けていってください！✨`,
            `ラッキーカラーの${kyuseiInfo.color}と、幸運の方位${kyuseiInfo.direction}が、${userName}さんの人生をサポートします。自分を信じて、輝かしい一年を過ごしましょう！🌟`,
            `${userName}さん、${kyuseiInfo.color}を取り入れ、${kyuseiInfo.direction}を意識することで、幸運の波に乗れます。この一年が、あなたにとって最高の年になりますように！💫`
        ];
        
        const fortune = `
            <p>${openings[Math.floor(Math.random() * openings.length)]}</p>
            <p><strong>2026年の展望:</strong> ${yearForecasts[Math.floor(Math.random() * yearForecasts.length)]}</p>
            <p>${elements[Math.floor(Math.random() * elements.length)]} ${ziweiFortune[Math.floor(Math.random() * ziweiFortune.length)]}</p>
            <p><strong>五行バランスからのアドバイス:</strong> ${gogyouAdvice}</p>
            <p><strong>開運のヒント:</strong> ${advice[Math.floor(Math.random() * advice.length)]}</p>
            <p>${conclusions[Math.floor(Math.random() * conclusions.length)]}</p>
        `;
        
        document.getElementById('totalFortune').innerHTML = fortune;
        console.log('✨ 総合運勢の生成完了');
    }, 1000);
}

// ============================================================
// ランキング表示
// ============================================================

function displayRanking(userName, birthYear, birthEto, western, kyusei, num, gosei, shichu, kabbalah, ziwei, tarot) {
    const scores = calculateTotalScore(birthYear, kyusei, num, western, gosei, shichu, kabbalah, ziwei, tarot);
    const totalScore = scores.normalized;
    const ranking = calculateRanking(totalScore);
    const fortuneLevel = getFortuneLevel(totalScore);
    
    const westernEmoji = westernZodiacData[western].emoji;
    document.getElementById('etoSignCombo').innerHTML = 
        `<strong>${userName}さんの2026年運勢</strong><br>${birthEto}年生まれ × ${western}${westernEmoji}`;
    
    document.getElementById('scoreBreakdown').innerHTML = `
        <div class="score-item">
            <span class="score-label">干支×タロット</span>
            <span class="score-value">${scores.etoTarot}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">九星×西洋占星術</span>
            <span class="score-value">${scores.kyuseiWestern}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">数秘術</span>
            <span class="score-value">${scores.numerology}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">五星三心</span>
            <span class="score-value">${scores.gosei}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">四柱推命</span>
            <span class="score-value">${scores.shichu}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">カバラ</span>
            <span class="score-value">${scores.kabbalah}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">紫微斗数</span>
            <span class="score-value">${scores.ziwei}点</span>
        </div>
    `;
    
    document.getElementById('totalScoreDisplay').innerHTML = `
        総合スコア
        <span class="score-number">${totalScore}</span>
        <span class="score-max">/ 100点</span>
    `;
    
    document.getElementById('rankingPosition').textContent = 
        `144通りの組み合わせ中 ${ranking}位`;
    
    document.getElementById('fortuneLevel').innerHTML = `
        <div class="star-rating">${fortuneLevel.stars}</div>
        <div class="fortune-message">${fortuneLevel.message}</div>
    `;
}

// ============================================================
// コピー用テキスト生成
// ============================================================

function generateCopyText(userName, year, month, day, hour, minute, kyusei, num, western, gosei, shichu, kabbalah, ziwei, tarot, birthEto) {
    const westernEmoji = westernZodiacData[western].emoji;
    const timeStr = hour !== 12 || minute !== 0 ? ` ${hour}時${minute}分` : '';
    
    const copyText = `【${userName}さんの運勢鑑定結果 - 2026年】

生年月日: ${year}年${month}月${day}日${timeStr}
干支: ${birthEto}年生まれ
西洋占星術: ${western}${westernEmoji}

━━━━━━━━━━━━━━━━
📊 8種類の占術による総合鑑定
━━━━━━━━━━━━━━━━

🌟 九星気学: ${kyusei}
${kyuseiData[kyusei].description}
ラッキーカラー: ${kyuseiData[kyusei].color}
ラッキー方位: ${kyuseiData[kyusei].direction}
ラッキーフード: ${kyuseiData[kyusei].luckyFood}
ラッキーアクション: ${kyuseiData[kyusei].luckyAction}

🔢 数秘術: 運命数${num}
${numerologyData[num].description}

🎋 四柱推命
年柱: ${shichu.year} / 月柱: ${shichu.month}
日柱: ${shichu.day} / 時柱: ${shichu.hour}
空亡: ${shichu.kubou && Array.isArray(shichu.kubou) ? shichu.kubou.join('・') : '--・--'}
五行バランス: 木${shichu.elements['木']} 火${shichu.elements['火']} 土${shichu.elements['土']} 金${shichu.elements['金']} 水${shichu.elements['水']}
${shichu.taiun ? `大運: ${shichu.taiun.description} (${shichu.taiun.period})` : ''}

♈ 西洋占星術: ${western}${westernEmoji}
${westernZodiacData[western].description}

🎭 五星三心占い: ${gosei}
${goseiData[gosei].description}

🔯 カバラ占術: 運命数${kabbalah}
${kabbalahData[kabbalah].description}

🟣 紫微斗数: ${ziwei}
${ziweiData[ziwei].description}

🃏 2026年運タロット: ${tarot}
${tarotData[tarot].description}

━━━━━━━━━━━━━━━━
💬 AIで詳しく占いたい方へ
━━━━━━━━━━━━━━━━

上記の結果をAI（ChatGPT、Gemini等）にコピー＆ペーストして、
以下のプロンプトと一緒に送信してください：

━━━━━━━━━━━━━━━━
【推奨プロンプト】

あなたは熟練の占術師です。上記の8種類の占術による鑑定結果に基づき、${userName}さんの2026年の運勢を、具体的かつ前向きなアドバイスと共に詳しく鑑定してください。

特に以下の点について教えてください：
1. 2026年の総合運勢と主要な運気の流れ
2. 恋愛運・仕事運・金運・健康運の詳細
3. ${userName}さんの性格的な特徴と才能
4. 2026年に特に注意すべき時期と開運のタイミング
5. 人生で大切にすべきことと、今後の指針

━━━━━━━━━━━━━━━━

【その他の質問例】
・「私に向いている職業や適性を教えてください」
・「人間関係で気をつけるべきことは何ですか？」
・「運気を上げるための具体的なアクションを教えてください」
・「2026年の月ごとの運勢の変化を教えてください」`;
    
    document.getElementById('copyText').value = copyText;
    
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.onclick = async function() {
        const textarea = document.getElementById('copyText');
        const text = textarea.value;
        
        try {
            // 最新のClipboard APIを使用
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // フォールバック: 古いブラウザ用
                textarea.select();
                document.execCommand('copy');
            }
            
            // 成功時のフィードバック
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ コピーしました！';
            copyBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        } catch (err) {
            console.error('コピー失敗:', err);
            alert('コピーに失敗しました。手動でコピーしてください。');
        }
    };
    
    // AIボタンにクリック時のリマインド機能を追加
    document.querySelectorAll('.ai-btn').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            const copyText = document.getElementById('copyText').value;
            if (!copyText) return;
            
            // 結果がコピー済みかチェック
            const isCopied = copyBtn.innerHTML.includes('コピーしました');
            
            if (!isCopied) {
                // まだコピーしていない場合、確認ダイアログを表示
                const confirmed = confirm('結果をクリップボードにコピーしてからAIサイトに移動しますか？\n\n「OK」を押すと自動でコピーして移動します。');
                if (confirmed) {
                    try {
                        // 最新のClipboard APIを使用
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                            await navigator.clipboard.writeText(copyText);
                        } else {
                            // フォールバック: 古いブラウザ用
                            document.getElementById('copyText').select();
                            document.execCommand('copy');
                        }
                        
                        // フィードバック表示
                        copyBtn.innerHTML = '✅ コピーしました！';
                        copyBtn.style.background = 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)';
                    } catch (err) {
                        console.error('コピー失敗:', err);
                        alert('コピーに失敗しました。手動でコピーしてからAIサイトに移動してください。');
                        e.preventDefault();
                    }
                } else {
                    // キャンセルされた場合は移動しない
                    e.preventDefault();
                }
            }
        });
    });
}

function resetForm() {
    location.reload();
}

// ============================================================
// ローディング演出
// ============================================================

function showLoading() {
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
// スコア正規化（定数を使用）
// ============================================================

function normalizeScore(rawScore) {
    const normalized = 60 + ((rawScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 40;
    return Math.round(Math.max(60, Math.min(100, normalized)));
}