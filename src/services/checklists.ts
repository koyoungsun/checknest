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
  Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type {
  Checklist,
  ChecklistCreateInput,
  ChecklistUpdateInput,
} from "@/types/checklist";

export type { ChecklistCreateInput, ChecklistUpdateInput };

const COLLECTION_NAME = "checklists";

/**
 * Date 타입 검증 및 Timestamp 변환 헬퍼
 */
const toTimestamp = (date: Date | null | undefined): Timestamp | null => {
  if (!date) return null;
  if (!(date instanceof Date)) {
    throw new TypeError("dueDate는 Date 인스턴스여야 합니다.");
  }
  if (isNaN(date.getTime())) {
    throw new TypeError("유효하지 않은 Date 값입니다.");
  }
  return Timestamp.fromDate(date);
};

/**
 * 체크리스트의 createdAt 필드 보정
 * createdAt이 없으면 updatedAt 또는 serverTimestamp()로 보정
 */
const ensureCreatedAt = async (checklistData: { id: string; createdAt?: Timestamp | null; updatedAt?: Timestamp | null }): Promise<void> => {
  if (!checklistData.createdAt) {
    const docRef = doc(db, COLLECTION_NAME, checklistData.id);
    const updateData: any = {};
    
    // updatedAt이 있으면 그것을 사용, 없으면 serverTimestamp() 사용
    if (checklistData.updatedAt) {
      updateData.createdAt = checklistData.updatedAt;
    } else {
      updateData.createdAt = serverTimestamp();
    }
    
    try {
      await updateDoc(docRef, updateData);
      console.log(`[ensureCreatedAt] 체크리스트 ${checklistData.id}의 createdAt 보정 완료`);
    } catch (error) {
      console.error(`[ensureCreatedAt] 체크리스트 ${checklistData.id}의 createdAt 보정 실패:`, error);
      // 보정 실패해도 계속 진행 (에러만 로그)
    }
  }
};

/**
 * 체크리스트 조회 (단일)
 */
