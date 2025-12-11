import {
  createChecklist,
} from "@/services/checklists";
import { createItem } from "@/services/items";
import { createTemplate } from "@/services/templates";
import { createChat } from "@/services/chats";

/**
 * 샘플 데이터 생성 함수
 * 
 * 실행 순서:
 * 1. 템플릿 생성 (병렬 처리 가능)
 * 2. 템플릿으로부터 체크리스트 생성
 * 3. 직접 체크리스트 생성
 * 4. 항목 추가 (순차 처리)
 * 5. 채팅 추가 (순차 처리)
 */
export const seedSampleData = async (userId: string) => {
  try {
    console.log("🌱 샘플 데이터 생성 시작...");
    console.log(`📌 사용자 ID: ${userId}`);

    // ============================================
    // 1. 템플릿 생성
    // ============================================
    console.log("\n📋 1단계: 템플릿 생성 중...");
    
    const template1 = await createTemplate({
      title: "여행 준비 템플릿",
      description: "여행 전 체크리스트",
      category: "여행",
      items: [
        { name: "항공권 예약", order: 1 },
        { name: "숙소 예약", order: 2 },
        { name: "여권 확인", order: 3 },
        { name: "여행자 보험", order: 4 },
        { name: "환전", order: 5 },
      ],
    });
    console.log(`  ✅ 템플릿 1 생성 완료: ${template1}`);

    const template2 = await createTemplate({
      title: "장보기 템플릿",
      description: "주간 장보기 체크리스트",
      category: "생활",
      items: [
        { name: "쌀", order: 1 },
        { name: "계란", order: 2 },
        { name: "우유", order: 3 },
        { name: "빵", order: 4 },
        { name: "과일", order: 5 },
      ],
    });
    console.log(`  ✅ 템플릿 2 생성 완료: ${template2}`);

    // ============================================
    // 2. 템플릿으로부터 체크리스트 생성
    // ============================================
    console.log("\n📝 2단계: 템플릿으로부터 체크리스트 생성 중...");
    
    const { createChecklistFromTemplate } = await import(
      "@/services/templates"
    );
    const checklist1Id = await createChecklistFromTemplate(
      template1,
      userId,
      "제주도 여행 준비"
    );
    console.log(`  ✅ 체크리스트 1 생성 완료: ${checklist1Id} (템플릿: ${template1})`);

    // ============================================
    // 3. 직접 체크리스트 생성
    // ============================================
    console.log("\n📝 3단계: 직접 체크리스트 생성 중...");
    
    const checklist2Id = await createChecklist({
      ownerId: userId,
      title: "오늘의 할 일",
      description: "오늘 해야 할 일들",
      dueDate: new Date(),
      members: [], // ownerId는 members에 포함하지 않음
      rolesEnabled: false,
    });
    console.log(`  ✅ 체크리스트 2 생성 완료: ${checklist2Id}`);

    // ============================================
    // 4. 항목 추가
    // ============================================
    console.log("\n📌 4단계: 항목 추가 중...");
    
    const item1Id = await createItem({
      checklistId: checklist2Id,
      name: "프로젝트 회의",
      order: 1,
      isDone: false,
    });
    console.log(`  ✅ 항목 1 생성 완료: ${item1Id}`);

    const item2Id = await createItem({
      checklistId: checklist2Id,
      name: "문서 작성",
      order: 2,
      isDone: true,
    });
    console.log(`  ✅ 항목 2 생성 완료: ${item2Id}`);

    const item3Id = await createItem({
      checklistId: checklist2Id,
      name: "코드 리뷰",
      order: 3,
      isDone: false,
    });
    console.log(`  ✅ 항목 3 생성 완료: ${item3Id}`);

    // ============================================
    // 5. 채팅 추가
    // ============================================
    console.log("\n💬 5단계: 채팅 추가 중...");
    
    const chat1Id = await createChat({
      checklistId: checklist2Id,
      userId,
      message: "체크리스트를 생성했습니다!",
      system: false,
    });
    console.log(`  ✅ 채팅 1 생성 완료: ${chat1Id} (사용자: ${userId})`);

    /**
     * 시스템 메시지 생성
     * 
     * @note userId: "system"은 Firestore 보안 규칙에서 허용 가능한 값입니다.
     *       시스템 메시지는 일반 사용자 메시지와 구분되며,
     *       Firestore rules에서 system 메시지에 대한 별도 처리가 필요할 수 있습니다.
     * 
     * Firestore rules 예시:
     *   allow create: if request.auth != null && 
     *     (request.resource.data.userId == request.auth.uid || 
     *      request.resource.data.userId == "system");
     */
    const chat2Id = await createChat({
      checklistId: checklist2Id,
      userId: "system", // 시스템 메시지 (Firestore rules에서 허용 필요)
      message: "항목이 완료되었습니다.",
      system: true,
    });
    console.log(`  ✅ 채팅 2 생성 완료: ${chat2Id} (시스템 메시지)`);

    // ============================================
    // 완료 요약
    // ============================================
    console.log("\n✨ 샘플 데이터 생성 완료!");
    console.log("\n📊 생성된 데이터 요약:");
    console.log("  📋 템플릿:");
    console.log(`    - 템플릿 1: ${template1} (여행 준비 템플릿)`);
    console.log(`    - 템플릿 2: ${template2} (장보기 템플릿)`);
    console.log("  📝 체크리스트:");
    console.log(`    - 체크리스트 1: ${checklist1Id} (템플릿 기반: ${template1})`);
    console.log(`    - 체크리스트 2: ${checklist2Id} (직접 생성)`);
    console.log("  📌 항목:");
    console.log(`    - 항목 1: ${item1Id} (프로젝트 회의)`);
    console.log(`    - 항목 2: ${item2Id} (문서 작성)`);
    console.log(`    - 항목 3: ${item3Id} (코드 리뷰)`);
    console.log("  💬 채팅:");
    console.log(`    - 채팅 1: ${chat1Id} (사용자 메시지)`);
    console.log(`    - 채팅 2: ${chat2Id} (시스템 메시지)`);

    return {
      templates: [template1, template2],
      checklists: [checklist1Id, checklist2Id],
      items: [item1Id, item2Id, item3Id],
      chats: [chat1Id, chat2Id],
    };
  } catch (error) {
    console.error("❌ 샘플 데이터 생성 실패:", error);
    throw error;
  }
};

/**
 * 개발 환경에서만 실행되는 시드 스크립트
 */
export const runSeed = async (userId: string) => {
  if (import.meta.env.MODE === "production") {
    console.warn("⚠️ 프로덕션 환경에서는 시드 스크립트를 실행할 수 없습니다.");
    return;
  }

  try {
    await seedSampleData(userId);
    console.log("\n✅ 시드 데이터 생성 완료!");
  } catch (error) {
    console.error("\n❌ 시드 데이터 생성 실패:", error);
  }
};
