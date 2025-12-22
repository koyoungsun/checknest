import { ref } from "vue";
import { useAuth } from "./useAuth";
import { getUserProfile } from "@/services/userService";

/**
 * 작성자 이름 관리 Composable
 * 
 * 사용자 프로필을 조회하여 작성자 이름을 캐싱하고 제공합니다.
 * template/computed/render에서 async 함수 호출을 금지하고,
 * authorId 목록을 기준으로 한 번만 fetch하여 Map<userId, displayName> 형태로 캐싱합니다.
 */
export function useAuthorName() {
  const { currentUser } = useAuth();
  
  // 작성자 이름 캐시: Map<userId, displayName>
  const authorNameCache = ref<Map<string, string>>(new Map());
  
  // 진행 중인 요청 추적 (중복 요청 방지)
  const loadingIds = ref<Set<string>>(new Set());

  /**
   * 작성자 이름 가져오기 (동기 함수)
   * 캐시에서만 읽으며, template/computed/render에서 안전하게 사용 가능합니다.
   * 
   * @param ownerId - 사용자 ID
   * @returns 작성자 이름 (캐시에 없으면 빈 문자열 반환)
   */
  const getAuthorName = (ownerId: string): string => {
    if (!ownerId) return "";
    return authorNameCache.value.get(ownerId) || "";
  };

  /**
   * 여러 작성자 이름을 일괄 로드
   * authorId 목록을 기준으로 한 번만 fetch하고 Map<userId, displayName> 형태로 캐싱합니다.
   * 동일 userId에 대해 중복 요청이 발생하지 않도록 처리합니다.
   * 
   * @param ownerIds - 사용자 ID 배열
   */
  const loadAuthorNames = async (ownerIds: string[]): Promise<void> => {
    if (!ownerIds || ownerIds.length === 0) return;

    // 유효한 ID만 필터링 및 중복 제거
    const validIds = [...new Set(ownerIds)].filter(
      (id) => id && typeof id === 'string' && id.trim() !== ''
    );

    if (validIds.length === 0) return;

    // 캐시에 없고 진행 중이 아닌 ID만 필터링
    const idsToLoad = validIds.filter(
      (id) => !authorNameCache.value.has(id) && !loadingIds.value.has(id)
    );

    if (idsToLoad.length === 0) return;

    // 진행 중인 요청으로 표시
    idsToLoad.forEach((id) => loadingIds.value.add(id));

    try {
      // 현재 로그인한 사용자 ID 전달 (본인 프로필 조회 시 필요)
      const currentUserId = currentUser.value?.uid;

      // 모든 프로필을 병렬로 조회
      const profilePromises = idsToLoad.map((id) =>
        getUserProfile(id, currentUserId)
      );
      const profiles = await Promise.all(profilePromises);

      // 결과를 캐시에 저장
      idsToLoad.forEach((id, index) => {
        const profile = profiles[index];
        if (profile && profile.displayName) {
          authorNameCache.value.set(id, profile.displayName);
        } else {
          // 프로필이 없거나 공개되지 않은 경우 기본값 저장
          authorNameCache.value.set(id, "알 수 없음");
        }
      });
    } catch (error) {
      // 에러 발생 시에도 기본값으로 캐싱하여 재요청 방지
      idsToLoad.forEach((id) => {
        if (!authorNameCache.value.has(id)) {
          authorNameCache.value.set(id, "알 수 없음");
        }
      });
    } finally {
      // 진행 중인 요청 표시 제거
      idsToLoad.forEach((id) => loadingIds.value.delete(id));
    }
  };

  /**
   * 캐시 초기화
   */
  const clearCache = () => {
    authorNameCache.value.clear();
    loadingIds.value.clear();
  };

  return {
    getAuthorName,
    loadAuthorNames,
    clearCache,
  };
}

