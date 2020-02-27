<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/logo.png" class="logopng" alt />
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse?'64px':'240px'">
                <!-- 折叠按钮 -->
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu :collapse="isCollapse" unique-opened background-color="#545c64" text-color="#fff" active-text-color="#409eff" :collapse-transition="false" router :default-active="routerpath">

                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <!-- 一级菜单的模板区域 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconlist[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/'+subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="defaultActive('/'+subitem.path)">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{subitem.authName}}</span>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容主体 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data(){
        return {
            menulist:[],
            iconlist:{
                125:'iconfont icon-users',
                103:'iconfont icon-tijikongjian',
                101:'iconfont icon-shangpin',
                102:'iconfont icon-danju',
                145:'iconfont icon-baobiao'

            },
            isCollapse:false,
            routerpath:''
        }
    },
    created(){
        this.getMenuList()
        this.routerpath = window.sessionStorage.getItem('path')
    },
    methods: {
        logout() {
            window.sessionStorage.clear();
            this.$router.push("/login");
        },
        async getMenuList(){
            const {data:res} = await this.$http.get('menus')
            // console.log(res)
            if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menulist = res.data
        },
        toggleCollapse(){
            this.isCollapse = !this.isCollapse;
        },
        defaultActive(path){
           window.sessionStorage.setItem('path',path)
           let routerpath = window.sessionStorage.getItem('path')
            this.routerpath = routerpath
        }
    }
};
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}
.el-aside {
    background-color: #333744;
    .el-menu{
        border-right: none;
    }
}
.el-main {
    background-color: #eaedf1;
}
.iconfont{
    margin-right: 10px
}
.toggle-button{
    background-color: #4A5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
}
.logopng{
    width:55px;
    border-radius: 15px;
    padding: 5px;
}
</style>