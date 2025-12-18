import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import type { Checklist } from "@/types/checklist";
import type { Template } from "@/types/template";
import type { Post } from "@/services/posts";

const CHECKLISTS_COLLECTION = "checklists";
const TEMPLATES_COLLECTION = "templates";
const POSTS_COLLECTION = "posts";

/**
 * 검색 결과 타입
 */
export interface SearchResults {
  checklists: Checklist[];
  templates: Template[];
  posts: Post[];
}

/**
 * 체크리스트 검색
 * title, description 필드에서 검색
 */
export const searchChecklists = async (
  keyword: string,
  userId?: string
): Promise<Checklist[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const constraints: any[] = [];
    
    // userId가 제공된 경우 해당 유저의 체크리스트만 검색
    if (userId) {
      constraints.push(where("ownerId", "==", userId));
    }

    // 정렬: createdAt desc
    constraints.push(orderBy("createdAt", "desc"));
    
    // limit 적용 (검색 결과는 최대 20개)
    constraints.push(limit(20));

    const q = query(collection(db, CHECKLISTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ownerId: data.ownerId,
          title: data.title,
          description: data.description || "",
          groups: data.groups || [],
          dueDate: data.dueDate || null,
          createdAt: data.createdAt,
          createdAtNum: data.createdAtNum,
          updatedAt: data.updatedAt,
          isCompleted: data.isCompleted ?? false,
          isDefault: data.isDefault ?? false,
          members: data.members || [],
          progress: data.progress || 0,
          maxParticipants: data.maxParticipants,
        } as Checklist;
      })
      .filter((checklist) => {
        // 클라이언트 사이드에서 title, description 검색
        const searchLower = keyword.toLowerCase();
        const titleMatch = checklist.title.toLowerCase().includes(searchLower);
        const descMatch = checklist.description.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      });

    return results;
  } catch (error: any) {
    console.error("[searchChecklists] 체크리스트 검색 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 템플릿 검색
 * title, description 필드에서 검색
 */
export const searchTemplates = async (
  keyword: string
): Promise<Template[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const constraints: any[] = [];
    
    // public 템플릿만 검색
    constraints.push(where("visibility", "==", "public"));
    
    // 정렬: createdAt desc
    constraints.push(orderBy("createdAt", "desc"));
    
    // limit 적용 (검색 결과는 최대 20개)
    constraints.push(limit(20));

    const q = query(collection(db, TEMPLATES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs
      .map((doc) => {
        const data = doc.data();
        
        // createdAt normalize
        let createdAtNormalized: any = data.createdAt;
        if (createdAtNormalized) {
          if (typeof createdAtNormalized.toDate === 'function') {
            createdAtNormalized = createdAtNormalized.toDate().getTime();
          } else if (createdAtNormalized instanceof Date) {
            createdAtNormalized = createdAtNormalized.getTime();
          } else if (typeof createdAtNormalized === 'number') {
            if (createdAtNormalized < 10000000000) {
              createdAtNormalized = createdAtNormalized * 1000;
            }
          }
          if (data.createdAtNum && typeof data.createdAtNum === 'number') {
            createdAtNormalized = data.createdAtNum;
          }
        }
        
        return {
          id: doc.id,
          title: data.title,
          description: data.description || "",
          category: data.category,
          groups: data.groups || [],
          items: data.items || [],
          ownerId: data.ownerId,
          visibility: data.visibility || "private",
          likeCount: data.likeCount || 0,
          usedCount: data.usedCount || 0,
          sourceChecklistId: data.sourceChecklistId || undefined,
          createdAt: createdAtNormalized ? { toDate: () => new Date(createdAtNormalized) } : data.createdAt,
        } as Template;
      })
      .filter((template) => {
        // 클라이언트 사이드에서 title, description 검색
        const searchLower = keyword.toLowerCase();
        const titleMatch = template.title.toLowerCase().includes(searchLower);
        const descMatch = template.description.toLowerCase().includes(searchLower);
        return titleMatch || descMatch;
      });

    return results;
  } catch (error: any) {
    console.error("[searchTemplates] 템플릿 검색 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 게시글 검색
 * title, content 필드에서 검색
 */
export const searchPosts = async (
  keyword: string
): Promise<Post[]> => {
  try {
    if (!keyword.trim()) {
      return [];
    }

    const constraints: any[] = [];
    
    // 정렬: createdAt desc
    constraints.push(orderBy("createdAt", "desc"));
    
    // limit 적용 (검색 결과는 최대 20개)
    constraints.push(limit(20));

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    const results = querySnapshot.docs
      .map((doc) => {
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
      })
      .filter((post) => {
        // 클라이언트 사이드에서 title, content 검색
        const searchLower = keyword.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(searchLower);
        const contentMatch = post.content.toLowerCase().includes(searchLower);
        return titleMatch || contentMatch;
      });

    return results;
  } catch (error: any) {
    console.error("[searchPosts] 게시글 검색 실패:", error?.message || error);
    throw error;
  }
};

/**
 * 통합 검색
 * 체크리스트, 템플릿, 게시글을 동시에 검색
 */
export const searchAll = async (
  keyword: string,
  userId?: string
): Promise<SearchResults> => {
  try {
    if (!keyword.trim()) {
      return {
        checklists: [],
        templates: [],
        posts: [],
      };
    }

    // 병렬 검색 실행
    const [checklists, templates, posts] = await Promise.all([
      searchChecklists(keyword, userId),
      searchTemplates(keyword),
      searchPosts(keyword),
    ]);

    return {
      checklists,
      templates,
      posts,
    };
  } catch (error: any) {
    console.error("[searchAll] 통합 검색 실패:", error?.message || error);
    throw error;
  }
};

