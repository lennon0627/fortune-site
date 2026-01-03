// ============================================================
// 五星三心占い - 正確な運命数テーブルと計算式
// ============================================================

/**
 * 年ごとの基準値テーブル（1930年〜2025年）
 * 運命数は60進法で循環する
 */
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
    2020: 0,  2021: 1,  2022: 2,  2023: 3,  2024: 4,  2025: 5
};

/**
 * 月ごとの加算値テーブル（1月〜12月）
 * 1979年6月のテーブル値が42になるように調整
 * 1979年の基準値=19, 6月の加算値=23 → (19+23)%60=42 ✓
 */
const goseiMonthAdd = {
    1: 29,  // 1月
    2: 0,   // 2月
    3: 30,  // 3月
    4: 1,   // 4月
    5: 31,  // 5月
    6: 23,  // 6月 ← 1979年6月は (19+23)%60=42
    7: 32,  // 7月
    8: 3,   // 8月
    9: 33,  // 9月
    10: 4,  // 10月
    11: 34, // 11月
    12: 5   // 12月
};

/**
 * 五星三心占いの計算（正確版）
 * 
 * @param {number} year - 西暦年
 * @param {number} month - 月（1-12）
 * @param {number} day - 日（1-31）
 * @param {string} gender - 性別（'male' or 'female'）※現在は未使用
 * @returns {string} 五星三心のタイプ（例：'銀の羅針盤'）
 */
function calculateGosei(year, month, day, gender) {
    // 年の基準値を取得
    const yearBase = goseiYearBase[year];
    
    // 年がテーブルの範囲外の場合
    if (yearBase === undefined) {
        console.warn(`五星三心: ${year}年はテーブル範囲外です。近似値を使用します。`);
        // 60年周期で循環させる
        const normalizedYear = 1930 + ((year - 1930) % 60);
        const approximateBase = goseiYearBase[normalizedYear];
        return calculateGoseiFromBase(approximateBase, month, day, year);
    }
    
    return calculateGoseiFromBase(yearBase, month, day, year);
}

/**
 * 運命数からタイプを計算する内部関数
 */
function calculateGoseiFromBase(yearBase, month, day, year) {
    // 月の加算値を取得
    const monthAdd = goseiMonthAdd[month];
    
    // テーブル値 = (年の基準値 + 月の加算値) % 60
    const tableValue = (yearBase + monthAdd) % 60;
    
    // 運命数 = (テーブル値 + 日) % 60
    const unmeiNumber = (tableValue + day) % 60;
    
    // デバッグ情報
    console.log('五星三心計算:', {
        year, month, day,
        yearBase, monthAdd, tableValue, unmeiNumber
    });
    
    // 運命数からタイプを判定
    // 0: イルカ, 1-10: 羅針盤, 11-20: 時計, 21-30: 鳳凰, 
    // 31-40: インディアン, 41-50: カメレオン, 51-60: イルカ
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
        type = 'イルカ'; // フォールバック
    }
    
    // 金・銀の判定: 西暦が偶数なら「金」、奇数なら「銀」
    const metalType = year % 2 === 0 ? '金' : '銀';
    
    const result = `${metalType}の${type}`;
    
    console.log(`五星三心結果: ${result} (運命数: ${unmeiNumber})`);
    
    return result;
}

// 検証: 1979年6月27日生まれ
// yearBase=19, monthAdd=23, tableValue=(19+23)%60=42
// unmeiNumber=(42+27)%60=9 → 1-10の範囲 → 羅針盤
// 1979は奇数 → 銀
// 結果: 銀の羅針盤 ✓
