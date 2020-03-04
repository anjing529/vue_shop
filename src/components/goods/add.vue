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
                <el-tabs
                    v-model="activeIndex"
                    @tab-click="tabChange"
                    tab-position="left"
                    :before-leave="beforeLeave"
                >
                    <!-- 基本信息 -->
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
                    <!-- 商品参数 -->
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item
                            v-for="item in manyData"
                            :key="item.attr_id"
                            :label="item.attr_name"
                        >
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox
                                    v-for="(item2,i) in item.attr_vals"
                                    :key="i"
                                    :label="item2"
                                    border
                                ></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品属性 -->
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item
                            v-for="item in onlyData"
                            :key="item.attr_id"
                            :label="item.attr_name"
                        >
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <!-- 商品图片 -->
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :action="uploadUrl"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :headers="uploadHeadrObj"
                            :on-success="handleSuccess"
                        >
                            <el-button size="small" type="primary">点击上传</el-button>
                            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                        </el-upload>
                    </el-tab-pane>
                    <!-- 商品内容 -->
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-button class="btnAdd" type="primary" @click="btnAdd">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览区域 -->
        <el-dialog title="图片预览" :visible.sync="preDialogVisible" width="50%">
            <img :src="preUrl" style="width:100%" alt />
        </el-dialog>
    </div>
</template>

<script>
import _ from "lodash";

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
                goods_cat: [],
                pics: [],
                goods_introduce: "",
                attrs: []
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
            },
            // 动态参数列表数据
            manyData: [],
            // 静态属性列表数据
            onlyData: [],
            // 图片上传的url
            uploadUrl: "http://127.0.0.1:8888/api/private/v1/upload",
            // 图片上传的header
            uploadHeadrObj: {
                Authorization: window.sessionStorage.getItem("token")
            },
            // 预览图片url
            preUrl: "",
            preDialogVisible: false,
            attrs: []
        };
    },
    created() {
        // 获取商品分类
        this.getCategories();
    },
    computed: {
        // 获取三级分类ID
        cateId() {
            if (this.addForm.goods_cat.length === 3) {
                return this.addForm.goods_cat[2];
            }
            return null;
        }
    },
    methods: {
        // 改变Tab
        async tabChange() {
            // console.log(this.activeIndex)
            // 访问动态参数面板
            if (this.activeIndex === "1") {
                const { data: res } = await this.$http.get(
                    `categories/${this.cateId}/attributes`,
                    {
                        params: { sel: "many" }
                    }
                );
                // console.log(res)
                if (res.meta.status !== 200)
                    return this.$message.error("获取失败");
                res.data.forEach(item => {
                    item.attr_vals =
                        item.attr_vals.length === 0
                            ? []
                            : item.attr_vals.split(" ");
                });
                this.manyData = res.data;
                // console.log(this.manyData);
            }
            // 访问静态属性面板
            if (this.activeIndex === "2") {
                const { data: res } = await this.$http.get(
                    `categories/${this.cateId}/attributes`,
                    {
                        params: { sel: "only" }
                    }
                );
                // console.log(res)
                if (res.meta.status !== 200)
                    return this.$message.error("获取失败");
                // console.log(res.data)
                // res.data.forEach(item => {
                //     item.attr_vals =
                //         item.attr_vals.length === 0
                //             ? []
                //             : item.attr_vals.split(" ");
                // });
                this.onlyData = res.data;
            }
        },
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
        beforeLeave(avtiveNmae, oldActiveName) {
            // console.log(avtiveNmae,oldActiveName)
            if (oldActiveName == 0 && this.addForm.goods_cat.length !== 3) {
                this.$message.error("请先选择三级商品分类");
                return false;
            }
        },
        // 处理图片预览
        handlePreview(file) {
            console.log(file);
            this.preUrl = file.response.data.url;
            this.preDialogVisible = true;
        },
        // 处理图片移除
        handleRemove(file) {
            // console.log(file);
            // 获取要删除的图片的临时url
            const filePath = file.response.data.tmp_path;
            // 从pics数组中，找到图片对应的index
            const i = this.addForm.pics.findIndex(x => {
                x.pic = filePath;
            });
            // splice 删除
            this.addForm.pics.splice(i, 1);
            // console.log(this.addForm.pics)
        },
        // 图片上传成功的钩子
        handleSuccess(response) {
            // console.log(response)
            // 1.拼接图片信息
            const picInfo = { pic: response.data.tmp_path };
            // push 到addForm 的pics 数组中
            this.addForm.pics.push(picInfo);
            // console.log(this.addForm.pics);
        },
        // 添加商品
        btnAdd() {
            // console.log(this.addForm.goods_introduce)
            this.$refs.addFormFef.validate(async valid => {
                if (!valid) return this.$message.error("请填写必要的表单项目");
                // 执行添加逻辑
                // 先处理goods_cat addForm内本身是[],API要求是Str
                // 利用lodash cloneDeep(obj) 深拷贝
                const form = _.cloneDeep(this.addForm);
                form.goods_cat = form.goods_cat.join(",");
                // console.log(this.manyData)
                // 处理 动态参数
                this.manyData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(" ")
                    };
                    this.addForm.attrs.push(newInfo);
                });
                // console.log(this.addForm);

                // // // 处理 静态属性
                this.onlyData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    };
                    this.addForm.attrs.push(newInfo);
                });
                // console.log(this.addForm);
                form.attrs = this.addForm.attrs;
								// console.log(form);
								
								// 提交请求
								const {data:res} = await this.$http.post('goods',form)
								if(res.meta.status!==201) return this.$message.error('添加失败')
								this.$message.success('添加成功')
								this.$router.push('/goods')
            });
        }
    }
};
</script>

<style lang="less" scoped>
.el-steps {
    margin: 15px 0;
}
.el-checkbox {
    margin: 0 10px 0 0 !important;
}
.btnAdd {
    margin-top: 15px;
}
</style>