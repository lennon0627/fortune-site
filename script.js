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
    1: { description: `
<strong>― 創造と始動の数 ―</strong><br><br>
<strong>本質</strong><br>
あなたは「最初の一歩」を踏み出すために生まれてきた人。誰もやっていないこと、まだ形になっていないアイデアに命を吹き込む力を持ちます。<br><br>

<strong>強み</strong><br>
・行動力と決断力／独立心／突破力とリーダーシップ<br><br>

<strong>課題・注意点</strong><br>
・独断専行になりやすい／孤立しがち／失敗を弱さと誤解しやすい<br><br>

<strong>開運アドバイス</strong><br>
「完璧」を待たず<strong>7割で始める</strong>ことが運気上昇の鍵。信頼できる相談相手を一人持つと成功が加速します。<br><br>

<strong>仕事・人間関係</strong><br>
起業・新規企画・プロジェクト立ち上げ役に最適。フォロワーではなく「旗振り役」で本領発揮。`
    },
    2: { description: `
<strong>― 調和と受容の数 ―</strong><br><br>
<strong>本質</strong><br>
人と人、心と心をつなぐ「橋渡し役」。争いを和らげ、場の空気を整える天性の感受性を持ちます。<br><br>

<strong>強み</strong><br>
・共感力／聞く力／調整力／サポートで信頼される<br><br>

<strong>課題・注意点</strong><br>
・本音を後回しにしがち／合わせすぎて疲れる／優柔不断になりやすい<br><br>

<strong>開運アドバイス</strong><br>
「NO」と言う練習を。自分の気持ちを書き出すと心のバランスが整います。<br><br>

<strong>仕事・人間関係</strong><br>
秘書・調整役・カウンセリング・教育分野で開花。縁の下の力持ちとして評価されます。`
    },
    3: { description: `
<strong>― 表現と喜びの数 ―</strong><br><br>
<strong>本質</strong><br>
あなたは「楽しさ」を広げる存在。言葉・表情・感性を通じて人の心を明るく照らします。<br><br>

<strong>強み</strong><br>
・表現力／発信力／社交性／創造的アイデア<br><br>

<strong>課題・注意点</strong><br>
・飽きっぽさ／感情の波／話が広がりすぎやすい<br><br>

<strong>開運アドバイス</strong><br>
話す・書く・描くなどアウトプットを習慣に。<strong>締切</strong>を設けると才能が形になります。<br><br>

<strong>仕事・人間関係</strong><br>
広報・営業・芸術・教育・SNS発信と好相性。`
    },
    4: { description: `
<strong>― 基盤と安定の数 ―</strong><br><br>
<strong>本質</strong><br>
秩序と信頼を築く「土台の人」。目立たなくても、あなたがいることで物事は崩れません。<br><br>

<strong>強み</strong><br>
・継続力／責任感／実務能力／誠実さ<br><br>

<strong>課題・注意点</strong><br>
・変化を恐れやすい／融通が利かない／頑張りすぎて疲弊<br><br>

<strong>開運アドバイス</strong><br>
週に一度「予定を入れない日」を作る。小さな変化を楽しむと運が動きます。<br><br>

<strong>仕事・人間関係</strong><br>
管理・事務・技術・インフラ系で真価発揮。`
    },
    5: { description: `
<strong>― 変化と自由の数 ―</strong><br><br>
<strong>本質</strong><br>
変化の波に乗る冒険者。停滞を壊し、新しい風を運ぶ存在です。<br><br>

<strong>強み</strong><br>
・柔軟性／適応力／情報感度／行動範囲の広さ<br><br>

<strong>課題・注意点</strong><br>
・落ち着きのなさ／継続が苦手／刺激を求めすぎる<br><br>

<strong>開運アドバイス</strong><br>
「自由＋ルール」。最低限の習慣（睡眠・運動など）を固定すると才能が安定します。<br><br>

<strong>仕事・人間関係</strong><br>
変化が多い環境、企画、営業、旅やイベントなどで運が伸びます。`
    },
    6: { description: `
<strong>― 愛と責任の数 ―</strong><br><br>
<strong>本質</strong><br>
守り、育て、支える役割。人の人生に深く関わる使命を持ちます。<br><br>

<strong>強み</strong><br>
・面倒見の良さ／誠実さ／安心感／調和を作る力<br><br>

<strong>課題・注意点</strong><br>
・世話の焼きすぎ／自己犠牲／境界線が曖昧になりやすい<br><br>

<strong>開運アドバイス</strong><br>
「自分を満たす時間」を最優先に。与える前に受け取ること。<br><br>

<strong>仕事・人間関係</strong><br>
教育・医療福祉・マネジメント・家庭運で強みが活きます。`
    },
    7: { description: `
<strong>― 探究と神秘の数 ―</strong><br><br>
<strong>本質</strong><br>
真理を探す求道者。表面的な答えでは満足せず、本質を見抜こうとします。<br><br>

<strong>強み</strong><br>
・洞察力／分析力／学びの深さ／精神性<br><br>

<strong>課題・注意点</strong><br>
・孤立しやすい／考えすぎ／現実逃避になりやすい<br><br>

<strong>開運アドバイス</strong><br>
学びを「言語化」して共有すると運が開きます（ブログ・メモ・講座など）。<br><br>

<strong>仕事・人間関係</strong><br>
研究・分析・専門職・コンサル・職人気質の分野と好相性。`
    },
    8: { description: `
<strong>― 成功と現実化の数 ―</strong><br><br>
<strong>本質</strong><br>
理想を現実に変える力の人。お金・組織・影響力と縁が深いタイプです。<br><br>

<strong>強み</strong><br>
・実行力／結果を出す力／目標達成力／統率力<br><br>

<strong>課題・注意点</strong><br>
・支配的になりやすい／失敗への恐れ／休まない<br><br>

<strong>開運アドバイス</strong><br>
成功を「分かち合う」ことで運気が安定。休息を戦略として入れると強くなります。<br><br>

<strong>仕事・人間関係</strong><br>
経営・マネジメント・投資・交渉ごとで強み。`
    },
    9: { description: `
<strong>― 完成と博愛の数 ―</strong><br><br>
<strong>本質</strong><br>
多くの経験を経て、人を導く存在。精神的成熟と「手放し」がテーマです。<br><br>

<strong>強み</strong><br>
・包容力／視野の広さ／共感／理想を語れる力<br><br>

<strong>課題・注意点</strong><br>
・過去に囚われる／情に流される／抱え込みやすい<br><br>

<strong>開運アドバイス</strong><br>
「終わらせる」「手放す」を意識すると運が回復。寄付やボランティアなども吉。<br><br>

<strong>仕事・人間関係</strong><br>
教育・支援・芸術・奉仕的役割で存在感が増します。`
    },
    11: { description: `
<strong>― マスターナンバー：直感と啓示 ―</strong><br><br>
<strong>本質</strong><br>
強い直感と使命を持つ魂。普通の人生では物足りず、感性や霊感が人生を導きます。<br><br>

<strong>強み</strong><br>
・インスピレーション／共感／表現力／人を目覚めさせる力<br><br>

<strong>課題・注意点</strong><br>
・繊細さ／不安定さ／理想と現実のギャップで消耗しやすい<br><br>

<strong>開運アドバイス</strong><br>
直感を信じて「表現」へ。創作・発信・人前で話すほど運が開きます。<br><br>

<strong>仕事・人間関係</strong><br>
アート・企画・カウンセリング・スピリチュアル分野などで輝きます。`
    },
    22: { description: `
<strong>― マスターナンバー：理想の実装 ―</strong><br><br>
<strong>本質</strong><br>
夢を社会に実装する「建築家」。大きなビジョンを現実の仕組みに変える使命を持ちます。<br><br>

<strong>強み</strong><br>
・実務力＋ビジョン／スケールの大きさ／組織化／長期計画<br><br>

<strong>課題・注意点</strong><br>
・責任を背負いすぎる／完璧主義／孤軍奮闘になりやすい<br><br>

<strong>開運アドバイス</strong><br>
一人で抱えず「仲間と進む」こと。分担と仕組み化で運が最大化します。<br><br>

<strong>仕事・人間関係</strong><br>
事業開発・組織運営・教育・社会的プロジェクトで大成功の器。`
    }
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
// 総合スコアの計算（6つの占術で100点満点）
// ============================================================

