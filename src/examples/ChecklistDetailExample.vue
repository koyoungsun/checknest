<template>
  <div class="p-4 border rounded-lg">
    <h2 class="text-xl font-bold mb-4">체크리스트 상세</h2>

    <div v-if="itemsLoading">항목 로딩 중...</div>
    <div v-else-if="itemsError">{{ itemsError.message }}</div>
    <div v-else>
      <!-- 항목 목록 -->
      <div class="space-y-2 mb-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-2 p-2 border rounded"
        >
          <input
            type="checkbox"
            :checked="item.isDone"
            @change="handleToggle(item.id)"
          />
          <span :class="{ 'line-through': item.isDone }">{{ item.name }}</span>
        </div>
      </div>

      <!-- 진행률 -->
      <div class="mb-4">
        <div class="text-sm text-gray-500 mb-1">진행률: {{ progress }}%</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
      </div>

      <!-- 새 항목 추가 -->
      <div class="flex gap-2">
        <input
          v-model="newItemName"
          type="text"
          placeholder="항목 이름"
          class="border p-2 rounded flex-1"
        />
        <button
          @click="handleAddItem"
          class="bg-green-600 text-white px-4 py-2 rounded"
          :disabled="itemsLoading"
        >
          추가
        </button>
      </div>
    </div>

    <!-- 채팅 -->
    <div class="mt-6">
      <h3 class="font-semibold mb-2">채팅</h3>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div
          v-for="chat in chats"
          :key="chat.id"
          class="p-2 bg-gray-100 rounded text-sm"
        >
          <span
            :class="chat.system ? 'text-gray-500 italic' : 'text-gray-900'"
          >
            {{ chat.message }}
          </span>
        </div>
      </div>
      <div class="flex gap-2 mt-2">
        <input
          v-model="newMessage"
          type="text"
          placeholder="메시지 입력"
          class="border p-2 rounded flex-1"
          @keyup.enter="handleSendMessage"
        />
        <button
          @click="handleSendMessage"
          class="bg-blue-600 text-white px-4 py-2 rounded"
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useItems } from "@/composables/useItems";
import { useChats } from "@/composables/useChats";

const props = defineProps<{
  checklistId: string;
}>();

const { currentUser } = useAuth();
const {
  items,
  loading: itemsLoading,
  error: itemsError,
  progress,
  loadItems,
  addItem,
  toggleItem,
} = useItems(props.checklistId);

const {
  chats,
  sendChat,
} = useChats(props.checklistId);

const newItemName = ref("");
const newMessage = ref("");

onMounted(() => {
  loadItems();
});

const handleAddItem = async () => {
  if (!newItemName.value.trim()) return;

  try {
    const maxOrder = items.value.length > 0
      ? Math.max(...items.value.map((i) => i.order))
      : 0;

    await addItem({
      name: newItemName.value,
      order: maxOrder + 1,
      isDone: false,
    });
    newItemName.value = "";
  } catch (err) {
    console.error("항목 추가 실패:", err);
  }
};

const handleToggle = async (id: string) => {
  try {
    await toggleItem(id);
  } catch (err) {
    console.error("항목 토글 실패:", err);
  }
};

const handleSendMessage = async () => {
  if (!newMessage.value.trim() || !currentUser.value) return;

  try {
    await sendChat({
      userId: currentUser.value.uid,
      message: newMessage.value,
      system: false,
    });
    newMessage.value = "";
  } catch (err) {
    console.error("메시지 전송 실패:", err);
  }
};
</script>











