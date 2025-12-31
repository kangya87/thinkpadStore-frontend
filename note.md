# 项目工作流

## 项目

### 项目结构

作为一个vue前端，python的后端是django，数据库是mysql。
``` frontend
# 项目结构
/thinkpadStore-frontend
├── public
├── src
├── .gitignore 
├── babel.config.js # babel配置文件(babel用于转换es6语法)
├── package-lock.json # 锁定项目依赖的版本
├── package.json # 项目依赖配置文件
├── README.md # 项目说明文档
└── vue.config.js # vue项目配置文件

/src
├── assets # 静态资源文件夹
├── components # 组件文件夹
├── App.vue # 应用入口文件
├── main.js # 应用主文件
├── /router/index.js # 路由配置文件，用于配置路由规则
```

其中，
- components文件存放的是复用的组件，比如购物车组件（Cart.vue）
- App.vue # 根组件
- main.js # 应应用入口文件，相当于cpp的main.cpp，在main.js中初始化vue实例
- /router/index.js # 路由配置文件，用于配置路由规则


### 实现功能

实现功能有三个
1. 商品列表展示
2. 商品详情展示
3. 购物车功能（代码在/src/components/Cart.vue）
    - 购物车商品列表展示（购物车商品展示在购物车组件中）
    - 购物车商品数量增加/减少（加减按键）
    - 购物车商品删除（当商品下架时，会显示一张提示图片）
    - 购物车商品清空（当用户点击清空购物车时，会显示一个确认弹窗）



## git工作流

1. fork代码到自己github仓库
2. clone自己仓库代码到本地
    ```bash
    git clone https://github.com/your-username/thinkpadStore-frontend.git
    ```
3. 创建新分支, 并切换到新分支
    ```bash
    git checkout -b feature/branch-name
    ```
4. 提交代码到新分支
    ```bash
    git add .
    git commit -m "feat: add feature branch-name"
    ```
4. 推送新分支到自己的仓库
    ```bash
    git push origin feature/branch-name
    ```
6. 提交PR到上游仓库


### 如何从上游仓库更新代码


1. 将上游仓库添加到本地的remote分支 
    ```bash
    git remote add upstream https://github.com/thinkpadStore/thinkpadStore-frontend.git
    ```
2. 切换到主分支main 
    ```bash
    git checkout main
    ```
3. 从上游仓库拉取最新代码
    ```bash
    git pull upstream main
    ```
4. 合并最新代码到当前分支
    ```bash
    git merge upstream/main

    # 或者选择rebase
    git rebase upstream/main
    ```

### 如何将本地代码推送到自己的仓库
```bash
git push origin main
# 或者其他分支（一般是其他分支，推送到main分支多数情况会有冲突）
git push origin feature/branch-name
```

### 如何将远程仓库代码提出PR

1. 先更新自己代码
2. 然后提交自己代码到远程仓库（自己的仓库的其他分支）
    ```bash
    git push origin feature/branch-name
    ```
3. 然后在上游仓库提出PR
4. 等待上游仓库合并PR

## 前后端基础知识

- 前端基础知识
    - html
    - css
    - javascript
    - vue
- 后端基础知识
    - python
    - django 
    - mysql

前后端是如何通信的？
- 前端通过http请求与后端通信（即发送http请求（也就是后端提前给出的函数,如get,post等）到后端服务器）
- 后端通过django的视图函数处理http请求，返回json数据(json就是一种格式，使用key-value对表示数据)
- 前端通过vue的axios库发送http请求，接收json数据
- 前端将json数据渲染到页面上

## vue基础知识

ai生成的，用于学习
## Vue 3 组合式API (Composition API)
### 1. setup() 函数
setup() 是Vue 3新增的组件选项，是组件内使用Composition API的入口点。

```javascript
import { ref, reactive, computed, onMounted } from 'vue'

export default {
  setup() {
    // 响应式数据
    const count = ref(0)
    const state = reactive({
      name: 'Vue 3',
      items: []
    })

    // 计算属性
    const doubleCount = computed(() => count.value * 2)

    // 方法
    const increment = () => {
      count.value++
    }

    // 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })

    // 返回需要在模板中使用的内容
    return {
      count,
      state,
      doubleCount,
      increment
    }
  }
}
```

