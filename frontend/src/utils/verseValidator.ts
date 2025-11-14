// 文字数チェック（ひらがな・カタカナ・漢字を1文字としてカウント）
export function countCharacters(text: string): number {
  return text.length;
}

// 5-7-5形式のチェック（17文字以内を許容）
export function validate575(text: string): { valid: boolean; error?: string } {
  const count = countCharacters(text.replace(/\s/g, ''));
  if (count === 0) {
    return { valid: false, error: '句を入力してください' };
  }
  if (count > 17) {
    return { valid: false, error: '5-7-5形式は17文字以内にしてください' };
  }
  return { valid: true };
}

// 7-7形式のチェック（14文字以内を許容）
export function validate77(text: string): { valid: boolean; error?: string } {
  const count = countCharacters(text.replace(/\s/g, ''));
  if (count === 0) {
    return { valid: false, error: '句を入力してください' };
  }
  if (count > 14) {
    return { valid: false, error: '7-7形式は14文字以内にしてください' };
  }
  return { valid: true };
}

// 季語のリスト（簡易版）
const SEASON_WORDS = {
  spring: ['春', '桜', '花見', '新緑', '若葉', '菜の花', 'つばめ', 'うぐいす'],
  summer: ['夏', '暑', '涼', '風鈴', '扇', '団扇', '蝉', '蛍', '花火'],
  autumn: ['秋', '紅葉', '月', '菊', '稲', '柿', '雁', '鹿', '霧'],
  winter: ['冬', '雪', '寒', '梅', '椿', '霜', '氷', '枯', '炉']
};

export function detectSeasonWord(text: string): string | undefined {
  const allWords = [
    ...SEASON_WORDS.spring,
    ...SEASON_WORDS.summer,
    ...SEASON_WORDS.autumn,
    ...SEASON_WORDS.winter
  ];
  
  for (const word of allWords) {
    if (text.includes(word)) {
      return word;
    }
  }
  return undefined;
}

// 禁忌語チェック（月、花などは発句以外で重複を避ける）
const TABOO_WORDS = ['月', '花', '雪', '桜'];
export function checkTabooWords(verses: Array<{ text: string }>, currentText: string, isFirstVerse: boolean): { valid: boolean; error?: string } {
  if (isFirstVerse) {
    return { valid: true }; // 発句は禁忌語OK
  }

  for (const taboo of TABOO_WORDS) {
    // 既存の句に禁忌語があるかチェック
    const hasTabooInExisting = verses.some(v => v.text.includes(taboo));
    // 現在の句にも同じ禁忌語があるかチェック
    const hasTabooInCurrent = currentText.includes(taboo);
    
    if (hasTabooInExisting && hasTabooInCurrent) {
      return { valid: false, error: `「${taboo}」は既に使われている禁忌語です` };
    }
  }
  
  return { valid: true };
}



