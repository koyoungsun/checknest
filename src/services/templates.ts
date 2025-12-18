import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type {
  Template,
  TemplateCreateInput,
  TemplateUpdateInput,
  TemplateListFilters,
  TemplateSortOption,
} from "@/types/template";

export type { TemplateCreateInput, TemplateUpdateInput };

const COLLECTION_NAME = "templates";

/**
 * 템플릿 Firestore 문서 구조
 * 
 * 필수 필드:
 * - visibility: "public" | "private" (필수, 기본값 "private")
 *   - "public": 다른 사용자에게 공개, 홈/탐색에 노출
 *   - "private": 나만 사용 가능, 홈에 노출되지 않음
 * 
 * 사용하지 않는 필드 (레거시):
 * - isPublic: 더 이상 사용하지 않음
 *   - 기존 데이터 마이그레이션: isPublic === true → visibility === "public"
 *   - 기존 데이터 마이그레이션: visibility 없음 → visibility === "private"
 * 
 * 마이그레이션 정책:
 * - 템플릿 조회 시 visibility가 없거나 레거시 데이터인 경우 자동으로 마이그레이션
 * - 마이그레이션은 비동기로 수행되며, 실패해도 조회는 계속 진행됨
 */

/**
 * visibility 필드 정규화 및 마이그레이션
 * 
 * @param data Firestore 문서 데이터
 * @returns 정규화된 visibility 값 ("public" | "private")
 * 
 * 마이그레이션 규칙:
 * 1. visibility 필드가 "public" 또는 "private"이면 그대로 사용
 * 2. visibility 필드가 없거나 null/undefined인 경우:
 *    - isPublic === true이면 "public"으로 변환
 *    - 그 외의 경우 "private"로 설정 (기본값)
 * 3. isPublic 필드는 레거시 필드이므로 무시
 */
const normalizeVisibility = (data: any): "private" | "public" => {
  // visibility 필드가 유효한 값이면 사용
  if (data.visibility === "public" || data.visibility === "private") {
    return data.visibility;
  }
  
  // visibility 필드가 없는 경우 마이그레이션
  // 레거시 isPublic 필드 확인 (하위 호환성)
  if (data.visibility === undefined || data.visibility === null) {
    if (data.isPublic === true) {
      console.warn(`[normalizeVisibility] 레거시 isPublic 필드 발견, "public"으로 마이그레이션`);
      return "public";
    }
    // 기본값: "private"
    return "private";
  }
  
  // 예상치 못한 값인 경우 기본값 반환
  console.warn(`[normalizeVisibility] 예상치 못한 visibility 값: ${data.visibility}, "private"로 설정`);
  return "private";
};

/**
 * 템플릿 조회 (단일)
 */