function calculateTotalScore(birthYear, kyusei, western, gosei, shichu, kabbalah, sukuyo) {
    // 生まれ年の干支を取得（参考情報として保持）
    const birthEto = getEto(birthYear, 2, 4);
    
    // 1. 四柱推命の五行バランス（20-30点）★最重要
    const elementValues = Object.values(shichu.elements);
    const maxElement = Math.max(...elementValues);
    const minElement = Math.min(...elementValues);
    const balance = maxElement - minElement;
    // バランスが良いほど高得点（最大30点、最小20点）
    const shichuScore = Math.max(20, 30 - balance * 1.5);
    
    // 2. 九星×西洋占星術の組み合わせ（18-28点）★重要
    const kyuseiWesternCombos = {
        '一白水星': { '蟹座': 28, '蠍座': 26, '魚座': 27, '牡牛座': 23, '乙女座': 24, '山羊座': 25 },
        '二黒土星': { '牡牛座': 28, '乙女座': 27, '山羊座': 26, '蟹座': 23, '蠍座': 24, '魚座': 25 },
        '三碧木星': { '牡羊座': 28, '獅子座': 27, '射手座': 26, '双子座': 24, '水瓶座': 25, '天秤座': 23 },
        '四緑木星': { '双子座': 28, '天秤座': 27, '水瓶座': 26, '牡羊座': 24, '獅子座': 25, '射手座': 23 },
        '五黄土星': { '山羊座': 28, '牡牛座': 26, '乙女座': 25, '獅子座': 24, '蟹座': 23, '蠍座': 24 },
        '六白金星': { '天秤座': 28, '水瓶座': 27, '双子座': 26, '牡牛座': 23, '乙女座': 24, '山羊座': 25 },
        '七赤金星': { '獅子座': 28, '射手座': 27, '牡羊座': 26, '双子座': 24, '天秤座': 25, '水瓶座': 23 },
        '八白土星': { '山羊座': 28, '牡牛座': 27, '乙女座': 26, '蠍座': 24, '蟹座': 25, '魚座': 23 },
        '九紫火星': { '牡羊座': 28, '獅子座': 27, '射手座': 26, '天秤座': 24, '双子座': 25, '水瓶座': 23 }
    };
    const kyuseiWesternScore = kyuseiWesternCombos[kyusei]?.[western] || 21;
    
    // 3. 五星三心（15-20点）★重要
    const goseiScores = {
        '金のイルカ': 20, '銀のイルカ': 18, '金の鳳凰': 19, '銀の鳳凰': 18,
        '金のインディアン': 19, '銀のインディアン': 17, '金の時計': 18, '銀の時計': 17,
        '金のカメレオン': 20, '銀のカメレオン': 18, '金の羅針盤': 19, '銀の羅針盤': 17
    };
    const goseiScore = goseiScores[gosei] || 16;
    
    // 4. 宿曜占星術（10-15点）
    const sukuyoScores = {
        '角': 15, '亢': 14, '氏': 13, '房': 15, '心': 14, '尾': 13, '箕': 12,
        '斗': 14, '女': 13, '虚': 12, '危': 13, '室': 14, '壁': 12, '奎': 15,
        '婁': 13, '胃': 14, '昴': 15, '畢': 14, '觜': 13, '参': 14, '井': 13,
        '鬼': 12, '柳': 15, '星': 14, '張': 15, '翼': 14, '軫': 13
    };
    const sukuyoScore = sukuyoScores[sukuyo] || 13;
    
    // 5. カバラ数秘術（10-15点）
    const kabbalahScores = {
        1: 15, 2: 12, 3: 14, 4: 11, 5: 13,
        6: 12, 7: 11, 8: 14, 9: 13, 11: 15, 22: 15
    };
    const kabbalahScore = kabbalahScores[kabbalah] || 10;
    
    // 合計（最大約100点）
    const rawScore = shichuScore + kyuseiWesternScore + goseiScore + sukuyoScore + kabbalahScore;
    
    return {
        shichu: shichuScore,
        kyuseiWestern: kyuseiWesternScore,
        gosei: goseiScore,
        sukuyo: sukuyoScore,
        kabbalah: kabbalahScore,
        total: rawScore,
        percentage: Math.round(rawScore) // 100点満点
    };
}

