import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  increment,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Comment, CommentCreateInput } from "@/types/comment";

const POSTS_COLLECTION = "posts";

/**
 * 댓글 목록 조회 (특정 게시글의 댓글)
 * posts/{postId}/comments 서브컬렉션 사용
 * 최신순(createdAt desc) 정렬
 */
export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, POSTS_COLLECTION, postId, "comments");
    const q = query(commentsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        postId: postId,
        authorId: data.authorId || data.ownerId, // ownerId도 지원 (호환성)
        authorName: data.authorName,
        content: data.content,
        createdAt: data.createdAt,
      } as Comment;
    });
  } catch (error: any) {
    // permission error는 warn 레벨로 로그 (로그인 필요 안내)
    if (error?.code === "permission-denied") {
      console.warn("[getComments] 댓글 조회 권한 없음: 로그인이 필요합니다.", error?.message || error);
    } else {
      console.error("[getComments] 댓글 목록 조회 실패:", error?.message || error);
    }
    throw error;
  }
};

/**
 * 댓글 생성
 * posts/{postId}/comments 서브컬렉션 사용
 * 게시글의 commentCount도 자동 증가
 */
export const createComment = async (
  input: CommentCreateInput
): Promise<string> => {
  try {
    const batch = writeBatch(db);

    // 댓글 생성 (서브컬렉션)
    const commentsRef = collection(db, POSTS_COLLECTION, input.postId, "comments");
    const commentRef = doc(commentsRef);
    batch.set(commentRef, {
      ownerId: input.authorId, // Firestore rules에서 ownerId로 검증
      authorId: input.authorId, // 호환성을 위해 둘 다 저장
      authorName: input.authorName,
      content: input.content,
      createdAt: serverTimestamp(),
    });

    // 게시글의 commentCount 증가
    const postRef = doc(db, POSTS_COLLECTION, input.postId);
    batch.update(postRef, {
      commentCount: increment(1),
    });

    await batch.commit();
    console.log("[createComment] 댓글 생성 성공, ID:", commentRef.id);
    return commentRef.id;
  } catch (error: any) {
    // permission error는 warn 레벨로 로그 (로그인 필요 안내)
    if (error?.code === "permission-denied") {
      console.warn("[createComment] 댓글 생성 권한 없음: 로그인이 필요합니다.", error?.message || error);
    } else {
      console.error("[createComment] 댓글 생성 실패:", error?.message || error);
    }
    throw error;
  }
};

/**
 * 댓글 삭제
 * posts/{postId}/comments 서브컬렉션 사용
 * 게시글의 commentCount도 자동 감소
 */
export const deleteComment = async (
  commentId: string,
  postId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);

    // 댓글 삭제 (서브컬렉션)
    const commentRef = doc(db, POSTS_COLLECTION, postId, "comments", commentId);
    batch.delete(commentRef);

    // 게시글의 commentCount 감소
    const postRef = doc(db, POSTS_COLLECTION, postId);
    batch.update(postRef, {
      commentCount: increment(-1),
    });

    await batch.commit();
    console.log("[deleteComment] 댓글 삭제 성공, ID:", commentId);
  } catch (error: any) {
    // permission error는 warn 레벨로 로그 (로그인 필요 안내)
    if (error?.code === "permission-denied") {
      console.warn("[deleteComment] 댓글 삭제 권한 없음: 로그인이 필요합니다.", error?.message || error);
    } else {
      console.error("[deleteComment] 댓글 삭제 실패:", error?.message || error);
    }
    throw error;
  }
};

/**
 * 게시글의 댓글 개수 조회
 * posts/{postId}/comments 서브컬렉션 사용
 */
export const getCommentCount = async (postId: string): Promise<number> => {
  try {
    const commentsRef = collection(db, POSTS_COLLECTION, postId, "comments");
    const querySnapshot = await getDocs(commentsRef);
    return querySnapshot.size;
  } catch (error: any) {
    // permission error는 warn 레벨로 로그 (로그인 필요 안내)
    if (error?.code === "permission-denied") {
      console.warn("[getCommentCount] 댓글 개수 조회 권한 없음: 로그인이 필요합니다.", error?.message || error);
    } else {
      console.error("[getCommentCount] 댓글 개수 조회 실패:", error?.message || error);
    }
    throw error;
  }
};

