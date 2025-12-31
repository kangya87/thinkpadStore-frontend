<template>
  <div class="assistant-root" @keydown.esc="close">
    <!-- 入口按钮 -->
    <button
      class="assistant-fab"
      type="button"
      @click="toggle"
      :aria-expanded="isOpen ? 'true' : 'false'"
      aria-label="AI 导购"
    >
      AI 导购
    </button>

    <!-- 面板 -->
    <div v-if="isOpen" class="assistant-panel" role="dialog" aria-label="AI 导购浮窗">
      <div class="assistant-header">
        <div class="assistant-title">AI 导购</div>
        <button class="assistant-close" type="button" @click="close" aria-label="关闭">×</button>
      </div>

      <div ref="messagesEl" class="assistant-messages">
        <div v-if="messages.length === 0" class="assistant-empty">
          你可以问：
          <div class="assistant-empty-examples">“预算 6000，办公为主，推荐轻薄本”</div>
        </div>

        <div
          v-for="m in messages"
          :key="m.id"
          class="assistant-message"
          :class="m.role === 'user' ? 'is-user' : 'is-assistant'"
        >
          <div class="assistant-bubble">
            <div class="assistant-content">{{ m.content }}</div>

            <div v-if="m.role === 'assistant' && m.recommendations && m.recommendations.length" class="assistant-reco">
              <div class="assistant-reco-title">推荐机型</div>
              <div
                v-for="r in m.recommendations"
                :key="r.product_id"
                class="assistant-reco-item"
                @click="goProduct(r.product_id)"
                role="button"
                tabindex="0"
              >
                <div class="assistant-reco-main">
                  <div class="assistant-reco-name">{{ r.name }} <span class="assistant-reco-model">{{ r.model }}</span></div>
                  <div class="assistant-reco-meta">
                    <span>¥{{ r.price }}</span>
                    <span class="assistant-dot">·</span>
                    <span>库存 {{ r.stock }}</span>
                  </div>
                </div>

                <div v-if="r.why_fit" class="assistant-reco-why">{{ r.why_fit }}</div>

                <div v-if="r.highlights && r.highlights.length" class="assistant-reco-tags">
                  <span v-for="(t, i) in r.highlights" :key="i" class="assistant-tag">{{ t }}</span>
                </div>

                <div v-if="r.tradeoffs && r.tradeoffs.length" class="assistant-reco-tradeoffs">
                  取舍：{{ r.tradeoffs.join('、') }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="assistant-loading">AI 思考中…</div>
        <div v-if="errorText" class="assistant-error">{{ errorText }}</div>
      </div>

      <form class="assistant-input" @submit.prevent="send">
        <div class="assistant-controls">
          <input
            v-model.trim="budgetMin"
            class="assistant-control"
            type="text"
            inputmode="decimal"
            placeholder="最低预算(元)"
            aria-label="最低预算"
          />
          <input
            v-model.trim="budgetMax"
            class="assistant-control"
            type="text"
            inputmode="decimal"
            placeholder="最高预算(元)"
            aria-label="最高预算"
          />
          <input
            v-model.number="limit"
            class="assistant-control assistant-control-limit"
            type="number"
            min="1"
            max="20"
            step="1"
            aria-label="候选商品数量"
            title="候选商品数量（1-20）"
          />
        </div>

        <div class="assistant-compose">
          <textarea
            v-model="inputText"
            class="assistant-textarea"
            rows="2"
            placeholder="告诉我你的用途、预算、偏好…"
            :disabled="isLoading"
            @keydown.enter.exact.prevent="send"
          />
          <button class="assistant-send" type="submit" :disabled="isLoading || !canSend">
            发送
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { assistantService } from '@/services/api'

let nextId = 1

export default {
  name: 'AssistantWidget',
  setup() {
    const router = useRouter()

    const isOpen = ref(false)
    const isLoading = ref(false)
    const errorText = ref('')

    const inputText = ref('')
    const budgetMin = ref('')
    const budgetMax = ref('')
    const limit = ref(8)

    const messages = ref([])
    const messagesEl = ref(null)

    const toggle = () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        nextTick(() => scrollToBottom())
      }
    }

    const close = () => {
      isOpen.value = false
    }

    const scrollToBottom = () => {
      const el = messagesEl.value
      if (!el) return
      el.scrollTop = el.scrollHeight
    }

    watch(
      () => messages.value.length,
      async () => {
        await nextTick()
        scrollToBottom()
      }
    )

    const normalizeBudget = val => {
      if (val === '' || val == null) return null
      const trimmed = String(val).trim()
      if (!trimmed) return null
      return trimmed
    }

    const buildHistory = (allMessages, maxItems = 6) => {
      const history = []
      for (const m of allMessages) {
        if (m.role !== 'user' && m.role !== 'assistant') continue
        const content = String(m.content || '').trim()
        if (!content) continue
        history.push({ role: m.role, content })
      }
      if (history.length <= maxItems) return history
      return history.slice(history.length - maxItems)
    }

    const toFriendlyError = err => {
      const status = err?.response?.status
      if (status === 429) return '请求过于频繁，请稍后再试'
      if (status === 400) return '参数错误或服务暂不可用'
      if (status === 401) return '当前请求未授权（该接口应允许匿名），请稍后重试'
      return '网络异常，请稍后重试'
    }

    const canSend = ref(false)
    watch(
      inputText,
      v => {
        canSend.value = String(v || '').trim().length > 0
      },
      { immediate: true }
    )

    const send = async () => {
      const text = String(inputText.value || '').trim()
      if (!text || isLoading.value) return

      errorText.value = ''
      isLoading.value = true

      const history = buildHistory(messages.value, 6)

      // 先落本地用户消息
      messages.value.push({
        id: nextId++,
        role: 'user',
        content: text,
        ts: Date.now()
      })

      inputText.value = ''

      try {
        const payload = {
          message: text,
          budget_min: normalizeBudget(budgetMin.value),
          budget_max: normalizeBudget(budgetMax.value),
          limit: Number(limit.value) || 8,
          history
        }

        const res = await assistantService.chat(payload)

        messages.value.push({
          id: nextId++,
          role: 'assistant',
          content: res?.answer || '（无回答）',
          recommendations: Array.isArray(res?.recommendations) ? res.recommendations : [],
          ts: Date.now()
        })
      } catch (err) {
        errorText.value = toFriendlyError(err)
      } finally {
        isLoading.value = false
      }
    }

    const goProduct = productId => {
      if (productId == null) return
      router.push(`/product/${productId}`)
      close()
    }

    return {
      isOpen,
      isLoading,
      errorText,
      inputText,
      budgetMin,
      budgetMax,
      limit,
      messages,
      messagesEl,
      canSend,
      toggle,
      close,
      send,
      goProduct
    }
  }
}
</script>