// ============================================================
// ランキング計算
// ============================================================

function calculateRanking(score) {
    const totalCombinations = 108; // 9九星 × 12星座 = 108通り
    
    // スコアから決定的に順位を計算（同じスコアなら必ず同じ順位）
    // 線形マッピング: スコア100→1位、スコア60→108位
    const rank = Math.round(totalCombinations - ((score - 60) / 40) * (totalCombinations - 1));
    
    // 1-108の範囲に収める
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
            const western = calculateWesternZodiac(month, day);
            const gosei = calculateGosei(year, month, day, gender);
            const shichu = calculateShichu(year, month, day, hour, minute);
            const kabbalah = calculateKabbalah(year, month, day);
            const sukuyo = calculateSukuyo(year, month, day);  // 宿曜占星術
            
            // 干支を取得
            const birthEto = getEto(year, month, day);
            
            // 結果を表示
            displayResults(name, kyusei, western, gosei, shichu, kabbalah, sukuyo, birthEto, year, month, day, hour, minute);
            
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
// DOM参照の安全ラッパー（要素が無い場合でも落とさない）
// ============================================================
function safeGet(id) {
    return document.getElementById(id);
}
function safeSetText(id, value) {
    const el = safeGet(id);
    if (!el) {
        console.warn(`[UI] #${id} が見つかりません（HTML側のid不足の可能性）`);
        return;
    }
    el.textContent = value ?? '';
}
function safeSetHTML(id, value) {
    const el = safeGet(id);
    if (!el) {
        console.warn(`[UI] #${id} が見つかりません（HTML側のid不足の可能性）`);
        return;
    }
    el.innerHTML = value ?? '';
}
function safeQuerySetHTML(selector, value) {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn(`[UI] ${selector} が見つかりません（HTML側のclass不足の可能性）`);
        return;
    }
    el.innerHTML = value ?? '';
}

// ============================================================
// 結果表示
// ============================================================

