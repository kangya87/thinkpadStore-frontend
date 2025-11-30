<template>
  <div id="app">
    <router-view/>

    <!-- 全局购物车侧边栏 -->
    <Cart
      v-if="cartState.isVisible"
      :is-sidebar="true"
      @close="closeCartSidebar"
    />

    <!-- 遮罩层 -->
    <div
      v-if="cartState.isVisible"
      class="cart-overlay"
      @click="closeCartSidebar"
    ></div>
  </div>
</template>

<script>
import { provide, reactive } from 'vue'
import Cart from './components/Cart.vue'

export default {
  name: 'App',
  components: {
    Cart
  },
  setup() {
    // 购物车状态管理
    const cartState = reactive({
      isVisible: false,
      items: []
    })

    // 显示购物车侧边栏
    const showCartSidebar = () => {
      cartState.isVisible = true
    }

    // 关闭购物车侧边栏
    const closeCartSidebar = () => {
      cartState.isVisible = false
    }

    // 提供给子组件的全局状态和方法
    provide('cartState', cartState)
    provide('showCartSidebar', showCartSidebar)

    return {
      cartState,
      closeCartSidebar
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

/* 购物车遮罩层样式 */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  transition: opacity 0.3s ease;
}
</style>
