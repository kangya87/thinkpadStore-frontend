import axios from 'axios'
import router from '@/router'

const apiClient = axios.create({
  baseURL: 'http://ouc.it.srv.thinkpadstore.lighilit.top/',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/* 请求拦截：自动带 token */
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

/* 响应拦截 */
apiClient.interceptors.response.use(
  response => response.data,
  async error => {
    const status = error.response?.status
    const originalRequest = error.config
    const currentPath = router.currentRoute.value.path

    // 👇 白名单页面（永远不强制登录）
    const whiteList = ['/', '/login', '/register']

    // 非 401，直接抛出
    if (status !== 401) {
      return Promise.reject(error)
    }

    // 某些接口允许匿名/不需要强制登录（如 AI 导购），避免 401 时被全局拦截跳转
    if (originalRequest?._skipAuthRedirect) {
      return Promise.reject(error)
    }

    // 白名单页面，不跳登录
    if (whiteList.includes(currentPath)) {
      return Promise.reject(error)
    }

    // 防止无限循环
    if (originalRequest._retry) {
      router.push('/login')
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      router.push('/login')
      return Promise.reject(error)
    }

    try {
      const res = await axios.post(
        'http://ouc.it.srv.thinkpadstore.lighilit.top/login/token/refresh/',
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      )

      localStorage.setItem('auth_token', res.data.access)
      originalRequest.headers.Authorization = `Bearer ${res.data.access}`
      return apiClient(originalRequest)
    } catch (e) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      router.push('/login')
      return Promise.reject(e)
    }
  }
)

/* ===== 业务接口 ===== */

export const productService = {
  getAll() {
    return apiClient.get('/product/')
  },
  getById(id) {
    return apiClient.get(`/product/${id}/`)
  }
}

export const cartService = {
  getAll() {
    return apiClient.get('/cart/')
  },
  create(data) {
    return apiClient.post('/cart/', data)
  },
  getById(id) {
    return apiClient.get(`/cart/${id}/`)
  },
  update(id, data) {
    return apiClient.put(`/cart/${id}/`, data)
  },
  partialUpdate(id, data) {
    return apiClient.patch(`/cart/${id}/`, data)
  },
  delete(id) {
    return apiClient.delete(`/cart/${id}/`)
  }
}

export const userService = {
  register(data) {
    return apiClient.post('/user/', {
      username: data.username,
      password: data.password,
      email: data.email
    })
  },
  login(data) {
    return apiClient.post('/login/', {
      username: data.username,
      password: data.password
    })
  }
}

export const assistantService = {
  chat(payload) {
    return apiClient.post('/assistant/chat/', payload, { _skipAuthRedirect: true })
  }
}

export default apiClient