export const getChecklist = async (id: string): Promise<Checklist | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const firestoreData = docSnap.data();
      
      // groups 배열: Firestore에 있으면 그대로 사용, 없으면 빈 배열 (재생성 금지)
      // 기존 데이터 보호: groups가 없으면 빈 배열로 처리 (UI에서 처리)
      let groups: Array<{ groupId: string; groupName: string; order: number }> = [];
      if (firestoreData.groups && Array.isArray(firestoreData.groups) && firestoreData.groups.length > 0) {
        // order 필드가 없으면 추가 (기존 데이터 보호)
        groups = firestoreData.groups.map((g: any, index: number) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          order: g.order !== undefined ? g.order : index
        }));
      }
      
      // 모든 필드를 명시적으로 포함하여 Checklist 타입으로 변환
      const data: Checklist = {
        id: docSnap.id,
        ownerId: firestoreData.ownerId,
        title: firestoreData.title,
        description: firestoreData.description || "",
        groups: groups, // Firestore에 있으면 그대로 사용, 없으면 빈 배열
        dueDate: firestoreData.dueDate || null,
        createdAt: firestoreData.createdAt,
        createdAtNum: firestoreData.createdAtNum,
        updatedAt: firestoreData.updatedAt,
        isCompleted: firestoreData.isCompleted ?? false,
        progress: firestoreData.progress ?? 0,
        members: firestoreData.members || [],
        pendingMembers: firestoreData.pendingMembers || undefined,
        rolesEnabled: firestoreData.rolesEnabled ?? false,
        templateId: firestoreData.templateId || null,
        isDefault: firestoreData.isDefault ?? false,
        hasChat: firestoreData.hasChat ?? undefined,
        // chatEnabled: 기본 todo는 false, 그 외는 true (없으면 true로 간주)
        chatEnabled: firestoreData.isDefault === true 
          ? false 
          : (firestoreData.chatEnabled !== undefined ? firestoreData.chatEnabled : true),
        maxParticipants: firestoreData.maxParticipants ?? undefined,
        status: firestoreData.status || undefined,
        completedAt: firestoreData.completedAt || undefined,
      };
      
      // createdAt이 없으면 보정
      if (!data.createdAt) {
        await ensureCreatedAt(data);
        // 보정 후 다시 조회하여 최신 데이터 반환
        const updatedSnap = await getDoc(docRef);
        if (updatedSnap.exists()) {
          const updatedFirestoreData = updatedSnap.data();
          // groups 배열: Firestore에 있으면 그대로 사용, 없으면 빈 배열 (재생성 금지)
          let updatedGroups: Array<{ groupId: string; groupName: string; order: number }> = [];
          if (updatedFirestoreData.groups && Array.isArray(updatedFirestoreData.groups) && updatedFirestoreData.groups.length > 0) {
            updatedGroups = updatedFirestoreData.groups.map((g: any, index: number) => ({
              groupId: g.groupId,
              groupName: g.groupName,
              order: g.order !== undefined ? g.order : index
            }));
          }
          
          return {
            id: updatedSnap.id,
            ownerId: updatedFirestoreData.ownerId,
            title: updatedFirestoreData.title,
            description: updatedFirestoreData.description || "",
            groups: updatedGroups, // Firestore에 있으면 그대로 사용, 없으면 빈 배열
            dueDate: updatedFirestoreData.dueDate || null,
            createdAt: updatedFirestoreData.createdAt,
            createdAtNum: updatedFirestoreData.createdAtNum,
            updatedAt: updatedFirestoreData.updatedAt,
            isCompleted: updatedFirestoreData.isCompleted ?? false,
            progress: updatedFirestoreData.progress ?? 0,
            members: updatedFirestoreData.members || [],
            pendingMembers: updatedFirestoreData.pendingMembers || undefined,
            rolesEnabled: updatedFirestoreData.rolesEnabled ?? false,
            templateId: updatedFirestoreData.templateId || null,
            isDefault: updatedFirestoreData.isDefault ?? false,
            hasChat: updatedFirestoreData.hasChat ?? undefined,
            // chatEnabled: 기본 todo는 false, 그 외는 true (없으면 true로 간주)
            chatEnabled: updatedFirestoreData.isDefault === true 
              ? false 
              : (updatedFirestoreData.chatEnabled !== undefined ? updatedFirestoreData.chatEnabled : true),
            maxParticipants: updatedFirestoreData.maxParticipants ?? undefined,
            status: updatedFirestoreData.status || undefined,
            completedAt: updatedFirestoreData.completedAt || undefined,
          };
        }
      }
      
      return data;
    }
    return null;
  } catch (error) {
    console.error("체크리스트 조회 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 목록 조회
 *
 * ⚠️ Firestore 복합 인덱스 필요:
 * - ownerId + isCompleted + createdAtNum (desc)
 * - members (array-contains) + isCompleted + createdAtNum (desc)
 * - ownerId + createdAtNum (desc)
 * - members (array-contains) + createdAtNum (desc)
 *
 * 인덱스 생성 방법:
 * 1. Firebase Console > Firestore > Indexes
 * 2. 또는 쿼리 실행 시 에러 메시지의 링크를 클릭하여 자동 생성
 */
export const getChecklists = async (filters?: {
  ownerId?: string;
  memberId?: string;
  isCompleted?: boolean;
}): Promise<Checklist[]> => {
  try {
    const constraints: any[] = [];

    // 필터 조건 추가
    if (filters?.ownerId) {
      constraints.push(where("ownerId", "==", filters.ownerId));
    }
    if (filters?.memberId) {
      constraints.push(where("members", "array-contains", filters.memberId));
    }
    if (filters?.isCompleted !== undefined) {
      constraints.push(where("isCompleted", "==", filters.isCompleted));
    }

    // createdAtNum이 있으면 사용, 없으면 createdAt 사용 (하위 호환성)
    // 새로 생성되는 문서는 createdAtNum을 포함하므로 createdAtNum 우선 사용
    constraints.push(orderBy("createdAtNum", "desc"));

    const q = query(collection(db, COLLECTION_NAME), ...constraints);

    const querySnapshot = await getDocs(q);
    const checklists = querySnapshot.docs.map((doc) => {
      const firestoreData = doc.data();
      
      // groups 배열: Firestore에 있으면 그대로 사용, 없으면 빈 배열 (재생성 금지)
      let groups: Array<{ groupId: string; groupName: string; order: number }> = [];
      if (firestoreData.groups && Array.isArray(firestoreData.groups) && firestoreData.groups.length > 0) {
        groups = firestoreData.groups.map((g: any, index: number) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          order: g.order !== undefined ? g.order : index
        }));
      }
      
      return {
        id: doc.id,
        ownerId: firestoreData.ownerId,
        title: firestoreData.title,
        description: firestoreData.description || "",
        groups: groups, // Firestore에 있으면 그대로 사용, 없으면 빈 배열
        dueDate: firestoreData.dueDate || null,
        createdAt: firestoreData.createdAt,
        createdAtNum: firestoreData.createdAtNum,
        updatedAt: firestoreData.updatedAt,
        isCompleted: firestoreData.isCompleted ?? false,
        progress: firestoreData.progress ?? 0,
        members: firestoreData.members || [],
        pendingMembers: firestoreData.pendingMembers || undefined,
        rolesEnabled: firestoreData.rolesEnabled ?? false,
        templateId: firestoreData.templateId || null,
        isDefault: firestoreData.isDefault ?? false,
        hasChat: firestoreData.hasChat ?? undefined,
        // chatEnabled: 기본 todo는 false, 그 외는 true (없으면 true로 간주)
        chatEnabled: firestoreData.isDefault === true 
          ? false 
          : (firestoreData.chatEnabled !== undefined ? firestoreData.chatEnabled : true),
        maxParticipants: firestoreData.maxParticipants ?? undefined,
        status: firestoreData.status || undefined,
        completedAt: firestoreData.completedAt || undefined,
      } as Checklist;
    });
    
    // createdAt이 없는 체크리스트 보정 (비동기로 처리, 결과는 기다리지 않음)
    checklists.forEach(async (checklist) => {
      if (!checklist.createdAt) {
        await ensureCreatedAt(checklist);
      }
    });
    
    return checklists;
  } catch (error: any) {
    // createdAtNum 인덱스가 없을 경우 createdAt으로 폴백
    if (
      error.code === "failed-precondition" &&
      error.message?.includes("index")
    ) {
      console.warn(
        "createdAtNum 인덱스가 없어 createdAt으로 폴백합니다. 인덱스를 생성해주세요."
      );
      try {
        const constraints: any[] = [];

        if (filters?.ownerId) {
          constraints.push(where("ownerId", "==", filters.ownerId));
        }
        if (filters?.memberId) {
          constraints.push(where("members", "array-contains", filters.memberId));
        }
        if (filters?.isCompleted !== undefined) {
          constraints.push(where("isCompleted", "==", filters.isCompleted));
        }
        constraints.push(orderBy("createdAt", "desc"));

        const q = query(collection(db, COLLECTION_NAME), ...constraints);
        const querySnapshot = await getDocs(q);
        // TODO: group 컬렉션 분리 시 migration 예정
        return querySnapshot.docs.map((doc) => {
          const firestoreData = doc.data();
          return {
            id: doc.id,
            ownerId: firestoreData.ownerId,
            title: firestoreData.title,
            description: firestoreData.description || "",
            // groups 배열: Firestore에 있으면 그대로 사용, 없으면 빈 배열 (재생성 금지)
            groups: (firestoreData.groups && Array.isArray(firestoreData.groups) && firestoreData.groups.length > 0)
              ? firestoreData.groups.map((g: any, index: number) => ({
                  groupId: g.groupId,
                  groupName: g.groupName,
                  order: g.order !== undefined ? g.order : index
                }))
              : [],
            dueDate: firestoreData.dueDate || null,
            createdAt: firestoreData.createdAt,
            createdAtNum: firestoreData.createdAtNum,
            updatedAt: firestoreData.updatedAt,
            isCompleted: firestoreData.isCompleted ?? false,
            progress: firestoreData.progress ?? 0,
            members: firestoreData.members || [],
            pendingMembers: firestoreData.pendingMembers || undefined,
            rolesEnabled: firestoreData.rolesEnabled ?? false,
            templateId: firestoreData.templateId || null,
            isDefault: firestoreData.isDefault ?? false,
            hasChat: firestoreData.hasChat ?? undefined,
            // chatEnabled: 기본 todo는 false, 그 외는 true (없으면 true로 간주)
            chatEnabled: firestoreData.isDefault === true 
              ? false 
              : (firestoreData.chatEnabled !== undefined ? firestoreData.chatEnabled : true),
            maxParticipants: firestoreData.maxParticipants ?? undefined,
            status: firestoreData.status || undefined,
            completedAt: firestoreData.completedAt || undefined,
          } as Checklist;
        });
      } catch (fallbackError) {
        console.error("체크리스트 목록 조회 실패 (폴백):", fallbackError);
        throw fallbackError;
      }
    }
    console.error("체크리스트 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 생성
 */
export const createChecklist = async (
  input: ChecklistCreateInput
): Promise<string> => {
  try {
    const now = Date.now();
    
    // members 배열에 ownerId가 없으면 추가
    const members = input.members || [];
    if (!members.includes(input.ownerId)) {
      members.push(input.ownerId);
    }
    
    // 3. input.dueDate 확인 및 처리
    console.log("[createChecklist] input.dueDate 받음:", {
      dueDate: input.dueDate,
      type: typeof input.dueDate,
      isDate: input.dueDate instanceof Date,
      isNull: input.dueDate === null,
      isUndefined: input.dueDate === undefined,
    });
    
    // dueDate가 Date 객체인지 확인하고 Timestamp로 변환
    const dueDateTimestamp = input.dueDate instanceof Date 
      ? Timestamp.fromDate(input.dueDate)
      : null;
    
    console.log("[createChecklist] dueDate 처리:", {
      original: input.dueDate,
      isDate: input.dueDate instanceof Date,
      timestamp: dueDateTimestamp,
      timestampType: dueDateTimestamp ? typeof dueDateTimestamp : 'null',
      timestampSeconds: dueDateTimestamp ? dueDateTimestamp.seconds : null,
      type: typeof input.dueDate
    });
    
    // chatEnabled 처리: 기본 todo는 false, 그 외는 입력값 또는 true
    const isDefault = input.isDefault || false;
    // 기본 todo는 chatEnabled = false, 그 외는 입력값 또는 true
    const chatEnabled = isDefault ? false : (input.chatEnabled !== undefined ? input.chatEnabled : true);
    
    // groups 배열: 필수 필드 (런타임 생성 금지)
    if (!input.groups || !Array.isArray(input.groups) || input.groups.length === 0) {
      throw new Error("groups 배열은 필수 필드입니다. 최소 1개 이상의 그룹이 필요합니다.");
    }
    
    const groups = input.groups;
    
    // payload 생성: dueDate가 있으면 포함, 없으면 필드 자체를 저장하지 않음
    const payload: any = {
      ownerId: input.ownerId,
      title: input.title,
      description: input.description || "",
      groups: groups, // 그룹 배열 (필수, 최소 1개 이상)
      chatEnabled: chatEnabled, // 필수 필드 (기본 todo는 false, 그 외는 true)
      createdAt: serverTimestamp(),
      createdAtNum: now, // 정렬을 위한 숫자 타임스탬프
      updatedAt: serverTimestamp(),
      isCompleted: false,
      progress: 0,
      members: members, // ownerId가 포함된 members 배열
      rolesEnabled: input.rolesEnabled || false,
      templateId: input.templateId || null,
      isDefault: isDefault,
      // dueDate가 있으면 Timestamp로 추가, 없으면 필드 자체를 저장하지 않음
      ...(dueDateTimestamp ? { dueDate: dueDateTimestamp } : {}),
    };
    
    // 4. Firestore에 저장되는 최종 payload 콘솔 출력
    console.log("[createChecklist] 최종 payload:", {
      ownerId: payload.ownerId,
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? `Timestamp(${payload.dueDate.seconds}, ${payload.dueDate.nanoseconds})` : 'undefined (필드 없음)',
      dueDateExists: 'dueDate' in payload,
      createdAt: 'serverTimestamp()',
      updatedAt: 'serverTimestamp()',
      isCompleted: payload.isCompleted,
      progress: payload.progress,
      members: payload.members,
      rolesEnabled: payload.rolesEnabled,
      templateId: payload.templateId,
      isDefault: payload.isDefault,
    });
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), payload);
    
    console.log("[createChecklist] 체크리스트 생성 완료, ID:", docRef.id);

    return docRef.id;
  } catch (error) {
    console.error("체크리스트 생성 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 업데이트
 */
export const updateChecklist = async (
  id: string,
  input: ChecklistUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.groups !== undefined) updateData.groups = input.groups;
    if (input.dueDate !== undefined) {
      // dueDate가 null이면 필드를 삭제, Date 객체면 Timestamp로 변환
      if (input.dueDate === null) {
        updateData.dueDate = null;
        console.log("[updateChecklist] dueDate를 null로 설정 (필드 삭제)");
      } else {
        updateData.dueDate = toTimestamp(input.dueDate);
        console.log("[updateChecklist] dueDate 저장:", {
          original: input.dueDate,
          timestamp: updateData.dueDate,
          type: typeof input.dueDate
        });
      }
    }
    if (input.isCompleted !== undefined)
      updateData.isCompleted = input.isCompleted;
    if (input.progress !== undefined) updateData.progress = input.progress;
    if (input.members !== undefined) updateData.members = input.members;
    if (input.rolesEnabled !== undefined)
      updateData.rolesEnabled = input.rolesEnabled;
    if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.completedAt !== undefined) {
      // completedAt이 null이면 null로 설정, Date 객체면 Timestamp로 변환
      if (input.completedAt === null) {
        updateData.completedAt = null;
      } else {
        updateData.completedAt = toTimestamp(input.completedAt);
      }
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("체크리스트 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 삭제
 */
export const deleteChecklist = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("체크리스트 삭제 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 진행률 계산
 * 
 * 최적화: 단일 순회로 완료 항목 수와 전체 항목 수를 동시에 계산
 */
export const calculateChecklistProgress = async (
  checklistId: string
): Promise<number> => {
  try {
    const { getItems } = await import("./items");
    const items = await getItems(checklistId);

    if (items.length === 0) return 0;

    // 단일 순회로 완료 항목 수 계산 (더 효율적)
    let completedCount = 0;
    for (const item of items) {
      if (item.isDone) completedCount++;
    }

    return Math.round((completedCount / items.length) * 100);
  } catch (error) {
    console.error("진행률 계산 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트 진행률 자동 업데이트
 * 
 * 최적화: updateChecklist를 두 번 호출하지 않고 하나의 updateDoc으로 통합
 */
export const updateChecklistProgress = async (
  checklistId: string
): Promise<void> => {
  try {
    const progress = await calculateChecklistProgress(checklistId);
    const docRef = doc(db, COLLECTION_NAME, checklistId);

    // 하나의 updateDoc으로 progress와 isCompleted를 동시에 업데이트
    const updateData: any = {
      progress,
      updatedAt: serverTimestamp(),
    };

    // 진행률이 100%면 자동으로 완료 처리
    if (progress === 100) {
      updateData.isCompleted = true;
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("진행률 업데이트 실패:", error);
    throw error;
  }
};
