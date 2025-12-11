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
 * 체크리스트 조회 (단일)
 */
export const getChecklist = async (id: string): Promise<Checklist | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Checklist;
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
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Checklist)
    );
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
        return querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Checklist)
        );
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
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ownerId: input.ownerId,
      title: input.title,
      description: input.description || "",
      dueDate: input.dueDate ? toTimestamp(input.dueDate) : null,
      createdAt: serverTimestamp(),
      createdAtNum: now, // 정렬을 위한 숫자 타임스탬프
      updatedAt: serverTimestamp(),
      isCompleted: false,
      progress: 0,
      members: input.members || [],
      rolesEnabled: input.rolesEnabled || false,
      templateId: input.templateId || null,
    });

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
    if (input.dueDate !== undefined) {
      updateData.dueDate = toTimestamp(input.dueDate);
    }
    if (input.isCompleted !== undefined)
      updateData.isCompleted = input.isCompleted;
    if (input.progress !== undefined) updateData.progress = input.progress;
    if (input.members !== undefined) updateData.members = input.members;
    if (input.rolesEnabled !== undefined)
      updateData.rolesEnabled = input.rolesEnabled;

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
