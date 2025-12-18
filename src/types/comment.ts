import { Timestamp } from "firebase/firestore";

/**
 * 댓글 데이터 구조 (Firestore comments 컬렉션)
 */
export interface Comment {
  id: string;
  postId: string; // 게시글 ID
  authorId: string; // 작성자 ID
  authorName: string; // 작성자 이름
  content: string; // 댓글 내용
  createdAt: Timestamp | Date | number; // 생성 시간
}

/**
 * 댓글 생성 입력 데이터
 */
export interface CommentCreateInput {
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
}

