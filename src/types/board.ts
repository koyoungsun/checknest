import type { Timestamp } from "firebase/firestore";

/**
 * 게시판 카테고리 타입
 */
export type BoardCategory = "notice" | "free" | "review";

/**
 * 게시글 데이터 구조 (Firestore boards 컬렉션)
 */
export interface Board {
  id: string;
  title: string;
  content: string;
  summary: string; // 리스트/홈 노출용 요약 (100자)
  category: BoardCategory; // 'notice' | 'free' | 'review'
  authorId: string;
  authorName: string;
  likeCount: number; // default 0
  commentCount: number; // default 0
  isPinned: boolean; // 공지 상단 고정용
  isDeleted: boolean; // soft delete
  createdAt: Timestamp;
  createdAtNum: number; // Date.now() 기반 정렬용
  updatedAt?: Timestamp;
}

/**
 * 게시글 생성 입력 데이터
 */
export interface BoardCreateInput {
  title: string;
  content: string;
  category: BoardCategory;
  authorId: string;
  authorName: string;
}

/**
 * 게시글 업데이트 입력 데이터
 */
export interface BoardUpdateInput {
  title?: string;
  content?: string;
  category?: BoardCategory;
}

/**
 * 댓글 데이터 구조 (Firestore boardComments 컬렉션)
 * 게시글당 댓글은 1개만 허용
 */
export interface BoardComment {
  id: string;
  boardId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Timestamp;
}

/**
 * 댓글 생성 입력 데이터
 */
export interface BoardCommentCreateInput {
  boardId: string;
  authorId: string;
  authorName: string;
  content: string;
}

/**
 * 댓글 업데이트 입력 데이터
 */
export interface BoardCommentUpdateInput {
  content: string;
}

/**
 * 좋아요 데이터 구조 (Firestore boardLikes 컬렉션)
 * id: `${boardId}_${userId}`
 */
export interface BoardLike {
  id: string; // `${boardId}_${userId}`
  boardId: string;
  userId: string;
  createdAt: Timestamp;
}

/**
 * 게시판 목록 조회 필터
 */
export interface BoardListFilters {
  category?: BoardCategory;
  authorId?: string;
}

