import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

/**
 * 완료된 체크리스트의 오래된 채팅 메시지 삭제
 * 
 * 실행 조건:
 * - status === 'completed'
 * - completedAt + 24시간이 지난 체크리스트의 chats 문서 삭제
 * 
 * 실행 방법:
 * 1. Cloud Scheduler로 주기적 실행 (예: 매일 자정)
 * 2. 또는 수동 트리거
 * 
 * @example
 * // Cloud Scheduler 설정 예시:
 * // Schedule: 0 0 * * * (매일 자정)
 * // Target: deleteOldCompletedChats
 */
export const deleteOldCompletedChats = functions
  .region("asia-northeast3") // 서울 리전 (필요시 변경)
  .pubsub
  .schedule("0 0 * * *") // 매일 자정 실행 (필요시 변경)
  .timeZone("Asia/Seoul")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursAgo = new admin.firestore.Timestamp(
      now.seconds - 24 * 60 * 60,
      now.nanoseconds
    );

    try {
      // 1. 완료된 체크리스트 조회
      // status === 'completed'이고 completedAt이 24시간 이전인 체크리스트
      const completedChecklistsQuery = db
        .collection("checklists")
        .where("status", "==", "completed")
        .where("completedAt", "<=", twentyFourHoursAgo);

      const completedChecklistsSnapshot = await completedChecklistsQuery.get();

      if (completedChecklistsSnapshot.empty) {
        console.log("[deleteOldCompletedChats] 삭제할 체크리스트가 없습니다.");
        return null;
      }

      console.log(
        `[deleteOldCompletedChats] ${completedChecklistsSnapshot.size}개의 완료된 체크리스트 발견`
      );

      const batch = db.batch();
      let deletedChatsCount = 0;
      let deletedChecklistsCount = 0;

      // 2. 각 체크리스트의 채팅 메시지 삭제
      for (const checklistDoc of completedChecklistsSnapshot.docs) {
        const checklistId = checklistDoc.id;
        const checklistData = checklistDoc.data();
        const completedAt = checklistData.completedAt as admin.firestore.Timestamp;

        // completedAt이 24시간 이전인지 확인 (이중 체크)
        if (completedAt && completedAt <= twentyFourHoursAgo) {
          // 해당 체크리스트의 모든 채팅 메시지 조회
          const chatsQuery = db
            .collection("chats")
            .where("checklistId", "==", checklistId);

          const chatsSnapshot = await chatsQuery.get();

          if (!chatsSnapshot.empty) {
            // 배치로 채팅 메시지 삭제 (Firestore 배치 제한: 500개)
            const chatsToDelete = chatsSnapshot.docs.slice(0, 500);
            chatsToDelete.forEach((chatDoc) => {
              batch.delete(chatDoc.ref);
              deletedChatsCount++;
            });

            console.log(
              `[deleteOldCompletedChats] 체크리스트 ${checklistId}: ${chatsToDelete.length}개의 채팅 메시지 삭제 예정`
            );
          }

          deletedChecklistsCount++;
        }
      }

      // 3. 배치 실행
      if (deletedChatsCount > 0) {
        await batch.commit();
        console.log(
          `[deleteOldCompletedChats] 완료: ${deletedChatsCount}개의 채팅 메시지 삭제됨 (${deletedChecklistsCount}개 체크리스트)`
        );
      } else {
        console.log("[deleteOldCompletedChats] 삭제할 채팅 메시지가 없습니다.");
      }

      return {
        deletedChatsCount,
        deletedChecklistsCount,
        timestamp: now.toDate().toISOString(),
      };
    } catch (error) {
      console.error("[deleteOldCompletedChats] 에러 발생:", error);
      throw error;
    }
  });

/**
 * 수동 트리거용 함수 (테스트 및 즉시 실행용)
 * 
 * @example
 * // Firebase CLI로 실행:
 * // firebase functions:call deleteOldCompletedChatsManual
 */
export const deleteOldCompletedChatsManual = functions
  .region("asia-northeast3")
  .https
  .onCall(async (data, context) => {
    // 인증 확인 (선택사항)
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "unauthenticated",
    //     "인증이 필요합니다."
    //   );
    // }

    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    const twentyFourHoursAgo = new admin.firestore.Timestamp(
      now.seconds - 24 * 60 * 60,
      now.nanoseconds
    );

    try {
      // 완료된 체크리스트 조회
      const completedChecklistsQuery = db
        .collection("checklists")
        .where("status", "==", "completed")
        .where("completedAt", "<=", twentyFourHoursAgo);

      const completedChecklistsSnapshot = await completedChecklistsQuery.get();

      if (completedChecklistsSnapshot.empty) {
        return {
          success: true,
          message: "삭제할 체크리스트가 없습니다.",
          deletedChatsCount: 0,
          deletedChecklistsCount: 0,
        };
      }

      let deletedChatsCount = 0;
      let deletedChecklistsCount = 0;

      // 각 체크리스트의 채팅 메시지 삭제
      for (const checklistDoc of completedChecklistsSnapshot.docs) {
        const checklistId = checklistDoc.id;
        const chatsQuery = db
          .collection("chats")
          .where("checklistId", "==", checklistId);

        const chatsSnapshot = await chatsQuery.get();

        if (!chatsSnapshot.empty) {
          // 배치로 삭제 (500개 제한)
          const batch = db.batch();
          const chatsToDelete = chatsSnapshot.docs.slice(0, 500);
          chatsToDelete.forEach((chatDoc) => {
            batch.delete(chatDoc.ref);
            deletedChatsCount++;
          });
          await batch.commit();
        }

        deletedChecklistsCount++;
      }

      return {
        success: true,
        message: `${deletedChatsCount}개의 채팅 메시지가 삭제되었습니다.`,
        deletedChatsCount,
        deletedChecklistsCount,
        timestamp: now.toDate().toISOString(),
      };
    } catch (error) {
      console.error("[deleteOldCompletedChatsManual] 에러 발생:", error);
      throw new functions.https.HttpsError(
        "internal",
        "채팅 메시지 삭제 중 오류가 발생했습니다.",
        error
      );
    }
  });