export const getTemplate = async (id: string): Promise<Template | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // createdAt 필드를 number(ms)로 normalize
      let createdAtNormalized: any = data.createdAt;
      if (createdAtNormalized) {
        if (typeof createdAtNormalized.toDate === 'function') {
          createdAtNormalized = createdAtNormalized.toDate().getTime();
        } else if (createdAtNormalized instanceof Date) {
          createdAtNormalized = createdAtNormalized.getTime();
        } else if (typeof createdAtNormalized === 'number') {
          if (createdAtNormalized < 10000000000) {
            createdAtNormalized = createdAtNormalized * 1000;
          }
        }
        if (data.createdAtNum && typeof data.createdAtNum === 'number') {
          createdAtNormalized = data.createdAtNum;
        }
      }
      
      // visibility 필드 정규화 및 마이그레이션
      const visibility = normalizeVisibility(data);
      
      // visibility가 없거나 레거시 데이터인 경우 Firestore에 마이그레이션
      if (!data.visibility || data.visibility !== visibility) {
        // 비동기로 마이그레이션 (에러가 발생해도 조회는 계속 진행)
        updateDoc(docRef, { visibility }).catch((err) => {
          console.warn(`[getTemplate] visibility 마이그레이션 실패 (ID: ${id}):`, err);
        });
      }
      
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description || "",
        category: data.category,
        groups: data.groups || [],
        items: data.items || [],
        ownerId: data.ownerId,
        visibility,
        likeCount: data.likeCount || 0,
        usedCount: data.usedCount || 0,
        sourceChecklistId: data.sourceChecklistId || undefined,
        createdAt: createdAtNormalized ? { toDate: () => new Date(createdAtNormalized) } : data.createdAt,
      } as Template;
    }
    return null;
  } catch (error) {
    console.error("템플릿 조회 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 목록 조회
 * 
 * @param filters 필터 옵션
 * @param sortBy 정렬 기준 (기본값: "createdAt")
 * @param sortOrder 정렬 방향 (기본값: "desc")
 */
export const getTemplates = async (
  filters?: TemplateListFilters,
  sortBy: TemplateSortOption = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
): Promise<Template[]> => {
  try {
    const constraints: any[] = [];

    // 필터 조건 추가
    if (filters?.visibility) {
      constraints.push(where("visibility", "==", filters.visibility));
    }
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.ownerId) {
      constraints.push(where("ownerId", "==", filters.ownerId));
    }
    // tags 필터 제거됨

    // 정렬 옵션 추가
    // createdAt만 서버에서 정렬 (title, category는 클라이언트에서 정렬)
    // createdAt 필드가 없는 문서는 쿼리 결과에서 제외됨 (정상 동작)
    if (sortBy === "createdAt") {
      constraints.push(orderBy("createdAt", sortOrder));
    } else {
      // title, category는 클라이언트에서 정렬하므로 서버에서는 createdAt desc로 정렬
      constraints.push(orderBy("createdAt", "desc"));
    }

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (error: any) {
      // 인덱스 오류인 경우 fallback: visibility 필터 없이 단순 쿼리 시도
      if (error?.code === "failed-precondition" && error?.message?.includes("index")) {
        console.warn("[getTemplates] Firestore 인덱스 오류 - fallback 쿼리 시도");
        try {
          const fallbackConstraints: any[] = [];
          
          // 필터 조건 추가 (visibility 제외)
          if (filters?.category) {
            fallbackConstraints.push(where("category", "==", filters.category));
          }
          if (filters?.ownerId) {
            fallbackConstraints.push(where("ownerId", "==", filters.ownerId));
          }
          
          // 정렬: createdAt 기준 (title, category는 클라이언트에서 정렬)
          if (sortBy === "createdAt") {
            fallbackConstraints.push(orderBy("createdAt", sortOrder));
          } else {
            fallbackConstraints.push(orderBy("createdAt", "desc"));
          }
          
          const fallbackQ = query(collection(db, COLLECTION_NAME), ...fallbackConstraints);
          querySnapshot = await getDocs(fallbackQ);
          
          // 클라이언트 사이드에서 visibility 필터링
          const results = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              // createdAt normalize 로직 (기존과 동일)
              let createdAtNormalized: any = data.createdAt;
              if (createdAtNormalized) {
                if (typeof createdAtNormalized.toDate === 'function') {
                  createdAtNormalized = createdAtNormalized.toDate().getTime();
                } else if (createdAtNormalized instanceof Date) {
                  createdAtNormalized = createdAtNormalized.getTime();
                } else if (typeof createdAtNormalized === 'number') {
                  if (createdAtNormalized < 10000000000) {
                    createdAtNormalized = createdAtNormalized * 1000;
                  }
                }
                if (data.createdAtNum && typeof data.createdAtNum === 'number') {
                  createdAtNormalized = data.createdAtNum;
                }
              }
              
              // visibility 필드 정규화 및 마이그레이션
              const visibility = normalizeVisibility(data);
              
              return {
                id: doc.id,
                title: data.title,
                description: data.description || "",
                category: data.category,
                groups: data.groups || [],
                items: data.items || [],
                ownerId: data.ownerId,
                visibility,
                likeCount: data.likeCount || 0,
                usedCount: data.usedCount || 0,
                sourceChecklistId: data.sourceChecklistId || undefined,
                createdAt: createdAtNormalized ? { toDate: () => new Date(createdAtNormalized) } : data.createdAt,
              } as Template;
            })
            .filter((template) => {
              // visibility 필터 적용
              if (filters?.visibility) {
                return template.visibility === filters.visibility;
              }
              return true;
            });
          
          return results;
        } catch (fallbackError: any) {
          console.error("[getTemplates] Fallback 쿼리도 실패:", fallbackError?.message || fallbackError);
          throw fallbackError;
        }
      }
      throw error;
    }
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      
      // createdAt 필드를 number(ms)로 normalize
      // Firestore Timestamp를 밀리초 숫자로 변환하여 일관성 보장
      let createdAtNormalized: any = data.createdAt;
      if (createdAtNormalized) {
        // Firestore Timestamp인 경우 toDate()로 변환 후 getTime()
        if (typeof createdAtNormalized.toDate === 'function') {
          createdAtNormalized = createdAtNormalized.toDate().getTime();
        }
        // 이미 Date 객체인 경우
        else if (createdAtNormalized instanceof Date) {
          createdAtNormalized = createdAtNormalized.getTime();
        }
        // 이미 number인 경우 그대로 사용
        else if (typeof createdAtNormalized === 'number') {
          // 이미 밀리초인지 확인 (초 단위인 경우 밀리초로 변환)
          if (createdAtNormalized < 10000000000) {
            createdAtNormalized = createdAtNormalized * 1000;
          }
        }
        // createdAtNum 필드가 있으면 우선 사용 (더 정확함)
        if (data.createdAtNum && typeof data.createdAtNum === 'number') {
          createdAtNormalized = data.createdAtNum;
        }
      }
      
      // visibility 필드 정규화 및 마이그레이션
      const visibility = normalizeVisibility(data);
      
      return {
        id: doc.id,
        title: data.title,
        description: data.description || "",
        category: data.category,
        groups: data.groups || [],
        items: data.items || [],
        ownerId: data.ownerId,
        visibility,
        likeCount: data.likeCount || 0,
        usedCount: data.usedCount || 0,
        sourceChecklistId: data.sourceChecklistId || undefined,
        createdAt: createdAtNormalized ? { toDate: () => new Date(createdAtNormalized) } : data.createdAt,
      } as Template;
    });
  } catch (error) {
    console.error("템플릿 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 생성
 * 
 * @note visibility 필드는 필수이며, 제공되지 않으면 "private"로 설정됨
 * @note visibility 값은 "public" 또는 "private"만 허용됨
 */
export const createTemplate = async (
  input: TemplateCreateInput
): Promise<string> => {
  try {
    // groups 검증 (최소 1개 이상 필요)
    if (!input.groups || input.groups.length === 0) {
      throw new Error("groups 배열은 필수 필드입니다. 최소 1개 이상의 그룹이 필요합니다.");
    }

    // visibility 검증 및 정규화
    let visibility: "private" | "public" = input.visibility || "private";
    if (visibility !== "public" && visibility !== "private") {
      console.warn(`[createTemplate] 잘못된 visibility 값: ${visibility}, "private"로 설정`);
      visibility = "private";
    }

    // items의 isCompleted를 모두 false로 보장
    const items = input.items.map((item) => ({
      title: item.title,
      isCompleted: false,
      groupId: item.groupId,
    }));

    // payload 구성
    // visibility는 반드시 포함되어야 함 (필수 필드)
    const payload: any = {
      title: input.title,
      description: input.description || "",
      category: input.category,
      groups: input.groups,
      items: items,
      ownerId: input.ownerId,
      visibility, // 필수 필드: "public" 또는 "private"
      likeCount: 0,
      usedCount: 0,
      createdAt: serverTimestamp(), // Firestore Timestamp
      createdAtNum: Date.now(), // 숫자 타임스탬프 (정렬용)
    };

    // sourceChecklistId가 있으면만 추가
    if (input.sourceChecklistId) {
      payload.sourceChecklistId = input.sourceChecklistId;
    }

    console.log("[createTemplate] 템플릿 생성 시작:", {
      title: payload.title,
      category: payload.category,
      visibility: payload.visibility,
      groupsCount: payload.groups.length,
      itemsCount: payload.items.length,
    });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);

    console.log("[createTemplate] 템플릿 생성 완료, ID:", docRef.id, "visibility:", payload.visibility);

    return docRef.id;
  } catch (error) {
    console.error("템플릿 생성 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 업데이트
 * 
 * @note visibility 업데이트 시 "public" 또는 "private"만 허용됨
 */
export const updateTemplate = async (
  id: string,
  input: TemplateUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.groups !== undefined) updateData.groups = input.groups;
    if (input.items !== undefined) {
      // items의 isCompleted를 모두 false로 보장
      updateData.items = input.items.map((item) => ({
        title: item.title,
        isCompleted: false,
        groupId: item.groupId,
      }));
    }
    if (input.visibility !== undefined) {
      // visibility 검증
      if (input.visibility !== "public" && input.visibility !== "private") {
        throw new Error(`잘못된 visibility 값입니다: ${input.visibility}. "public" 또는 "private"만 허용됩니다.`);
      }
      updateData.visibility = input.visibility;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("템플릿 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 삭제
 */
export const deleteTemplate = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("템플릿 삭제 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 좋아요 증가
 */
export const incrementTemplateLike = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      likeCount: increment(1),
    });
  } catch (error) {
    console.error("템플릿 좋아요 증가 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 좋아요 감소
 */
export const decrementTemplateLike = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const template = await getTemplate(id);
    if (template && template.likeCount > 0) {
      await updateDoc(docRef, {
        likeCount: increment(-1),
      });
    }
  } catch (error) {
    console.error("템플릿 좋아요 감소 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 사용 횟수 증가
 */
export const incrementTemplateUsedCount = async (
  id: string
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      usedCount: increment(1),
    });
  } catch (error) {
    console.error("템플릿 사용 횟수 증가 실패:", error);
    throw error;
  }
};

/**
 * 템플릿으로부터 체크리스트 생성
 * 
 * 템플릿의 groups 구조를 그대로 복사하여 체크리스트를 생성합니다.
 * 모든 항목의 isCompleted는 false로 초기화됩니다.
 */
export const createChecklistFromTemplate = async (
  templateId: string,
  ownerId: string,
  title?: string
): Promise<string> => {
  try {
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error("템플릿을 찾을 수 없습니다.");
    }

    const { createChecklist } = await import("./checklists");
    const { createItem } = await import("./items");

    // 템플릿의 groups를 그대로 복사 (id는 새로 생성)
    const checklistGroups = template.groups.map((group, index) => ({
      groupId: crypto.randomUUID(), // 새 ID 생성
      groupName: group.groupName, // 이름은 그대로 복사
      order: group.order, // order도 그대로 복사
    }));

    // groupId 매핑 생성 (템플릿 groupId -> 체크리스트 groupId)
    const groupIdMap = new Map<string, string>();
    template.groups.forEach((templateGroup, index) => {
      groupIdMap.set(templateGroup.groupId, checklistGroups[index].groupId);
    });

    // 체크리스트 생성
    const checklistId = await createChecklist({
      ownerId,
      title: title || template.title,
      description: template.description,
      templateId: templateId,
      members: [], // ownerId는 members에 포함하지 않음
      groups: checklistGroups,
    });

    // 템플릿의 항목들을 체크리스트에 추가 (groupId 매핑 적용)
    for (let i = 0; i < template.items.length; i++) {
      const templateItem = template.items[i];
      const checklistGroupId = groupIdMap.get(templateItem.groupId);
      if (!checklistGroupId) {
        console.warn(`템플릿 항목의 groupId(${templateItem.groupId})를 찾을 수 없습니다.`);
        continue;
      }
      
      await createItem({
        checklistId,
        name: templateItem.title,
        order: i,
        isDone: false, // 항상 false로 초기화
        groupId: checklistGroupId,
      });
    }

    // 템플릿 사용 횟수 증가
    await incrementTemplateUsedCount(templateId);

    return checklistId;
  } catch (error) {
    console.error("템플릿으로부터 체크리스트 생성 실패:", error);
    throw error;
  }
};

/**
 * 템플릿의 items를 체크리스트에 추가 (append 방식)
 * 기존 항목은 유지하고 템플릿의 items를 추가합니다.
 * 
 * @param templateId 템플릿 ID
 * @param checklistId 체크리스트 ID
 * @param targetGroupId 항목을 추가할 그룹 ID (템플릿의 groups 구조는 무시하고 모두 이 그룹에 추가)
 */
export const appendTemplateItemsToChecklist = async (
  templateId: string,
  checklistId: string,
  targetGroupId: string
): Promise<void> => {
  try {
    const template = await getTemplate(templateId);
    if (!template) {
      throw new Error("템플릿을 찾을 수 없습니다.");
    }

    const { getItems } = await import("./items");
    const { createItem } = await import("./items");

    // 기존 항목들의 order 확인
    const existingItems = await getItems(checklistId);
    const maxOrder = existingItems.length > 0 
      ? Math.max(...existingItems.map((item) => item.order))
      : -1;

    // 템플릿의 항목들을 체크리스트에 추가 (모두 targetGroupId에 추가)
    for (let i = 0; i < template.items.length; i++) {
      const templateItem = template.items[i];
      await createItem({
        checklistId,
        name: templateItem.title,
        order: maxOrder + 1 + i,
        isDone: false, // 항상 false로 초기화
        groupId: targetGroupId,
      });
    }

    // 템플릿 사용 횟수 증가
    await incrementTemplateUsedCount(templateId);
  } catch (error) {
    console.error("템플릿 항목 추가 실패:", error);
    throw error;
  }
};

