<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 添加分类按钮 -->
            <el-button type="primary" @click="addClick">添加分类</el-button>
            <!-- 分类表格区域 -->
            <tree-table
                class="tree-table"
                :data="cateList"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false"
            >
                <!-- 是否有效 -->
                <template v-slot:isok="{row}">
                    <i
                        class="el-icon-success"
                        v-if="row.cat_deleted === false"
                        style="color:lightgreen"
                    ></i>
                    <i class="el-icon-error" v-else style="color:red"></i>
                </template>
                <!-- 排序 -->
                <template v-slot:order="{row}">
                    <el-tag v-if="row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" v-else-if="row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" v-else>三级</el-tag>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 添加分类Dialog区域 -->
        <el-dialog title="添加分类" :visible.sync="addDialogVisible" width="50%" @close="addClose">
            <el-form :model="newCat" label-width="110px" ref="addRef" :rules="addCatRules">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="newCat.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：" label-width="110px">
                    <el-cascader
                        class="cascader"
                        v-model="currentCat"
                        :options="parentList"
                        :props="addProps"
                        @change="handleChange"
                        clearable
                    ></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="makeAdd()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
export default {
    data() {
        return {
            addDialogVisible: false,
            cateList: [], //商品分类的数据列表
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            total: 0,
            columns: [
                {
                    label: "分类名称",
                    prop: "cat_name"
                },
                {
                    label: "是否有效",
                    type: "template",
                    template: "isok"
                },
                {
                    label: "排序",
                    type: "template",
                    template: "order"
                }
            ],
            newCat: {
                cat_pid: 0,
                cat_name: "",
                cat_level: 0
            },
            parentList: [],
            addCatRules: {
                cat_name: [
                    {
                        required: true,
                        message: "请输入活动名称",
                        trigger: "blur"
                    },
                    {
                        min: 1,
                        max: 10,
                        message: "长度在 1 到 10 个字符",
                        trigger: "blur"
                    }
                ]
            },
            // 添加时选择的
            currentCat: [],
            // 级联数据对象
            addProps: {
                children: "children",
                label: "cat_name",
                value: "cat_id",
                checkStrictly: true,
                expandTrigger: "hover"
            }
        };
    },
    created() {
        // this.getCateList();
        this.getCategories();
    },
    methods: {
        // getCateList() {},
        async getCategories() {
            const { data: res } = await this.$http.get("categories", {
                params: this.queryInfo
            });
            //  console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.errpr("获取商品分类失败");
            }
            this.cateList = res.data.result;
            this.total = res.data.total;
        },
        // 监听pagesize改变的事件
        handleSizeChange(newPageSize) {
            this.queryInfo.pagesize = newPageSize;
            this.getCategories();
        },
        // 监听pagenum改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getCategories();
        },
        // 确定添加
        makeAdd() {
            this.$refs.addRef.validate(async valid => {
                // console.log(valid);
                if (!valid) return;
                console.log(this.newCat);
                const { data: res } = await this.$http.post(
                    "categories",
                    this.newCat
                );
								// console.log(res);
								if(res.meta.status!==201) return this.$message.error('添加分类失败')
								this.$message.success('添加分类成功')
								this.addDialogVisible=false
								this.getCategories()
            });
        },
        addClose() {
            this.$refs.addRef.resetFields();
            this.currentCat = [];
            this.newCat.cat_pid = 0;
            this.newCat.cat_pid = 0;
        },
        addClick() {
            this.addDialogVisible = true;
            this.getParnetCat();
        },
        async getParnetCat() {
            const { data: res } = await this.$http.get("categories", {
                params: { type: 2 }
            });
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.erroe("获取分类列表失败");
            }
            this.parentList = res.data;
        },
        handleChange() {
            // console.log(this.currentCat);
            // 长度大于0 说明选择了父级分类
            if (this.currentCat.length > 0) {
                // 把数组最后一个数值赋值给newCat的pid
                this.newCat.cat_pid = this.currentCat[
                    this.currentCat.length - 1
                ];
                // 为当前分类的等级赋值
                this.newCat.cat_level = this.currentCat.length;
                return;
            } else {
                this.newCat.cat_pid = 0;
                this.newCat.cat_level = 0;
            }
        }
    }
};
</script>


<style lang="less" scoped>
.tree-table {
    margin-top: 15px;
}
.cascader {
    width: 100%;
}
</style>