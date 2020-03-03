<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input
                        placeholder="请输入内容"
                        class="input-with-select"
                        v-model="queryInfo.query"
                        clearable
                        @clear="searchClear"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="searchClick"></el-button>
                    </el-input>
                </el-col>
                <!-- 添加商品按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- 商品列表 -->
            <el-table :data="goodsForm" style="width: 100%" stripe border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" min-width="300px"></el-table-column>
                <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
                <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
                <el-table-column label="创建时间">
                    <template v-slot="{row}">{{row.add_time | dataFormat}}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template v-slot="{row}">
                        <!-- {{row}} -->
                        <!-- 编辑按钮 -->
                        <el-tooltip
                            class="item"
                            effect="dark"
                            content="编辑"
                            :enterable="false"
                            placement="top"
                        >
                            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
                            <!-- 删除按钮 -->
                        </el-tooltip>
                        <el-tooltip
                            class="item"
                            effect="dark"
                            content="删除"
                            :enterable="false"
                            placement="top"
                        >
                            <el-button
                                type="danger"
                                icon="el-icon-delete"
                                size="mini"
                                @click="del(row.goods_id)"
                            ></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[2,3,5,10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 搜索栏内容
            queryInfo: {
                query: "",
                pagenum: 1,
                pagesize: 5
            },
            // 商品列表初始渲染数据
            goodsForm: [],
            total: 0,
            addDialogVisiable: false
        };
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        // 清空搜索栏
        searchClear() {},
        // 点击搜索按钮
        searchClick() {},
        // 商品列表数据渲染
        async getGoodsList() {
            const { data: res } = await this.$http.get("goods", {
                params: this.queryInfo
            });
            if (res.meta.status !== 200)
                return this.$message.error("读取商品列表失败");
            // console.log(res);
            this.total = res.data.total;
            this.goodsForm = res.data.goods;
            // console.log(this.queryInfo)
        },
        // 搜索栏size改变
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getGoodsList();
        },
        handleCurrentChange(newNum) {
            this.queryInfo.pagenum = newNum;
            this.getGoodsList();
        },
        // 搜索功能
        searchClick() {
            this.getGoodsList();
        },
        // 搜索清空
        searchClear() {
            this.queryInfo.query = "";
            this.getGoodsList();
        },
        // 删除商品
        async del(id) {
            const confirm = await this.$confirm(
                "此操作将永久删除该商品, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            // console.log(confirm);
            if (confirm !== "confirm") return;
            // console.log("123");
            const { data: res } = await this.$http.delete("goods/" + id);
            console.log(res);
            if (res.meta.status !== 200) return this.$message.error("删除失败");
            this.$message.success("删除商品成功");
            this.getGoodsList();
        },
        // 跳转添加商品页面
        goAddPage(){
          this.$router.push('/goods/add')
        }
    }
};
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 15px;
}
</style>