function displayResults(name, kyusei, western, gosei, shichu, kabbalah, sukuyo, birthEto, birthYear, birthMonth, birthDay, birthHour, birthMinute) {
    // 九星気学
    const kyuseiInfo = kyuseiData[kyusei];
    safeSetText('kyuseiStar', kyusei);
    safeSetHTML('kyuseiDesc', kyuseiInfo.description);
    safeSetText('kyuseiColor', kyuseiInfo.color);
    safeSetText('kyuseiDirection', kyuseiInfo.direction);
    
    // ラッキーアイテムを追加表示
    safeQuerySetHTML('.lucky-info', `
        <div class="luck-item">ラッキーカラー: <span>${kyuseiInfo.color}</span></div>
        <div class="luck-item">ラッキー方位: <span>${kyuseiInfo.direction}</span></div>
        <div class="luck-item">ラッキーフード: <span>${kyuseiInfo.luckyFood}</span></div>
        <div class="luck-item">ラッキーアクション: <span>${kyuseiInfo.luckyAction}</span></div>
    `);
    
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
    safeSetText('goseiType', gosei);
    document.getElementById('goseiDesc').innerHTML = goseiData[gosei].description + 
        '<div style="margin-top: 15px; padding: 12px; background: rgba(76, 175, 80, 0.1); border: 2px solid #4CAF50; border-radius: 8px;">' +
        '<p style="font-size: 0.9em; color: #2E7D32; font-weight: bold; margin: 0 0 8px 0;">✓ 運命数テーブルを使用した正確な計算</p>' +
        '<p style="font-size: 0.85em; color: #666; line-height: 1.6; margin: 0;">' +
        '本アプリの五星三心占いは、<strong>運命数（1-60）テーブルを使用した正確な計算</strong>を行っています。<br>' +
        '西暦の偶数/奇数で金・銀を判定し、運命数の範囲でタイプを決定する標準的な方式を採用しています。<br>' +
        '<span style="font-size: 0.8em; color: #999;">※1930-2029年に対応。範囲外の年は60年周期で近似値を使用します。</span>' +
        '</p>' +
        '</div>';
    
    // カバラ数秘術
    document.getElementById('kabbalahNumber').textContent = `運命数: ${kabbalah}`;
    safeSetHTML('kabbalahDesc', kabbalahData[kabbalah].description);
    
    // 宿曜占星術
    const sukuyoInfo = sukuyoData[sukuyo];
    document.getElementById('sukuyoStar').textContent = `${sukuyo}宿`;
    safeSetHTML('sukuyoDesc', sukuyoInfo.description);
    safeSetHTML('sukuyoFortune', sukuyoInfo.fortune2026);
    document.getElementById('sukuyoWork').innerHTML = sukuyoInfo.work;
    document.getElementById('sukuyoLove').innerHTML = sukuyoInfo.love;
    
    // 総合運勢
    displayTotal(name, kyusei, western, gosei, shichu, kabbalah, sukuyo);
    
    // ランキング表示
    displayRanking(name, birthYear, birthEto, western, kyusei, gosei, shichu, kabbalah, sukuyo);
    
    // コピー用テキスト生成
    generateCopyText(name, birthYear, birthMonth, birthDay, birthHour, birthMinute, kyusei, western, gosei, shichu, kabbalah, sukuyo, birthEto);
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
    
    safeSetHTML('shichuElements', html);
    
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

function displayTotal(userName, kyusei, western, gosei, shichu, kabbalah, sukuyo) {
    console.log('総合運勢を生成中...', { userName, kyusei, western, gosei, kabbalah, sukuyo });
    
    // ローディング表示
    document.getElementById('totalFortune').innerHTML = '<p style="text-align: center; color: #764ba2; font-weight: bold; animation: pulse 1.5s infinite;">✨ 総合運勢を鑑定中...</p>';
    
    // 少し遅延を入れて鑑定している感を出す
    setTimeout(() => {
        const kyuseiInfo = kyuseiData[kyusei];
        const kabbalahInfo = kabbalahData[kabbalah];
        const westernInfo = westernZodiacData[western];
        const goseiInfo = goseiData[gosei];
        
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
            `${userName}さんの運命には、<strong>${kyusei}</strong>の持つ神秘的な力と、カバラ数秘術の運命数<strong>${kabbalah}</strong>が示す特別な使命が宿っています。`,
            `<strong>${kyusei}</strong>として生まれた${userName}さんには、カバラ運命数<strong>${kabbalah}</strong>が授けた独自の才能があります。`,
            `${userName}さんはカバラ運命数<strong>${kabbalah}</strong>と<strong>${kyusei}</strong>の組み合わせにより、特別な人生の意味を持っています。`,
            `<strong>${kyusei}</strong>の性質とカバラ運命数<strong>${kabbalah}</strong>の力が、${userName}さんの中で美しく調和しています。`
        ];
        
        const yearForecasts = [
            `2026年は<strong>${western}</strong> ${westernInfo.emoji}として、${westernInfo.description}充実した一年を過ごせるでしょう。`,
            `${userName}さんの今年は<strong>${western}</strong>の特性が活きる年です。${westernInfo.description}チャンスを確実につかんでください。`,
            `<strong>${gosei}</strong>として迎える2026年、${goseiInfo.description}大きな飛躍が期待できます。`,
            `${userName}さんの2026年は、カバラ運命数<strong>${kabbalah}</strong>の力が最大限に発揮される年です。${kabbalahInfo.description}自信を持って前進しましょう。`
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
        
        const conclusions = [
            `${userName}さん、${kyuseiInfo.color}を身につけ、${kyuseiInfo.direction}の方位を意識することで、さらに運気が高まります。2026年は、あなたらしさを大切にしながら、新しい可能性にも目を向けていってください！✨`,
            `ラッキーカラーの${kyuseiInfo.color}と、幸運の方位${kyuseiInfo.direction}が、${userName}さんの人生をサポートします。自分を信じて、輝かしい一年を過ごしましょう！🌟`,
            `${userName}さん、${kyuseiInfo.color}を取り入れ、${kyuseiInfo.direction}を意識することで、幸運の波に乗れます。この一年が、あなたにとって最高の年になりますように！💫`
        ];
        
        const fortune = `
            <p>${openings[Math.floor(Math.random() * openings.length)]}</p>
            <p><strong>2026年の展望:</strong> ${yearForecasts[Math.floor(Math.random() * yearForecasts.length)]}</p>
            <p>${elements[Math.floor(Math.random() * elements.length)]}</p>
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

function displayRanking(userName, birthYear, birthEto, western, kyusei, gosei, shichu, kabbalah, sukuyo) {
    const scores = calculateTotalScore(birthYear, kyusei, western, gosei, shichu, kabbalah, sukuyo);
    const totalScore = scores.percentage;
    const ranking = calculateRanking(totalScore);
    const fortuneLevel = getFortuneLevel(totalScore);
    
    const westernEmoji = westernZodiacData[western].emoji;
    safeSetHTML('etoSignCombo', 
        `<strong>${userName}さんの2026年運勢</strong><br>${birthEto}年生まれ × ${western}${westernEmoji}`);
safeSetHTML('scoreBreakdown', `
        <div class="score-item">
            <span class="score-label">四柱推命（五行バランス）</span>
            <span class="score-value">${scores.shichu}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">九星×西洋占星術</span>
            <span class="score-value">${scores.kyuseiWestern}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">五星三心</span>
            <span class="score-value">${scores.gosei}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">宿曜占星術</span>
            <span class="score-value">${scores.sukuyo}点</span>
        </div>
        <div class="score-item">
            <span class="score-label">カバラ数秘術</span>
            <span class="score-value">${scores.kabbalah}点</span>
        </div>
    `);
safeSetHTML('totalScoreDisplay', `
        総合スコア
        <span class="score-number">${totalScore}</span>
        <span class="score-max">/ 100点</span>
    `);
document.getElementById('rankingPosition').textContent = 
        `108通りの組み合わせ中 ${ranking}位`;
    
    safeSetHTML('fortuneLevel', `
        <div class="star-rating">${fortuneLevel.stars}</div>
        <div class="fortune-message">${fortuneLevel.message}</div>
    `);
}

// ============================================================
// コピー用テキスト生成
// ============================================================

function generateCopyText(userName, year, month, day, hour, minute, kyusei, western, gosei, shichu, kabbalah, sukuyo, birthEto) {
    const westernEmoji = westernZodiacData[western].emoji;
    const timeStr = hour !== 12 || minute !== 0 ? ` ${hour}時${minute}分` : '';
    
    const copyText = `【${userName}さんの運勢鑑定結果 - 2026年】

生年月日: ${year}年${month}月${day}日${timeStr}
干支: ${birthEto}年生まれ
西洋占星術: ${western}${westernEmoji}

━━━━━━━━━━━━━━━━
📊 6種類の占術による総合鑑定
━━━━━━━━━━━━━━━━

🌟 九星気学: ${kyusei}
${kyuseiData[kyusei].description}
ラッキーカラー: ${kyuseiData[kyusei].color}
ラッキー方位: ${kyuseiData[kyusei].direction}
ラッキーフード: ${kyuseiData[kyusei].luckyFood}
ラッキーアクション: ${kyuseiData[kyusei].luckyAction}

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

🌙 宿曜占星術: ${sukuyo}宿
${sukuyoData[sukuyo].description}
2026年の運勢: ${sukuyoData[sukuyo].fortune2026}

🔯 カバラ数秘術: 運命数${kabbalah}
${kabbalahData[kabbalah].description}

━━━━━━━━━━━━━━━━
💬 AIで詳しく占いたい方へ
━━━━━━━━━━━━━━━━

上記の結果をAI（ChatGPT、Gemini等）にコピー＆ペーストして、
以下のプロンプトと一緒に送信してください：

━━━━━━━━━━━━━━━━
【推奨プロンプト】

あなたは熟練の占術師です。上記の6種類の占術による鑑定結果に基づき、${userName}さんの2026年の運勢を、具体的かつ前向きなアドバイスと共に詳しく鑑定してください。

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

// ============================================================
// 宿曜占星術（27宿）
// ============================================================

// 27宿の配列（インデックス0〜26）
const sukuyoList = [
    '角', '亢', '氏', '房', '心', '尾', '箕', '斗', '女', '虚', '危', '室', '壁', '奎',
    '婁', '胃', '昴', '畢', '觜', '参', '井', '鬼', '柳', '星', '張', '翼', '軫'
];

// 旧暦月ごとの基準宿（1日時点のインデックス）
const monthBaseSukuyo = {
    1: 11,  // 室
    2: 13,  // 奎
    3: 15,  // 胃
    4: 17,  // 畢
    5: 19,  // 参
    6: 21,  // 鬼
    7: 24,  // 張
    8: 0,   // 角
    9: 3,   // 房
    10: 5,  // 尾
    11: 7,  // 斗
    12: 9   // 虚
};

// 旧暦データテーブル（1900-2100年）
const lunarYearData = {
    1979: { solarDate: "01-28", months: [30, 29, 29, 30, 29, 30, 29, 30, 29, 30, 30, 30, 29], leapMonth: 5 },
    1980: { solarDate: "02-16", months: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], leapMonth: 0 },
    1981: { solarDate: "02-05", months: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], leapMonth: 0 },
    1982: { solarDate: "01-25", months: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], leapMonth: 0 },
    1983: { solarDate: "02-13", months: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], leapMonth: 0 },
    1984: { solarDate: "02-02", months: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], leapMonth: 10 },
    1985: { solarDate: "02-20", months: [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30], leapMonth: 0 },
    1986: { solarDate: "02-09", months: [29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30, 29], leapMonth: 0 },
    1987: { solarDate: "01-29", months: [30, 29, 30, 29, 29, 30, 29, 30, 30, 30, 29, 30], leapMonth: 0 },
    1988: { solarDate: "02-17", months: [29, 30, 29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30], leapMonth: 6 },
    1989: { solarDate: "02-06", months: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], leapMonth: 0 },
    1990: { solarDate: "01-27", months: [29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30], leapMonth: 0 },
    2000: { solarDate: "02-05", months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 0 },
    2024: { solarDate: "02-10", months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], leapMonth: 0 },
    2025: { solarDate: "01-29", months: [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 30, 29, 30], leapMonth: 6 },
    2026: { solarDate: "02-17", months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], leapMonth: 0 }
};