<style scoped>
.assistant-root {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1200;
}

.assistant-fab {
  border: none;
  background: #2c3e50;
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
}

.assistant-panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: calc(100vw - 48px);
  height: 520px;
  max-height: calc(100vh - 120px);
  margin-top: 12px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.assistant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.assistant-title {
  font-weight: 600;
  font-size: 14px;
}

.assistant-close {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.assistant-messages {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  text-align: left;
}

.assistant-empty {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
}

.assistant-empty-examples {
  margin-top: 6px;
  color: #2c3e50;
}

.assistant-message {
  display: flex;
  margin: 8px 0;
}

.assistant-message.is-user {
  justify-content: flex-end;
}

.assistant-message.is-assistant {
  justify-content: flex-start;
}

.assistant-bubble {
  max-width: 90%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #ededed;
  background: #fff;
}

.assistant-message.is-user .assistant-bubble {
  background: #2c3e50;
  color: #fff;
  border-color: #2c3e50;
}

.assistant-content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
}

.assistant-reco {
  margin-top: 10px;
}

.assistant-reco-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  color: inherit;
}

.assistant-reco-item {
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  padding: 10px;
  margin: 8px 0;
  cursor: pointer;
  background: #fafafa;
}

.assistant-message.is-user .assistant-reco-item {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.2);
}

.assistant-reco-name {
  font-size: 13px;
  font-weight: 600;
}

.assistant-reco-model {
  font-weight: 400;
  opacity: 0.8;
  margin-left: 6px;
}

.assistant-reco-meta {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.assistant-dot {
  margin: 0 6px;
}

.assistant-reco-why {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.9;
}

.assistant-reco-tags {
  margin-top: 8px;
}

.assistant-tag {
  display: inline-block;
  font-size: 12px;
  padding: 2px 8px;
  margin: 0 6px 6px 0;
  border-radius: 999px;
  border: 1px solid #e6e6e6;
  background: #fff;
}

.assistant-message.is-user .assistant-tag {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.assistant-reco-tradeoffs {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}

.assistant-loading {
  margin-top: 10px;
  color: #666;
  font-size: 12px;
}

.assistant-error {
  margin-top: 10px;
  color: #c0392b;
  font-size: 12px;
}

.assistant-input {
  flex: 0 0 auto;
  border-top: 1px solid #f0f0f0;
  padding: 10px;
  background: #fff;
}

.assistant-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.assistant-control {
  flex: 1;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12px;
}

.assistant-control-limit {
  width: 78px;
  flex: 0 0 78px;
}

.assistant-compose {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.assistant-textarea {
  flex: 1;
  resize: none;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 8px;
  font-size: 13px;
}

.assistant-send {
  border: none;
  background: #2c3e50;
  color: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.assistant-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
