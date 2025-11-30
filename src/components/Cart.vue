<template>
  <div
    class="cart-container"
    :class="{
      'cart-page': !isSidebar,
      'cart-sidebar': isSidebar,
      'show': isSidebar && cartState.isVisible
    }"
  >
    <!-- 页面模式：显示完整的头部导航 -->
    <AppHeader v-if="!isSidebar" />

    <!-- 侧边栏模式：显示购物车头部和关闭按钮 -->
    <div v-if="isSidebar" class="cart-header">
      <h3>购物车</h3>
      <button class="close-btn" @click="$emit('close')">&times;</button>
    </div>

    <!-- 购物车内容区域 -->
    <main class="cart-content">
      <!-- 购物车为空时的显示 -->
      <div v-if="!hasItems" class="empty-cart">
        <img src="@/assets/logo.png" alt="空购物车" class="empty-cart-image" />
        <p>您的购物车还是空的</p>
        <button class="continue-shopping-btn" @click="closeCartAndGoHome">
          继续购物
        </button>
      </div>

      <!-- 购物车有商品时的显示（预留） -->
      <div v-else class="cart-items">
        <!-- 这里后续会添加购物车商品列表 -->
      </div>
    </main>
  </div>
</template>

<script>
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'ShoppingCart',
  components: {
    AppHeader
  },
  props: {
    isSidebar: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const router = useRouter()

    // 注入购物车状态
    const cartState = inject('cartState', { items: [] })

    // 检查购物车是否有商品
    const hasItems = cartState.items && cartState.items.length > 0

    // 关闭购物车并跳转到首页
    const closeCartAndGoHome = () => {
      if (props.isSidebar) {
        emit('close')
      } else {
        router.push('/')
      }
    }

    return {
      hasItems,
      cartState,
      closeCartAndGoHome
    }
  }
}
</script>

<style scoped>
.cart-container {
  background-color: #fff;
}

/* 页面模式样式 */
.cart-page {
  min-height: 100vh;
  padding: 20px;
}

/* 侧边栏模式样式 */
.cart-sidebar {
  position: fixed;
  top: 60px; /* AppHeader高度 */
  right: 0;
  width: 50%;
  height: calc(100vh - 60px);
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  opacity: 0;
}

.cart-sidebar.show {
  transform: translateX(0);
  opacity: 1;
}

/* 购物车头部（侧边栏模式） */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
}

.cart-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 5px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #333;
}

/* 购物车内容区域 */
.cart-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 空购物车状态 */
.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-cart-image {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-cart p {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
}

.continue-shopping-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.continue-shopping-btn:hover {
  background-color: #0056b3;
}

/* 页面模式下的内容区域 */
.cart-page .cart-content {
  margin-top: 60px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-sidebar {
    width: 80%;
  }

  .cart-header {
    padding: 15px;
  }

  .cart-header h3 {
    font-size: 1.1rem;
  }

  .empty-cart-image {
    width: 80px;
    height: 80px;
  }

  .empty-cart p {
    font-size: 1rem;
  }

  .continue-shopping-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .cart-sidebar {
    width: 90%;
  }

  .cart-header {
    padding: 10px;
  }

  .empty-cart {
    padding: 20px 10px;
  }
}

/* 购物车商品列表（预留） */
.cart-items {
  width: 100%;
}
</style>
