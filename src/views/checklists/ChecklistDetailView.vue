<template>
  <div class="checklist-detail-page flex flex-col overflow-hidden bg-gray-50">
    <!-- 로딩 상태 -->
    <div v-if="loading" class="flex items-center justify-center flex-1">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">로딩 중...</p>
      </div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="flex items-center justify-center flex-1">
      <div class="text-center">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="loadChecklistData" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          다시 시도
        </button>
      </div>
    </div>

    <!-- 정상 상태 -->
    <template v-else-if="checklist">
    <!-- 1. 상단 헤더 -->
    <header class="flex items-center px-4 h-14 border-b bg-white flex-shrink-0 z-10">
      <button @click="router.back()" class="mr-3 text-xl text-gray-700">
        <i class="bi bi-arrow-left"></i>
      </button>
      <h1 class="text-base font-semibold truncate flex-1">
        {{ checklistTitle }}
      </h1>
      <!-- 오너모드 버튼 (오너 또는 admin일 때만 표시) -->
      <button 
        v-if="isOwnerOrAdmin"
        @click="openBottomSheet('ownerMode')"
        class="ml-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        {{ isOwner ? '오너모드' : '관리모드' }}
      </button>
      <!-- 정렬 버튼 (오너/비오너 모두 표시) -->
      <button
        @click="openBottomSheet('sort')"
        class="ml-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        title="정렬"
      >
        <i class="bi bi-sort-down text-xl"></i>
      </button>
    </header>

    <!-- 메인 컨테이너: 전체 레이아웃 (전용 클래스 구조) -->
    <div class="checklist-detail-layout">
      <div class="checklist-detail-split">
        <!-- Article 1: 체크리스트 영역 -->
        <article 
          class="checklist-detail-list"
          :class="{ 
            'checklist-detail-list--chat-open': shouldShowChatArea && isChatOpen, 
            'checklist-detail-list--chat-closed': shouldShowChatArea && !isChatOpen
          }"
        >
        <!-- 1️⃣ 상단 정보 영역 (그룹명, 제목, 메타 정보) -->
        <div class="bg-white border-b border-gray-200 flex-shrink-0">
          <!-- 그룹명 & 제목 -->
          <header class="px-4 py-3 border-b border-gray-100">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <!-- 체크리스트 제목 (상단 헤더에 h1이 있으므로 여기서는 h2) -->
                <h2 class="text-base font-semibold text-gray-800 truncate flex-1 mb-1">
                  {{ checklistTitle }}
                </h2>
                <!-- 체크리스트 서브 타이틀 (description이 있을 때만 표시) -->
                <div 
                  v-if="checklist?.description && checklist.description.trim()"
                  class="text-sm text-gray-500 opacity-75 mt-1 truncate"
                >
                  {{ checklist.description }}
                </div>
              </div>
            </div>
          </header>

          <!-- 2️⃣ 메타 정보 영역 (작성일, 종료일, 진행도, 참여자 목록) -->
          <div class="px-4 py-3 bg-gray-50">

            <!-- 작성일, 수정일, 종료일, 진행도 -->
            <div class="grid grid-cols-2 gap-3 text-sm mb-4">
              <!-- 작성일 -->
              <div class="flex items-center gap-2">
                <i class="bi bi-calendar3 text-gray-500"></i>
                <span class="text-gray-600">작성일</span>
                <span class="text-gray-800 font-medium">
                  {{ checklist?.createdAt ? formatDate(checklist.createdAt.toDate()) : '-' }}
                </span>
              </div>

              <!-- 수정일 (오너모드에서 옵션 변경 시에만 노출) -->
              <div v-if="checklist?.updatedAt && showUpdatedAt" class="flex items-center gap-2">
                <i class="bi bi-pencil text-gray-500"></i>
                <span class="text-gray-600">수정일</span>
                <span class="text-gray-800 font-medium">
                  {{ formatDate(checklist.updatedAt.toDate()) }}
                </span>
              </div>

              <!-- 종료일 (있을 때만 표시, 기본 todo는 제외) -->
              <div v-if="checklist?.dueDate && !checklist?.isDefault" class="flex items-center gap-2">
                <i class="bi bi-calendar-event text-gray-500"></i>
                <span class="text-gray-600">종료일</span>
                <span class="text-gray-800 font-medium">
                  {{ formatDate(checklist.dueDate.toDate()) }}
                </span>
              </div>

              <!-- 진행도 (기본 todo는 제외) -->
              <div v-if="!checklist?.isDefault" class="flex items-center gap-2">
                <i class="bi bi-check-circle" :style="{ color: progressColor }"></i>
                <span class="text-gray-600">진행도</span>
                <span class="font-medium" :style="{ color: progressColor }">
                  {{ completedCount }} / {{ totalCount }} ({{ progressPercentage }}%)
                </span>
              </div>
            </div>

            <!-- 참여자 목록 (이름 + 컬러) -->
            <div class="mt-3 pt-3 border-t border-gray-200">
              <div class="flex items-center gap-2 mb-2">
                <i class="bi bi-people text-gray-500"></i>
                <span class="text-sm font-semibold text-gray-700">참여자</span>
                <button
                  v-if="participantCount > 0"
                  @click="toggleParticipantTooltip"
                  class="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  ({{ participantCount }}명)
                </button>
              </div>
              
              <!-- 참여자 툴팁 -->
              <div
                v-if="showParticipantTooltip"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                @click.self="showParticipantTooltip = false"
              >
                <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">참여자 목록</h3>
                    <button
                      @click="showParticipantTooltip = false"
                      class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
                      aria-label="닫기"
                    >
                      <i class="bi bi-x-lg text-xl"></i>
                    </button>
                  </div>
                  
                  <div class="space-y-3">
                    <!-- 오너 -->
                    <div v-if="checklist" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div 
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        :style="{ backgroundColor: getMemberColor(checklist.ownerId) }"
                      >
                        {{ getMemberInitial(checklist.ownerId) }}
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">{{ getMemberName(checklist.ownerId) }}</p>
                        <p class="text-xs text-gray-500">(오너)</p>
                      </div>
                    </div>
                    
                    <!-- 멤버 -->
                    <div
                      v-for="member in validMembers"
                      :key="member.userId"
                      class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div 
                        class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        :style="{ backgroundColor: getMemberColor(member.userId) }"
                      >
                        {{ getMemberInitial(member.userId) }}
                      </div>
                      <div class="flex-1">
                        <p class="text-sm font-medium text-gray-800">{{ getMemberName(member.userId) }}</p>
                        <p class="text-xs text-gray-500">({{ member.role === 'admin' ? '운영자' : '멤버' }})</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <!-- 오너 1명뿐일 경우: 오너만 표시 -->
                <template v-if="participantCount === 1">
                  <div v-if="checklist" class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
                    <div 
                      class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      :style="{ backgroundColor: getMemberColor(checklist.ownerId) }"
                    >
                      {{ getMemberInitial(checklist.ownerId) }}
                    </div>
                    <span class="text-sm text-gray-800 font-medium">{{ getMemberName(checklist.ownerId) }}</span>
                    <span class="text-xs text-gray-500">(오너)</span>
                  </div>
                </template>
                
                <!-- 여러 명일 경우: 오너/운영자/멤버 구분 표시 -->
                <template v-else>
                  <!-- 오너 표시 -->
                  <div v-if="checklist" class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
                    <div 
                      class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      :style="{ backgroundColor: getMemberColor(checklist.ownerId) }"
                    >
                      {{ getMemberInitial(checklist.ownerId) }}
                    </div>
                    <span class="text-sm text-gray-800 font-medium">{{ getMemberName(checklist.ownerId) }}</span>
                    <span class="text-xs text-gray-500">(오너)</span>
                  </div>
                  
                  <!-- 멤버 표시 (역할 구분) -->
                  <div
                    v-for="member in validMembers"
                    :key="member.userId"
                    class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm"
                  >
                    <div 
                      class="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                      :style="{ backgroundColor: getMemberColor(member.userId) }"
                    >
                      {{ getMemberInitial(member.userId) }}
                    </div>
                    <span class="text-sm text-gray-800 font-medium">{{ getMemberName(member.userId) }}</span>
                    <span class="text-xs text-gray-500">({{ member.role === 'admin' ? '운영자' : '멤버' }})</span>
                  </div>
                </template>
              </div>
              
              <!-- 초대하기 버튼 (오너 또는 admin일 때만 표시) -->
              <div v-if="isOwner || isAdmin" class="mt-3">
                <button
                  @click="openInviteModal"
                  :disabled="isMaxParticipantsReached"
                  class="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200"
                >
                  <i class="bi bi-person-plus mr-2"></i>
                  {{ isMaxParticipantsReached ? '최대 인원 초과' : '초대하기' }}
                </button>
                <p v-if="isMaxParticipantsReached" class="text-xs text-gray-500 mt-1 text-center">
                  최대 참가 인원({{ checklist?.maxParticipants || 0 }}명)에 도달했습니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3️⃣ 체크리스트 항목 영역 (스크롤 가능) -->
        <div class="checklist-detail-list-content">
            <div class="space-y-4">
              <!-- 그룹 추가 UI -->
              <div v-if="isAddingGroup" class="bg-white rounded-lg border-2 border-blue-500 shadow-md p-4">
                <div class="flex items-center gap-2 mb-3">
                  <i class="bi bi-folder-plus text-blue-600"></i>
                  <input
                    v-model="newGroupName"
                    @keydown.enter="confirmAddGroup"
                    @keydown.escape="cancelAddGroup"
                    type="text"
                    placeholder="그룹명을 입력하세요..."
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ref="newGroupInputRef"
                  />
                </div>
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="cancelAddGroup"
                    class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    @click="confirmAddGroup"
                    :disabled="!newGroupName.trim()"
                    class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    추가
                  </button>
                </div>
              </div>

              <!-- 그룹별로 그룹화된 체크 항목 리스트 -->
              <template v-for="group in groupedItems" :key="group.groupId">
                <!-- 그룹 헤더 (h3) -->
                <div class="flex items-center gap-2">
                  <h3 
                    class="text-sm font-semibold text-gray-700 px-2 py-1 bg-gray-100 rounded-md flex-1 cursor-pointer"
                    :class="selectedGroupId === group.groupId ? 'bg-blue-100 text-blue-700' : ''"
                    @click="selectGroup(group.groupId)"
                  >
                    {{ group.groupName }}
                  </h3>
                  <!-- 그룹별 항목 추가 버튼 -->
                  <button
                    v-if="!isAddingNewItem && selectedGroupId !== group.groupId"
                    @click="selectGroup(group.groupId); startAddingItem()"
                    class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    title="이 그룹에 항목 추가"
                  >
                    <i class="bi bi-plus-lg"></i>
                  </button>
                  <button
                    v-if="selectedGroupId === group.groupId"
                    @click="selectGroup(null)"
                    class="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
                    title="그룹 선택 해제"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
                
                <!-- 그룹 내 아이템 리스트 -->
                <div class="space-y-3 ml-2">
                  <!-- 빈 그룹 메시지 -->
                  <div 
                    v-if="group.items.length === 0 && !isAddingNewItem"
                    class="text-sm text-gray-400 italic py-2 px-2"
                  >
                    항목이 없습니다
                  </div>
                  
                  <!-- 그룹 내 아이템들 -->
                  <div
                    v-for="item in group.items"
                    :key="item.id"
                    class="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <!-- 항목 메인 영역: 단일 flex-row 컨테이너 (1줄 고정, 줄바꿈 금지) -->
                    <div class="p-4 flex items-center gap-2 overflow-hidden" style="display: flex; align-items: center; gap: 8px; white-space: nowrap;">
                      <!-- 체크박스 -->
                      <input
                        type="checkbox"
                        :checked="item.isChecked"
                        @change="toggleItemChecked(getItemIndex(item.id))"
                        class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      />
                  
                  <!-- 담당자 컬러 dot (항상 표시, assigneeId가 없으면 회색) -->
                  <div
                    class="w-3 h-3 rounded-full flex-shrink-0"
                    :style="{ 
                      backgroundColor: item.assigneeId ? '#9ca3af' : '#d1d5db'
                    }"
                  ></div>
                  
                  <!-- 항목 제목 텍스트 (flex-1, truncate, 줄바꿈 금지) -->
                  <span 
                    class="flex-1 text-base min-w-0 overflow-hidden"
                    :class="item.isChecked 
                      ? 'line-through text-gray-400 opacity-60' 
                      : 'text-gray-800'"
                    :title="item.title"
                    style="white-space: nowrap; text-overflow: ellipsis;"
                  >
                    {{ item.title }}
                  </span>
                  
                      <!-- 메모 버튼 (항상 표시, 클릭 시 토글) -->
                      <button
                        @click="toggleItemMemo(getItemIndex(item.id))"
                        class="p-2 rounded-lg transition-colors flex-shrink-0"
                        :class="item.memo || item.isMemoOpen
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'"
                        :disabled="item.isChecked"
                        title="메모"
                      >
                        <i :class="item.memo ? 'bi bi-sticky-fill text-lg' : 'bi bi-sticky text-lg'"></i>
                      </button>
                      
                      <!-- 항목 삭제 버튼 -->
                      <button
                        @click="deleteItem(getItemIndex(item.id))"
                        class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="항목 삭제"
                      >
                        <i class="bi bi-trash text-lg"></i>
                      </button>
                    </div>

                    <!-- 메모 입력 영역 (항목 바로 아래, 토글 방식) -->
                    <div
                      v-if="item.isMemoOpen || item.memo"
                      class="px-4 pb-4 border-t border-gray-100 bg-gray-50"
                    >
                      <div class="pt-3">
                        <div class="flex items-start gap-2">
                          <textarea
                            v-model="item.memo"
                            :data-item-index="getItemIndex(item.id)"
                            @blur="handleMemoBlur(getItemIndex(item.id))"
                            @focus="handleMemoFocus(getItemIndex(item.id))"
                            placeholder="메모를 입력하세요..."
                            rows="3"
                            class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            :class="item.isChecked ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-800'"
                            :disabled="item.isChecked"
                          ></textarea>
                          
                          <!-- 메모 삭제 버튼 (memo가 있을 때만 표시) -->
                          <button
                            v-if="item.memo"
                            @click="clearItemMemo(getItemIndex(item.id))"
                            class="p-2 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                            :disabled="item.isChecked"
                            title="메모 삭제"
                          >
                            <i class="bi bi-x-circle text-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
              
              <!-- 체크 항목이 없을 때 -->
              <div v-if="checklistItems.length === 0 && !isAddingNewItem" class="text-center text-gray-400 py-12">
                <i class="bi bi-inbox text-4xl mb-2 block"></i>
                <p>체크리스트 항목이 없습니다.</p>
              </div>

              <!-- 새 항목 입력 UI -->
              <div
                v-if="isAddingNewItem"
                class="bg-white rounded-lg border-2 border-blue-500 shadow-md"
              >
                <div class="p-4">
                  <div class="flex items-start gap-3">
                    <!-- 체크박스 (비활성화) -->
                    <input
                      type="checkbox"
                      disabled
                      class="w-5 h-5 text-blue-600 border-gray-300 rounded mt-0.5 flex-shrink-0 opacity-50"
                    />
                    
                    <!-- 텍스트 입력 필드 -->
                    <div class="flex-1">
                      <input
                        v-model="newItemText"
                        @keydown.enter="confirmAddItem"
                        @keydown.escape="cancelAddItem"
                        type="text"
                        placeholder="항목을 입력하세요..."
                        class="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ref="newItemInputRef"
                      />
                    </div>
                  </div>
                  
                  <!-- 확인/취소 버튼 -->
                  <div class="flex items-center justify-end gap-2 mt-3">
                    <button
                      @click="cancelAddItem"
                      class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      @click="confirmAddItem"
                      :disabled="!newItemText.trim()"
                      class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            </div>

          <!-- 그룹 추가 / 항목 추가 버튼 (하단 고정) -->
          <div class="px-4 pb-4 pt-2 border-t border-gray-200 bg-white flex-shrink-0 space-y-2">
            <!-- 그룹 추가 버튼 -->
            <button
              v-if="!isAddingGroup && !isAddingNewItem"
              @click="startAddingGroup"
              class="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <i class="bi bi-folder-plus text-lg"></i>
              <span>그룹 추가</span>
            </button>
            
            <!-- 항목 추가 버튼 (전역, 첫 번째 그룹에 추가) -->
            <button
              v-if="!isAddingNewItem && !isAddingGroup && checklist?.groups && checklist.groups.length > 0"
              @click="startAddingItem"
              class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <i class="bi bi-plus-lg text-xl text-white"></i>
              <span>항목 추가</span>
              <span class="text-xs bg-blue-500 px-2 py-0.5 rounded">
                {{ checklist.groups[0]?.groupName }}
              </span>
            </button>
          </div>
        </div>
        </article>

      <!-- Article 2: 채팅 영역 (하단, 채팅 노출 조건 만족 시 렌더링) -->
      <article
        v-if="checklist && shouldShowChatArea"
        class="checklist-detail-chat"
        :class="{ 'checklist-detail-chat--open': isChatOpen, 'checklist-detail-chat--closed': !isChatOpen }"
      >
        <!-- 채팅 열림 상태: 전체 채팅 UI -->
        <div v-if="isChatOpen" class="checklist-detail-chat-wrapper">
          <!-- 채팅 헤더 -->
          <div class="flex items-center justify-between p-3 border-b border-gray-200 bg-white flex-shrink-0">
            <div class="flex items-center gap-2">
              <i class="bi bi-chat-dots text-blue-600"></i>
              <h3 class="text-sm font-semibold text-gray-700">{{ chatTitle }}</h3>
              <span v-if="checklistChats.length > 0" class="text-xs text-gray-500">
                ({{ checklistChats.length }})
              </span>
            </div>
            <button
              @click="toggleChat"
              class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
              title="채팅 닫기"
            >
              <i class="bi bi-chevron-down"></i>
            </button>
          </div>

          <!-- 채팅 메시지 영역 (시간 순 로그 스타일, 스크롤 가능, 입력창 위 공간만 사용) -->
          <div 
            class="checklist-detail-chat-messages" 
            ref="chatMessagesAreaRef"
          >
            <!-- 채팅 메시지 (Firestore 구조 기준, 시간 순 로그 스타일) -->
            <div
              v-for="chat in checklistChats"
              :key="chat.id"
              class="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-b-0 group hover:bg-gray-50 transition-colors"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-400 font-mono">{{ formatChatTime(chat.createdAt) }}</span>
                <span class="text-xs text-gray-500 font-medium">{{ getMemberName(chat.userId) }}</span>
                <span v-if="isPendingMember(chat.userId)" class="text-xs text-orange-500 font-medium">(대기중)</span>
              </div>
              <div 
                class="text-sm leading-relaxed"
                :style="{ color: getMemberColor(chat.userId) || '#666' }"
              >
                {{ chat.message }}
              </div>
            </div>
            
            <!-- 채팅 메시지가 없을 때 -->
            <div v-if="checklistChats.length === 0" class="text-center text-gray-400 py-12">
              <i class="bi bi-chat-dots text-4xl mb-2 block opacity-50"></i>
              <p class="text-sm">채팅 메시지가 없습니다.</p>
              <p class="text-xs mt-1">메시지를 입력해보세요.</p>
            </div>
          </div>

          <!-- 채팅 입력창 (하단 고정) -->
          <div class="checklist-detail-chat-input">
            <!-- 이모지 선택 바 -->
            <div 
              v-if="isEmojiPickerOpen" 
              class="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg flex flex-wrap gap-2"
            >
              <button
                v-for="emoji in emojiList"
                :key="emoji"
                @click="insertEmoji(emoji)"
                class="text-2xl hover:scale-110 transition-transform p-1 rounded hover:bg-gray-200"
                :title="emoji"
              >
                {{ emoji }}
              </button>
            </div>
            
            <form @submit.prevent="handleChatSend" class="flex items-center gap-2">
              <!-- 이모지 버튼 -->
              <button
                type="button"
                @click="toggleEmojiPicker"
                class="px-3 py-2.5 text-xl hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                title="이모지"
              >
                😀
              </button>
              
              <input
                ref="chatInputRef"
                v-model="chatInput"
                type="text"
                placeholder="메시지를 입력하세요..."
                class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-0"
                @focus="scrollToBottom"
              />
              <button
                type="submit"
                class="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                :disabled="!chatInput.trim() || isSendingChat"
                title="전송"
              >
                <i class="bi bi-send text-white"></i>
              </button>
            </form>
          </div>
        </div>
        
        <!-- 채팅 닫힘 상태: 토글 버튼 (채팅이 닫혀 있을 때만 표시) -->
        <div v-if="!isChatOpen" class="checklist-detail-chat-toggle">
          <button
            @click="toggleChat"
            class="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            <div class="flex items-center gap-2">
              <i class="bi bi-chat-dots text-blue-600 text-lg"></i>
              <span class="text-sm font-medium text-gray-700">{{ chatTitle }}</span>
              <span v-if="checklistChats.length > 0" class="text-xs text-gray-500">
                ({{ checklistChats.length }})
              </span>
            </div>
            <i class="bi bi-chevron-up text-gray-400"></i>
          </button>
        </div>
      </article>
      </div>
    </div>

    <!-- 바텀시트 오버레이 (공통) -->
    <transition name="fade-dimd">
      <div
        v-if="activeBottomSheet !== 'none'"
        class="fixed inset-0 bg-black bg-opacity-50 z-50"
        @click="closeBottomSheet"
      ></div>
    </transition>

    <!-- 정렬 Bottom Sheet -->
    <transition name="slide-up">
      <div
        v-if="activeBottomSheet === 'sort'"
        class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50"
        @click.stop
      >
        <div class="p-6">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">정렬 방식</h2>
            <button
              @click="closeBottomSheet"
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 정렬 옵션 목록 -->
          <div class="space-y-2">
            <button
              @click="selectSortOption('assignee')"
              class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all"
              :class="selectedSortOption === 'assignee' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'"
            >
              <span class="font-medium">담당자별 정렬</span>
              <i
                v-if="selectedSortOption === 'assignee'"
                class="bi bi-check-circle-fill text-blue-500 text-xl"
              ></i>
            </button>

            <button
              @click="selectSortOption('default')"
              class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all"
              :class="selectedSortOption === 'default' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'"
            >
              <span class="font-medium">기본 순서</span>
              <i
                v-if="selectedSortOption === 'default'"
                class="bi bi-check-circle-fill text-blue-500 text-xl"
              ></i>
            </button>

            <button
              @click="selectSortOption('completed')"
              class="w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all"
              :class="selectedSortOption === 'completed' 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50'"
            >
              <span class="font-medium">체크 완료 순</span>
              <i
                v-if="selectedSortOption === 'completed'"
                class="bi bi-check-circle-fill text-blue-500 text-xl"
              ></i>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 설정 Bottom Sheet -->
    <transition name="slide-up">
      <div
        v-if="activeBottomSheet === 'settings'"
        class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">설정</h2>
            <button
              @click="closeBottomSheet"
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 멤버 목록 영역 (members는 userId 배열이므로 제한적 표시) -->
          <section class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">멤버</h3>
            <div class="space-y-3">
              <!-- 오너 표시 -->
              <div v-if="checklist" class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                  {{ checklist.ownerId.charAt(0).toUpperCase() }}
                </div>
                <span class="text-base text-gray-800 font-medium">{{ checklist.ownerId }} (오너)</span>
              </div>
              <!-- 멤버 목록 (userId와 role 표시) -->
              <div
                v-for="member in validMembers"
                :key="member.userId"
                class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div class="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm font-semibold">
                  {{ getMemberInitial(member.userId) }}
                </div>
                <span class="text-base text-gray-800 font-medium">{{ getMemberName(member.userId) }}</span>
                <span class="text-xs text-gray-500">({{ member.role === 'admin' ? '운영자' : '멤버' }})</span>
              </div>
            </div>
          </section>

          <!-- 체크리스트 삭제 버튼 (오너일 때만 표시) -->
          <section v-if="isOwner" class="pt-4 border-t border-gray-200">
            <button
              @click="handleDeleteChecklist"
              class="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              <i class="bi bi-trash mr-2 text-white"></i>
              체크리스트 삭제
            </button>
          </section>
        </div>
      </div>
    </transition>

    <!-- 오너모드 Bottom Sheet -->
    <transition name="slide-up">
      <div
        v-if="activeBottomSheet === 'ownerMode'"
        class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">오너모드</h2>
            <button
              @click="closeBottomSheet"
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 제목 수정 -->
          <section class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              제목
            </label>
            <input
              v-model="editForm.title"
              type="text"
              placeholder="체크리스트 제목을 입력하세요"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </section>

          <!-- 부제(설명) 수정 -->
          <section class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              부제 (설명)
            </label>
            <textarea
              v-model="editForm.description"
              placeholder="체크리스트 설명을 입력하세요"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            ></textarea>
          </section>

          <!-- 종료일 수정 -->
          <section class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              종료일
            </label>
            <input
              v-model="editForm.dueDate"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div class="mt-2 flex items-center gap-2">
              <button
                @click="clearDueDate"
                class="text-sm text-red-600 hover:text-red-700 underline"
              >
                종료일 제거
              </button>
            </div>
          </section>

          <!-- 멤버별 담당자 컬러 지정 -->
          <section class="mb-6">
            <label class="block text-sm font-semibold text-gray-700 mb-3">
              멤버별 컬러 지정
            </label>
            <div class="space-y-3">
              <!-- 오너 컬러 -->
              <div v-if="checklist" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    :style="{ backgroundColor: getMemberColor(checklist.ownerId) }"
                  >
                    {{ getMemberInitial(checklist.ownerId) }}
                  </div>
                  <span class="text-sm text-gray-800 font-medium">
                    {{ getMemberName(checklist.ownerId) }} (오너)
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    @click="updateMemberColor(checklist.ownerId, color)"
                    class="w-6 h-6 rounded-full border-2 transition-all"
                    :class="getMemberColor(checklist.ownerId) === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-110'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                  ></button>
                </div>
              </div>
              
              <!-- 멤버 컬러 -->
              <div
                v-for="member in validMembers"
                :key="member.userId"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div 
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                    :style="{ backgroundColor: getMemberColor(member.userId) }"
                  >
                    {{ getMemberInitial(member.userId) }}
                  </div>
                  <span class="text-sm text-gray-800 font-medium">
                    {{ getMemberName(member.userId) }}
                  </span>
                  <span class="text-xs text-gray-500">({{ member.role === 'admin' ? '운영자' : '멤버' }})</span>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-for="color in colorPresets"
                    :key="color"
                    @click="updateMemberColor(member.userId, color)"
                    class="w-6 h-6 rounded-full border-2 transition-all"
                    :class="getMemberColor(member.userId) === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-110'"
                    :style="{ backgroundColor: color }"
                    :title="color"
                  ></button>
                </div>
              </div>
            </div>
          </section>

          <!-- 체크리스트 삭제 버튼 -->
          <section class="pt-4 border-t border-gray-200">
            <button
              @click="saveChecklistChanges"
              :disabled="isSaving"
              class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              <span v-if="isSaving">저장 중...</span>
              <span v-else>저장</span>
            </button>
            <button
              v-if="isOwner"
              @click="handleDeleteChecklist"
              class="w-full py-3 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
            >
              <i class="bi bi-trash mr-2"></i>
              체크리스트 삭제
            </button>
          </section>
        </div>
      </div>
    </transition>

    <!-- 항목 설정 Bottom Sheet -->
    <transition name="slide-up">
      <div
        v-if="activeBottomSheet === 'itemSettings' && selectedItemIndex !== null"
        class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">항목 설정</h2>
            <button
              @click="closeBottomSheet"
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 항목 제목 표시 -->
          <div class="mb-6 pb-4 border-b border-gray-200">
            <p class="text-sm text-gray-500 mb-1">항목</p>
            <p class="text-base font-medium text-gray-800">
              {{ checklistItems[selectedItemIndex]?.title }}
            </p>
          </div>

          <!-- 담당자 지정 섹션 -->
          <section class="mb-6">
            <h3 class="text-sm font-semibold text-gray-700 mb-4">담당자 지정</h3>
            <div class="space-y-2">
              <!-- 담당자 없음 옵션 -->
              <label
                class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                :class="checklistItems[selectedItemIndex]?.assigneeId === null
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  :value="null"
                  :checked="checklistItems[selectedItemIndex]?.assigneeId === null"
                  @change="updateItemAssignee(null)"
                  class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex items-center gap-2 flex-1">
                  <div class="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                  <span class="text-base text-gray-800">담당자 없음</span>
                </div>
              </label>

              <!-- 오너도 담당자로 선택 가능 -->
              <label
                v-if="checklist"
                class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                :class="checklistItems[selectedItemIndex]?.assigneeId === checklist.ownerId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  :value="checklist.ownerId"
                  :checked="checklistItems[selectedItemIndex]?.assigneeId === checklist.ownerId"
                  @change="updateItemAssignee(checklist.ownerId)"
                  class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                    {{ checklist.ownerId.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-base text-gray-800">{{ checklist.ownerId }} (오너)</span>
                </div>
              </label>

              <!-- 멤버 목록 (라디오 버튼) - members는 { userId, role } 배열 -->
              <label
                v-for="member in validMembers"
                :key="member.userId"
                class="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                :class="checklistItems[selectedItemIndex]?.assigneeId === member.userId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'"
              >
                <input
                  type="radio"
                  :value="member.userId"
                  :checked="checklistItems[selectedItemIndex]?.assigneeId === member.userId"
                  @change="updateItemAssignee(member.userId)"
                  class="w-5 h-5 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                    {{ getMemberInitial(member.userId) }}
                  </div>
                  <span class="text-base text-gray-800">{{ getMemberName(member.userId) }}</span>
                  <span class="text-xs text-gray-500">({{ member.role === 'admin' ? '운영자' : '멤버' }})</span>
                </div>
              </label>
            </div>
          </section>
        </div>
      </div>
    </transition>

    <!-- 초대하기 Bottom Sheet -->
    <transition name="slide-up">
      <div
        v-if="activeBottomSheet === 'invite'"
        class="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
        @click.stop
      >
        <div class="p-6">
          <!-- 헤더 -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-800">초대하기</h2>
            <button
              @click="closeBottomSheet"
              class="p-2 text-gray-500 hover:text-gray-700 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <i class="bi bi-x-lg text-xl"></i>
            </button>
          </div>

          <!-- 최대 인원 안내 -->
          <div v-if="isMaxParticipantsReached" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600 text-center">
              최대 참가 인원({{ checklist?.maxParticipants || 0 }}명)에 도달했습니다.
            </p>
          </div>

          <!-- 탭 선택 -->
          <div class="flex gap-2 mb-4 border-b border-gray-200">
            <button
              @click="inviteTab = 'email'"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :class="inviteTab === 'email' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              이메일 초대
            </button>
            <button
              @click="inviteTab = 'friend'"
              class="flex-1 py-2 text-sm font-medium transition-colors"
              :class="inviteTab === 'friend' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              친구 초대
            </button>
          </div>

          <!-- 이메일 초대 탭 -->
          <div v-if="inviteTab === 'email'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">이메일 주소</label>
              <input
                v-model="inviteEmail"
                type="email"
                placeholder="example@email.com"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @keydown.enter="handleEmailInvite"
              />
            </div>
            <button
              @click="handleEmailInvite"
              :disabled="!inviteEmail.trim() || isMaxParticipantsReached || isInviting"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {{ isInviting ? '초대 중...' : '초대하기' }}
            </button>
          </div>

          <!-- 친구 초대 탭 -->
          <div v-if="inviteTab === 'friend'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">검색</label>
              <input
                v-model="friendSearchQuery"
                type="text"
                placeholder="이메일 또는 닉네임으로 검색"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div class="max-h-60 overflow-y-auto">
              <div v-if="filteredFriends.length === 0" class="text-center py-8 text-gray-500">
                <p class="text-sm">검색 결과가 없습니다.</p>
              </div>
              <div
                v-for="friend in filteredFriends"
                :key="friend.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-semibold">
                    {{ friend.name?.charAt(0).toUpperCase() || '?' }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ friend.name || friend.email }}</p>
                    <p class="text-xs text-gray-500">{{ friend.email }}</p>
                  </div>
                </div>
                <button
                  @click="handleFriendInvite(friend)"
                  :disabled="isMaxParticipantsReached || isInviting"
                  class="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  초대
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { getChecklist, updateChecklist } from "@/services/checklists";
import { getItems, createItem, deleteItem as deleteItemService, updateItem } from "@/services/items";
import { getChats, createChat } from "@/services/chats";
import { getUserProfile } from "@/services/userService";
import { getProgressColor } from "@/utils/progressColor";
import type { Checklist } from "@/types/checklist";
import type { Chat } from "@/types/chat";
import type { Timestamp } from "firebase/firestore";
import { collection, query, where, orderBy, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const router = useRouter();
const route = useRoute();
const { currentUser } = useAuth();

// 바텀시트 단일 활성 상태 (single source of truth)
type BottomSheetType = 'none' | 'sort' | 'settings' | 'memberColor' | 'itemSettings' | 'ownerMode' | 'invite';
const activeBottomSheet = ref<BottomSheetType>('none');

// 현재 선택된 항목 인덱스 (항목 설정 바텀시트용)
const selectedItemIndex = ref<number | null>(null);

// 오너 여부 계산
const isOwner = computed(() => {
  if (!checklist.value || !currentUser.value) return false;
  return checklist.value.ownerId === currentUser.value.uid;
});

// Admin 여부 계산
const isAdmin = computed(() => {
  if (!checklist.value || !currentUser.value) return false;
  const member = checklist.value.members?.find(m => m.userId === currentUser.value?.uid);
  return member?.role === 'admin';
});

// 오너 또는 Admin 여부 계산
const isOwnerOrAdmin = computed(() => {
  return isOwner.value || isAdmin.value;
});

// 체크리스트 데이터 (Firestore에서 가져옴)
const checklist = ref<Checklist | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// 체크리스트 제목 (computed)
const checklistTitle = computed(() => {
  return checklist.value?.title || "";
});

// computed 스타일 제거: CSS 클래스로 대체

// 채팅 타이틀 텍스트 (computed)
// 하단 영역은 항상 "채팅" 전용 (나의 메모 UI 제거)
const chatTitle = computed(() => {
  return '채팅';
});

// 채팅 상태 (기본적으로 열린 상태)
const isChatOpen = ref(true);
const chatInput = ref("");
const chatInputRef = ref<HTMLInputElement | null>(null);
const chatMessagesAreaRef = ref<HTMLElement | null>(null);
const isSendingChat = ref(false); // 채팅 전송 중복 방지 플래그
const chatSnapshotUnsubscribe = ref<Unsubscribe | null>(null); // Firestore snapshot listener unsubscribe 함수

// 이모지 관련 상태
const isEmojiPickerOpen = ref(false);
const emojiList = ['👍', '✅', '❗', '🔥', '🎯', '🙆‍♂️', '⏰', '📌', '❌', '❤️'];

// 이모지 선택 바 토글
const toggleEmojiPicker = () => {
  isEmojiPickerOpen.value = !isEmojiPickerOpen.value;
};

// 이모지 삽입
const insertEmoji = (emoji: string) => {
  if (!chatInputRef.value) return;
  
  const input = chatInputRef.value;
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || 0;
  const textBefore = chatInput.value.substring(0, start);
  const textAfter = chatInput.value.substring(end);
  
  // 이모지를 현재 커서 위치에 삽입
  chatInput.value = textBefore + emoji + textAfter;
  
  // 커서 위치를 삽입된 이모지 뒤로 이동
  setTimeout(() => {
    if (chatInputRef.value) {
      const newPosition = start + emoji.length;
      chatInputRef.value.setSelectionRange(newPosition, newPosition);
      chatInputRef.value.focus();
    }
  }, 0);
};

// 수정일 표시 여부 (오너모드에서 옵션 변경 시에만 true)
const showUpdatedAt = ref(false);

// 참여자 툴팁 표시 여부
const showParticipantTooltip = ref(false);
const toggleParticipantTooltip = () => {
  showParticipantTooltip.value = !showParticipantTooltip.value;
};

// 최대 인원 초과 여부 확인
const isMaxParticipantsReached = computed(() => {
  if (!checklist.value || !checklist.value.maxParticipants) return false;
  const currentParticipants = participantCount.value;
  return currentParticipants >= checklist.value.maxParticipants;
});

// 참여자 수 계산 (computed)
const participantCount = computed(() => {
  if (!checklist.value) return 0;
  
  // ownerId 1명
  let count = 1;
  
  // members 배열 중 ownerId와 다른 사용자만 카운트 (중복 제거)
  if (checklist.value.members && Array.isArray(checklist.value.members)) {
    const ownerId = checklist.value.ownerId;
    const uniqueMembers = checklist.value.members.filter(member => {
      if (!member || typeof member !== 'object' || !member.userId) return false;
      return member.userId !== ownerId; // ownerId와 다른 사용자만
    });
    count += uniqueMembers.length;
  }
  
  return count;
});

// 유효한 멤버 목록 필터링 (computed)
// ownerId와 다른 사용자만 반환 (중복 제거)
const validMembers = computed(() => {
  if (!checklist.value || !checklist.value.members) return [];
  const ownerId = checklist.value.ownerId;
  return checklist.value.members.filter(member => {
    if (!member || typeof member !== 'object' || !member.userId || typeof member.userId !== 'string' || member.userId.trim() === '') {
      return false;
    }
    return member.userId !== ownerId; // ownerId와 다른 사용자만
  });
});

// 초대 관련 상태
const inviteTab = ref<'email' | 'friend'>('email');
const inviteEmail = ref('');
const friendSearchQuery = ref('');
const isInviting = ref(false);
const friends = ref<Array<{ id: string; email: string; name?: string }>>([]); // TODO: 친구 목록 로드

// 필터링된 친구 목록
const filteredFriends = computed(() => {
  if (!friendSearchQuery.value.trim()) return friends.value;
  const query = friendSearchQuery.value.toLowerCase();
  return friends.value.filter(friend => 
    friend.email.toLowerCase().includes(query) || 
    friend.name?.toLowerCase().includes(query)
  );
});

// 초대 모달 열기
const openInviteModal = () => {
  if (isMaxParticipantsReached.value) {
    alert("최대 참가 인원에 도달했습니다.");
    return;
  }
  inviteTab.value = 'email';
  inviteEmail.value = '';
  friendSearchQuery.value = '';
  openBottomSheet('invite');
};

// 이메일 초대 처리
const handleEmailInvite = async () => {
  if (!inviteEmail.value.trim() || isMaxParticipantsReached.value || isInviting.value) return;
  
  // TODO: 이메일로 사용자 검색 및 초대 로직 구현
  // 1. 이메일로 사용자 검색 (이미 가입된 사용자만)
  // 2. members 배열에 추가 (role: 'member' 기본값)
  // 3. Firestore 업데이트
  
  console.log("[ChecklistDetailView] 이메일 초대:", inviteEmail.value);
  alert("이메일 초대 기능은 다음 단계에서 구현됩니다.");
  inviteEmail.value = '';
};

// 친구 초대 처리
const handleFriendInvite = async (friend: { id: string; email: string; name?: string }) => {
  if (isMaxParticipantsReached.value || isInviting.value) return;
  
  // TODO: 친구 초대 로직 구현
  // 1. members 배열에 추가 (role: 'member' 기본값)
  // 2. Firestore 업데이트
  
  console.log("[ChecklistDetailView] 친구 초대:", friend);
  alert("친구 초대 기능은 다음 단계에서 구현됩니다.");
};

// 정렬 옵션
const selectedSortOption = ref<'assignee' | 'default' | 'completed'>('default');

// 새 항목 추가 상태
const isAddingNewItem = ref(false);
const newItemText = ref("");
const newItemInputRef = ref<HTMLInputElement | null>(null);
const isCreatingItem = ref(false); // 항목 생성 중복 방지 플래그

// 그룹 관리 상태
interface Group {
  groupId: string;
  groupName: string;
  order: number;
}

const groups = ref<Group[]>([]); // 로컬 그룹 목록
const selectedGroupId = ref<string | null>(null); // 선택된 그룹 ID
const isAddingGroup = ref(false); // 그룹 추가 모드
const newGroupName = ref(""); // 새 그룹명 입력
const newGroupInputRef = ref<HTMLInputElement | null>(null); // 그룹명 입력 필드 참조

// 체크 항목 리스트 (Firestore에서 가져옴)
// Firestore 구조: id, checklistId, title, isChecked, assigneeId: string | null, memo?: string, createdAt, groupId?, groupName?
// 현재 Item 타입과 다르므로 변환 필요: name -> title, isDone -> isChecked, assignedTo -> assigneeId
interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isChecked: boolean;
  assigneeId: string | null;
  memo?: string;
  createdAt: Timestamp | Date;
  isMemoOpen?: boolean; // UI 상태: 메모 입력창 열림/닫힘
  groupId?: string; // 그룹 ID (UI 그룹 렌더링 기준)
  groupName?: string; // 그룹명 (UI 그룹 렌더링 기준)
}

const checklistItems = ref<ChecklistItem[]>([]);

// 체크리스트 채팅 메시지 (Firestore에서 가져옴)
const checklistChats = ref<Chat[]>([]);

// 바텀시트 열기 (단일 함수)
// 오너모드 수정 폼 데이터
const editForm = ref({
  title: '',
  description: '',
  dueDate: '', // YYYY-MM-DD 형식
});

// 저장 중 상태
const isSaving = ref(false);

const openBottomSheet = (type: BottomSheetType) => {
  // 기존에 열려 있던 바텀시트가 있으면 먼저 닫고 새로 열기
  activeBottomSheet.value = type;
  console.log(`[ChecklistDetailView] 바텀시트 열기: ${type}`);
  
  // 오너모드 바텀시트 열 때 폼 데이터 초기화
  if (type === 'ownerMode' && checklist.value) {
    editForm.value.title = checklist.value.title;
    editForm.value.description = checklist.value.description || '';
    // dueDate를 YYYY-MM-DD 형식으로 변환
    if (checklist.value.dueDate) {
      const dueDate = checklist.value.dueDate.toDate();
      const year = dueDate.getFullYear();
      const month = String(dueDate.getMonth() + 1).padStart(2, '0');
      const day = String(dueDate.getDate()).padStart(2, '0');
      editForm.value.dueDate = `${year}-${month}-${day}`;
    } else {
      editForm.value.dueDate = '';
    }
  }
};

// 바텀시트 닫기 (단일 함수)
const closeBottomSheet = () => {
  activeBottomSheet.value = 'none';
  console.log('[ChecklistDetailView] 바텀시트 닫기');
};


// 멤버 컬러 프리셋
const colorPresets = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
];

