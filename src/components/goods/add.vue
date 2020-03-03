<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 提示信息 Tips -->
            <el-alert title="添加商品信息" type="info" show-icon></el-alert>
            <!-- 步骤条 -->
            <el-steps :active="activeIndex * 1" finish-status="success" align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>
            <!-- 竖版 Tab条 含 Form-->
            <el-form
                :model="addForm"
                :rules="addFormRules"
                ref="addFormFef"
                label-width="100px"
                label-position="top"
            >
                <el-tabs v-model="activeIndex" @tab-click="tabChange" tab-position="left" :before-leave="beforeLeave">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称：" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格：" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量：" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量：" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类：" prop="goods_cat">
                            <el-cascader
                                v-model="addForm.goods_cat"
                                :options="categoriesList"
                                :props="cascaderProps"
                                @change="cascaderChange"
                            ></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1"></el-tab-pane>
                    <el-tab-pane label="商品属性" name="2"></el-tab-pane>
                    <el-tab-pane label="商品图片" name="3"></el-tab-pane>
                    <el-tab-pane label="商品内容" name="4"></el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 步骤条的激活索引
            activeIndex: 0,
            // 第一个Tab选项卡的 name
            tabActiveName: "商品信息",
            // 总表单内容
            addForm: {
                goods_name: "",
                goods_price: 0,
                goods_weight: 0,
                goods_number: 0,
                goods_cat: ""
            },
            // 表单校验规则
            addFormRules: {
                goods_name: [
                    {
                        required: true,
                        message: "请输入商品名称",
                        trigger: "blur"
                    }
                ],
                goods_price: [
                    {
                        required: true,
                        message: "请输入商品价格",
                        trigger: "blur"
                    }
                ],
                goods_weight: [
                    {
                        required: true,
                        message: "请输入商品重量",
                        trigger: "blur"
                    }
                ],
                goods_number: [
                    {
                        required: true,
                        message: "请输入商品数量",
                        trigger: "blur"
                    }
                ],
                goods_cat: [
                    {
                        required: true,
                        message: "请选择商品分类",
                        trigger: "blur"
                    }
                ]
            },
            // 商品分类信息
            categoriesList: [],
            // 级联选择器规则
            cascaderProps: {
                expandTrigger: "hover",
                value: "cat_id",
                label: "cat_name",
                children: "children"
            }
        };
    },
    created() {
        // 获取商品分类
        this.getCategories();
    },
    methods: {
        // 改变Tab
        tabChange() {},
        // 获取商品分类
        async getCategories() {
            const { data: res } = await this.$http.get("categories");
            if (res.meta.status !== 200) {
                return this.$message.error("获取分类失败");
            }
            this.categoriesList = res.data;
        },
        // 级联选择器改变
        cascaderChange() {
            if (this.addForm.goods_cat.length !== 3) {
                this.$message.error("级联选择器只能选择第三级");
                this.addForm.goods_cat = [];
                return;
            }
            // this.addForm.goods_cat = this.addForm.goods_cat.split(',')
            // console.log(this.addForm.goods_cat)
        },
        // 切换Tab之前
        beforeLeave(avtiveNmae,oldActiveName){
          // console.log(avtiveNmae,oldActiveName)
          if(oldActiveName==0 && this.addForm.goods_cat.length !== 3){
            this.$message.error('请先选择三级商品分类')
            return false 
          }
        }
    }
};
</script>

<style lang="less" scoped>
.el-steps {
    margin: 15px 0;
}
</style>