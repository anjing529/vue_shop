<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
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
                        @clear="getOrderList"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表区域 -->
            <el-table :data="orderForm" style="width: 100%" stripe border>
                <el-table-column label="#" type="index"></el-table-column>

                <el-table-column prop="order_number" label="订单编号" min-width="130px"></el-table-column>
                <el-table-column prop="order_price" label="订单价格"></el-table-column>
                <el-table-column prop="pay_status" label="是否付款">
                    <template v-slot="{row}">
                        <el-tag type="success" v-if="row.pay_status=='1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货"></el-table-column>
                <el-table-column prop="create_time" label="下单时间">
                    <template v-slot="{row}">{{row.create_time|dataFormat}}</template>
                </el-table-column>
                <el-table-column label="操作">
                    <template v-slot="{row}">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editOpen"></el-button>
                        <el-button
                            type="success"
                            icon="el-icon-location"
                            @click="showProgressBox"
                            size="mini"
                        ></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[2, 3, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 编辑地址Dialog区域 -->
        <el-dialog
            title="编辑地址"
            :visible.sync="editDialogVisible"
            width="30%"
            :before-close="handleClose"
        >
            <!-- 外层表单 -->
            <el-form
                :model="addressForm"
                :rules="addressRules"
                ref="addressFormRef"
                label-width="100px"
            >
                <!-- 省市区 级联选择器 -->
                <el-form-item label="省市区" prop="ssq">
                    <el-cascader
                        size="large"
                        :options="options"
                        v-model="addressForm.ssq"
                        @change="handleChange"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="addr">
                    <el-input v-model="addressForm.addr"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editsend">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 显示物流进度区域 -->
        <el-dialog title="物流进度" :visible.sync="showDialogVisible" width="50%">
            <el-timeline :reverse="true">
                <el-timeline-item
                    v-for="(item, i) in progressInfo"
                    :key="i"
                    :timestamp="item.time"
                >{{item.context}}</el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
// 引入省市级联模块
import { regionData, CodeToText } from "element-china-area-data";
import _ from "lodash";

export default {
    data() {
        return {
            // 搜索栏数据
            queryInfo: {
                query: "",
                pagenum: 1,
                pagesize: 10
            },
            total: 0,
            // 列表查询到的数据
            orderForm: [],
            editDialogVisible: false,
            // 省市联动数据
            options: regionData,
            // 选择的省市区
            selectedOptions: [],
            // 修改的地址
            addressForm: {
                ssq: [],
                ssqArr: [],
                ssqText: "",
                addr: ""
            },
            addressRules: {
                ssq: [
                    { required: true, message: "请选择省市区", trigger: "blur" }
                ],
                addr: [
                    {
                        required: true,
                        message: "请填写详细地址",
                        trigger: "blur"
                    }
                ]
            },
            showDialogVisible: false,
            // 物流信息
            progressInfo: []
        };
    },
    created() {
        // 查询订单列表，渲染页面
        this.getOrderList();
    },
    computed: {},
    methods: {
        // 查询订单列表，渲染页面
        async getOrderList() {
            const { data: res } = await this.$http.get("orders", {
                params: this.queryInfo
            });
            if (res.meta.status !== 200)
                return this.$message.error("获取订单列表失败");
            // console.log(res);
            this.total = res.data.total;
            this.orderForm = res.data.goods;
        },
        // 页面size改变
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getOrderList();
        },
        // 当前页面改变
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage;
            this.getOrderList();
        },
        // 打开编辑地址Dialog
        editOpen() {
            this.editDialogVisible = true;
        },
        handleChange(value) {
            //     console.log(value);
        },
        handleClose() {},
        // 提交编辑地址
        editsend() {
            this.codeToHZ(this.addressForm.ssq);
        },
        // 省市区还原成汉语
        codeToHZ() {
            const sheng = this.addressForm.ssq[0];
            const shi = this.addressForm.ssq[1];
            const qu = this.addressForm.ssq[2];
            if (sheng !== undefined) {
                this.addressForm.ssqArr.push(CodeToText[sheng]);
            }
            if (shi !== undefined) {
                this.addressForm.ssqArr.push(CodeToText[shi]);
            }
            if (qu !== undefined) {
                this.addressForm.ssqArr.push(CodeToText[qu]);
            }
            this.addressForm.ssqText = this.addressForm.ssqArr.join("");
            console.log(this.addressForm.ssqText);
        },
        // 显示物流进度区域
        async showProgressBox() {
            this.showDialogVisible = true;
            const { data: res } = await this.$http.get("/kuaidi/1106975712662");
            if (res.meta.status !== 200)
                return this.$message.error("获取物流失败");
            this.progressInfo = res.data;
            console.log(this.progressInfo);
        }
    }
};
</script>

<style lang="less" scoped>
.el-table {
    margin: 15px 0;
}
</style>