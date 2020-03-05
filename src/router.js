import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './components/Login.vue'
import Home from './components/home.vue'
import Welcome from './components/welcome.vue'
import Users from './components/user/users.vue'
import Rights from './components/power/right.vue'
import Roles from './components/power/roles.vue'
import Cat from './components/goods/cat.vue'
import Params from './components/goods/params.vue'
import Goods from './components/goods/goods.vue'
import AddGoods from './components/goods/add.vue'
import Orders from './components/order/order.vue'
import Reports from './components/report/reports.vue'


Vue.use(VueRouter)

const routes = [
    {path:'/',redirect:'/login'},
    {path:'/login',component:Login},
    {path:'/home',
     component:Home,
     redirect:'/welcome',
     children:[{path:'/welcome',component:Welcome},
               {path:'/users',component:Users},
               {path:'/rights',component:Rights},
               {path:'/roles',component:Roles},
               {path:'/categories',component:Cat},
               {path:'/params',component:Params},
               {path:'/goods',component:Goods},
               {path:'/goods/add',component:AddGoods},
               {path:'/orders',component:Orders},
               {path:'/reports',component:Reports}
              ] 
    }
]

const router = new VueRouter({
  routes
})


//挂载路由导航守卫

router.beforeEach((to,from,next)=>{
  // to 将要访问的路径
  // from 从哪个路径跳转过来的
  // next 放行 next('/login')  强制跳转回登录页
  if(to.path === '/login') return next()
  // 获取  token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next()
})

export default router