### 2. 响应式API
- **ref()**: 创建响应式的原始值或对象
- **reactive()**: 创建响应式的对象
- **computed()**: 创建计算属性

```javascript
// ref 用于原始值
const count = ref(0)
console.log(count.value) // 访问需要使用 .value

// reactive 用于对象
const state = reactive({
  user: {
    name: 'John',
    age: 25
  }
})
console.log(state.user.name) // 直接访问，不需要 .value

// computed 计算属性
const fullName = computed(() => {
  return `${state.user.firstName} ${state.user.lastName}`
})
```

### 3. provide/inject 跨组件通信
provide/inject 用于祖孙组件之间的数据传递，避免了逐层传递props。

```javascript
// 父组件 (App.vue)
import { provide, reactive } from 'vue'

export default {
  setup() {
    const cartState = reactive({
      items: [],
      isVisible: false
    })

    // 向子组件提供数据
    provide('cartState', cartState)
    provide('showCartSidebar', () => {
      cartState.isVisible = true
    })

    return {
      cartState
    }
  }
}

// 子组件 (AppHeader.vue)
import { inject } from 'vue'

export default {
  setup() {
    // 注入父组件提供的数据
    const cartState = inject('cartState', { items: [] })
    const showCartSidebar = inject('showCartSidebar', () => {})

    return {
      cartState,
      showCartSidebar
    }
  }
}
```

### 4. 组件设计模式
- **单一组件多用途**: 通过props控制组件的不同显示模式
- **响应式设计**: 使用CSS媒体查询和弹性单位
- **动画过渡**: Vue transition组件配合CSS过渡

```vue
<template>
  <div
    class="cart-container"
    :class="{
      'page-mode': !isSidebar,
      'sidebar-mode': isSidebar,
      'show': isSidebar && isVisible
    }"
  >
    <!-- 页面模式：显示完整头部 -->
    <AppHeader v-if="!isSidebar" />

    <!-- 侧边栏模式：显示关闭按钮 -->
    <div v-else class="sidebar-header">
      <button @click="$emit('close')">&times;</button>
    </div>
  </div>
</template>
```

### Vue 3 组合式API格式：
```vue
<template>
    <!-- 组件的html模板 -->
    <div @click="increment">
        {{ count }}
    </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: '组件名称',
  props: {
    // 组件接收的props属性
  },
  setup(props, { emit }) {
    // 响应式数据
    const count = ref(0)

    // 计算属性
    const doubleCount = computed(() => count.value * 2)

    // 路由
    const router = useRouter()

    // 方法
    const increment = () => {
      count.value++
      emit('change', count.value)
    }

    // 生命周期
    onMounted(() => {
      console.log('组件已挂载')
    })

    return {
      count,
      doubleCount,
      increment
    }
  }
}
</script>

<style scoped>
    /* 组件的css样式 */
</style>
```

---

# 新增功能实现思路：AI 导购浮窗（assistant/chat）

目标：基于后端新增接口 `POST /assistant/chat/`，在前端实现一个“可随时呼出/收起”的 AI 导购浮窗，用于自然语言提问并展示推荐商品；点击推荐商品可跳转到商品详情页。

## 1. 需求拆解（最小可用）
- 浮窗入口：页面右下角固定一个按钮（如“AI 导购”）。
- 浮窗形态：点击按钮打开一个悬浮面板（不跳页），可关闭/最小化。
- 对话能力：输入问题 → 调用接口 → 展示 `answer` 文本 + `recommendations` 列表。
- 多轮对话：将最近若干条对话作为 `history` 传给接口（接口要求最多 6 条）。
- 过滤参数：可选输入 `budget_min` / `budget_max`，以及 `limit`（默认 8）。
- 推荐商品交互：
  - 展示名称、型号、价格、库存、亮点/取舍、推荐理由。
  - 点击推荐项：`router.push('/product/:id')`（或项目当前详情路由）。

## 2. UI/组件设计（建议组件，不立即实现）
放在 `src/components/` 下：
- `AssistantWidget.vue`（核心浮窗组件）
  - 负责：按钮 + 面板容器、开关状态、消息列表、输入框、加载/错误态。
  - 对外：无需 props（或仅一个 `defaultOpen`），在 `App.vue` 全局挂载一次。