// 멤버 컬러 저장 (로컬 스토리지 또는 메모리)
const memberColorsCache = ref<Map<string, string>>(new Map());

// 멤버 컬러 업데이트
const updateMemberColor = (userId: string | null | undefined, color: string) => {
  // userId 검증
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.warn("[ChecklistDetailView] updateMemberColor: 유효하지 않은 userId:", userId);
    return;
  }
  
  if (!color || typeof color !== 'string') {
    console.warn("[ChecklistDetailView] updateMemberColor: 유효하지 않은 color:", color);
    return;
  }
  memberColorsCache.value.set(userId, color);
  // TODO: Firestore에 저장 (checklist.membersRoles 또는 별도 컬렉션)
  console.log(`[ChecklistDetailView] 멤버 ${userId} 컬러 업데이트:`, color);
};

// 체크리스트 삭제 처리
const handleDeleteChecklist = () => {
  const confirmed = confirm("정말로 이 체크리스트를 삭제하시겠습니까?\n삭제된 체크리스트는 복구할 수 없습니다.");
  if (confirmed) {
    console.log("[ChecklistDetailView] 체크리스트 삭제 확인됨");
    // 실제 삭제 로직은 나중에 추가
    closeBottomSheet();
  } else {
    console.log("[ChecklistDetailView] 체크리스트 삭제 취소됨");
  }
};

