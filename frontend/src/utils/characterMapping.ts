// 이터널 리턴 캐릭터 번호 매핑
export const CHARACTER_MAPPING: { [key: number]: string } = {
  1: "재키",
  2: "아야",
  3: "피오라",
  4: "매그너스",
  5: "자히르",
  6: "나딘",
  7: "현우",
  8: "하트",
  9: "아이솔",
  10: "리다이린",
  11: "유키",
  12: "혜진",
  13: "쇼우",
  14: "키아라",
  15: "시셀라",
  16: "아드리아나",
  17: "쇼이치",
  18: "엠마",
  19: "아델라", // 실제 gwark가 사용하는 캐릭터
  20: "레녹스",
  21: "로지",
  22: "루크",
  23: "캐시",
  24: "아델라", // 중복된 번호 (실제로는 19번)
  25: "아델라",
  26: "아델라",
  27: "아델라",
  28: "아델라",
  29: "아델라",
  30: "아델라",
  // ... 더 많은 캐릭터들
};

export const getCharacterName = (characterNum: number): string => {
  return CHARACTER_MAPPING[characterNum] || `캐릭터 #${characterNum}`;
};

export const getCharacterIcon = (characterNum: number): string => {
  // 캐릭터 아이콘 URL 반환 (실제 이미지 경로로 수정 필요)
  return `/characters/${characterNum}.png`;
}; 