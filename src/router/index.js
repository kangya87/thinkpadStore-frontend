import { createRouter, createWebHistory } from 'vue-router'
import StoreApp from '@/components/StoreApp.vue'
import ProductDetail from '@/components/ProductDetail.vue'
import Cart from '@/components/Cart.vue'


const routes = [
  { path: '/', name: 'Home', component: StoreApp },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/cart', name: 'ShoppingCart', component: Cart, props: true }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router