- （可选）`AssistantMessageList.vue` / `RecommendationList.vue`
  - 若主组件过大再拆分；MVP 可以先全部写在一个组件里。

样式原则：
- 使用现有项目 CSS 写法（当前项目未看到 Tailwind/设计系统约束时，保持风格一致即可）。
- 固定定位：`position: fixed; right: 24px; bottom: 24px;`（可根据现有样式调整）。

## 3. 路由与挂载位置
两种方案，优先“全局浮窗”（更符合“随时呼出”）：
1) 全局浮窗（推荐）
   - 在 `App.vue` 根组件中引入并渲染 `<AssistantWidget />`，确保所有页面都可用。
2) 独立页面 + 浮窗入口
   - 新增一个路由 `/assistant`（页面里也渲染浮窗内容）；
   - 但用户要求“浮窗页面”，更像方案 1。

## 4. 接口对接与数据结构
接口：`POST /assistant/chat/`（匿名可调用，无需登录）。

请求体（按接口文档）：
```json
{
  "message": "string",
  "budget_min": "string | null",
  "budget_max": "string | null",
  "limit": 8,
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}
```

响应体：
```json
{
  "answer": "...",
  "recommendations": [
    {
      "product_id": 1,
      "name": "...",
      "model": "...",
      "price": "...",
      "stock": 5,
      "highlights": ["..."],
      "tradeoffs": ["..."],
      "why_fit": "..."
    }
  ],
  "used_filters": {"budget_min": null, "budget_max": "6000.00", "limit": 8}
}
```

前端状态建议：
- `isOpen`: 是否展开
- `inputText`: 当前输入
- `budgetMin/budgetMax/limit`: 可选过滤
- `messages`: 用于渲染对话气泡（本地维护）
  - 结构示例：`{ role: 'user'|'assistant', content: string, ts: number, recommendations?: Recommendation[] }`
- `isLoading`: 请求中
- `error`: 错误信息（如 400/429/网络错误）

history 组装策略：
- 每次发送请求时，从 `messages` 中筛选最近的 user/assistant 文本消息，截断到 6 条；
- 注意：后端的 `recommendations` 是结构化字段，不一定要放进 history（避免冗长）；
  - history 里建议仅放自然语言 `content`（用户问题 + assistant answer）。

## 5. services/api.js 的改造点（仅方案）
当前项目已有 `src/services/api.js`：
- 增加一个方法：`assistantChat(payload)`，内部 `axios.post('/assistant/chat/', payload)`。
- baseURL：沿用现有配置（接口文档服务地址 `http://ouc.it.srv.thinkpadstore.lighilit.top/`）。
- 认证：该接口标注匿名可调用；因此不要强制附带登录 token。
  - 如果项目已有 axios 拦截器统一加 Authorization，需要确保该接口不会因为缺 token 而失败（按后端描述应允许匿名）。

## 6. 交互细节（用户体验与边界）
- 发送：点击发送按钮或 Enter 发送（Shift+Enter 换行可选，MVP 可不做）。
- 加载态：发送后禁用输入/按钮，显示“AI 思考中…”占位。
- 错误态：
  - 429：提示“请求过于频繁，请稍后再试”。
  - 400：提示“参数错误/服务暂不可用”（可展示后端返回 detail）。
  - 网络错误：提示“网络异常”。
- 自动滚动：新消息追加后滚动到底部。

## 7. 与商品/购物车页面的联动
- 推荐列表点击跳转商品详情：
  - 若已有 `ProductDetail.vue` 路由：`/product/:id` 或其他规则，以现有 `src/router/index.js` 为准。
- （可选后续）在推荐条目上提供“加入购物车”按钮：
  - 需要调用 cart 接口并处理登录/匿名策略；本次先不做（避免扩大范围）。

## 8. 开发顺序（实施步骤）
1) 确认现有 axios/baseURL 与路由结构（查看 `src/services/api.js`、`src/router/index.js`）。
2) 在 `src/services/api.js` 新增 `assistantChat` 方法并联调最小请求体。
3) 新增 `AssistantWidget.vue`：先完成静态 UI + 开关逻辑。
4) 接入请求：输入 → 调用 → 渲染 answer + recommendations。
5) 增加 history 截断与 429/400 错误处理。
6) 在 `App.vue` 挂载组件，并手动验证在商品列表/详情/购物车页都可呼出。
