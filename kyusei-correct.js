// ============================================================
// 九星気学 - 正確な計算式（西暦各桁の和を使用）
// ============================================================

/**
 * 九星気学の計算（正確版）
 * 西暦の各桁を足して1桁になるまで繰り返し、その値から九星を決定
 * 
 * @param {number} year - 西暦年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日（1-31）
 * @returns {string} 九星（例：'三碧木星'）
 */
function calculateKyusei(year, month, day) {
    // 正確な立春判定
    const risshun = calculateAccurateRisshun(year);
    const birthDate = new Date(year, month - 1, day);
    
    // 立春前の場合は前年として計算
    const calcYear = birthDate < risshun ? year - 1 : year;
    
    // 西暦の各桁を足して1桁になるまで繰り返す
    let digitSum = sumDigits(calcYear);
    
    // 九星の配列（インデックス0-8）
    const kyuseiOrder = [
        '一白水星', '二黒土星', '三碧木星', '四緑木星', '五黄土星',
        '六白金星', '七赤金星', '八白土星', '九紫火星'
    ];
    
    // 九星のインデックスを計算: (10 - digitSum) % 9
    // ※9の場合は9紫火星（インデックス8）になるよう調整
    let index;
    if (digitSum === 9) {
        index = 8; // 九紫火星
    } else {
        index = (10 - digitSum) % 9;
    }
    
    const result = kyuseiOrder[index];
    
    console.log('九星気学計算:', {
        year, calcYear, digitSum, index, result
    });
    
    return result;
}

/**
 * 数値の各桁を足して1桁になるまで繰り返す
 * 
 * @param {number} num - 対象の数値
 * @returns {number} 1桁の数値（1-9）
 */
function sumDigits(num) {
    let sum = num;
    
    // 1桁になるまで繰り返す
    while (sum >= 10) {
        let temp = 0;
        while (sum > 0) {
            temp += sum % 10;
            sum = Math.floor(sum / 10);
        }
        sum = temp;
    }
    
    // 0になった場合は9として扱う（九星気学では1-9の範囲）
    if (sum === 0) {
        sum = 9;
    }
    
    console.log(`各桁の和: ${num} → ${sum}`);
    
    return sum;
}

// 検証例:
// 1979年6月27日（立春後）
// calcYear = 1979
// digitSum: 1+9+7+9 = 26 → 2+6 = 8
// index: (10 - 8) % 9 = 2
// kyuseiOrder[2] = '三碧木星' ✓

// 2000年（立春後）
// digitSum: 2+0+0+0 = 2
// index: (10 - 2) % 9 = 8
// kyuseiOrder[8] = '九紫火星' ✓

// 2024年（立春後）
// digitSum: 2+0+2+4 = 8
// index: (10 - 8) % 9 = 2
// kyuseiOrder[2] = '三碧木星' ✓