// 종료일 제거
const clearDueDate = () => {
  editForm.value.dueDate = '';
};

// 체크리스트 변경사항 저장
const saveChecklistChanges = async () => {
  if (!checklist.value) return;
  
  // 제목 검증
  if (!editForm.value.title.trim()) {
    alert('제목을 입력해주세요.');
    return;
  }
  
  try {
    isSaving.value = true;
    
    // dueDate 처리: 빈 문자열이면 null, 있으면 Date 객체로 변환
    let dueDate: Date | null = null;
    if (editForm.value.dueDate.trim()) {
      dueDate = new Date(editForm.value.dueDate);
      if (isNaN(dueDate.getTime())) {
        alert('올바른 날짜 형식이 아닙니다.');
        isSaving.value = false;
        return;
      }
    }
    
    // Firestore 업데이트
    await updateChecklist(checklist.value.id, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || '',
      dueDate: dueDate,
    });
    
    console.log('[ChecklistDetailView] 체크리스트 업데이트 성공 (오너모드 옵션 변경)');
    
    // 수정일 표시 플래그 설정 (오너모드에서 옵션 변경 시에만)
    showUpdatedAt.value = true;
    
    // 바텀시트 닫기
    closeBottomSheet();
    
    // 데이터 다시 로드하여 최신 상태 반영
    await loadChecklistData();
  } catch (err) {
    console.error('[ChecklistDetailView] 체크리스트 업데이트 실패:', err);
    alert('체크리스트 업데이트에 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
  } finally {
    isSaving.value = false;
  }
};