function convertToLunar(year, month, day) {
    if (!lunarYearData[year]) {
        console.warn(`旧暦データが無い年: ${year}年。近似値を使用します。`);
        let approxMonth = month - 1;
        if (approxMonth < 1) approxMonth = 12;
        return { lunarYear: year, lunarMonth: approxMonth, lunarDay: day, isLeapMonth: false };
    }
    
    const yearData = lunarYearData[year];
    const solarNewYear = new Date(year, parseInt(yearData.solarDate.split('-')[0]) - 1, parseInt(yearData.solarDate.split('-')[1]));
    const targetDate = new Date(year, month - 1, day);
    
    if (targetDate < solarNewYear) {
        const prevYear = year - 1;
        if (!lunarYearData[prevYear]) {
            return { lunarYear: prevYear, lunarMonth: 12, lunarDay: Math.min(day, 29), isLeapMonth: false };
        }
        return convertToLunar(prevYear, 12, 31);
    }
    
    const daysSinceNewYear = Math.floor((targetDate - solarNewYear) / (1000 * 60 * 60 * 24));
    let accumulatedDays = 0;
    let lunarMonth = 1;
    let isLeapMonth = false;
    
    for (let m = 0; m < yearData.months.length; m++) {
        const monthDays = yearData.months[m];
        if (accumulatedDays + monthDays > daysSinceNewYear) {
            const lunarDay = daysSinceNewYear - accumulatedDays + 1;
            if (yearData.leapMonth > 0 && m >= yearData.leapMonth) {
                if (m === yearData.leapMonth) {
                    isLeapMonth = true;
                    lunarMonth = yearData.leapMonth;
                } else {
                    lunarMonth = m;
                }
            } else {
                lunarMonth = m + 1;
            }
            return { lunarYear: year, lunarMonth: lunarMonth, lunarDay: lunarDay, isLeapMonth: isLeapMonth };
        }
        accumulatedDays += monthDays;
    }
    return { lunarYear: year + 1, lunarMonth: 1, lunarDay: 1, isLeapMonth: false };
}

function calculateSukuyo(year, month, day) {
    const lunar = convertToLunar(year, month, day);
    const baseMonth = lunar.lunarMonth;
    const baseSukuyoIndex = monthBaseSukuyo[baseMonth];
    const sukuyoIndex = (baseSukuyoIndex + lunar.lunarDay - 1) % 27;
    
    console.log('宿曜計算:', {
        グレゴリオ暦: `${year}年${month}月${day}日`,
        旧暦: `${lunar.lunarYear}年${lunar.isLeapMonth ? '閏' : ''}${lunar.lunarMonth}月${lunar.lunarDay}日`,
        基準宿: sukuyoList[baseSukuyoIndex],
        計算: `(${baseSukuyoIndex} + ${lunar.lunarDay} - 1) % 27 = ${sukuyoIndex}`,
        宿: sukuyoList[sukuyoIndex]
    });
    
    return sukuyoList[sukuyoIndex];
}

