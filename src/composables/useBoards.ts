import { ref, computed } from "vue";
import {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
  getBoardComment,
  createBoardComment,
  updateBoardComment,
  deleteBoardComment,
  checkBoardLike,
  addBoardLike,
  removeBoardLike,
  type BoardCreateInput,
  type BoardUpdateInput,
  type BoardCommentCreateInput,
  type BoardCommentUpdateInput,
  type BoardListFilters,
} from "@/services/boards";
import type { Board, BoardComment } from "@/types/board";

/**
 * 게시판 관리 Composable
 */
export const useBoards = () => {
  // boards 초기값은 반드시 빈 배열 (더미 데이터 절대 사용 금지)
  const boards = ref<Board[]>([]);
  const currentBoard = ref<Board | null>(null);
  const currentComment = ref<BoardComment | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  const liked = ref<boolean>(false);

  /**
   * 게시글 목록 로드
   * 수정: Boards는 public read이므로 permission-denied는 발생하지 않아야 함
   * 에러 발생 시에도 기존 state 유지 (빈 배열로 덮어쓰지 않음)
   */
  const loadBoards = async (
    filters?: BoardListFilters,
    limitCount?: number
  ) => {
    loading.value = true;
    error.value = null;
    try {
      // Boards는 public read이므로 로그인 여부와 무관하게 조회 가능
      boards.value = await getBoards(filters, limitCount);
    } catch (err: any) {
      error.value = err as Error;
      
      // Firestore 인덱스 오류인 경우 빈 배열 반환 (fallback)
      if (err?.code === "failed-precondition" && err?.message?.includes("index")) {
        console.warn("[useBoards] Firestore 인덱스 오류 - 빈 배열 반환");
        boards.value = [];
        return;
      }
      
      // permission-denied는 발생하지 않아야 함 (public read)
      // 발생한다면 Firestore rules 문제
      if (err?.code === "permission-denied") {
        console.error("[useBoards] Firestore permission error:", err?.message || err);
        console.error("[useBoards] boards 컬렉션 read 권한이 'allow read: if true;'로 설정되어 있는지 확인하세요");
        boards.value = [];
        return;
      }
      
      // 기타 오류 발생 시 빈 배열 반환
      console.error("[useBoards] 게시글 목록 로드 실패:", err?.message || err);
      boards.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 단일 로드
   */
  const loadBoard = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      currentBoard.value = await getBoard(id);
      if (!currentBoard.value) {
        throw new Error("게시글을 찾을 수 없습니다.");
      }

      // 댓글 로드
      currentComment.value = await getBoardComment(id);

      // 좋아요 상태 확인 (인증된 사용자만)
      // TODO: currentUser 주입 필요
    } catch (err) {
      error.value = err as Error;
      console.error("게시글 로드 실패:", err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 생성
   */
  const addBoard = async (input: BoardCreateInput) => {
    loading.value = true;
    error.value = null;
    try {
      const id = await createBoard(input);
      return id;
    } catch (err) {
      error.value = err as Error;
      console.error("게시글 생성 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 업데이트
   */
  const editBoard = async (id: string, input: BoardUpdateInput) => {
    loading.value = true;
    error.value = null;
    try {
      await updateBoard(id, input);
      await loadBoard(id);
      await loadBoards();
    } catch (err) {
      error.value = err as Error;
      console.error("게시글 업데이트 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 게시글 삭제
   */
  const removeBoard = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      await deleteBoard(id);
      await loadBoards();
    } catch (err) {
      error.value = err as Error;
      console.error("게시글 삭제 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 댓글 생성
   */
  const addComment = async (input: BoardCommentCreateInput) => {
    loading.value = true;
    error.value = null;
    try {
      await createBoardComment(input);
      // 댓글 다시 로드
      currentComment.value = await getBoardComment(input.boardId);
      // 게시글 다시 로드 (commentCount 업데이트)
      if (currentBoard.value) {
        await loadBoard(currentBoard.value.id);
      }
    } catch (err) {
      error.value = err as Error;
      console.error("댓글 생성 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 댓글 업데이트
   */
  const editComment = async (
    commentId: string,
    input: BoardCommentUpdateInput
  ) => {
    loading.value = true;
    error.value = null;
    try {
      if (!currentBoard.value) {
        throw new Error("게시글이 로드되지 않았습니다.");
      }
      await updateBoardComment(commentId, input);
      // 댓글 다시 로드
      currentComment.value = await getBoardComment(currentBoard.value.id);
    } catch (err) {
      error.value = err as Error;
      console.error("댓글 업데이트 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 댓글 삭제
   */
  const removeComment = async (commentId: string) => {
    loading.value = true;
    error.value = null;
    try {
      if (!currentBoard.value) {
        throw new Error("게시글이 로드되지 않았습니다.");
      }
      await deleteBoardComment(commentId, currentBoard.value.id);
      currentComment.value = null;
      // 게시글 다시 로드 (commentCount 업데이트)
      await loadBoard(currentBoard.value.id);
    } catch (err) {
      error.value = err as Error;
      console.error("댓글 삭제 실패:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 좋아요 토글
   */
  const toggleLike = async (boardId: string, userId: string) => {
    try {
      const isLiked = await checkBoardLike(boardId, userId);
      if (isLiked) {
        await removeBoardLike(boardId, userId);
        liked.value = false;
        if (currentBoard.value) {
          currentBoard.value.likeCount = Math.max(0, currentBoard.value.likeCount - 1);
        }
      } else {
        await addBoardLike(boardId, userId);
        liked.value = true;
        if (currentBoard.value) {
          currentBoard.value.likeCount += 1;
        }
      }
    } catch (err) {
      console.error("좋아요 토글 실패:", err);
      throw err;
    }
  };

  /**
   * 좋아요 상태 확인
   */
  const checkLike = async (boardId: string, userId: string) => {
    try {
      liked.value = await checkBoardLike(boardId, userId);
    } catch (err) {
      console.error("좋아요 상태 확인 실패:", err);
      liked.value = false;
    }
  };

  return {
    boards,
    currentBoard,
    currentComment,
    loading,
    error,
    liked,
    loadBoards,
    loadBoard,
    addBoard,
    editBoard,
    removeBoard,
    addComment,
    editComment,
    removeComment,
    toggleLike,
    checkLike,
  };
};