// 채팅 토글
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  console.log(`[ChecklistDetailView] 채팅 ${isChatOpen.value ? '열림' : '닫힘'}`);
  if (isChatOpen.value) {
    // 채팅이 열릴 때 스크롤을 맨 아래로
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }
};

// handleChatInputEnter 제거 - handleChatSend를 직접 호출하도록 변경

// loadChatsOnly 함수 제거: Firestore snapshot listener가 실시간 업데이트를 처리

// 채팅 전송 (form @submit 단일 진입점)
// Firestore write만 수행하고, onSnapshot listener가 자동으로 상태를 갱신함
const handleChatSend = async (event?: Event) => {
  // form 기본 동작 방지 (이미 @submit.prevent로 처리되지만 이중 방어)
  if (event) {
    event.preventDefault();
  }
  
  // 1. 중복 호출 방지
  if (isSendingChat.value) {
    console.log("[CHAT] 이미 전송 중입니다. 중복 호출 차단");
    return;
  }
  
  // 플래그 설정
  isSendingChat.value = true;
  
  try {
    // 2. 채팅 노출 조건 확인
    if (!checklist.value || !shouldShowChatArea.value) {
      console.warn("[ChecklistDetailView] 채팅 노출 조건 미충족:", {
        chatEnabled: checklist.value?.chatEnabled,
        status: (checklist.value as any)?.status,
        completedAt: (checklist.value as any)?.completedAt,
      });
      return;
    }

    // 3. 입력값 검증
    const messageText = chatInput.value.trim();
    
    if (!messageText) {
      console.warn("[ChecklistDetailView] 채팅 메시지가 비어있습니다.");
      return;
    }

    // 4. 입력 필드 초기화 (메시지 텍스트 저장 후 단 한 번만 수행)
    chatInput.value = "";
    console.log("[CHAT] 입력 필드 초기화 완료");

    // 5. auth.uid 존재 여부 확인
    if (!currentUser.value || !currentUser.value.uid) {
      console.error("[ChecklistDetailView] 사용자 인증 정보가 없습니다. currentUser:", currentUser.value);
      return;
    }

    // 6. checklistId 확인
    const routeChecklistId = route.params.id as string;
    const checklistIdFromValue = checklist.value?.id;
    const checklistId = checklistIdFromValue || routeChecklistId;
    
    if (!checklistId) {
      console.error("[ChecklistDetailView] 체크리스트 ID가 없습니다:", {
        routeParamsId: routeChecklistId,
        checklistValueId: checklistIdFromValue,
        checklist: checklist.value,
      });
      return;
    }

    // senderId는 반드시 auth.currentUser.uid 사용
    const senderId = currentUser.value.uid;

    console.log("[CHAT] handleChatSend 호출 시작:", {
      senderId,
      checklistId,
      text: messageText,
    });

    // Firestore에 채팅 저장 (onSnapshot listener가 자동으로 상태를 갱신함)
    await createChat({
      checklistId: checklistId,
      userId: senderId,
      message: messageText,
    });

    console.log("[CHAT] Firestore write 성공");
    
    // onSnapshot listener가 자동으로 메시지를 추가하고 스크롤 처리함
  } catch (err) {
    // 에러 로그만 출력 (롤백 로직 없음)
    console.error("[ChecklistDetailView] 채팅 전송 실패:", {
      error: err,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      errorMessage: err instanceof Error ? err.message : String(err),
      errorStack: err instanceof Error ? err.stack : undefined,
    });
  } finally {
    // 중복 호출 방지 플래그 해제
    isSendingChat.value = false;
    console.log("[CHAT] handleChatSend 완료");
  }
};

