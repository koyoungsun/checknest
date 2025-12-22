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
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";

const POSTS_COLLECTION = "posts";

/**
 * 게시글 데이터 구조
 */
export interface Post {
  id: string;
  category: "notice" | "free" | "review";
  title: string;
  content: string;
  ownerId: string;
  authorName: string;
  createdAt: any; // Timestamp
  updatedAt?: any; // Timestamp
  likeCount: number; // default 0
  commentCount: number; // default 0
}

/**
 * 게시글 생성 입력 데이터
 */
export interface PostCreateInput {
  category: "notice" | "free" | "review";
  title: string;
  content: string;
  ownerId: string;
  authorName: string;
}

/**
 * 게시글 업데이트 입력 데이터
 */
export interface PostUpdateInput {
  title?: string;
  content?: string;
  category?: "notice" | "free" | "review";
}

/**
 * 게시글 목록 조회 필터
 */
export interface PostListFilters {
  category?: "notice" | "free" | "review";
}

/**
 * 게시글 목록 조회
 * orderBy(createdAt, desc)로 조회
 */
export const getPosts = async (
  filters?: PostListFilters,
  limitCount?: number
): Promise<Post[]> => {
  try {
    const constraints: any[] = [];

    // 필터 조건 추가
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }

    // 정렬: createdAt desc
    constraints.push(orderBy("createdAt", "desc"));

    // limit 적용
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        category: data.category,
        title: data.title,
        content: data.content,
        ownerId: data.ownerId,
        authorName: data.authorName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
      } as Post;
    });
  } catch (error: any) {
    console.error("[getPosts] 게시글 목록 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 조회 (단일)
 */
export const getPostById = async (postId: string): Promise<Post | null> => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      category: data.category,
      title: data.title,
      content: data.content,
      ownerId: data.ownerId,
      authorName: data.authorName,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
    } as Post;
  } catch (error: any) {
    console.error("[getPostById] 게시글 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 생성
 */
export const createPost = async (input: PostCreateInput): Promise<string> => {
  try {
    const payload: any = {
      category: input.category,
      title: input.title,
      content: input.content,
      ownerId: input.ownerId,
      authorName: input.authorName,
      likeCount: 0,
      commentCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, POSTS_COLLECTION), payload);
    console.log("[createPost] 게시글 생성 성공, ID:", docRef.id);
    return docRef.id;
  } catch (error: any) {
    console.error("[createPost] 게시글 생성 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 업데이트
 */
export const updatePost = async (
  postId: string,
  input: PostUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.category !== undefined) updateData.category = input.category;

    await updateDoc(docRef, updateData);
    console.log("[updatePost] 게시글 업데이트 성공, ID:", postId);
  } catch (error: any) {
    console.error("[updatePost] 게시글 업데이트 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 삭제
 */
export const deletePost = async (postId: string): Promise<void> => {
  try {
    const docRef = doc(db, POSTS_COLLECTION, postId);
    await deleteDoc(docRef);
    console.log("[deletePost] 게시글 삭제 성공, ID:", postId);
  } catch (error: any) {
    console.error("[deletePost] 게시글 삭제 실패:", error?.message || error);
    throw error;
  }
};





