<template>
  <div class="min-h-screen bg-gray-50 pb-20 template-create-wrapper">
    <PageSubtitle />
    <div class="px-4 py-4 content-wrapper template-create-body">
      <!-- 템플릿 이름 -->
      <section class="mb-4 template-create-title-section">
        <label class="block text-sm font-semibold mb-1">템플릿 이름</label>
        <input
          v-model="title"
          type="text"
          class="input template-create-title-input"
          placeholder="예: 여행 준비 템플릿"
        />
      </section>

      <!-- 카테고리 -->
      <section class="mb-4 template-create-category-section">
        <label class="block text-sm font-semibold mb-1">카테고리</label>
        <select v-model="category" class="input template-create-category-select">
          <option value="생활">생활</option>
          <option value="여행">여행</option>
          <option value="쇼핑">쇼핑</option>
          <option value="업무">업무</option>
          <option value="기타">기타</option>
        </select>
      </section>

      <!-- 설명 -->
      <section class="mb-4 template-create-description-section">
        <label class="block text-sm font-semibold mb-1">설명 (선택)</label>
        <textarea
          v-model="description"
          rows="2"
          class="input template-create-description-input"
          placeholder="템플릿에 대한 설명을 적어주세요."
        ></textarea>
      </section>

      <!-- 공개 범위 -->
      <section class="mb-4 template-create-visibility-section">
        <label class="block text-sm font-semibold mb-2">공개 범위</label>
        <div class="space-y-3 template-create-visibility-options">
          <!-- 공유 템플릿 -->
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors template-create-visibility-option"
            :class="visibility === 'public' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
            <input
              type="radio"
              v-model="visibility"
              value="public"
              class="mt-1"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-800 mb-1">공유 템플릿</div>
              <div class="text-xs text-gray-600">
                다른 사용자에게 공개되며 홈/탐색에 노출될 수 있습니다.
              </div>
            </div>
          </label>

          <!-- 개인 템플릿 -->
          <label class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors template-create-visibility-option"
            :class="visibility === 'private' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
            <input
              type="radio"
              v-model="visibility"
              value="private"
              class="mt-1"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-800 mb-1">개인 템플릿</div>
              <div class="text-xs text-gray-600">
                나만 사용 가능하며, 홈에는 노출되지 않습니다.
              </div>
            </div>
          </label>
        </div>
      </section>

      <!-- 그룹 및 항목 편집 -->
      <section class="mb-4 template-create-groups-section">
        <div class="flex items-center justify-between mb-2 template-create-groups-header">
          <label class="block text-sm font-semibold">그룹 및 항목</label>
          <button class="text-xs text-blue-600 template-create-groups-add-btn" @click="addGroup">
            + 그룹 추가
          </button>
        </div>

        <!-- 그룹 추가 UI -->
        <div v-if="isAddingGroup" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg template-create-groups-add-form">
          <input
            v-model="newGroupName"
            @keydown.enter="confirmAddGroup"
            @keydown.escape="cancelAddGroup"
            type="text"
            class="input mb-2"
            placeholder="그룹명을 입력하세요..."
            ref="newGroupInputRef"
          />
          <div class="flex items-center gap-2">
            <button
              @click="confirmAddGroup"
              :disabled="!newGroupName.trim()"
              class="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
            <button
              @click="cancelAddGroup"
              class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
          </div>
        </div>

        <!-- 그룹 목록 -->
        <div v-if="groups.length === 0" class="text-xs text-gray-400 mb-4 template-create-groups-empty">
          그룹을 추가하면 항목을 구성할 수 있습니다.
        </div>

        <div v-else class="space-y-4 template-create-groups-list">
          <div
            v-for="(group, groupIndex) in groups"
            :key="group.groupId"
            class="group-section p-4 bg-white border border-gray-200 rounded-lg template-create-group-item"
          >
            <!-- 그룹 헤더 -->
            <div class="flex items-center justify-between mb-3 template-create-group-header">
              <input
                v-model="group.groupName"
                type="text"
                class="text-sm font-semibold text-gray-800 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none flex-1 template-create-group-name-input"
                placeholder="그룹명"
              />
              <button
                @click="removeGroup(groupIndex)"
                class="ml-2 text-xs text-red-500 hover:text-red-700 template-create-group-remove-btn"
                title="그룹 삭제"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>

            <!-- 그룹 내 항목 목록 -->
            <div class="space-y-2 template-create-group-items">
              <div
                v-for="(item, itemIndex) in getGroupItems(group.groupId)"
                :key="itemIndex"
                class="flex items-center gap-2 template-create-group-item-row"
              >
                <input
                  v-model="item.title"
                  type="text"
                  class="input flex-1 text-sm template-create-group-item-input"
                  :placeholder="`항목 ${itemIndex + 1}`"
                />
                <button
                  @click="removeItem(group.groupId, itemIndex)"
                  class="text-xs text-red-500 hover:text-red-700 template-create-group-item-remove-btn"
                  title="항목 삭제"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>

              <!-- 항목 추가 버튼 -->
              <button
                @click="addItem(group.groupId)"
                class="w-full text-xs text-blue-600 hover:text-blue-700 py-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors template-create-group-item-add-btn"
              >
                <i class="bi bi-plus-circle"></i> 항목 추가
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 버튼 -->
      <section class="button-group template-create-actions">
        <button class="btn-primary template-create-save-btn" @click="save">
          템플릿 생성
        </button>
        <button class="btn-secondary template-create-cancel-btn" @click="cancel">
          취소
        </button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useTemplates } from "@/composables/useTemplates";
