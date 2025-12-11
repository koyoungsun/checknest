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
import type {
  Template,
  TemplateCreateInput,
  TemplateUpdateInput,
} from "@/types/template";

export type { TemplateCreateInput, TemplateUpdateInput };

const COLLECTION_NAME = "templates";

/**
 * 템플릿 조회 (단일)
 */
export const getTemplate = async (id: string): Promise<Template | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Template;
    }
    return null;
  } catch (error) {
    console.error("템플릿 조회 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 목록 조회
 */
export const getTemplates = async (filters?: {
  category?: string;
}): Promise<Template[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      ...(filters?.category
        ? [where("category", "==", filters.category)]
        : []),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Template)
    );
  } catch (error) {
    console.error("템플릿 목록 조회 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 생성
 */
export const createTemplate = async (
  input: TemplateCreateInput
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title: input.title,
      description: input.description || "",
      category: input.category,
      items: input.items,
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("템플릿 생성 실패:", error);
    throw error;
  }
};

/**
 * 템플릿 업데이트
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
    if (input.items !== undefined) updateData.items = input.items;

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
 * 템플릿으로부터 체크리스트 생성
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

    // 체크리스트 생성
    // members는 빈 배열로 강제 (ownerId는 members에 포함하지 않음)
    const checklistId = await createChecklist({
      ownerId,
      title: title || template.title,
      description: template.description,
      templateId,
      members: [], // ownerId는 members에 포함하지 않음
    });

    // 템플릿의 항목들을 체크리스트에 추가
    for (const templateItem of template.items) {
      await createItem({
        checklistId,
        name: templateItem.name,
        order: templateItem.order,
        isDone: false,
      });
    }

    return checklistId;
  } catch (error) {
    console.error("템플릿으로부터 체크리스트 생성 실패:", error);
    throw error;
  }
};

