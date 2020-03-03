<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 头部警告区域 -->
            <el-alert title="注意： 只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的 级联选择框 -->
                    <el-cascader
                        v-model="selectCatIds"
                        :options="catList"
                        :props="selectCatProps"
                        @change="slectCatChange"
                        ref="cascaderRef"
                    ></el-cascader>
                </el-col>
            </el-row>
            <!-- Tab 区域 -->
            <el-tabs v-model="activeTabName" @tab-click="TabChange">
                <!-- 动态参数 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数 按钮 -->
                    <el-button
                        class="bt15"
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="addOpen"
                    >添加参数</el-button>
                    <!-- 渲染表格 -->
                    <el-table :data="manyData" style="width: 100%" border stripe>
											<!-- expand 展开 -->
                        <el-table-column type="expand">
                            <template v-slot="{row}">
                                <!-- {{row.attr_vals}} -->
                                <el-tag
                                    v-for="(item,i) in row.attr_vals"
                                    :key="item.i"
                                    closable
                                    @close="handleClose(i,row)"
                                >{{item}}</el-tag>
                                <!-- input 还是 Tag ? -->
                                <el-input
                                    style="width:120px"
                                    class="input-new-tag"
                                    v-if="row.inputVisible"
                                    v-model="row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(row)"
                                    @blur="handleInputConfirm(row)"
                                ></el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(row)"
                                >+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                        <!-- 操作区域 -->
                        <el-table-column label="操作">
                            <template v-slot="{row}">
                                <!-- {{row}} -->
                                <!-- 修改按钮 -->
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="editOpen(row)"
                                >修改</el-button>
                                <!-- 删除按钮 -->
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="delOpen(row)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态属性 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加参数 按钮 -->
                    <el-button
                        class="bt15"
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="addOpen"
                    >添加属性</el-button>
                    <!-- 渲染表格 -->
                    <!-- 渲染表格 -->
                    <el-table :data="onlyData" style="width: 100%" border stripe>
                        <!-- expand 展开 -->
                        <el-table-column type="expand">
                            <template v-slot="{row}">
                                <!-- {{row.attr_vals}} -->
                                <el-tag
                                    v-for="(item,i) in row.attr_vals"
                                    :key="item.i"
                                    closable
                                    @close="handleClose(i,row)"
                                >{{item}}</el-tag>
                                <!-- input 还是 Tag ? -->
                                <el-input
                                    style="width:120px"
                                    class="input-new-tag"
                                    v-if="row.inputVisible"
                                    v-model="row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(row)"
                                    @blur="handleInputConfirm(row)"
                                ></el-input>
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(row)"
                                >+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                        <!-- 操作区域 -->
                        <el-table-column label="操作">
                            <template v-slot="{row}">
                                <!-- {{row}} -->
                                <!-- 修改按钮 -->
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="editOpen(row)"
                                >修改</el-button>
                                <!-- 删除按钮 -->
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="delOpen(row)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数/属性 Dialog 区域 -->
        <el-dialog
            :title="'添加'+titleText"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addClose"
        >
            <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="100px">
                <el-form-item :label="'添加'+ titleText +'：'" prop="attr_name" label-width="20%">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addSend">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类Dialog区域 -->
        <el-dialog
            :title="'修改'+titleText"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="addClose"
        >
            <el-form :model="editForm" :rules="addRules" ref="editRef" label-width="100px">
                <el-form-item :label="'修改'+ titleText +'：'" prop="attr_name" label-width="20%">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editSend">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
