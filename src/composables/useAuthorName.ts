import { ref } from "vue";
import { useAuth } from "./useAuth";
import { getUserProfile } from "@/services/userService";

/**
 * 작성자 이름 관리 Composable
 * 
 * 사용자 프로필을 조회하여 작성자 이름을 캐싱하고 제공합니다.
 * isPublicProfile === true인 경우에만 조회 가능하며, 권한 오류 시 안전하게 fallback 처리합니다.
 */
export function useAuthorName() {
  const { currentUser } = useAuth();
  
  // 작성자 이름 캐시
  const authorNameCache = ref<Map<string, string>>(new Map());

  /**
   * 작성자 이름 가져오기
   * 캐시에 있으면 즉시 반환하고, 없으면 비동기로 로드합니다.
   * 
   * @param ownerId - 사용자 ID
   * @returns 작성자 이름 (캐시에 없으면 "로딩 중..." 반환)
   */
  const getAuthorName = (ownerId: string): string => {
    if (!ownerId) return "";

    // 캐시에 있으면 반환
    if (authorNameCache.value.has(ownerId)) {
      return authorNameCache.value.get(ownerId) || "";
    }

    // 캐시에 없으면 비동기로 로드 (UI는 "로딩 중..." 표시)
    loadAuthorName(ownerId);
    return "로딩 중...";
  };

  /**
   * 작성자 이름 비동기 로드
   * isPublicProfile === true인 경우에만 조회 가능합니다.
   * 권한 오류 발생 시 UI가 깨지지 않도록 안전하게 fallback 처리합니다.
   * 
   * @param ownerId - 사용자 ID
   */
  const loadAuthorName = async (ownerId: string) => {
    if (!ownerId || authorNameCache.value.has(ownerId)) return;

    try {
      // 현재 로그인한 사용자 ID 전달 (본인 프로필 조회 시 필요)
      const currentUserId = currentUser.value?.uid;
      const profile = await getUserProfile(ownerId, currentUserId);
      
      if (profile && profile.displayName) {
        authorNameCache.value.set(ownerId, profile.displayName);
      } else {
        // 프로필이 없거나 공개되지 않은 경우 fallback
        authorNameCache.value.set(ownerId, "알 수 없음");
      }
    } catch (err: any) {
      // 권한 오류는 공개되지 않은 프로필일 수 있으므로 정상적인 상황으로 처리
      if (err?.code === 'permission-denied') {
        // 권한 오류는 공개되지 않은 프로필이거나 구조적 문제일 수 있음
        // UI가 깨지지 않도록 fallback 처리
        authorNameCache.value.set(ownerId, "알 수 없음");
        return;
      }
      
      // 네트워크 오류 등 예외적인 경우에만 에러 로그
      console.error("[useAuthorName] 작성자 프로필 로드 실패:", err);
      // 네트워크 오류 등도 fallback 처리하여 UI 안정성 유지
      authorNameCache.value.set(ownerId, "알 수 없음");
    }
  };

  /**
   * 여러 작성자 이름을 일괄 로드
   * 
   * @param ownerIds - 사용자 ID 배열
   */
  const loadAuthorNames = async (ownerIds: string[]) => {
    const uniqueIds = [...new Set(ownerIds)].filter(
      (id) => id && !authorNameCache.value.has(id)
    );

    await Promise.all(uniqueIds.map((id) => loadAuthorName(id)));
  };

  /**
   * 캐시 초기화
   */
  const clearCache = () => {
    authorNameCache.value.clear();
  };

  return {
    getAuthorName,
    loadAuthorName,
    loadAuthorNames,
    clearCache,
  };
}