const sukuyoData = {
    '角': { description: '角宿は春の始まりを告げる宿。正義感が強く、リーダーシップに優れています。新しいことを始める力があり、困難にも果敢に立ち向かいます。一方で、頑固な面があり、柔軟性に欠けることも。', fortune2026: '2026年は新しい挑戦に最適な年です。特に春から夏にかけて運気が上昇します。自分の信念を貫きながらも、周囲の意見に耳を傾けることで、さらなる成長が期待できます。', work: '仕事では統率力を発揮し、プロジェクトのリーダーとして活躍できます。金運は安定しており、投資よりも堅実な貯蓄がおすすめです。', love: '恋愛では積極的にアプローチすることで良い結果が得られます。相手の価値観を尊重することが、長続きする関係の鍵です。対人関係では、正直さと誠実さが信頼を生みます。' },
    '亢': { description: '亢宿は向上心が強く、完璧主義者です。細部にこだわり、質の高い仕事をします。プライドが高く、自分の能力を過信することもありますが、努力家で着実に目標を達成します。', fortune2026: '2026年は自己研鑽の年です。スキルアップに時間を投資することで、後半に大きな成果が現れます。完璧を求めすぎず、80%の完成度で進めることも大切です。', work: '専門性を活かした仕事で成功します。細かい作業や品質管理に向いています。金運は後半に向上し、昇給や臨時収入の可能性があります。', love: '理想が高いため、相手選びは慎重になりがちです。完璧を求めず、相手の長所を見つめることで良い関係が築けます。友人関係は知的な交流を大切にします。' },
    '氏': { description: '氏宿は温和で協調性があり、人々をまとめる力があります。平和を愛し、争いを避ける傾向がありますが、内に秘めた情熱と強い意志を持っています。', fortune2026: '2026年は人間関係が充実する年です。チームワークを活かした活動で成功します。自分の意見を積極的に発信することで、さらに信頼が深まります。', work: '調整役として組織内で重要な役割を果たします。コミュニケーション能力を活かした仕事が向いています。金運は人脈を通じて良い情報が入ります。', love: '穏やかな関係を好み、安定した恋愛を築きます。相手を尊重し、思いやりを持つことで、深い絆が生まれます。友人は多く、社交的な活動を楽しみます。' },
    '房': { description: '房宿は社交的で人気者です。明るく楽しい雰囲気を作り出し、周囲を元気にします。感受性が豊かで芸術的才能に恵まれていますが、気分屋な一面もあります。', fortune2026: '2026年は創造性を発揮する年です。趣味や特技を仕事に活かすチャンスがあります。感情の起伏をコントロールすることで、より安定した運気を保てます。', work: 'クリエイティブな分野や接客業で才能を発揮します。人を楽しませる仕事が向いています。金運は波がありますが、節度ある支出を心がければ問題ありません。', love: '恋愛では情熱的で、相手を楽しませることが得意です。ただし、熱しやすく冷めやすい傾向があるので、長期的な視点を持つことが大切です。友人関係は華やかです。' },
    '心': { description: '心宿は知性と直感力に優れています。物事の本質を見抜く力があり、深い洞察力を持っています。神秘的な雰囲気があり、精神世界に興味を持ちやすい宿です。', fortune2026: '2026年は内面の成長に焦点を当てる年です。瞑想や学びを深めることで、新しい視点が得られます。直感を信じて行動することで、良い結果につながります。', work: '分析力を活かした仕事や、カウンセリング、占いなどスピリチュアルな分野で成功します。金運は精神的充足を優先することで、結果的に向上します。', love: '深い精神的つながりを求めます。表面的な関係ではなく、心の通じ合う相手を選びます。対人関係では、相手の心を理解する力があり、信頼されます。' },
    '尾': { description: '尾宿は行動力があり、エネルギッシュです。チャレンジ精神旺盛で、困難な状況でも諦めません。短気な面もありますが、正義感が強く、弱者を守る優しさがあります。', fortune2026: '2026年は行動の年です。思い立ったら即実行することで、チャンスをつかめます。ただし、計画性を持つことで、より大きな成功が期待できます。', work: '営業やスポーツ、アウトドア関連の仕事で力を発揮します。体を動かす仕事が向いています。金運は積極的な行動により向上します。', love: '情熱的で積極的にアプローチします。スピード感のある展開を好みますが、相手のペースも尊重することが大切です。友人関係は活発で、多くの人と交流します。' },
    '箕': { description: '箕宿は自由を愛し、束縛を嫌います。独創的なアイデアを持ち、既存の枠にとらわれない発想ができます。マイペースですが、その分、独自の世界観を持っています。', fortune2026: '2026年は自由な発想が評価される年です。型にはまらないアプローチで成功します。ただし、基本的なルールは守ることで、信頼も得られます。', work: 'クリエイティブな仕事や、フリーランス、起業に向いています。自分のペースで働ける環境が理想です。金運は変動がありますが、才能を活かせば安定します。', love: '自由な関係を好み、束縛されることを嫌います。お互いの自立を尊重できる相手と良い関係が築けます。友人は個性的な人が多いです。' },
    '斗': { description: '斗宿は知恵と教養があり、文化的な活動を好みます。思慮深く、計画的に物事を進めます。保守的な面もありますが、信頼できる人柄で周囲から慕われます。', fortune2026: '2026年は学びの年です。新しい知識や技術を習得することで、将来の基盤が固まります。伝統と革新のバランスを取ることで、成功への道が開けます。', work: '教育、出版、文化事業など知的な分野で活躍します。コツコツと積み重ねる仕事が向いています。金運は堅実で、長期的な資産形成に適しています。', love: '真面目で誠実な恋愛を好みます。じっくりと関係を深めていくタイプです。対人関係では、知的な会話を楽しみ、教養のある人との交流を大切にします。' },
    '女': { description: '女宿は繊細で感受性が強く、美的センスに優れています。優しく思いやりがあり、人の気持ちを理解する力があります。傷つきやすい面もありますが、芸術的才能に恵まれています。', fortune2026: '2026年は感性を磨く年です。アートや音楽など、美しいものに触れることで運気が上昇します。自分の感情を大切にしながら、表現することで新しい道が開けます。', work: 'デザイン、ファッション、美容など美に関わる仕事で才能を発揮します。人の心に寄り添う仕事も向いています。金運は芸術的活動を通じて向上します。', love: 'ロマンチックで理想的な恋愛を夢見ます。相手の優しさや繊細さに惹かれます。友人関係では、心の通じ合う少数の友人を大切にします。' },
    '虚': { description: '虚宿は柔軟性があり、適応力に優れています。控えめですが、内に秘めた強さと粘り強さを持っています。周囲の変化に敏感で、状況に応じて臨機応変に対応できます。', fortune2026: '2026年は変化の年です。柔軟に対応することで、予想外のチャンスをつかめます。自分の強みを再認識し、自信を持って行動することが成功の鍵です。', work: 'サポート役として優れた能力を発揮します。変化の多い環境でも対応できる仕事が向いています。金運は安定志向で、リスクを避けた堅実な管理がおすすめです。', love: '控えめですが、一途で誠実な恋愛をします。相手を支えることに喜びを感じます。対人関係では、聞き上手で相談役になることが多いです。' },
    '危': { description: '危宿は慎重で用心深く、リスク管理に優れています。洞察力があり、危険を察知する能力が高いです。保守的に見えますが、確実に目標を達成する力があります。', fortune2026: '2026年は準備の年です。慎重に計画を立て、リスクを最小限に抑えることで成功します。直感を信じつつ、事実に基づいた判断を心がけましょう。', work: 'リスク管理、セキュリティ、保険など安全性に関わる仕事が向いています。慎重な性格を活かせる分野で活躍します。金運は堅実で、安定した収入が期待できます。', love: '慎重に相手を選び、信頼関係を築いてから深い関係に進みます。安定した恋愛を好みます。友人関係では、信頼できる少数の友人を大切にします。' },
    '室': { description: '室宿は家庭的で温かい雰囲気を持っています。人を癒す力があり、居心地の良い空間を作ることが得意です。保守的ですが、家族や仲間を大切にする優しい心の持ち主です。', fortune2026: '2026年は基盤を固める年です。家庭や身近な環境を整えることで、心の安定が得られます。大切な人との絆を深めることで、幸運が訪れます。', work: '不動産、インテリア、福祉など人々の生活を支える仕事が向いています。チームの絆を大切にする職場で力を発揮します。金運は安定しており、堅実な運用がおすすめです。', love: '温かく安定した恋愛を好みます。家庭を築くことを意識した真面目な交際をします。対人関係では、包容力があり、多くの人から信頼されます。' },
    '壁': { description: '壁宿は忍耐強く、困難な状況でも粘り強く頑張ります。防衛本能が強く、自分や大切な人を守る力があります。内向的に見えますが、芯の強さと決断力を持っています。', fortune2026: '2026年は忍耐の年です。すぐに結果が出なくても、継続することで大きな成果が得られます。自分を守りながらも、新しい挑戦を恐れないことが重要です。', work: '長期的なプロジェクトや、じっくり取り組む仕事が向いています。防衛、セキュリティ関連の分野でも活躍できます。金運は後半に向けて上昇します。', love: 'ガードが堅く、心を開くまで時間がかかりますが、一度信頼すると深く愛します。安定した関係を築くことを重視します。友人は少数精鋭です。' },
    '奎': { description: '奎宿は文才があり、コミュニケーション能力に優れています。知的で教養があり、人に物事を教えることが得意です。理論的思考ができ、説得力のある話し方をします。', fortune2026: '2026年は発信の年です。自分の知識や経験を人に伝えることで、評価が高まります。学び続ける姿勢を持つことで、さらなる成長が期待できます。', work: '教育、ライティング、メディア関連の仕事で才能を発揮します。人に教える仕事や情報発信の分野が向いています。金運は知的労働により安定します。', love: '知的な会話を楽しめる相手に惹かれます。精神的なつながりを重視し、コミュニケーションを大切にします。友人関係は幅広く、社交的です。' },
    '婁': { description: '婁宿は勤勉で責任感が強く、与えられた仕事を確実にこなします。几帳面で細かいことにも気を配り、信頼される人柄です。真面目すぎて柔軟性に欠けることもあります。', fortune2026: '2026年は地道な努力が報われる年です。コツコツと積み重ねてきたことが形になります。完璧主義を少し緩めることで、心の余裕も生まれます。', work: '事務、経理、管理など正確性が求められる仕事が向いています。責任感を活かせる職場で評価されます。金運は堅実で、計画的な貯蓄に向いています。', love: '真面目で誠実な恋愛をします。相手に対しても誠実さを求めます。対人関係では、約束を守り、信頼を大切にします。友人は長く付き合える人が多いです。' },
    '胃': { description: '胃宿は豊かさを象徴し、物質的にも精神的にも満たされることを求めます。食べることが好きで、美食家の傾向があります。与えることも得意で、人を養う力があります。', fortune2026: '2026年は豊かさの年です。物質的な充足だけでなく、精神的な満足も追求することで、真の幸福が得られます。与えることで、さらに豊かになります。', work: '飲食業、栄養士、農業など食に関わる仕事が向いています。人を満足させる仕事で成功します。金運は良好で、適度な支出と貯蓄のバランスが大切です。', love: '相手を大切に養い、満たすことに喜びを感じます。安定した関係を好み、家庭的な幸せを求めます。友人関係では、食事を共にすることで絆を深めます。' },
    '昴': { description: '昴宿は華やかで目立つ存在です。リーダーシップがあり、人を引きつける魅力があります。プライドが高く、注目されることを好みますが、その分、責任感も強いです。', fortune2026: '2026年は輝きの年です。自分の魅力を最大限に発揮することで、多くのチャンスが訪れます。謙虚さを忘れずに、周囲への感謝を持つことで、さらに運気が上昇します。', work: 'エンターテインメント、広報、プレゼンテーションなど人前に出る仕事が向いています。リーダーシップを発揮できる役職で成功します。金運は華やかさに見合った収入が期待できます。', love: 'ロマンチックで華やかな恋愛を好みます。相手にも魅力を求め、理想が高い傾向があります。友人関係は広く、社交的な活動を楽しみます。' },
    '畢': { description: '畢宿は実務能力が高く、効率的に物事を進めます。現実的で合理的な思考をし、無駄を嫌います。ビジネスセンスがあり、利益を生み出す力があります。', fortune2026: '2026年は実績の年です。実務能力を活かし、具体的な成果を上げることで評価されます。効率だけでなく、人間関係にも気を配ることで、さらに成功します。', work: 'ビジネス、営業、コンサルティングなど成果が求められる仕事が向いています。実績を重視する職場で力を発揮します。金運は良好で、投資にも向いています。', love: '現実的な恋愛観を持ち、相手の条件も考慮します。安定した関係を築くことを重視します。友人関係では、ビジネスライクな付き合いも多いです。' },
    '觜': { description: '觜宿は鋭い観察力と批判的思考を持っています。物事を客観的に分析し、問題点を指摘する能力があります。厳しい面もありますが、正確な判断力で信頼されます。', fortune2026: '2026年は分析の年です。冷静に状況を見極め、適切な判断を下すことで成功します。批判だけでなく、建設的な提案をすることで、さらに評価が高まります。', work: '評論家、監査、品質管理など分析力を活かせる仕事が向いています。客観的な視点が求められる分野で活躍します。金運は堅実で、リスク管理が得意です。', love: '相手を冷静に見極め、慎重に選びます。完璧を求めすぎず、相手の良い面を見ることが大切です。友人関係では、知的な交流を好みます。' },
    '参': { description: '参宿は勇敢で戦闘的な性格です。競争心が強く、挑戦を恐れません。正義感があり、弱者を守るために戦います。時に攻撃的になることもありますが、情熱的で魅力的です。', fortune2026: '2026年は挑戦の年です。困難な目標に立ち向かうことで、大きな成長が得られます。攻撃性をコントロールし、戦略的に行動することで、勝利をつかめます。', work: 'スポーツ、軍事、警察、消防など体力と勇気が必要な仕事が向いています。競争の激しい業界でも力を発揮します。金運は勝負により変動があります。', love: '情熱的で積極的にアプローチします。相手を守りたいという気持ちが強いです。対人関係では、リーダーシップを発揮し、仲間を守ります。' },
    '井': { description: '井宿は深い知恵と洞察力を持っています。精神性が高く、哲学的な思考を好みます。内省的で、自分の内面と向き合うことを大切にします。静かですが、深い影響力があります。', fortune2026: '2026年は内面の年です。自己探求を深めることで、人生の方向性が明確になります。精神的な成長を優先することで、物質的な豊かさもついてきます。', work: 'カウンセリング、宗教、哲学、研究など精神性や知性を活かせる仕事が向いています。深い洞察力が評価されます。金運は精神的充足を優先することで安定します。', love: '深い精神的つながりを求めます。表面的な関係ではなく、魂のレベルで通じ合う相手を探します。友人は少数ですが、深い絆で結ばれています。' },
    '鬼': { description: '鬼宿は神秘的で不思議な魅力があります。霊感が強く、見えない世界に敏感です。独特の世界観を持ち、普通の人とは違う感性で物事を捉えます。孤独を好む面もあります。', fortune2026: '2026年は直感の年です。自分の感覚を信じて行動することで、良い結果が得られます。スピリチュアルな学びを深めることで、さらに能力が開花します。', work: '占い、ヒーリング、芸術など感性を活かせる仕事が向いています。神秘的な分野で才能を発揮します。金運は波がありますが、直感に従うことで向上します。', love: '神秘的な魅力で相手を惹きつけます。精神的なつながりを重視し、理解し合える相手を求めます。友人関係は選択的で、特別な縁を大切にします。' },
    '柳': { description: '柳宿は柔軟で適応力があり、どんな環境でも順応できます。優雅で美しく、芸術的センスに優れています。柔らかい外見とは裏腹に、内に強い意志を秘めています。', fortune2026: '2026年は柔軟性の年です。変化に対して柔軟に対応することで、多くのチャンスをつかめます。美的センスを活かした活動で成功します。', work: 'ファッション、ダンス、フラワーアレンジメントなど美と柔軟性を活かせる仕事が向いています。変化の多い環境でも活躍できます。金運は芸術的活動により向上します。', love: '優雅で魅力的な恋愛をします。相手に合わせる柔軟性がありますが、自分の意志も大切にします。友人関係は社交的で、多くの人と交流します。' },
    '星': { description: '星宿は理想が高く、夢を追い求めます。ロマンチストで、美しいものや高尚なものを愛します。現実離れした面もありますが、その純粋さが魅力です。', fortune2026: '2026年は夢の年です。理想を追求することで、人生が豊かになります。現実とのバランスを取りながら、夢に向かって進むことが大切です。', work: 'エンターテインメント、アート、イベント企画など夢や理想を形にする仕事が向いています。クリエイティブな分野で才能を発揮します。金運は夢への投資により変動があります。', love: 'ロマンチックで理想的な恋愛を求めます。夢見る恋愛を楽しみますが、現実も大切にすることで長続きします。友人関係では、同じ夢を持つ仲間を大切にします。' },
    '張': { description: '張宿は拡大志向が強く、大きな目標を持っています。野心的で、成功を求めて努力します。社交的で人脈を広げることが得意で、その人脈を活かして成功します。', fortune2026: '2026年は拡大の年です。ネットワークを広げ、大きなプロジェクトに挑戦することで成功します。野心と現実のバランスを取ることが重要です。', work: '営業、マーケティング、ネットワークビジネスなど人脈を活かせる仕事が向いています。拡大志向を活かせる分野で成功します。金運は人脈により向上します。', love: '社交的で魅力的な恋愛をします。多くの人と出会いますが、真剣な関係を築く相手は慎重に選びます。友人関係は広く、多様な人と交流します。' },
    '翼': { description: '翼宿は自由を愛し、束縛を嫌います。飛翔する力があり、高い目標に向かって羽ばたきます。独立心が強く、自分の道を切り開く力があります。', fortune2026: '2026年は飛躍の年です。自由に羽ばたくことで、新しい可能性が開けます。独立や起業にも良い時期です。自由と責任のバランスを取ることが大切です。', work: 'フリーランス、起業、パイロット、旅行業など自由度の高い仕事が向いています。束縛されない環境で力を発揮します。金運は自由な活動により向上します。', love: '自由な恋愛を好み、束縛を嫌います。お互いの自由を尊重できる関係が理想です。友人関係も自由で、多様な人と交流します。' },
    '軫': { description: '軫宿は慈悲深く、人を助けることに喜びを感じます。奉仕の精神があり、社会貢献を大切にします。優しく思いやりがあり、多くの人から慕われます。', fortune2026: '2026年は奉仕の年です。人を助けることで、自分も成長します。与えることで受け取る豊かさを実感できる年です。自分のケアも忘れずに。', work: '福祉、医療、ボランティア、NGOなど人を助ける仕事が向いています。奉仕の精神を活かせる分野で活躍します。金運は奉仕により精神的に豊かになります。', love: '優しく思いやりのある恋愛をします。相手を支え、助けることに喜びを感じます。友人関係では、困っている人を放っておけない性格です。' }
};