export default {
    data() {
        return {
            // 分类列表
            catList: [],
            // 选中的分类
            selectCatIds: [],
            // 级联选择规则
            selectCatProps: {
                expandTrigger: "hover",
                label: "cat_name",
                value: "cat_id",
                children: "children"
            },
            // 当前选择的Tab
            activeTabName: "many",
            manyData: [],
            onlyData: [],
            editDialogVisible: false,
            addDialogVisible: false,
            addForm: {
                attr_name: "",
                attr_sel: ""
            },
            addRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur"
                    }
                ]
            },
            editForm: {}
        };
    },
    created() {
        // 获取所有商品分类列表
        this.getCatList();
    },
    computed: {
        isBtnDisabled() {
            if (this.selectCatIds.length !== 3) {
                return true;
            }
            return false;
        },
        // 当前选中的三级分类的id
        cateId() {
            if (this.selectCatIds.length === 3) {
                return this.selectCatIds[2];
            }
            return null;
        },
        titleText() {
            if (this.activeTabName == "many") {
                return "动态参数";
            } else {
                return "静态属性";
            }
        }
    },
    methods: {
        // 获取所有商品分类列表
        async getCatList() {
            const { data: res } = await this.$http.get("categories");
            if (res.meta.status !== 200) {
                return this.$message.error("获取分类列表失败");
            }
            // console.log(res)
            this.catList = res.data;
            // console.log(this.catList)
        },
        // 级联选择器改变
        slectCatChange() {
            this.getParamData();
            if (this.selectCatIds.length !== 3) {
                this.selectCatIds = [];
                this.manyData = [];
								this.onlyData = [];
								return
            }
        },
        // Tab面板改变
        TabChange() {
            this.getParamData();
        },
        // 获取参数列表数据 重新渲染列表
        async getParamData() {
            if (this.selectCatIds.length !== 3) {
                this.selectCatIds = [];
                return this.$message.error("只允许为第三级分类设置相关参数");
            }
            const { data: res } = await this.$http.get(
                `categories/${this.cateId}/attributes`,
                {
                    params: { sel: this.activeTabName }
                }
            );
            // console.log(res);
            if (res.meta.status !== 200) {
                return this.$message.error("获取参数列表失败");
            }
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals
                    ? item.attr_vals.split(" ")
                    : [];
                // 控制文本框的显示与隐藏
                item.inputVisible = false;
                // 文本框中输入的值
                item.inputValue = "";
            });
            // console.log(res.data)
            if (this.activeTabName == "many") {
                this.manyData = res.data;
            } else {
                this.onlyData = res.data;
            }
        },
        addOpen() {
            this.addDialogVisible = true;
        },
        addClose() {
            this.$refs.addRef.resetFields();
        },
        addSend() {
            this.$refs.addRef.validate(async valid => {
                if (!valid) {
                    return this.$message.error("添加参数失败");
                } else {
                    // console.log(this.cateId)
                    this.addForm.attr_sel = this.activeTabName;
                    console.log(this.addForm);
                    const { data: res } = await this.$http.post(
                        `categories/${this.cateId}/attributes`,
                        this.addForm
                        // {
                        //     attr_name: this.addForm.attr_name,
                        //     attr_sel: this.activeTabName
                        // }
                    );
                    // console.log(res);
                    if (res.meta.status !== 201) {
                        this.$message.error("添加参数失败");
                    }
                    this.$message.success("添加参数成功");
                    this.addDialogVisible = false;
                    this.getParamData();
                }
            });
        },
        async editOpen(row) {
            // console.log(row)

            // 查询原来的数据
            const {
                data: res
            } = await this.$http.get(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                { params: { attr_sel: this.activeTabName } }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("获取表单失败");
            }
            console.log(res);
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editClose() {
            // this.$refs.editRef.resetFields();
        },
        editSend() {
            this.$refs.editRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$http.put(
                    `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                    this.editForm
                );
                // console.log(res)
                if (res.meta.status !== 200) {
                    return this.$message.error("修改参数失败");
                }
                this.$message.success("修改参数成功");
                this.editDialogVisible = false;
                this.getParamData();
            });
        },
        async delOpen(row) {
            const confirm = await this.$confirm(
                "此操作将永久删除该文件, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            // console.log(confirm)
            if (!confirm) return this.$message.info("取消删除");
            const { data: res } = await this.$http.delete(
                `categories/${this.cateId}/attributes/${row.attr_id}`
            );
            // console.log(res)
            if (res.meta.status !== 200) return this.$message.error("删除失败");
            this.$message.success("删除成功");
            this.getParamData();
        },
        async handleInputConfirm(row) {
            // console.log('ok')
            // 没输入内容
            if (row.inputValue.trim().length == 0) {
                row.inputValue = "";
                row.inputVisible = false;
                return;
            }
            // 输入内容 加入 row.attr_vals 这个数组中
            row.attr_vals.push(row.inputValue.trim());
            // 清空，避免二次累加
            row.inputValue = "";
            // 上传
            const { data: res } = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(" ")
                }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("修改失败");
            }
            this.$message.success("修改成功");
            row.inputVisible = false;
        },
        showInput(row) {
            row.inputVisible = true;
            // 让文本框自动获得焦点
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        async handleClose(i, row) {
            row.attr_vals.splice(i, 1);
            const { data: res } = await this.$http.put(
                `categories/${this.cateId}/attributes/${row.attr_id}`,
                {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(" ")
                }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("修改失败");
            }
            this.$message.success("修改成功");
            row.inputVisible = false;
        }
    }
};
</script>


<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
.bt15 {
    margin-bottom: 15px;
}
.el-tag {
    margin: 5px;
}
</style>