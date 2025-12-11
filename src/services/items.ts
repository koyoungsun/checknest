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
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Item, ItemCreateInput, ItemUpdateInput } from "@/types/item";

export type { ItemCreateInput, ItemUpdateInput };

const COLLECTION_NAME = "items";

/**
 * 항목 조회 (단일)
 */
export const getItem = async (id: string): Promise<Item | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Item;
    }
    return null;
  } catch (error) {
    console.error("항목 조회 실패:", error);
    throw error;
  }
};

/**
 * 체크리스트의 항목 목록 조회
 */
export const getItems = async (
  checklistId: string
): Promise<Item[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("checklistId", "==", checklistId),
      orderBy("order", "asc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Item)
    );
  } catch (error) {
    console.error("항목 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 항목 생성
 */
export const createItem = async (input: ItemCreateInput): Promise<string> => {
  try {
    const now = Date.now();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      checklistId: input.checklistId,
      name: input.name,
      isDone: input.isDone || false,
      assignedTo: input.assignedTo || null,
      order: input.order,
      createdAt: serverTimestamp(),
      createdAtNum: now, // 정렬을 위한 숫자 타임스탬프
      updatedAt: serverTimestamp(),
    });

    // 체크리스트 진행률 자동 업데이트
    const { updateChecklistProgress } = await import("./checklists");
    await updateChecklistProgress(input.checklistId);

    return docRef.id;
  } catch (error) {
    console.error("항목 생성 실패:", error);
    throw error;
  }
};

/**
 * 항목 업데이트
 */
export const updateItem = async (
  id: string,
  input: ItemUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // 현재 항목 정보 조회 (checklistId 필요)
    const currentItem = await getItem(id);
    if (!currentItem) {
      throw new Error("항목을 찾을 수 없습니다.");
    }

    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.isDone !== undefined) updateData.isDone = input.isDone;
    if (input.assignedTo !== undefined)
      updateData.assignedTo = input.assignedTo;
    if (input.order !== undefined) updateData.order = input.order;

    await updateDoc(docRef, updateData);

    // 체크리스트 진행률 자동 업데이트
    const { updateChecklistProgress } = await import("./checklists");
    await updateChecklistProgress(currentItem.checklistId);
  } catch (error) {
    console.error("항목 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 항목 삭제
 */
export const deleteItem = async (id: string): Promise<void> => {
  try {
    // 현재 항목 정보 조회 (checklistId 필요)
    const currentItem = await getItem(id);
    if (!currentItem) {
      throw new Error("항목을 찾을 수 없습니다.");
    }

    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);

    // 체크리스트 진행률 자동 업데이트
    const { updateChecklistProgress } = await import("./checklists");
    await updateChecklistProgress(currentItem.checklistId);
  } catch (error) {
    console.error("항목 삭제 실패:", error);
    throw error;
  }
};

/**
 * 항목 순서 일괄 업데이트
 */
export const updateItemsOrder = async (
  items: { id: string; order: number }[]
): Promise<void> => {
  try {
    const updatePromises = items.map((item) =>
      updateItem(item.id, { order: item.order })
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("항목 순서 업데이트 실패:", error);
    throw error;
  }
};

