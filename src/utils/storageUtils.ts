/**
 * localStorage에 이메일 저장
 */
export const saveEmail = (email: string): void => {
  localStorage.setItem("savedEmail", email);
};

/**
 * localStorage에서 이메일 불러오기
 */
export const getSavedEmail = (): string | null => {
  return localStorage.getItem("savedEmail");
};

/**
 * localStorage에서 이메일 삭제
 */
export const removeSavedEmail = (): void => {
  localStorage.removeItem("savedEmail");
};

