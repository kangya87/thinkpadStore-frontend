<template>
  <div class="TitleBackground">
    <div class="Logo">
      <img alt="Lenovo Logo" src="@/assets/logo.png" />
      <span class="logo-text">联想商店</span>
    </div>
    <div class="ShoppingCart" @click="showCartSidebar">
      <img alt="Shopping Cart" src="@/assets/logo.png" />
      <span>购物车</span>
      <!-- 购物车商品数量显示 -->
      <span v-if="cartItemCount > 0" class="cart-badge">
        {{ cartItemCount }}
      </span>
    </div>
  </div>
</template>

<script>
import { inject, computed } from 'vue'

export default {
  name: 'AppHeader',
  setup() {
    // 注入购物车状态和方法
    const cartState = inject('cartState', { items: [] })
    const showCartSidebar = inject('showCartSidebar', () => {})

    // 计算购物车商品数量
    const cartItemCount = computed(() => {
      return cartState.items ? cartState.items.length : 0
    })

    return {
      cartItemCount,
      showCartSidebar
    }
  }
}
</script>

<style scoped>
.TitleBackground {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #f8f8f8;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.Logo {
  display: flex;
  align-items: center;
}

.Logo img {
  max-width: 100px;
  height: auto;
  margin-right: 10px;
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 购物车样式 */
.ShoppingCart {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 60px;
  position: relative;
}

.ShoppingCart img {
  max-width: 40px;
  height: auto;
  margin-right: 8px;
}

.ShoppingCart span {
  font-size: 16px;
  color: #333;
}

/* 购物车徽章样式 */
.cart-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .Logo {
    padding: 5px 10px;
  }
  .Logo img {
    max-width: 80px;
    margin-right: 5px;
  }
  .logo-text {
    font-size: 16px;
    font-style: italic;
  }

  .ShoppingCart {
    margin-right: 20px;
  }

  .ShoppingCart img {
    max-width: 35px;
  }

  .ShoppingCart span {
    font-size: 14px;
  }

  .cart-badge {
    min-width: 18px;
    height: 18px;
    font-size: 11px;
    top: -6px;
    right: -6px;
  }
}
</style>