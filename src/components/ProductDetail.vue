<template>
  <div class="product-page">
    <AppHeader />
    <main class="detail-content">
      <!-- 这里先空页面，后续填充商品详情 -->
    </main>
  </div>
</template>

<script>
import AppHeader from './AppHeader.vue'

export default {
  name: 'ProductDetail',
  components: { AppHeader }
}
</script>

<style scoped>
.product-page {
  padding-top: 60px; /* 抵消固定头部 */
  min-height: 100vh;
  background: #fff;
}
.detail-content {
  padding: 16px;
  /* 目前为空，可后续添加详情布局 */
}
</style>