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

      <!-- 购物车有商品时的显示 -->
      <div v-else class="cart-items">
        <div v-for="item in (localCartItems.length > 0 ? localCartItems : cartState.items)" :key="item.id" class="cart-item">
          <div class="item-image" @click="goToProduct(item.product_id)">
            <img :src="item.image || '@/assets/logo.png'" :alt="item.product_name" />
          </div>
          <div class="item-info">
            <h4 class="item-name" @click="goToProduct(item.product_id)">{{ item.product_name }}</h4>
            <p class="item-price">¥{{ item.price }}</p>
            <div class="item-quantity">
              <button class="quantity-btn" @click="decreaseQuantity(item)">-</button>
              <span class="quantity">{{ item.quantity }}</span>
              <button class="quantity-btn" @click="increaseQuantity(item)">+</button>
            </div>
          </div>
          <div class="item-total">
            <p>¥{{ (item.price * item.quantity).toFixed(2) }}</p>
            <button class="remove-btn" @click="removeItem(item.id)">删除</button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row">
            <span>总计：</span>
            <span class="total-price">¥{{ totalPrice.toFixed(2) }}</span>
          </div>
          <button class="checkout-btn" @click="checkout">结算</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { inject, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { cartService } from '@/services/api'

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
  emits: ['close', 'item-added', 'item-removed', 'quantity-changed'],
  setup(props, { emit }) {
    const router = useRouter()

    // 注入购物车状态
    const cartState = inject('cartState', { items: [] })

    // 本地购物车数据，用于实时响应
    const localCartItems = ref(cartState.items || [])

    // 计算属性
    const hasItems = computed(() => {
      return (localCartItems.value && localCartItems.value.length > 0) ||
             (cartState.items && cartState.items.length > 0)
    })

    const totalPrice = computed(() => {
      const items = localCartItems.value.length > 0 ? localCartItems.value : cartState.items
      return (items || []).reduce((total, item) => {
        return total + (item.price * item.quantity)
      }, 0)
    })

    // 加载购物车数据
    const loadCartItems = async () => {
      try {
        const response = await cartService.getAll()
        localCartItems.value = response.data || []
        // 更新全局状态
        cartState.items = localCartItems.value
      } catch (error) {
        console.error('加载购物车失败:', error)
        localCartItems.value = []
      }
    }

    // 添加商品到购物车
    const addToCart = async (product) => {
      try {
        const cartItem = {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image
        }

        await cartService.create(cartItem)
        await loadCartItems() // 重新加载购物车
        emit('item-added', cartItem)
      } catch (error) {
        console.error('添加到购物车失败:', error)
      }
    }

    // 增加商品数量
    const increaseQuantity = async (item) => {
      try {
        const updatedItem = { ...item, quantity: item.quantity + 1 }
        await cartService.partialUpdate(item.id, { quantity: updatedItem.quantity })
        item.quantity += 1
        emit('quantity-changed', item)
      } catch (error) {
        console.error('更新数量失败:', error)
      }
    }

    // 减少商品数量
    const decreaseQuantity = async (item) => {
      if (item.quantity <= 1) return

      try {
        const updatedItem = { ...item, quantity: item.quantity - 1 }
        await cartService.partialUpdate(item.id, { quantity: updatedItem.quantity })
        item.quantity -= 1
        emit('quantity-changed', item)
      } catch (error) {
        console.error('更新数量失败:', error)
      }
    }

    // 删除购物车项
    const removeItem = async (itemId) => {
      try {
        await cartService.delete(itemId)
        localCartItems.value = localCartItems.value.filter(item => item.id !== itemId)
        cartState.items = localCartItems.value
        emit('item-removed', itemId)
      } catch (error) {
        console.error('删除购物车项失败:', error)
      }
    }

    // 跳转到商品详情页
    const goToProduct = (productId) => {
      if (props.isSidebar) {
        emit('close')
      }
      router.push(`/product/${productId}`)
    }

    // 结算
    const checkout = () => {
      if (props.isSidebar) {
        emit('close')
      }
      router.push('/checkout')
    }

    // 关闭购物车并跳转到首页
    const closeCartAndGoHome = () => {
      if (props.isSidebar) {
        emit('close')
      } else {
        router.push('/')
      }
    }

    // 初始化时加载购物车数据
    loadCartItems()

    return {
      cartState,
      localCartItems,
      hasItems,
      totalPrice,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeItem,
      goToProduct,
      checkout,
      closeCartAndGoHome,
      loadCartItems
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
}

/* 空购物车状态 */
.empty-cart {
  text-align: center;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
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

/* 购物车商品列表 */
.cart-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #fafafa;
}

.item-image {
  width: 80px;
  height: 80px;
  margin-right: 15px;
  cursor: pointer;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  transition: color 0.2s;
}

.item-name:hover {
  color: #007bff;
}

.item-price {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.quantity-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.quantity-btn:hover {
  background-color: #f0f0f0;
}

.quantity {
  font-size: 1rem;
  min-width: 30px;
  text-align: center;
}

.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  text-align: right;
}

.item-total p {
  margin: 0;
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
}

.remove-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 5px;
  transition: color 0.2s;
}

.remove-btn:hover {
  color: #c82333;
}

/* 购物车总结 */
.cart-summary {
  margin-top: 20px;
  padding: 20px;
  border-top: 2px solid #eee;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
}

.total-price {
  color: #007bff;
  font-size: 1.3rem;
}

.checkout-btn {
  width: 100%;
  background-color: #28a745;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 6px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-btn:hover {
  background-color: #218838;
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

  .cart-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-image {
    margin-right: 0;
    margin-bottom: 10px;
    align-self: center;
  }

  .item-total {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
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

  .cart-item {
    padding: 10px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }
}
</style>