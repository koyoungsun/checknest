<template>
  <div class="min-h-screen bg-gray-50 flex flex-col checklist-create-wrapper">
    <PageSubtitle />
    
    <!-- 진행 표시 -->
    <div class="wizard-progress checklist-create-progress">
      <div class="progress-steps checklist-create-progress-steps">
        <div 
          v-for="step in 3" 
          :key="step"
          :class="['progress-step', { active: currentStep >= step, completed: currentStep > step }, 'checklist-create-progress-step']"
        >
          <div class="step-number">{{ step }}</div>
          <div class="step-label">{{ getStepLabel(step) }}</div>
        </div>
      </div>
      <div class="progress-bar checklist-create-progress-bar">
        <div class="progress-fill checklist-create-progress-fill" :style="{ width: `${(currentStep / 3) * 100}%` }"></div>
      </div>
    </div>

    <!-- 리스트 전체 -->
    <main class="flex-1 overflow-y-auto pb-16 content-wrapper checklist-create-body">
      <!-- STEP 1: 기본 정보 -->
      <div v-if="currentStep === 1" class="step-content checklist-create-step checklist-create-step-1">
        <section class="mb-4 checklist-create-title-section">
          <label class="block text-sm font-semibold mb-1">
            체크리스트 제목 <span class="text-red-500">*</span>
          </label>
          <input
            v-model="formData.title"
            type="text"
            class="input checklist-create-title-input"
            placeholder="예: 오늘의 할 일"
            @blur="validateStep1"
          />
          <p v-if="errors.title" class="text-red-500 text-xs mt-1">{{ errors.title }}</p>
        </section>

        <section class="mb-4 checklist-create-category-section">
          <label class="block text-sm font-semibold mb-1">카테고리 (선택)</label>
          <select v-model="formData.category" class="input checklist-create-category-select">
            <option value="">선택 안 함</option>
            <option value="생활">생활</option>
            <option value="여행">여행</option>
            <option value="쇼핑">쇼핑</option>
            <option value="업무">업무</option>
            <option value="집안일">집안일</option>
            <option value="기타">기타</option>
          </select>
        </section>

        <section class="mb-4">
          <label class="block text-sm font-semibold mb-1">설명 (선택)</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="input"
            placeholder="체크리스트에 대한 설명을 적어주세요."
          ></textarea>
        </section>

        <section class="mb-4">
          <label class="block text-sm font-semibold mb-1">종료일 (선택)</label>
          <div class="date-input-wrapper">
            <i class="bi bi-calendar3 date-icon"></i>
            <VueDatePicker
              ref="datePickerRef"
              v-model="formData.dueDate"
              :enable-time-picker="false"
              :format="'yyyy-MM-dd'"
              :locale="ko"
              :auto-apply="true"
              placeholder="종료일을 선택하세요"
              class="date-picker"
              :teleport="true"
              @update:model-value="handleDateSelect"
              @closed="handleDatePickerClosed"
            />
          </div>
          <p v-if="errors.dueDate" class="text-red-500 text-xs mt-1">{{ errors.dueDate }}</p>
        </section>
      </div>

      <!-- STEP 2: 체크 항목 -->
      <div v-if="currentStep === 2" class="step-content">
        <section class="mb-4">
          <div class="flex items-center justify-between mb-4">
            <label class="block text-sm font-semibold">체크 항목</label>
            <button 
              type="button"
              class="btn-add-group"
              @click="addGroup"
            >
              <i class="bi bi-folder-plus"></i> 그룹 추가
            </button>
          </div>

          <!-- 기본 그룹 (항상 표시, 그룹이 없거나 기본 그룹에 내용이 있을 때) -->
          <div v-if="formData.groups.length === 0 || (defaultGroupItems.length > 0 && (defaultGroupItems.some(item => item.name.trim()) || defaultGroupName.trim() !== '그룹1'))" class="default-group-section">
            <div class="group-header">
              <input
                v-model="defaultGroupName"
                type="text"
                class="group-name-input"
                placeholder="Group default"
                @keydown.enter="createDefaultGroup"
              />
            </div>
            <div class="group-items">
              <div
                v-for="(item, index) in defaultGroupItems"
                :key="item.id"
                class="item-row"
              >
                <div class="item-handle">
                  <i class="bi bi-grip-vertical text-gray-400"></i>
                </div>
                <input
                  v-model="item.name"
                  type="text"
                  class="input flex-1"
                  :placeholder="`항목 ${index + 1}`"
                  @keydown.enter="addItemAfterEnter(index)"
                  ref="itemInputs"
                />
                <button
                  v-if="defaultGroupItems.length > 1"
                  type="button"
                  class="item-delete-btn"
                  @click="removeDefaultGroupItem(index)"
                  aria-label="항목 삭제"
                >
                  <i class="bi bi-trash text-red-500"></i>
                </button>
              </div>
              <button
                type="button"
                class="add-item-in-group-btn"
                @click="addItemToDefaultGroup"
              >
                <i class="bi bi-plus-circle"></i> 항목 추가
              </button>
            </div>
          </div>

          <!-- 그룹 목록 -->
          <div v-if="formData.groups.length > 0" class="groups-list">
            <div
              v-for="(group, groupIndex) in formData.groups"
              :key="group.id"
              class="group-section"
              :data-group-index="groupIndex"
            >
              <div class="group-header">
                <input
                  v-model="group.name"
                  type="text"
                  class="group-name-input"
                  :placeholder="`그룹 ${groupIndex + 1}`"
                />
                <button
                  type="button"
                  class="group-delete-btn"
                  @click="removeGroup(groupIndex)"
                  aria-label="그룹 삭제"
                >
                  <i class="bi bi-trash text-red-500"></i>
                </button>
              </div>
              <div class="group-items">
                <div
                  v-for="(item, itemIndex) in group.items"
                  :key="item.id"
                  class="item-row"
                >
                  <div class="item-handle">
                    <i class="bi bi-grip-vertical text-gray-400"></i>
                  </div>
                  <input
                    v-model="item.name"
                    type="text"
                    class="input flex-1"
                    :placeholder="`항목 ${itemIndex + 1}`"
                    @keydown.enter="addItemAfterEnterInGroup(groupIndex, itemIndex)"
                  />
                  <button
                    type="button"
                    class="item-delete-btn"
                    @click="removeItemFromGroup(groupIndex, itemIndex)"
                    aria-label="항목 삭제"
                  >
                    <i class="bi bi-trash text-red-500"></i>
                  </button>
                </div>
                <button
                  type="button"
                  class="add-item-in-group-btn"
                  @click="addItemToGroup(groupIndex)"
                >
                  <i class="bi bi-plus-circle"></i> 항목 추가
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- STEP 3: 설정 -->
      <div v-if="currentStep === 3" class="step-content">
        <section class="mb-4">
          <label class="block text-sm font-semibold mb-2">초대하기</label>
          <div class="invite-buttons">
            <button
              type="button"
              class="btn-invite"
              @click="showInviteFromContacts = true"
            >
              <i class="bi bi-people"></i> 내 일촌에서 추가
            </button>
            <button
              type="button"
              class="btn-invite"
              @click="showInviteNew = true"
            >
              <i class="bi bi-person-plus"></i> 신규 추가
            </button>
          </div>
          
          <!-- 초대된 멤버 목록 -->
          <div v-if="invitedUsers.length > 0 || invitedEmails.length > 0" class="invited-members-section mt-4">
            <h4 class="text-sm font-semibold mb-2">초대된 멤버</h4>
            <div class="invited-members-list">
              <!-- 초대된 사용자 (일촌, 검색) -->
              <div
                v-for="(user, index) in invitedUsers"
                :key="`user-${index}`"
                class="invited-member-item"
              >
                <div class="member-info">
                  <span class="member-name">{{ user.name }}</span>
                  <span class="member-email">{{ user.email }}</span>
                </div>
                <button
                  type="button"
                  class="remove-member-btn"
                  @click="removeUserInvite(index)"
                  aria-label="제거"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
              <!-- 초대된 이메일 -->
              <div
                v-for="(email, index) in invitedEmails"
                :key="`email-${index}`"
                class="invited-member-item"
              >
                <div class="member-info">
                  <span class="member-email">{{ email }}</span>
                </div>
                <button
                  type="button"
                  class="remove-member-btn"
                  @click="removeEmailInvite(index)"
                  aria-label="제거"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 신규 추가 모달 -->
        <div v-if="showInviteNew" class="invite-modal" @click.self="showInviteNew = false">
          <div class="invite-modal-content">
            <div class="invite-modal-header">
              <h3 class="text-lg font-semibold">신규 추가</h3>
              <button
                type="button"
                class="close-btn"
                @click="showInviteNew = false"
                aria-label="닫기"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="invite-modal-body">
              <button
                type="button"
                class="btn-invite-option"
                @click="showEmailInvite = true; showInviteNew = false"
              >
                <i class="bi bi-envelope"></i> 이메일 초대
              </button>
              <button
                type="button"
                class="btn-invite-option"
                @click="showSearchInvite = true; showInviteNew = false"
              >
                <i class="bi bi-search"></i> 검색하기
              </button>
            </div>
          </div>
        </div>

        <!-- 이메일 초대 모달 -->
        <div v-if="showEmailInvite" class="invite-modal" @click.self="showEmailInvite = false">
          <div class="invite-modal-content">
            <div class="invite-modal-header">
              <h3 class="text-lg font-semibold">이메일 초대</h3>
              <button
                type="button"
                class="close-btn"
                @click="showEmailInvite = false"
                aria-label="닫기"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="invite-modal-body">
              <input
                v-model="inviteEmail"
                type="email"
                class="input"
                placeholder="이메일 주소를 입력하세요"
                @keydown.enter="addEmailInvite"
              />
              <button
                type="button"
                class="btn-primary mt-2"
                @click="addEmailInvite"
              >
                추가
              </button>
              <div v-if="invitedEmails.length > 0" class="invited-list mt-4">
                <div
                  v-for="(email, index) in invitedEmails"
                  :key="index"
                  class="invited-item"
                >
                  <span>{{ email }}</span>
                  <button
                    type="button"
                    class="remove-btn"
                    @click="removeEmailInvite(index)"
                    aria-label="제거"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 검색하기 모달 -->
        <div v-if="showSearchInvite" class="invite-modal" @click.self="showSearchInvite = false">
          <div class="invite-modal-content">
            <div class="invite-modal-header">
              <h3 class="text-lg font-semibold">검색하기</h3>
              <button
                type="button"
                class="close-btn"
                @click="showSearchInvite = false"
                aria-label="닫기"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="invite-modal-body">
              <input
                v-model="searchQuery"
                type="text"
                class="input"
                placeholder="이름 또는 이메일로 검색"
                @input="handleSearch"
              />
              <div v-if="searchResults.length > 0" class="search-results mt-4">
                <div
                  v-for="(user, index) in searchResults"
                  :key="index"
                  class="search-result-item"
                  @click="addUserInvite(user)"
                >
                  <div class="user-info">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-email">{{ user.email }}</span>
                  </div>
                  <button
                    type="button"
                    class="add-user-btn"
                    @click.stop="addUserInvite(user)"
                    aria-label="추가"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>
              <div v-if="searchQuery && searchResults.length === 0" class="no-results mt-4 text-center text-gray-500">
                검색 결과가 없습니다.
              </div>
              <div v-if="invitedUsers.length > 0" class="invited-list mt-4">
                <h4 class="text-sm font-semibold mb-2">초대된 사용자</h4>
                <div
                  v-for="(user, index) in invitedUsers"
                  :key="index"
                  class="invited-item"
                >
                  <span>{{ user.name }} ({{ user.email }})</span>
                  <button
                    type="button"
                    class="remove-btn"
                    @click="removeUserInvite(index)"
                    aria-label="제거"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 내 일촌에서 추가 모달 -->
        <div v-if="showInviteFromContacts" class="invite-modal" @click.self="showInviteFromContacts = false">
          <div class="invite-modal-content">
            <div class="invite-modal-header">
              <h3 class="text-lg font-semibold">내 일촌에서 추가</h3>
              <button
                type="button"
                class="close-btn"
                @click="showInviteFromContacts = false"
                aria-label="닫기"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <div class="invite-modal-body">
              <div v-if="contacts.length > 0" class="contacts-list">
                <div
                  v-for="(contact, index) in contacts"
                  :key="index"
                  class="contact-item"
                >
                  <label class="flex items-center">
                    <input
                      v-model="selectedContacts"
                      type="checkbox"
                      :value="contact.id"
                      class="mr-2"
                    />
                    <div class="contact-info">
                      <span class="contact-name">{{ contact.name }}</span>
                      <span class="contact-email">{{ contact.email }}</span>
                    </div>
                  </label>
                </div>
              </div>
              <div v-else class="no-contacts text-center text-gray-500">
                일촌이 없습니다.
              </div>
            </div>
            <div class="invite-modal-footer">
              <button
                type="button"
                class="btn-cancel"
                @click="showInviteFromContacts = false"
              >
                닫기
              </button>
              <button
                type="button"
                class="btn-add-contacts"
                @click="addSelectedContacts"
              >
                추가
              </button>
            </div>
          </div>
        </div>

        <section class="mb-4">
          <!-- 최대 참가 인원: 최대 8인까지 설정 가능 -->
          <label class="block text-sm font-semibold mb-1">최대 참가 인원</label>
          <select
            v-model.number="formData.maxMembers"
            class="input"
          >
            <option v-for="num in 8" :key="num" :value="num">{{ num }}명</option>
          </select>
          <p class="text-xs text-gray-500 mt-1">최대 8인까지 참가 가능합니다.</p>
        </section>

        <!-- 채팅 활성화 옵션 제거: 기본값 true로 내부 처리 -->
        <!-- 역할 사용 옵션 제거: 역할/권한 설계는 다음 단계로 이월 -->
      </div>
    </main>

    <!-- 하단 버튼 -->
    <div class="wizard-footer">
      <button 
        v-if="currentStep > 1"
        class="btn-secondary"
        @click="prevStep"
      >
        이전
      </button>
      <button 
        v-if="currentStep < 3"
        class="btn-primary"
        @click="nextStep"
        :disabled="!canProceed"
      >
        다음
      </button>
      <button 
        v-if="currentStep === 3"
        class="btn-primary"
        @click="submit"
        :disabled="loading"
      >
        {{ loading ? '생성 중...' : '체크리스트 생성' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useChecklists } from "@/composables/useChecklists";
import { useAuth } from "@/composables/useAuth";
import { createItem } from "@/services/items";
import { getChecklist } from "@/services/checklists";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import { ko } from "date-fns/locale";
import PageSubtitle from "@/components/common/PageSubtitle.vue";
import "@vuepic/vue-datepicker/dist/main.css";

const router = useRouter();
const { addChecklist } = useChecklists();
const { currentUser } = useAuth();

// 현재 단계
const currentStep = ref(1);
const loading = ref(false);

// VueDatePicker ref
const datePickerRef = ref<InstanceType<typeof VueDatePicker> | null>(null);
// 캘린더에서 선택된 날짜 (확정 전)
const pendingDueDate = ref<Date | null>(null);

// 폼 데이터
const formData = ref({
  title: "",
  category: "",
  description: "",
  dueDate: null as Date | null,
  items: [] as Array<{ id: string; name: string; order: number }>,
  groups: [] as Array<{
    id: string;
    name: string;
    items: Array<{ id: string; name: string; order: number }>;
  }>,
  maxMembers: 1,
});

// 기본 그룹 (그룹이 없을 때 사용)
const defaultGroupName = ref("Group default");
const defaultGroupItems = ref<Array<{ id: string; name: string; order: number }>>([
  {
    id: `temp_${Date.now()}_${Math.random()}`,
    name: "",
    order: 0,
  }
]);
const itemInputs = ref<(HTMLInputElement | null)[]>([]);

// 초대 관련 상태
const showInviteFromContacts = ref(false);
const showInviteNew = ref(false);
const showEmailInvite = ref(false);
const showSearchInvite = ref(false);
const inviteEmail = ref("");
const invitedEmails = ref<string[]>([]);
const searchQuery = ref("");
const searchResults = ref<Array<{ id: string; name: string; email: string }>>([]);
const invitedUsers = ref<Array<{ id: string; name: string; email: string }>>([]);
const contacts = ref<Array<{ id: string; name: string; email: string }>>([
  { id: "1", name: "이영희", email: "lee@example.com" },
  { id: "2", name: "박민수", email: "park@example.com" },
]);
const selectedContacts = ref<string[]>([]);

// 에러 메시지
const errors = ref<{ [key: string]: string }>({});

// 날짜 선택 핸들러 (auto-apply로 인해 자동으로 호출됨)
const handleDateSelect = (date: Date | null) => {
  if (date) {
    formData.value.dueDate = date;
    // 에러 메시지 제거
    if (errors.value.dueDate) {
      delete errors.value.dueDate;
    }
    console.log("[handleDateSelect] 날짜 선택됨:", date);
  }
};

// 캘린더 닫힘 핸들러
const handleDatePickerClosed = () => {
  isDatePickerOpen.value = false;
  console.log("[handleDatePickerClosed] 캘린더 닫힘");
};

// 단계별 라벨
const getStepLabel = (step: number) => {
  const labels = {
    1: "기본 정보",
    2: "체크 항목",
    3: "설정",
  };
  return labels[step as keyof typeof labels] || "";
};

// 다음 단계로 진행 가능한지 확인
const canProceed = computed(() => {
  if (currentStep.value === 1) {
    return formData.value.title.trim().length > 0;
  }
  return true; // STEP 2와 3는 항목이 없어도 진행 가능
});

// STEP 1 검증
const validateStep1 = () => {
  errors.value = {};
  if (!formData.value.title.trim()) {
    errors.value.title = "체크리스트 제목을 입력해주세요.";
  }
};

// 다음 단계
const nextStep = () => {
  if (currentStep.value === 1) {
    validateStep1();
    if (errors.value.title) {
      return;
    }
  }
  
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

// 이전 단계
const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// 기본 그룹 생성 (명시적으로 호출될 때만)
const createDefaultGroup = () => {
  if (defaultGroupName.value.trim() && defaultGroupItems.value.length > 0) {
    // 빈 항목 제외하고 실제 입력된 항목만 저장
    const validItems = defaultGroupItems.value.filter(item => item.name.trim());
    if (validItems.length > 0) {
      formData.value.groups.push({
        id: `group_${Date.now()}`,
                name: defaultGroupName.value.trim() || "Group default",
        items: validItems,
      });
    }
    defaultGroupName.value = "Group default";
    defaultGroupItems.value = [{
      id: `temp_${Date.now()}_${Math.random()}`,
      name: "",
      order: 0,
    }];
  }
};

// 기본 그룹에 항목 추가
const addItemToDefaultGroup = () => {
  const newItem = {
    id: `temp_${Date.now()}_${Math.random()}`,
    name: "",
    order: defaultGroupItems.value.length,
  };
  defaultGroupItems.value.push(newItem);
  
  // 다음 틱에서 포커스
  setTimeout(() => {
    const lastInput = itemInputs.value[defaultGroupItems.value.length - 1];
    if (lastInput) {
      lastInput.focus();
    }
  }, 0);
};

// 기본 그룹에서 항목 삭제
const removeDefaultGroupItem = (index: number) => {
  defaultGroupItems.value.splice(index, 1);
  defaultGroupItems.value.forEach((item, idx) => {
    item.order = idx;
  });
};

// 기본 그룹에서 엔터 시 다음 항목 추가
const addItemAfterEnter = (index: number) => {
  const item = defaultGroupItems.value[index];
  if (item && item.name.trim()) {
    // 현재 항목이 마지막이면 새 항목 추가
    if (index === defaultGroupItems.value.length - 1) {
      addItemToDefaultGroup();
    } else {
      // 다음 항목으로 포커스 이동
      setTimeout(() => {
        const nextInput = itemInputs.value[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }, 0);
    }
  }
};

// 그룹 추가
const addGroup = () => {
  // 기본 그룹의 내용은 유지하고, 새 그룹만 추가
  const newGroup = {
    id: `group_${Date.now()}_${Math.random()}`,
    name: `그룹 ${formData.value.groups.length + 1}`,
    items: [{
      id: `temp_${Date.now()}_${Math.random()}`,
      name: "",
      order: 0,
    }],
  };
  formData.value.groups.push(newGroup);
  
  // 다음 틱에서 포커스
  setTimeout(() => {
    const groupElement = document.querySelector(`[data-group-index="${formData.value.groups.length - 1}"]`);
    if (groupElement) {
      const inputs = groupElement.querySelectorAll('input[type="text"]');
      const firstItemInput = inputs[1] as HTMLInputElement; // 0번은 그룹 이름, 1번이 첫 항목
      if (firstItemInput) {
        firstItemInput.focus();
      }
    }
  }, 0);
};

// 그룹 삭제
const removeGroup = (index: number) => {
  formData.value.groups.splice(index, 1);
};

// 그룹에 항목 추가
const addItemToGroup = (groupIndex: number) => {
  const group = formData.value.groups[groupIndex];
  if (!group) return;
  
  const newItem = {
    id: `temp_${Date.now()}_${Math.random()}`,
    name: "",
    order: group.items.length,
  };
  group.items.push(newItem);
  
  // 다음 틱에서 포커스
  setTimeout(() => {
    const groupElement = document.querySelector(`[data-group-index="${groupIndex}"]`);
    if (groupElement) {
      const inputs = groupElement.querySelectorAll('input[type="text"]');
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      if (lastInput) {
        lastInput.focus();
      }
    }
  }, 0);
};

// 그룹에서 항목 삭제
const removeItemFromGroup = (groupIndex: number, itemIndex: number) => {
  const group = formData.value.groups[groupIndex];
  if (!group) return;
  
  group.items.splice(itemIndex, 1);
  group.items.forEach((item, idx) => {
    item.order = idx;
  });
};

// 그룹에서 엔터 시 다음 항목 추가
const addItemAfterEnterInGroup = (groupIndex: number, itemIndex: number) => {
  const group = formData.value.groups[groupIndex];
  if (!group) return;
  
  const item = group.items[itemIndex];
  if (item && item.name.trim()) {
    // 현재 항목이 마지막이면 새 항목 추가
    if (itemIndex === group.items.length - 1) {
      addItemToGroup(groupIndex);
    } else {
      // 다음 항목으로 포커스 이동
      setTimeout(() => {
        const groupElement = document.querySelector(`[data-group-index="${groupIndex}"]`);
        if (groupElement) {
          const inputs = groupElement.querySelectorAll('input[type="text"]');
          const nextInput = inputs[itemIndex + 1] as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
          }
        }
      }, 0);
    }
  }
};

// 초대 관련 함수들
const addEmailInvite = () => {
  if (inviteEmail.value.trim() && !invitedEmails.value.includes(inviteEmail.value.trim())) {
    invitedEmails.value.push(inviteEmail.value.trim());
    inviteEmail.value = "";
  }
};

const removeEmailInvite = (index: number) => {
  invitedEmails.value.splice(index, 1);
};

const handleSearch = () => {
  // TODO: 실제 검색 API 호출
  // 임시 더미 데이터
  if (searchQuery.value.trim()) {
    searchResults.value = [
      { id: "1", name: "홍길동", email: "hong@example.com" },
      { id: "2", name: "김철수", email: "kim@example.com" },
    ].filter(user => 
      user.name.includes(searchQuery.value) || 
      user.email.includes(searchQuery.value)
    );
  } else {
    searchResults.value = [];
  }
};

const addUserInvite = (user: { id: string; name: string; email: string }) => {
  if (!invitedUsers.value.find(u => u.id === user.id)) {
    invitedUsers.value.push(user);
  }
};

const removeUserInvite = (index: number) => {
  invitedUsers.value.splice(index, 1);
};

const addSelectedContacts = () => {
  const selected = contacts.value.filter(contact => 
    selectedContacts.value.includes(contact.id)
  );
  selected.forEach(contact => {
    if (!invitedUsers.value.find(u => u.id === contact.id)) {
      invitedUsers.value.push(contact);
    }
  });
  selectedContacts.value = [];
  showInviteFromContacts.value = false;
};

// 제출
const submit = async () => {
  if (!formData.value.title.trim()) {
    validateStep1();
    return;
  }

  // 로그인 확인
  if (!currentUser.value) {
    alert("로그인이 필요합니다. 로그인 페이지로 이동합니다.");
    router.push("/login");
    return;
  }

  // 3. Create 버튼 클릭 시 캘린더가 열려 있고 날짜가 선택되어 있다면 자동으로 select 실행
  // 캘린더가 열려있는지 확인 (DOM 요소 확인)
  const datePickerElement = document.querySelector('.dp__calendar');
  const isCalendarOpen = datePickerElement && datePickerElement.offsetParent !== null;
  
  if (isCalendarOpen && datePickerRef.value) {
    console.log("[submit] 캘린더가 열려있음, 날짜 자동 확정 시도");
    
    // VueDatePicker의 내부 상태에서 선택된 날짜 확인
    // datePickerRef를 통해 접근 가능한 경우, 선택된 날짜를 가져와서 확정
    try {
      // VueDatePicker의 내부 API에 접근 시도
      // selectDate 속성이나 내부 메서드를 통해 선택된 날짜 확인
      const pickerInstance = datePickerRef.value as any;
      
      // 선택된 날짜가 있지만 v-model에 반영되지 않은 경우
      if (pickerInstance?.selectDate && !formData.value.dueDate) {
        console.log("[submit] 캘린더에서 선택된 날짜 발견, 자동 확정:", pickerInstance.selectDate);
        formData.value.dueDate = pickerInstance.selectDate;
      }
      
      // 캘린더 닫기 (자동 확정 후)
      if (pickerInstance?.closeCalendar) {
        pickerInstance.closeCalendar();
      }
    } catch (error) {
      console.log("[submit] 캘린더 내부 API 접근 실패, auto-apply에 의존:", error);
    }
  }

  // 2. 날짜가 선택되었는데 select 안 누른 상태로 생성 시 경고 메시지 표시
  // (auto-apply로 인해 대부분 자동 처리되지만, 추가 검증)
  // 캘린더가 열려있고 날짜가 선택되지 않은 경우는 거의 없지만, 안전장치로 추가
  // 실제로는 auto-apply로 인해 날짜 클릭 시 자동으로 v-model에 반영되므로
  // 이 검증은 거의 실행되지 않지만, 안전장치로 유지

  loading.value = true;
  try {
    // 초대된 멤버 ID 수집 (일촌, 검색으로 추가된 사용자)
    // TODO: 실제 사용자 ID로 변환 필요 (현재는 더미 데이터)
    const memberIds: string[] = [];
    // invitedUsers.value.forEach(user => {
    //   if (user.id) memberIds.push(user.id);
    // });

    // dueDate 타입 확인 및 정규화
    const dueDateValue = formData.value.dueDate;
    
    // 1. 현재 dueDate의 실제 타입 확인
    console.log("[CreateView] dueDate 원본:", dueDateValue, typeof dueDateValue, dueDateValue instanceof Date);
    
    // 2. dueDate를 Date 객체로 정규화
    // string("YYYY-MM-DD")인 경우 Date 객체로 변환
    // 이미 Date 객체면 그대로 사용
    // 그 외의 경우 null
    const normalizedDueDate =
      typeof dueDateValue === "string"
        ? new Date(dueDateValue + "T00:00:00")
        : dueDateValue instanceof Date
          ? dueDateValue
          : null;
    
    // 3. 변환 후 확인
    console.log("[CreateView] dueDate 정규화 후:", {
      original: dueDateValue,
      normalized: normalizedDueDate,
      isDate: normalizedDueDate instanceof Date,
      type: typeof normalizedDueDate,
      value: normalizedDueDate ? normalizedDueDate.toISOString() : null,
    });
    
    // 4. 최종 검증: Date 객체인지 확인
    if (normalizedDueDate !== null && !(normalizedDueDate instanceof Date)) {
      console.error("[CreateView] dueDate 정규화 실패:", normalizedDueDate);
      throw new Error("dueDate는 Date 객체여야 합니다.");
    }
    
    // groups 배열 생성: 최소 1개 이상의 그룹이 필요
    const groups: Array<{ groupId: string; groupName: string; order: number }> = [];
    
    // 기본 그룹 생성 (항상 포함, order: 0)
    const defaultGroupId = crypto.randomUUID();
    const defaultGroupNameValue = defaultGroupName.value.trim() || "Group default";
    groups.push({
      groupId: defaultGroupId,
      groupName: defaultGroupNameValue,
      order: 0
    });
    
    // 추가 그룹들 추가
    formData.value.groups.forEach((group, index) => {
      if (group.name.trim()) {
        groups.push({
          groupId: crypto.randomUUID(),
          groupName: group.name.trim(),
          order: index + 1
        });
      }
    });
    
    // groups 배열이 비어있으면 생성 불가
    if (groups.length === 0) {
      alert("최소 1개 이상의 그룹이 필요합니다.");
      return;
    }
    
    console.log("체크리스트 생성 시작:", {
      title: formData.value.title.trim(),
      description: formData.value.description?.trim(),
      dueDate: normalizedDueDate,
      dueDateType: typeof normalizedDueDate,
      dueDateIsDate: normalizedDueDate instanceof Date,
      members: memberIds,
      rolesEnabled: formData.value.rolesEnabled,
      groups: groups,
      currentUser: currentUser.value?.uid,
    });

    // 체크리스트 생성
    // dueDate가 Date 객체일 때만 전달, null이면 undefined로 전달 (필드 저장 안 함)
    // V1에서는 채팅을 기본 항상 활성으로 유지 (chatEnabled: true 명시)
    const checklistId = await addChecklist({
      title: formData.value.title.trim(),
      description: formData.value.description?.trim() || undefined,
      dueDate: normalizedDueDate instanceof Date ? normalizedDueDate : undefined,
      members: memberIds, // 초대된 멤버 ID 배열
      groups: groups, // 필수 필드: 최소 1개 이상의 그룹
      chatEnabled: true, // V1에서는 채팅을 기본 항상 활성으로 유지
      maxParticipants: Math.max(1 + memberIds.length, formData.value.maxMembers), // 최초 참여자 수 또는 설정한 최대 인원 중 큰 값
    });

    console.log("체크리스트 생성 성공, ID:", checklistId);

    // 체크리스트 raw 데이터 확인을 위해 다시 조회
    try {
      const createdChecklist = await getChecklist(checklistId);
      if (createdChecklist) {
        console.log("checklist raw:", createdChecklist);
        console.log("checklist.groups:", createdChecklist.groups);
        console.log("checklist.groupId:", (createdChecklist as any).groupId);
        console.log("checklist.groupName:", (createdChecklist as any).groupName);
      }
    } catch (err) {
      console.error("체크리스트 조회 실패:", err);
    }

    // 항목 생성 (그룹별로 순서대로)
    let globalOrder = 0;
    
    // 기본 그룹 항목 저장 (groups[0]에 해당)
    if (defaultGroupItems.value.length > 0) {
      const defaultItems = defaultGroupItems.value
        .filter(item => item.name.trim())
        .map(item => ({
          checklistId,
          name: item.name.trim(),
          order: globalOrder++,
          isDone: false,
          groupId: defaultGroupId, // 기본 그룹의 groupId
        }));
      
      if (defaultItems.length > 0) {
        await Promise.all(defaultItems.map(item => createItem(item)));
      }
    }
    
    // 추가 그룹별 항목 저장 (forEach는 async/await를 지원하지 않으므로 for...of 사용)
    for (let groupIndex = 0; groupIndex < formData.value.groups.length; groupIndex++) {
      const group = formData.value.groups[groupIndex];
      if (group.name.trim()) {
        const groupId = groups[groupIndex + 1]?.groupId; // groups[0]은 기본 그룹이므로 +1
        if (groupId) {
          const groupItems = group.items
            .filter(item => item.name.trim())
            .map(item => ({
              checklistId,
              name: item.name.trim(),
              order: globalOrder++,
              isDone: false,
              groupId: groupId, // 해당 그룹의 groupId
            }));
          
          if (groupItems.length > 0) {
            await Promise.all(groupItems.map(item => createItem(item)));
          }
        }
      }
    }

    // 성공 메시지
    alert("체크리스트가 생성되었습니다!");
    
    // 폼 데이터 초기화
    formData.value = {
      title: "",
      category: "",
      description: "",
      dueDate: null,
      items: [],
      groups: [],
      maxMembers: 1,
    };
    defaultGroupName.value = "Group default";
    defaultGroupItems.value = [{
      id: `temp_${Date.now()}_${Math.random()}`,
      name: "",
      order: 0,
    }];
    invitedUsers.value = [];
    invitedEmails.value = [];
    selectedContacts.value = [];
    currentStep.value = 1;
    errors.value = {};
    
    // 리스트 페이지로 이동
    router.push("/lists");
  } catch (error: any) {
    console.error("체크리스트 생성 실패:", error);
    
    // 상세한 에러 메시지 표시
    let errorMessage = "체크리스트 생성에 실패했습니다.";
    
    if (error?.message) {
      errorMessage += `\n\n에러: ${error.message}`;
    }
    
    if (error?.code) {
      errorMessage += `\n코드: ${error.code}`;
      
      // Firestore 에러 코드별 메시지
      switch (error.code) {
        case "permission-denied":
          errorMessage += "\n\n권한이 없습니다. 로그인 상태를 확인해주세요.";
          break;
        case "unauthenticated":
          errorMessage += "\n\n로그인이 필요합니다.";
          break;
        case "invalid-argument":
          errorMessage += "\n\n입력 데이터가 올바르지 않습니다.";
          break;
        default:
          errorMessage += `\n\n상세 정보는 콘솔을 확인해주세요.`;
      }
    }
    
    alert(errorMessage);
    console.error("상세 에러 정보:", {
      error,
      formData: formData.value,
      defaultGroupItems: defaultGroupItems.value,
      groups: formData.value.groups,
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.content-wrapper {
  padding: 16px;
}

.wizard-progress {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.progress-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 60%;
  right: -40%;
  height: 2px;
  background: #e5e7eb;
  z-index: 0;
}

.progress-step.completed:not(:last-child)::after {
  background: #ff6b35;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.progress-step.active .step-number {
  background: #ff6b35;
  color: #fff;
}

.progress-step.completed .step-number {
  background: #ff6b35;
  color: #fff;
}

.step-label {
  margin-top: 4px;
  font-size: 11px;
  color: #9ca3af;
}

.progress-step.active .step-label {
  color: #ff6b35;
  font-weight: 600;
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #ff6b35;
  transition: width 0.3s ease;
}

.step-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb20;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
  font-size: 1rem;
  pointer-events: none;
  z-index: 2;
}

.date-picker {
  width: 100%;
}

.date-picker :deep(.dp__input_wrap) {
  width: 100%;
}

.date-picker :deep(.dp__input) {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  cursor: pointer;
}

.date-picker :deep(.dp__input:focus) {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb20;
}

.date-picker :deep(.dp__input_icon) {
  display: none;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-handle {
  cursor: move;
  padding: 4px;
}

.item-delete-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #ff6b35;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.wizard-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  display: flex;
  gap: 8px;
  z-index: 10;
}

.btn-primary {
  flex: 1;
  background: #ff6b35;
  color: #fff;
  height: 48px;
  border-radius: 10px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #e55a2b;
}

.btn-primary:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.btn-secondary {
  flex: 1;
  background: #e5e7eb;
  color: #374151;
  height: 48px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #d1d5db;
}

/* 초대 관련 스타일 */
.invite-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-invite {
  flex: 1;
  min-width: 140px;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-invite:hover {
  background: #f9fafb;
  border-color: #ff6b35;
}

.btn-invite i {
  font-size: 16px;
}

.invite-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.invite-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
}

.invite-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.invite-modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.invite-modal-body {
  padding: 16px;
}

.btn-invite-option {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-invite-option:hover {
  background: #f9fafb;
  border-color: #ff6b35;
}

.btn-invite-option i {
  font-size: 16px;
}

.invited-list {
  margin-top: 16px;
}

.invited-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.remove-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #dc2626;
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-result-item:hover {
  background: #f9fafb;
  border-color: #ff6b35;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.user-email {
  font-size: 12px;
  color: #6b7280;
}

.add-user-btn {
  background: #ff6b35;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.add-user-btn:hover {
  background: #e55a2b;
}

.no-results,
.no-contacts {
  padding: 24px;
  font-size: 14px;
}

.contacts-list {
  max-height: 400px;
  overflow-y: auto;
}

.contact-item {
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
}

.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.contact-email {
  font-size: 12px;
  color: #6b7280;
}

.invite-modal-footer {
  display: flex;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-add-contacts {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #ff6b35;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-contacts:hover {
  background: #e55a2b;
}

.invited-members-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.invited-members-section h4 {
  margin-bottom: 12px;
  color: #333;
}

.invited-members-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invited-member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.member-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.member-email {
  font-size: 12px;
  color: #6b7280;
}

.remove-member-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-left: 8px;
}

.remove-member-btn:hover {
  color: #dc2626;
}
</style>