// 채팅 시간 포맷팅 (HH:mm 또는 YYYY.MM.DD HH:mm)
const formatChatTime = (createdAt: Timestamp | Date): string => {
  const date = createdAt instanceof Date ? createdAt : createdAt.toDate();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  
  // 오늘인 경우: HH:mm만 표시
  if (messageDate.getTime() === today.getTime()) {
    return timeStr;
  } else {
    // 오늘이 아닌 경우: YYYY.MM.DD HH:mm 형식
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day} ${timeStr}`;
  }
};

// 채팅 영역 스크롤을 맨 아래로
const scrollToBottom = () => {
  // ref를 우선 사용, 없으면 querySelector 사용
  const chatMessagesArea = chatMessagesAreaRef.value || document.querySelector(".checklist-detail-chat-messages");
  if (chatMessagesArea) {
    chatMessagesArea.scrollTop = chatMessagesArea.scrollHeight;
    console.log("[CHAT] 스크롤 위치:", {
      scrollTop: chatMessagesArea.scrollTop,
      scrollHeight: chatMessagesArea.scrollHeight,
      clientHeight: chatMessagesArea.clientHeight,
    });
  } else {
    console.warn("[CHAT] 채팅 메시지 영역을 찾을 수 없습니다.");
  }
};

// 날짜 포맷팅
const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

// 진행도 계산
const completedCount = computed(() => {
  return checklistItems.value.filter(item => item.isChecked).length;
});

const totalCount = computed(() => {
  return checklistItems.value.length;
});

// 진행도 계산 (items 기준 자동 계산)
// checklist.progress는 items 기준으로 계산된 값과 동기화
// UI에서는 항상 items 기준으로 계산된 progressPercentage를 표시
const progressPercentage = computed(() => {
  if (totalCount.value === 0) return 0;
  return Math.round((completedCount.value / totalCount.value) * 100);
});

// 진행률 컬러 계산 (동적 반응)
const progressColor = computed(() => {
  return getProgressColor(progressPercentage.value);
});

// 채팅 영역 노출 조건 계산
// 체크리스트가 active 또는 completed 상태일 때는 채팅 항상 노출
// completed 상태라도 채팅 유지
// completedAt 기준으로 24시간이 지나면 채팅을 로드하지 않음
const shouldShowChatArea = computed(() => {
  if (!checklist.value) return false;
  
  // chatEnabled가 false면 채팅 영역 숨김
  if (checklist.value.chatEnabled !== true) {
    return false;
  }
  
  const status = (checklist.value as any).status || 'active';
  const completedAt = (checklist.value as any).completedAt;
  
  // active 상태일 때는 항상 채팅 노출
  if (status === 'active') {
    return true;
  }
  
  // completed 상태일 때
  if (status === 'completed') {
    // completedAt이 없으면 채팅 노출 (방어 코드)
    if (!completedAt) {
      return true;
    }
    
    // completedAt 기준으로 24시간이 지났는지 확인
    let completedAtDate: Date | null = null;
    if (completedAt && typeof (completedAt as any).toDate === 'function') {
      completedAtDate = (completedAt as any).toDate();
    } else if (completedAt instanceof Date) {
      completedAtDate = completedAt;
    }
    
    if (!completedAtDate) {
      return true; // 날짜 파싱 실패 시 채팅 노출 (방어 코드)
    }
    
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completedAtDate.getTime()) / (1000 * 60 * 60);
    
    // 24시간 이내면 채팅 노출, 24시간 지났으면 숨김
    return hoursSinceCompletion < 24;
  }
  
  // archived 상태일 때는 채팅 숨김
  if (status === 'archived') {
    return false;
  }
  
  // 기본값: 채팅 노출
  return true;
});

// 그룹 ID 생성 함수 (UUID v4 사용)
const generateGroupId = (): string => {
  return crypto.randomUUID();
};

// checklist.groups 기준으로 아이템 그룹화 (computed)
// 실제 그룹 구분 키는 groupId를 사용하며, groupName은 단순 라벨
const groupedItems = computed(() => {
  if (!checklist.value || !checklist.value.groups || checklist.value.groups.length === 0) {
    return [];
  }
  
  // checklist.groups 기준으로 그룹화
  const groupMap = new Map<string, {
    groupId: string;
    groupName: string;
    items: ChecklistItem[];
  }>();
  
  // 1. checklist.groups를 order 기준으로 정렬하여 추가 (빈 그룹으로 시작)
  const sortedGroups = [...checklist.value.groups].sort((a, b) => a.order - b.order);
  sortedGroups.forEach(group => {
    groupMap.set(group.groupId, {
      groupId: group.groupId,
      groupName: group.groupName,
      items: []
    });
  });
  
  // 2. items를 그룹별로 분류
  // 기존 데이터 보호: groupId가 없는 item은 첫 번째 그룹으로 보정
  const firstGroupId = sortedGroups.length > 0 ? sortedGroups[0]?.groupId : null;
  
  checklistItems.value.forEach(item => {
    // groupId가 없으면 첫 번째 그룹으로 보정 (기존 데이터 보호)
    let groupId = item.groupId;
    if (!groupId) {
      if (firstGroupId) {
        console.warn(`[ChecklistDetailView] Item ${item.id} has no groupId, using first group: ${firstGroupId}`);
        groupId = firstGroupId;
      } else {
        console.warn(`[ChecklistDetailView] Item ${item.id} has no groupId and no groups available`);
        return;
      }
    }
    
    // 그룹이 없으면 스킵 (checklist.groups에 없는 그룹은 표시하지 않음)
    if (!groupMap.has(groupId)) {
      console.warn(`[ChecklistDetailView] Item ${item.id} has unknown groupId: ${groupId}`);
      return;
    }
    
    groupMap.get(groupId)!.items.push(item);
  });
  
  // 그룹 배열로 변환 (order 기준 정렬)
  // 빈 그룹(items.length === 0)은 제외
  const result = sortedGroups
    .map(group => groupMap.get(group.groupId)!)
    .filter(Boolean)
    .filter(group => group.items.length > 0);
  
  console.log(`[ChecklistDetailView] 그룹 렌더링 대상: ${result.length}개 (빈 그룹 제외)`);
  
  return result;
});

// item.id로 checklistItems 배열에서 인덱스 찾기 (헬퍼 함수)
const getItemIndex = (itemId: string): number => {
  return checklistItems.value.findIndex(item => item.id === itemId);
};

// Firestore에서 데이터 로드
const loadChecklistData = async () => {
  const checklistId = route.params.id as string;
  if (!checklistId) {
    error.value = "체크리스트 ID가 없습니다.";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    // 체크리스트 문서 가져오기
    const checklistDoc = await getChecklist(checklistId);
    if (!checklistDoc) {
      error.value = "체크리스트를 찾을 수 없습니다.";
      loading.value = false;
      return;
    }
    checklist.value = checklistDoc;
    
    // 채팅 상태 로그
    console.log("[ChecklistDetailView] 체크리스트 로드 완료 - 채팅 상태:", {
      chatEnabled: checklistDoc.chatEnabled,
      isChatOpen: isChatOpen.value,
    });
    
    // checklist.groups를 로컬 groups에 로드 (Firestore에 있으면 그대로 사용, 없으면 기본 그룹 생성)
    // order 필드가 없으면 인덱스로 보정 (기존 데이터 보호)
    // 기본 체크리스트(isDefault === true)도 일반 체크리스트와 동일하게 처리
    if (checklistDoc.groups && Array.isArray(checklistDoc.groups) && checklistDoc.groups.length > 0) {
      groups.value = checklistDoc.groups
        .filter((g: any) => g && g.groupId && g.groupName) // undefined/null 필터링
        .map((g: any, index: number) => ({
          groupId: g.groupId,
          groupName: g.groupName,
          order: g.order !== undefined && typeof g.order === 'number' ? g.order : index
        }));
    } else {
      // groups가 없거나 빈 배열인 경우, 기본 그룹 1개 생성 (기본 체크리스트 포함)
      groups.value = [{
        groupId: generateGroupId(),
        groupName: '기본 그룹',
        order: 0
      }];
      
      // Firestore에 기본 그룹 저장
      try {
        await updateChecklist(checklistDoc.id, {
          groups: groups.value
        });
        console.log("[ChecklistDetailView] 기본 그룹 자동 생성 완료 (isDefault:", checklistDoc.isDefault, ")");
      } catch (err) {
        console.error("[ChecklistDetailView] 기본 그룹 자동 생성 실패:", err);
      }
    }
    
    // 항목 목록 가져오기 (checklistId 기준)
    const items = await getItems(checklistId);
    
    // 기존 데이터 보호: groupId가 없는 item은 첫 번째 그룹으로 보정
    const firstGroupId = (checklistDoc.groups && checklistDoc.groups.length > 0)
      ? checklistDoc.groups[0]?.groupId
      : null;
    
    // Item 타입을 ChecklistItem 타입으로 변환
    // groupId가 없는 기존 item은 첫 번째 그룹으로 보정 처리
    checklistItems.value = items.map(item => {
      // groupId가 없으면 첫 번째 그룹으로 보정
      let itemGroupId = item.groupId;
      if (!itemGroupId && firstGroupId) {
        console.warn(`[ChecklistDetailView] Item ${item.id} has no groupId, using first group: ${firstGroupId}`);
        itemGroupId = firstGroupId;
        // Firestore에 업데이트 (비동기로 처리, 결과는 기다리지 않음)
        updateItem(item.id, { groupId: firstGroupId }).catch(err => {
          console.error(`[ChecklistDetailView] Failed to update item ${item.id} with groupId:`, err);
        });
      }
      
      return {
        id: item.id,
        checklistId: item.checklistId,
        title: item.name, // name -> title 변환
        isChecked: item.isDone, // isDone -> isChecked 변환
        assigneeId: item.assignedTo, // assignedTo -> assigneeId 변환
        memo: undefined, // Item 타입에 memo가 없으므로 undefined (TODO: Firestore 구조에 맞게 수정 필요)
        createdAt: item.createdAt,
        isMemoOpen: false, // UI 상태 초기화
        groupId: itemGroupId || undefined, // 필수 필드 (보정 처리 후)
        groupName: undefined, // groupName은 저장하지 않음 (checklist.groups에서 가져옴)
      };
    });

    // 채팅 목록은 Firestore snapshot listener로 실시간 업데이트
    // 채팅 노출 조건을 만족하는 경우에만 listener 설정
    if (shouldShowChatArea.value) {
      setupChatSnapshotListener(checklistId);
    } else {
      // 채팅 노출 조건 미충족 시 기존 listener 해제 및 채팅 배열 초기화
      if (chatSnapshotUnsubscribe.value) {
        chatSnapshotUnsubscribe.value();
        chatSnapshotUnsubscribe.value = null;
      }
      checklistChats.value = [];
    }
    
    // 진행도 재계산 (items 기준)
    // 페이지 진입 시 items 기준으로 progress를 다시 계산하여 표시
    await calculateAndSaveProgress();

  } catch (err) {
    console.error("[ChecklistDetailView] 데이터 로드 실패:", err);
    error.value = "데이터를 불러오는 중 오류가 발생했습니다.";
  } finally {
    loading.value = false;
  }
};

// Firestore snapshot listener로 채팅 실시간 업데이트
const setupChatSnapshotListener = (checklistId: string) => {
  // 채팅 노출 조건 확인
  if (!shouldShowChatArea.value) {
    console.log("[CHAT] 채팅 노출 조건 미충족, listener 설정하지 않음:", {
      chatEnabled: checklist.value?.chatEnabled,
      status: (checklist.value as any)?.status,
      completedAt: (checklist.value as any)?.completedAt,
    });
    // 기존 listener가 있으면 해제
    if (chatSnapshotUnsubscribe.value) {
      chatSnapshotUnsubscribe.value();
      chatSnapshotUnsubscribe.value = null;
    }
    // 채팅 배열 초기화 (노출 조건 미충족 시 채팅 숨김)
    checklistChats.value = [];
    return;
  }
  
  // 기존 listener 해제
  if (chatSnapshotUnsubscribe.value) {
    chatSnapshotUnsubscribe.value();
    chatSnapshotUnsubscribe.value = null;
  }
  
  try {
    const q = query(
      collection(db, "chats"),
      where("checklistId", "==", checklistId),
      orderBy("createdAt", "desc")
    );
    
    chatSnapshotUnsubscribe.value = onSnapshot(q, (snapshot) => {
      // Firestore snapshot 데이터만 사용하여 채팅 배열 완전 교체
      const firestoreChats: Chat[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreChats.push({
          id: doc.id,
          checklistId: data.checklistId,
          userId: data.userId,
          message: data.message,
          createdAt: data.createdAt,
          createdAtNum: data.createdAtNum,
          system: data.system || false,
        } as Chat);
      });
      
      // createdAt desc로 가져왔으므로 역순으로 정렬 (오래된 것부터)
      firestoreChats.reverse();
      
      // snapshot 데이터를 단일 소스로 사용하여 완전 교체
      // optimistic update 없이 Firestore 데이터만 사용
      checklistChats.value = firestoreChats;
      
      console.log("[CHAT] snapshot 메시지 반영:", {
        firestoreChatsCount: firestoreChats.length,
      });
      
      // createdAtNum 기준으로 정렬 (오름차순 - 가장 오래된 것부터)
      checklistChats.value.sort((a, b) => {
        const aNum = a.createdAtNum || (a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.toMillis());
        const bNum = b.createdAtNum || (b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.toMillis());
        return aNum - bNum;
      });
      
      // 스크롤을 맨 아래로
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }, (error) => {
      console.error("[CHAT] snapshot listener 에러:", error);
    });
    
    console.log("[CHAT] snapshot listener 설정 완료:", { checklistId });
  } catch (err) {
    console.error("[CHAT] snapshot listener 설정 실패:", err);
  }
};

// 라우트 파라미터 변경 감지 (조회만 수행)
watch(() => route.params.id, () => {
  loadChecklistData();
});

// 컴포넌트 마운트 시 데이터 로드 (조회만 수행)
onMounted(() => {
  // 채팅 초기 상태 로그
  console.log("[ChecklistDetailView] 컴포넌트 마운트 - 채팅 초기 상태:", {
    isChatOpen: isChatOpen.value,
  });
  
  loadChecklistData();
});

// 컴포넌트 언마운트 시 snapshot listener 해제
onUnmounted(() => {
  if (chatSnapshotUnsubscribe.value) {
    chatSnapshotUnsubscribe.value();
    chatSnapshotUnsubscribe.value = null;
    console.log("[CHAT] snapshot listener 해제 완료");
  }
});

// 멤버 상태는 Firestore 구조에 없으므로 제거됨

// 참여자 정보 관리 (이름, 컬러)
interface MemberInfo {
  userId: string;
  nickname: string;
  color: string;
}

const memberInfoCache = ref<Map<string, MemberInfo>>(new Map());

// userId 기반 컬러 생성 (일관성 유지)
// 멤버 컬러 캐시를 우선 사용하고, 없으면 해시 기반 생성
const getMemberColor = (userId: string | null | undefined): string => {
  // userId 검증: undefined/null/빈 문자열 체크
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return '#9CA3AF'; // 기본 회색 반환
  }
  
  // 캐시에 있으면 사용
  if (memberColorsCache.value.has(userId)) {
    return memberColorsCache.value.get(userId)!;
  }
  
  // 캐시에 없으면 해시 기반 생성
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color = colorPresets[Math.abs(hash) % colorPresets.length] || '#9CA3AF';
  // 생성한 컬러를 캐시에 저장
  memberColorsCache.value.set(userId, color);
  return color;
};

// 멤버 이니셜 가져오기
const getMemberInitial = (userId: string | null | undefined): string => {
  // userId 검증: undefined/null/빈 문자열 체크
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return '?';
  }
  
  const info = memberInfoCache.value.get(userId);
  if (info && info.nickname && info.nickname.length > 0) {
    return info.nickname.charAt(0).toUpperCase();
  }
  
  if (userId.length > 0) {
    return userId.charAt(0).toUpperCase();
  }
  
  return '?';
};

// 멤버 이름 가져오기 (uid가 아닌 이름만 반환)
const getMemberName = (userId: string | null | undefined): string => {
  // userId 검증: undefined/null/빈 문자열 체크
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    return '알 수 없음';
  }
  
  const info = memberInfoCache.value.get(userId);
  if (info && info.nickname) {
    return info.nickname;
  }
  // 캐시에 없으면 로딩 중 표시 (프로필이 로드되면 자동 업데이트됨)
  return '로딩 중...';
};

// 초대 대기중인 멤버인지 확인
const isPendingMember = (userId: string): boolean => {
  if (!checklist.value) return false;
  
  // ownerId는 대기중이 아님
  if (userId === checklist.value.ownerId) return false;
  
  // members 배열에 포함되어 있으면 초대 수락한 멤버 (대기중 아님)
  if (checklist.value.members?.some(m => m.userId === userId)) return false;
  
  // pendingMembers 배열에 포함되어 있으면 초대 대기중 상태
  if (checklist.value.pendingMembers && checklist.value.pendingMembers.includes(userId)) {
    return true;
  }
  
  return false;
};

// 멤버 프로필 정보 로드
const loadMemberProfiles = async () => {
  if (!checklist.value) return;
  
  // ownerId 검증 및 추가
  const validUserIds: string[] = [];
  if (checklist.value.ownerId && typeof checklist.value.ownerId === 'string' && checklist.value.ownerId.trim() !== '') {
    validUserIds.push(checklist.value.ownerId);
  }
  
  // members 배열 필터링: undefined/null 제거 및 userId 검증
  if (checklist.value.members && Array.isArray(checklist.value.members)) {
    const validMemberUserIds = checklist.value.members
      .filter(member => member && typeof member === 'object' && member.userId)
      .map(member => member.userId)
      .filter(userId => typeof userId === 'string' && userId.trim() !== '');
    
    validUserIds.push(...validMemberUserIds);
  }
  
  // 이미 로드된 멤버는 스킵
  const userIdsToLoad = validUserIds.filter(userId => userId && !memberInfoCache.value.has(userId));
  
  if (userIdsToLoad.length === 0) return;
  
  // 각 userId에 대해 프로필 정보 가져오기
  for (const userId of userIdsToLoad) {
    // 추가 검증: userId가 유효한지 확인
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.warn(`[ChecklistDetailView] 유효하지 않은 userId 스킵:`, userId);
      continue;
    }
    
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        memberInfoCache.value.set(userId, {
          userId,
          nickname: profile.nickname || '사용자',
          color: getMemberColor(userId),
        });
      } else {
        // 프로필이 없으면 기본값 사용 (이름은 '사용자'로 표시)
        memberInfoCache.value.set(userId, {
          userId,
          nickname: '사용자',
          color: getMemberColor(userId),
        });
      }
    } catch (err) {
      console.error(`[ChecklistDetailView] 멤버 ${userId} 프로필 로드 실패:`, err);
      // 실패 시 기본값 사용 (이름은 '사용자'로 표시)
      memberInfoCache.value.set(userId, {
        userId,
        nickname: '사용자',
        color: getMemberColor(userId),
      });
    }
  }
};

// 체크리스트 데이터 로드 시 멤버 프로필도 함께 로드
watch(() => checklist.value, () => {
  if (checklist.value) {
    loadMemberProfiles();
  }
}, { immediate: true });

// 항목 설정 바텀시트 열기
const openItemSettings = (itemIndex: number) => {
  selectedItemIndex.value = itemIndex;
  openBottomSheet('itemSettings');
  console.log(`[ChecklistDetailView] 항목 설정 열기: 항목 ${itemIndex}`);
};

// 항목 담당자 업데이트 (오너만 가능)
const updateItemAssignee = (userId: string | null) => {
  if (selectedItemIndex.value === null) return;
  
  const item = checklistItems.value[selectedItemIndex.value];
  if (!item) return;

  // 오너 권한 확인
  if (!isOwner.value) {
    console.warn('[ChecklistDetailView] 담당자 지정 권한이 없습니다.');
    return;
  }

  // assigneeId 업데이트
  item.assigneeId = userId;
  console.log(`[ChecklistDetailView] 항목 ${selectedItemIndex.value} 담당자 변경:`, userId || '담당자 없음');
  
  // TODO: Firestore에 저장
  // await updateChecklistItem(item.id, { assigneeId: userId });
  
  // 바텀시트 닫기 (선택사항 - UX에 따라 유지할 수도 있음)
  // closeBottomSheet();
};

// 담당자 컬러는 Firestore 구조에 없으므로 기본 회색 사용


// 정렬 옵션 선택
const selectSortOption = (option: 'assignee' | 'default' | 'completed') => {
  selectedSortOption.value = option;
  console.log("[ChecklistDetailView] 정렬 옵션 선택:", option);
  // 실제 정렬 로직은 나중에 추가
  // 선택 후 Bottom Sheet 닫기 (선택사항)
  // closeBottomSheet();
};

// 진행도 계산 및 저장 함수
const calculateAndSaveProgress = async () => {
  if (!checklist.value) return;
  
  const totalItems = checklistItems.value.length;
  if (totalItems === 0) {
    // 항목이 없으면 progress는 0
    await updateChecklist(checklist.value.id, { progress: 0 });
    return;
  }
  
  const completedItems = checklistItems.value.filter(item => item.isChecked).length;
  const progress = Math.round((completedItems / totalItems) * 100);
  
  try {
    const updateData: any = { progress };
    
    // progress가 100%가 되면 status를 'completed'로 변경하고 completedAt에 현재 시간 저장
    if (progress === 100) {
      const currentStatus = (checklist.value as any).status;
      // 이미 completed 상태가 아니면 상태 변경
      if (currentStatus !== 'completed') {
        updateData.status = 'completed';
        updateData.completedAt = new Date(); // 현재 시간 저장
        console.log("[ChecklistDetailView] 체크리스트 완료 처리:", {
          progress,
          status: 'completed',
          completedAt: updateData.completedAt,
        });
      }
    } else {
      // progress가 100% 미만이면 completed 상태가 아닌 경우 active로 변경
      const currentStatus = (checklist.value as any).status;
      if (currentStatus === 'completed') {
        updateData.status = 'active';
        updateData.completedAt = null; // 완료일 초기화
        console.log("[ChecklistDetailView] 체크리스트 활성화 처리:", {
          progress,
          status: 'active',
        });
      }
    }
    
    await updateChecklist(checklist.value.id, updateData);
    console.log("[ChecklistDetailView] 진행도 업데이트 완료:", {
      completedItems,
      totalItems,
      progress,
      status: updateData.status,
      completedAt: updateData.completedAt,
    });
  } catch (err) {
    console.error("[ChecklistDetailView] 진행도 업데이트 실패:", err);
  }
};

// 체크 항목 체크/해제 토글
const toggleItemChecked = async (index: number) => {
  const item = checklistItems.value[index];
  if (!item) return;
  
  const newCheckedState = !item.isChecked;
  
  try {
    // Optimistic UI: 즉시 UI 업데이트
    item.isChecked = newCheckedState;
    
    // Firestore에 업데이트 (isDone 필드 사용)
    await updateItem(item.id, {
      isDone: newCheckedState,
    });
    
    console.log(`[ChecklistDetailView] 항목 ${index} 체크 상태 변경 성공:`, newCheckedState);
    
    // 진행도 재계산 및 저장
    await calculateAndSaveProgress();
  } catch (err) {
    console.error("[ChecklistDetailView] 항목 체크 상태 변경 실패:", err);
    
    // 실패 시 원상복구
    item.isChecked = !newCheckedState;
    alert("항목 상태 변경에 실패했습니다: " + (err instanceof Error ? err.message : String(err)));
  }
};

// 항목 메모 토글
const toggleItemMemo = (index: number) => {
  if (checklistItems.value[index]?.isChecked) {
    return; // 체크된 항목은 메모 추가 불가
  }
  
  const item = checklistItems.value[index];
  if (item) {
    if (!item.isMemoOpen) {
      item.isMemoOpen = true;
    } else {
      item.isMemoOpen = false;
    }
    console.log(`[ChecklistDetailView] 항목 ${index} 메모 영역 토글:`, item.isMemoOpen);
    
    // 메모 영역이 열릴 때 포커스
    if (item.isMemoOpen) {
      setTimeout(() => {
        const textarea = document.querySelector(`textarea[data-item-index="${index}"]`) as HTMLTextAreaElement;
        if (textarea) {
          textarea.focus();
        }
      }, 100);
    }
  }
};

// 메모 포커스 핸들러
const handleMemoFocus = (index: number) => {
  const item = checklistItems.value[index];
  if (item && !item.isMemoOpen) {
    item.isMemoOpen = true;
  }
};

// 메모 블러 핸들러 (메모가 비어있으면 영역 닫기)
const handleMemoBlur = (index: number) => {
  const item = checklistItems.value[index];
  if (item && !item.memo?.trim()) {
    setTimeout(() => {
      if (item && !item.memo?.trim()) {
        item.isMemoOpen = false;
      }
    }, 200);
  }
  
  // TODO: Firestore에 메모 저장
  // if (item && item.memo) {
  //   await updateItem(item.id, { memo: item.memo });
  // }
};

// 메모 삭제
const clearItemMemo = (index: number) => {
  const item = checklistItems.value[index];
  if (item) {
    item.memo = "";
    item.isMemoOpen = false;
    console.log(`[ChecklistDetailView] 항목 ${index} 메모 삭제됨`);
    
    // TODO: Firestore에 즉시 반영
    // await updateItem(item.id, { memo: "" });
  }
};

// 새 항목 추가 시작
const startAddingItem = () => {
  isAddingNewItem.value = true;
  newItemText.value = "";
  // 다음 틱에서 입력 필드에 포커스
  setTimeout(() => {
    if (newItemInputRef.value) {
      newItemInputRef.value.focus();
    }
  }, 100);
};

// 새 항목 추가 확인 (오직 항목 추가 버튼 클릭에서만 실행)
const confirmAddItem = async () => {
  // 중복 호출 방지
  if (isCreatingItem.value) {
    console.log("[ITEM] createItem already in progress, skipping duplicate call");
    return;
  }
  
  if (!newItemText.value.trim() || !checklist.value) {
    return;
  }
  
  const itemText = newItemText.value.trim();
  const checklistId = checklist.value.id;
  
  // 중복 호출 방지 플래그 설정
  isCreatingItem.value = true;
  
  console.log("[ITEM] add item clicked - createItem 호출 시작");
  
  try {
    // Firestore에 항목 생성 (checklistId 포함)
    // 선택된 그룹이 있으면 해당 그룹 사용, 없으면 첫 번째 그룹 사용
    let targetGroupId: string | null = null;
    
    if (selectedGroupId.value) {
      const targetGroup = groups.value.find(g => g.groupId === selectedGroupId.value);
      if (targetGroup) {
        targetGroupId = targetGroup.groupId;
      }
    }
    
    // 선택된 그룹이 없거나 찾을 수 없으면 첫 번째 그룹 사용
    if (!targetGroupId && checklist.value.groups && checklist.value.groups.length > 0) {
      targetGroupId = checklist.value.groups[0]?.groupId || null;
    }
    
    if (!targetGroupId) {
      alert("그룹이 없습니다. 먼저 그룹을 추가해주세요.");
      return;
    }
    
    // createItem 호출 (1회만 실행)
    await createItem({
      checklistId: checklistId,
      name: itemText,
      isDone: false,
      assignedTo: null,
      order: checklistItems.value.length,
      groupId: targetGroupId,
      // groupName은 저장하지 않음 (checklist.groups에서 가져옴)
    });
    
    console.log("[ITEM] createItem 호출 완료 - 항목 추가 성공:", itemText);
    
    // 입력 필드 초기화
    cancelAddItem();
    
    // 항목 목록 다시 로드 (조회만 수행)
    await loadChecklistData();
  } catch (err) {
    console.error("[ChecklistDetailView] 항목 추가 실패:", err);
    alert("항목 추가에 실패했습니다: " + (err instanceof Error ? err.message : String(err)));
  } finally {
    // 중복 호출 방지 플래그 해제
    isCreatingItem.value = false;
  }
};

// 새 항목 추가 취소
const cancelAddItem = () => {
  isAddingNewItem.value = false;
  newItemText.value = "";
};

// 그룹 추가 시작
const startAddingGroup = () => {
  isAddingGroup.value = true;
  newGroupName.value = "";
  // 다음 틱에서 입력 필드에 포커스
  setTimeout(() => {
    if (newGroupInputRef.value) {
      newGroupInputRef.value.focus();
    }
  }, 0);
};

// 그룹 추가 확인
const confirmAddGroup = async () => {
  if (!newGroupName.value.trim() || !checklist.value) {
    return;
  }
  
  // groups 배열 방어 코드: undefined/null 체크
  if (!groups.value || !Array.isArray(groups.value)) {
    console.warn("[ChecklistDetailView] groups 배열이 유효하지 않습니다. 초기화합니다.");
    groups.value = checklist.value.groups && Array.isArray(checklist.value.groups) && checklist.value.groups.length > 0
      ? [...checklist.value.groups]
      : [{
          groupId: generateGroupId(),
          groupName: '기본 그룹',
          order: 0
        }];
  }
  
  const groupName = newGroupName.value.trim();
  const groupId = generateGroupId();
  
  // 새 그룹 생성 (order는 현재 groups 길이로 설정)
  const newGroup = {
    groupId,
    groupName,
    order: groups.value.length
  };
  
  // 로컬 상태에 그룹 추가
  groups.value.push(newGroup);
  
  // 새로 추가한 그룹을 선택 상태로 설정
  selectedGroupId.value = groupId;
  
  // Firestore에 저장 (기본 체크리스트 포함 모든 체크리스트 동일 처리)
  try {
    await updateChecklist(checklist.value.id, {
      groups: groups.value
    });
    console.log("[ChecklistDetailView] 그룹 추가 성공:", groupName, groupId, "isDefault:", checklist.value.isDefault);
  } catch (err) {
    console.error("[ChecklistDetailView] 그룹 추가 실패:", err);
    // 실패 시 로컬 상태 롤백
    groups.value = groups.value.filter(g => g.groupId !== groupId);
    alert("그룹 추가에 실패했습니다.");
    return;
  }
  
  // 입력 필드 초기화
  cancelAddGroup();
};

// 그룹 추가 취소
const cancelAddGroup = () => {
  isAddingGroup.value = false;
  newGroupName.value = "";
};

// 그룹 선택
const selectGroup = (groupId: string | null) => {
  selectedGroupId.value = groupId;
  console.log("[ChecklistDetailView] 그룹 선택:", groupId);
};

// 항목 삭제
const deleteItem = async (index: number) => {
  const item = checklistItems.value[index];
  if (!item) return;
  
  // 오너 권한 확인
  if (!isOwner.value) {
    alert("항목 삭제 권한이 없습니다. 체크리스트 소유자만 삭제할 수 있습니다.");
    return;
  }
  
  if (!confirm(`"${item.title}" 항목을 삭제하시겠습니까?`)) {
    return;
  }
  
  try {
    // Firestore에서 항목 삭제
    await deleteItemService(item.id);
    
    console.log(`[ChecklistDetailView] 항목 ${index} 삭제 성공:`, item.id);
    
    // Optimistic UI: 리스트에서 즉시 제거
    checklistItems.value.splice(index, 1);
    
    // 항목 목록 다시 로드하여 최신 상태 유지
    await loadChecklistData();
  } catch (err) {
    console.error("[ChecklistDetailView] 항목 삭제 실패:", err);
    alert("항목 삭제에 실패했습니다: " + (err instanceof Error ? err.message : String(err)));
    
    // 실패 시 데이터 다시 로드하여 원상복구
    await loadChecklistData();
  }
};
</script>

<style scoped>
/* ChecklistDetailView 전용 레이아웃 클래스 */

/* 최상위 페이지 컨테이너 */
.checklist-detail-page {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 최상위 레이아웃 컨테이너 */
.checklist-detail-layout {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* 리스트/채팅 분할 영역 */
.checklist-detail-split {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 체크리스트 리스트 영역 */
.checklist-detail-list {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f9fafb;
  border-bottom: 2px solid #d1d5db;
  transition: flex-basis 0.3s ease;
}

/* 채팅 열림 상태: 리스트 70% */
.checklist-detail-list--chat-open {
  flex-basis: 70%;
}

/* 채팅 닫힘 상태: 리스트 90% */
.checklist-detail-list--chat-closed {
  flex-basis: 90%;
}

/* 채팅이 없을 때: 리스트 100% */
.checklist-detail-list:only-child {
  flex-basis: 100%;
}

/* 체크리스트 리스트 콘텐츠 영역 (스크롤 가능) */
.checklist-detail-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  min-height: 0;
}

/* 채팅 영역 */
.checklist-detail-chat {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #f3f4f6;
  border-top: 2px solid #d1d5db;
  transition: flex-basis 0.3s ease;
}

/* 채팅 열림 상태: 채팅 30% */
.checklist-detail-chat--open {
  flex-basis: 30%;
}

/* 채팅 닫힘 상태: 채팅 10% */
.checklist-detail-chat--closed {
  flex-basis: 10%;
}

/* 채팅 래퍼 (열림 상태) */
.checklist-detail-chat-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* 채팅 메시지 영역 (스크롤 가능) */
.checklist-detail-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  min-height: 0;
}

/* 채팅 입력창 영역 (하단 고정) */
.checklist-detail-chat-input {
  flex-shrink: 0;
  padding: 0.75rem;
  border-top: 1px solid #e5e7eb;
  background-color: white;
}

/* 채팅 토글 버튼 (닫힘 상태) */
.checklist-detail-chat-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
}

/* page-content padding 강제 제거 (이 페이지 한정) */
.checklist-detail-page :deep(.page-content),
.checklist-detail-page.page-content {
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Bottom Sheet 애니메이션 */
.fade-dimd-enter-active,
.fade-dimd-leave-active {
  transition: opacity 0.3s ease;
}

.fade-dimd-enter-from,
.fade-dimd-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
