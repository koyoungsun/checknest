import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type {
  Board,
  BoardCreateInput,
  BoardUpdateInput,
  BoardListFilters,
  BoardComment,
  BoardCommentCreateInput,
  BoardCommentUpdateInput,
  BoardLike,
} from "@/types/board";

const BOARDS_COLLECTION = "boards";
const COMMENTS_COLLECTION = "boardComments";
const LIKES_COLLECTION = "boardLikes";

/**
 * content에서 summary 자동 생성 (100자)
 */
const generateSummary = (content: string): string => {
  // HTML 태그 제거 및 텍스트만 추출
  const textContent = content.replace(/<[^>]*>/g, "").trim();
  if (textContent.length <= 100) {
    return textContent;
  }
  return textContent.substring(0, 100) + "...";
};

/**
 * 게시글 조회 (단일)
 */
export const getBoard = async (id: string): Promise<Board | null> => {
  try {
    const docRef = doc(db, BOARDS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // isDeleted가 true인 경우 null 반환
      if (data.isDeleted === true) {
        return null;
      }
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        summary: data.summary || "",
        category: data.category,
        authorId: data.authorId,
        authorName: data.authorName,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        isPinned: data.isPinned || false,
        isDeleted: data.isDeleted || false,
        createdAt: data.createdAt,
        createdAtNum: data.createdAtNum || 0,
        updatedAt: data.updatedAt,
      } as Board;
    }
    return null;
  } catch (error: any) {
    // 권한 오류인 경우 명확한 메시지만 출력
    if (error?.code === "permission-denied") {
      console.error("[getBoard] 게시글 조회 권한 없음");
      throw error; // 원본 에러를 그대로 throw
    }
    console.error("[getBoard] 게시글 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 목록 조회
 * 
 * Firestore Index 필요 (Firebase Console > Firestore > Indexes에서 생성):
 * 
 * 1. 복합 인덱스 (category 필터 사용 시):
 *    Collection: boards
 *    Fields:
 *      - category (Ascending)
 *      - isDeleted (Ascending)
 *      - isPinned (Descending)
 *      - createdAtNum (Descending)
 * 
 * 2. 복합 인덱스 (authorId 필터 사용 시):
 *    Collection: boards
 *    Fields:
 *      - authorId (Ascending)
 *      - isDeleted (Ascending)
 *      - isPinned (Descending)
 *      - createdAtNum (Descending)
 * 
 * 3. 기본 인덱스 (필터 없이 조회 시):
 *    Collection: boards
 *    Fields:
 *      - isDeleted (Ascending)
 *      - isPinned (Descending)
 *      - createdAtNum (Descending)
 * 
 * 참고: createdAtNum 필드가 없는 문서는 쿼리 결과에서 제외됩니다.
 */
export const getBoards = async (
  filters?: BoardListFilters,
  limitCount?: number
): Promise<Board[]> => {
  try {
    const constraints: any[] = [];

    // 필터 조건 추가
    if (filters?.category) {
      constraints.push(where("category", "==", filters.category));
    }
    if (filters?.authorId) {
      constraints.push(where("authorId", "==", filters.authorId));
    }

    // 삭제되지 않은 게시글만 조회
    constraints.push(where("isDeleted", "==", false));

    // 정렬: createdAt 기준 최신순
    // createdAt 필드가 없는 문서는 쿼리 결과에서 제외됨
    constraints.push(orderBy("createdAt", "desc"));

    // limit 적용
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, BOARDS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      // createdAtNum이 없으면 createdAt에서 계산
      let createdAtNum = data.createdAtNum;
      if (!createdAtNum && data.createdAt) {
        if (typeof data.createdAt.toMillis === 'function') {
          createdAtNum = data.createdAt.toMillis();
        } else if (data.createdAt instanceof Date) {
          createdAtNum = data.createdAt.getTime();
        } else if (typeof data.createdAt === 'number') {
          createdAtNum = data.createdAt;
        }
      }
      
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        summary: data.summary || "",
        category: data.category,
        authorId: data.authorId,
        authorName: data.authorName,
        likeCount: data.likeCount || 0,
        commentCount: data.commentCount || 0,
        isPinned: data.isPinned || false,
        isDeleted: data.isDeleted || false,
        createdAt: data.createdAt,
        createdAtNum: createdAtNum || Date.now(),
        updatedAt: data.updatedAt,
      } as Board;
    });
  } catch (error: any) {
    // 인덱스 오류인 경우 fallback: isDeleted 필터 없이 단순 쿼리 시도
    if (error?.code === "failed-precondition" && error?.message?.includes("index")) {
      console.warn("[getBoards] Firestore 인덱스 오류 - fallback 쿼리 시도");
      try {
        const fallbackConstraints: any[] = [];
        
        // 필터 조건 추가 (isDeleted 제외)
        if (filters?.category) {
          fallbackConstraints.push(where("category", "==", filters.category));
        }
        if (filters?.authorId) {
          fallbackConstraints.push(where("authorId", "==", filters.authorId));
        }
        
        // 정렬: createdAt 기준 최신순
        fallbackConstraints.push(orderBy("createdAt", "desc"));
        
        // limit 적용
        if (limitCount) {
          fallbackConstraints.push(limit(limitCount));
        }
        
        const fallbackQ = query(collection(db, BOARDS_COLLECTION), ...fallbackConstraints);
        const fallbackSnapshot = await getDocs(fallbackQ);
        
        // 클라이언트 사이드에서 isDeleted 필터링
        const results = fallbackSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title,
              content: data.content,
              summary: data.summary || "",
              category: data.category,
              authorId: data.authorId,
              authorName: data.authorName,
              likeCount: data.likeCount || 0,
              commentCount: data.commentCount || 0,
              isPinned: data.isPinned || false,
              isDeleted: data.isDeleted || false,
              createdAt: data.createdAt,
              createdAtNum: data.createdAtNum || (data.createdAt?.toMillis?.() || Date.now()),
              updatedAt: data.updatedAt,
            } as Board;
          })
          .filter((board) => !board.isDeleted);
        
        // limit 재적용 (클라이언트 사이드 필터링 후)
        return limitCount ? results.slice(0, limitCount) : results;
      } catch (fallbackError: any) {
        console.error("[getBoards] Fallback 쿼리도 실패:", fallbackError?.message || fallbackError);
        throw fallbackError;
      }
    }
    
    // 권한 오류인 경우 명확한 메시지만 출력
    if (error?.code === "permission-denied") {
      console.error("[getBoards] Firestore permission error:", error?.message || error);
      console.error("[getBoards] boards 컬렉션 read 권한이 'allow read: if true;'로 설정되어 있는지 확인하세요");
      throw error; // 원본 에러를 그대로 throw
    }
    
    console.error("[getBoards] 게시글 목록 조회 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 생성
 */
export const createBoard = async (input: BoardCreateInput): Promise<string> => {
  try {
    const summary = generateSummary(input.content);
    const createdAtNum = Date.now();

    const payload: any = {
      title: input.title,
      content: input.content,
      summary: summary,
      category: input.category,
      authorId: input.authorId,
      authorName: input.authorName,
      likeCount: 0,
      commentCount: 0,
      isPinned: input.category === "notice", // 공지는 기본적으로 고정
      isDeleted: false,
      createdAt: serverTimestamp(),
      createdAtNum: createdAtNum,
    };

    const docRef = await addDoc(collection(db, BOARDS_COLLECTION), payload);
    return docRef.id;
  } catch (error) {
    console.error("게시글 생성 실패:", error);
    throw error;
  }
};

/**
 * 게시글 업데이트
 */
export const updateBoard = async (
  id: string,
  input: BoardUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, BOARDS_COLLECTION, id);
    const updateData: any = {};

    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) {
      updateData.content = input.content;
      updateData.summary = generateSummary(input.content); // summary도 업데이트
    }
    if (input.category !== undefined) updateData.category = input.category;
    updateData.updatedAt = serverTimestamp();

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("게시글 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 게시글 삭제 (soft delete)
 */
export const deleteBoard = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, BOARDS_COLLECTION, id);
    await updateDoc(docRef, {
      isDeleted: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("게시글 삭제 실패:", error);
    throw error;
  }
};

