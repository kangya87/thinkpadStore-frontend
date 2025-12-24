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
