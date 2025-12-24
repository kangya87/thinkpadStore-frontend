<template>
  <div class="TitleBackground">
    <!--logo-->>
    <div class="Logo">
      <img alt="Lenovo Logo" src="@/assets/logo.png" />
      <span class="logo-text">联想商店</span>
    </div>

    <!-- 右侧功能区 -->
    <div class="RightArea">
      <!-- 购物车 -->
      <div class="ShoppingCart" @click="showCartSidebar">
        <img alt="Shopping Cart" src="@/assets/logo.png" />
        <span>购物车</span>
        <span v-if="cartItemCount > 0" class="cart-badge">
          {{ cartItemCount }}
        </span>
      </div>

      <!-- 未登录 -->
      <template v-if="!isLogin">
        <div class="ShoppingCart" @click="goRegister">
          <span>注册</span>
        </div>
        <div class="ShoppingCart" @click="goLogin">
          <span>登录</span>
        </div>
      </template>

      <!-- 已登录 -->
      <template v-else>
        <div class="ShoppingCart user">
          <span>你好，{{ username }}</span>
        </div>
        <div class="ShoppingCart logout" @click="logout">
          <span>退出</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { inject, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AppHeader',
  setup() {
    const cartState = inject('cartState', { items: [] })
    const showCartSidebar = inject('showCartSidebar', () => {})

    const router = useRouter()

       // ===== 登录状态 =====
    const isLogin = ref(false)
    const username = ref('')

    const checkLoginStatus = () => {
      const token = localStorage.getItem('auth_token')
      isLogin.value = !!token

      if (token) {
        const userInfo = localStorage.getItem('user_info')
        if (userInfo) {
          try {
            username.value = JSON.parse(userInfo).username
          } catch {
            username.value = '用户'
          }
        }
      }
    }

    onMounted(() => {
      checkLoginStatus()
    })

    // ===== 路由跳转 =====
    const goHome = () => router.push('/')
    const goRegister = () => router.push('/register')
    const goLogin = () => router.push('/login')

    // ===== 退出登录 =====
    const logout = () => {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_info')

      isLogin.value = false
      username.value = ''

      router.push('/login')
    }

    const cartItemCount = computed(() => {
      return cartState.items ? cartState.items.length : 0
    })

    return {
      cartItemCount,
      showCartSidebar,
      goRegister,
      goLogin,
      goHome,
      logout,
      isLogin,
      username
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

.RightArea {
  display: flex;
  align-items: center;
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
/* 用户名 */
.user span {
  font-weight: 500;
}

/* 退出按钮 */
.logout span {
  color: #e2231a;
  font-weight: bold;
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