/**
 * 댓글 조회 (게시글당 1개만)
 */
export const getBoardComment = async (
  boardId: string
): Promise<BoardComment | null> => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("boardId", "==", boardId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      boardId: data.boardId,
      authorId: data.authorId,
      authorName: data.authorName,
      content: data.content,
      createdAt: data.createdAt,
    } as BoardComment;
  } catch (error) {
    console.error("댓글 조회 실패:", error);
    throw error;
  }
};

/**
 * 댓글 생성 (게시글당 1개만)
 */
export const createBoardComment = async (
  input: BoardCommentCreateInput
): Promise<string> => {
  try {
    // 기존 댓글이 있는지 확인
    const existingComment = await getBoardComment(input.boardId);
    if (existingComment) {
      throw new Error("이미 댓글이 존재합니다. 게시글당 댓글은 1개만 허용됩니다.");
    }

    const payload: any = {
      boardId: input.boardId,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), payload);

    // 게시글의 commentCount 증가
    const boardRef = doc(db, BOARDS_COLLECTION, input.boardId);
    await updateDoc(boardRef, {
      commentCount: increment(1),
    });

    return docRef.id;
  } catch (error) {
    console.error("댓글 생성 실패:", error);
    throw error;
  }
};

/**
 * 댓글 업데이트
 */
