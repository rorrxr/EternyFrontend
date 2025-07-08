export const isValidNickname = (nickname: string): boolean => {
  return typeof nickname === 'string' && nickname.length >= 2 && nickname.length <= 16;
}; 