import { useAuth } from "@/composables/useAuth";
import type { TemplateGroup, TemplateItem } from "@/types/template";
import PageSubtitle from "@/components/common/PageSubtitle.vue";

const router = useRouter();
const { addTemplate } = useTemplates();
const { currentUser } = useAuth();

const title = ref("");
const category = ref("생활");
const description = ref("");
const visibility = ref<"public" | "private">("private"); // 기본값: 개인 템플릿

// 그룹 관리
const groups = ref<TemplateGroup[]>([]);
const items = ref<TemplateItem[]>([]);

// 그룹 추가 UI 상태
const isAddingGroup = ref(false);
const newGroupName = ref("");
const newGroupInputRef = ref<HTMLInputElement | null>(null);

// 그룹 ID 생성 헬퍼
const generateGroupId = () => {
  return crypto.randomUUID();
};

// 그룹 추가 시작
const addGroup = () => {
  isAddingGroup.value = true;
  newGroupName.value = "";
  setTimeout(() => {
    if (newGroupInputRef.value) {
      newGroupInputRef.value.focus();
    }
  }, 0);
};

// 그룹 추가 확인
const confirmAddGroup = () => {
  if (!newGroupName.value.trim()) return;

  const newGroup: TemplateGroup = {
    groupId: generateGroupId(),
    groupName: newGroupName.value.trim(),
    order: groups.value.length,
  };

  groups.value.push(newGroup);
  cancelAddGroup();
};

// 그룹 추가 취소
const cancelAddGroup = () => {
  isAddingGroup.value = false;
  newGroupName.value = "";
};

// 그룹 삭제
const removeGroup = (groupIndex: number) => {
  const group = groups.value[groupIndex];
  if (!group) return;

  // 해당 그룹의 항목들도 모두 삭제
  items.value = items.value.filter((item) => item.groupId !== group.groupId);

  // 그룹 삭제
  groups.value.splice(groupIndex, 1);

  // order 재정렬
  groups.value.forEach((g, index) => {
    g.order = index;
  });
};

// 그룹의 항목 목록 가져오기
const getGroupItems = (groupId: string) => {
  return items.value.filter((item) => item.groupId === groupId);
};

// 항목 추가
const addItem = (groupId: string) => {
  const newItem: TemplateItem = {
    title: "",
    isCompleted: false,
    groupId: groupId,
  };
  items.value.push(newItem);
};

// 항목 삭제
const removeItem = (groupId: string, itemIndex: number) => {
  const groupItems = getGroupItems(groupId);
  const item = groupItems[itemIndex];
  if (!item) return;

  const globalIndex = items.value.findIndex((i) => i === item);
  if (globalIndex !== -1) {
    items.value.splice(globalIndex, 1);
  }
};

// 저장
const save = async () => {
  if (!title.value.trim()) {
    alert("템플릿 이름을 입력해주세요.");
    return;
  }

  if (groups.value.length === 0) {
    alert("최소 1개 이상의 그룹이 필요합니다.");
    return;
  }

  if (!currentUser.value) {
    alert("로그인이 필요합니다.");
    router.push("/login");
    return;
  }

  // 빈 항목 필터링
  const validItems = items.value.filter((item) => item.title.trim());

  try {
    const templateId = await addTemplate({
      title: title.value,
      category: category.value,
      description: description.value,
      ownerId: currentUser.value.uid,
      visibility: visibility.value, // 사용자가 선택한 공개 범위
      groups: groups.value,
      items: validItems.map((item) => ({
        title: item.title.trim(),
        isCompleted: false,
        groupId: item.groupId,
      })),
    });

    console.log("[TemplateCreateView] 템플릿 생성 성공, ID:", templateId);
    // 생성된 템플릿 상세 페이지로 이동
    router.push(`/templates/${templateId}`);
  } catch (error) {
    console.error("[TemplateCreateView] 템플릿 생성 실패:", error);
    alert("템플릿 생성에 실패했습니다.");
  }
};

const cancel = () => {
  router.back();
};
</script>

<style scoped>
.content-wrapper {
  padding:16px;
}

.input {
  width:100%; padding:10px 12px; border-radius:10px;
  border:1px solid #d1d5db; font-size:0.9rem;
}
.input:focus {
  outline:none; border-color:#2563eb; box-shadow:0 0 0 1px #2563eb20;
}

.button-group {
  display:flex; gap:4px; margin-top:24px;
}

.btn-primary {
  background:#2563eb; color:#fff; height:50px; width:50%;
  border-radius:10px; font-weight:600; border:none; cursor:pointer;
}

.btn-secondary {
  background:#e5e7eb; color:#374151; height:50px; width:50%;
  border-radius:10px; font-size:0.9rem; border:none; cursor:pointer;
}

.group-section {
  box-shadow:0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 공개 범위 라디오 버튼 스타일 */
input[type="radio"] {
  width:18px; height:18px; cursor:pointer; accent-color:#2563eb;
}

input[type="radio"]:checked {
  accent-color:#2563eb;
}
</style>