export const updateBoardComment = async (
  commentId: string,
  input: BoardCommentUpdateInput
): Promise<void> => {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(docRef, {
      content: input.content,
    });
  } catch (error) {
    console.error("댓글 업데이트 실패:", error);
    throw error;
  }
};

/**
 * 댓글 삭제
 */
export const deleteBoardComment = async (
  commentId: string,
  boardId: string
): Promise<void> => {
  try {
    const docRef = doc(db, COMMENTS_COLLECTION, commentId);
    await deleteDoc(docRef);

    // 게시글의 commentCount 감소
    const boardRef = doc(db, BOARDS_COLLECTION, boardId);
    await updateDoc(boardRef, {
      commentCount: increment(-1),
    });
  } catch (error) {
    console.error("댓글 삭제 실패:", error);
    throw error;
  }
};

/**
 * 좋아요 확인
 */
export const checkBoardLike = async (
  boardId: string,
  userId: string
): Promise<boolean> => {
  try {
    const likeId = `${boardId}_${userId}`;
    const docRef = doc(db, LIKES_COLLECTION, likeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("좋아요 확인 실패:", error);
    return false;
  }
};

/**
 * 좋아요 추가
 */
export const addBoardLike = async (
  boardId: string,
  userId: string
): Promise<void> => {
  try {
    const likeId = `${boardId}_${userId}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    const likeSnap = await getDoc(likeRef);

    // 이미 좋아요가 있으면 에러
    if (likeSnap.exists()) {
      throw new Error("이미 좋아요를 누른 게시글입니다.");
    }

    // 좋아요 추가 (id를 문서 ID로 사용)
    const likeDocRef = doc(db, LIKES_COLLECTION, likeId);
    await setDoc(likeDocRef, {
      boardId: boardId,
      userId: userId,
      createdAt: serverTimestamp(),
    });

    // 게시글의 likeCount 증가
    const boardRef = doc(db, BOARDS_COLLECTION, boardId);
    await updateDoc(boardRef, {
      likeCount: increment(1),
    });
  } catch (error) {
    console.error("좋아요 추가 실패:", error);
    throw error;
  }
};

/**
 * 좋아요 제거
 */
export const removeBoardLike = async (
  boardId: string,
  userId: string
): Promise<void> => {
  try {
    const likeId = `${boardId}_${userId}`;
    const likeRef = doc(db, LIKES_COLLECTION, likeId);
    const likeSnap = await getDoc(likeRef);

    // 좋아요가 없으면 에러
    if (!likeSnap.exists()) {
      throw new Error("좋아요를 누르지 않은 게시글입니다.");
    }

    // 좋아요 제거
    await deleteDoc(likeRef);

    // 게시글의 likeCount 감소
    const boardRef = doc(db, BOARDS_COLLECTION, boardId);
    await updateDoc(boardRef, {
      likeCount: increment(-1),
    });
  } catch (error) {
    console.error("좋아요 제거 실패:", error);
    throw error;
  }
};

