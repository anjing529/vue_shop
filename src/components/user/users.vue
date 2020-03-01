<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
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
                        @clear="getUserList"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <!-- 添加用户按钮 -->
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userlist" style="width: 100%" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template v-slot=" {row}">
                        <!-- {{row}} -->
                        <el-switch v-model="row.mg_state" @change="userStatusChange(row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop label="操作">
                    <template v-slot="{row}">
                        <!-- {{row}} -->
                        <!-- 修改按钮 -->
                        <el-tooltip content="修改角色" placement="top" :enterable="false">
                            <el-button
                                type="primary"
                                icon="el-icon-edit"
                                circle
                                size="mini"
                                @click="editUserForm(row)"
                            ></el-button>
                        </el-tooltip>

                        <!-- 删除按钮 -->
                        <el-tooltip content="删除角色" placement="top" :enterable="false">
                            <el-button
                                type="danger"
                                icon="el-icon-delete"
                                circle
                                size="mini"
                                @click="removeUserById(row.id)"
                            ></el-button>
                        </el-tooltip>

                        <!-- 分配角色按钮 -->
                        <el-tooltip content="分配角色" placement="top" :enterable="false">
                            <el-button
                                type="warning"
                                icon="el-icon-setting"
                                circle
                                size="mini"
                                @click="setRight(row)"
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
                :page-sizes="[1, 2, 3, 5]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="30%"
            @closed="addDialogClosed"
            :close-on-click-modal="false"
        >
            <!-- 内容的主题区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="30%"
            @closed="editDialogClosed"
            :close-on-click-modal="false"
        >
            <!-- 主体区域 -->
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email" clearable></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="mobile">
                    <el-input v-model="editForm.mobile" clearable></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo()">确 定</el-button>
        </el-dialog>

        <!-- 分配角色 -->
        <el-dialog title="分配角色" :visible.sync="setDialogVisible" width="30%" close="setClose">
            当前的用户：{{currentuser}}
            <br />
            当前的用户角色：{{currentrole}}
            <el-select placeholder="请选择角色名称" v-model="roleName">
                <el-option
                    v-for="item in roleList"
                    :label="item.roleName"
                    :key="item.id"
                    :value="item.id"
                ></el-option>
            </el-select>

            <span slot="footer" class="dialog-footer">
                <el-button @click="setDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="up(roleName)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>



<script>
export default {
    data() {
        // 验证邮箱的规则
        var checkEmail = (rules, value, cb) => {
            const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
            if (regEmail.test(value)) {
                return cb();
            }
            cb(new Error("请输入正确的邮箱地址"));
        };
        // 验证手机号的规则
        var checkMobile = (rules, value, cb) => {
            const regMobile = /(\d{3})/;
            if (regMobile.test(value)) {
                return cb();
            }
            cb(new Error("请输入正确的电话号码"));
        };

        return {
            //获取用户列表的参数对象
            queryInfo: {
                query: "",
                pagenum: 1,
                pagesize: 3
            },
            userlist: [],
            total: 0,
            addDialogVisible: false, //控制添加用户对话框的显示/隐藏
            addForm: {},
            addFormRules: {
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur"
                    },
                    {
                        min: 3,
                        max: 10,
                        message: "用户名的长度在 3~10 个字符",
                        trigger: "blur"
                    }
                ],
                password: [
                    { required: true, message: "请输入密码", trigger: "blur" },
                    {
                        min: 6,
                        max: 15,
                        message: "密码的长度在 6~15 个字符",
                        trigger: "blur"
                    }
                ],
                email: [
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    { validator: checkEmail, trigger: "blur" }
                ],
                mobile: [
                    { required: true, message: "请输入电话", trigger: "blur" },
                    { validator: checkMobile, trigger: "blur" }
                ]
            },
            editDialogVisible: false,
            editForm: {},
            setDialogVisible: false,
            roleList: [],
            roleName: "",
            currentuser: "",
            currentrole: "",
            currentuserid: ""
        };
    },
    created() {
        //渲染页面
        this.getUserList();
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get("users", {
                params: this.queryInfo
            });
            // console.log(res)
            if (res.meta.status !== 200)
                return this.$message.error("获取用户列表失败");
            this.userlist = res.data.users;
            // console.log(this.userlist);
            this.total = res.data.total;
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },
        handleCurrentChange(currentPage) {
            this.queryInfo.pagenum = currentPage;
            this.getUserList();
        },
        async userStatusChange(userInfo) {
            const { data: res } = await this.$http.put(
                `users/${userInfo.id}/state/${userInfo.mg_state}`
            );
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state;
                return this.$message.error("更改状态失败");
            }
            return this.$message.success("更改状态成功");
        },
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                // console.log(valid)
                if (!valid) return;
                // 校验成功，可以发送添加请求
                const { data: res } = await this.$http.post(
                    "users",
                    this.addForm
                );
                // console.log(res)
                if (res.meta.status !== 201) {
                    this.$message.error("用户创建失败");
                }
                this.$message.success("用户创建成功");
                // 隐藏dialog
                this.addDialogVisible = false;
                // 重新渲染列表
                this.getUserList();
            });
        },
        async editUserForm(formdata) {
            // console.log(formdata.id)
            const { data: res } = await this.$http.get("users/" + formdata.id);
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error("获取用户信息失败");
            }
            console.log(res);
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        editDialogClosed() {
            this.$refs.editFormRef.resetFields();
        },
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                // 提交修改
                // console.log(this.editForm.id)
                const { data: res } = await this.$http.put(
                    "users/" + this.editForm.id,
                    {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile
                    }
                );
                console.log(res);
                if (res.meta.status !== 200)
                    return this.$message.error("修改用户信息失败");
                this.editDialogVisible = false;
                this.getUserList();
                this.$message.success("更新用户信息成功");
            });
        },
        async removeUserById(id) {
            // console.log(id)
            const confirmRes = await this.$confirm(
                "此操作将永久用户, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            if (confirmRes !== "confirm") {
                return this.$message.info("取消删除");
            }
            const { data: res } = await this.$http.delete("users/" + id);
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error("删除用户失败");
            }
            this.$message.success("已删除");
            this.getUserList();
        },
        async setRight(user) {
            // console.log(user)
            this.currentuser = user.username;
            this.currentrole = user.role_name;
            this.currentuserid = user.id;

            this.setDialogVisible = true;
            const { data: res } = await this.$http.get("roles");
            // console.log(res)
            this.roleList = res.data;
            // console.log(this.roleList)
        },
        async up(rolename) {
            //    console.log(rolename)
            // console.log(this.currentuserid)
            if (!this.roleName) {
               return this.$message.error("请选择角色");
            }
            const { data: res } = await this.$http.put(
                "users/" + this.currentuserid + "/role",
                { rid: this.roleName }
            );
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error("分配角色失败");
            }
            this.$message.success("分配角色成功");
            this.setDialogVisible = false;
            this.getUserList();
            
        },
        setClose(){
            this.roleName = ""
            this.currentuser=""
            this.currentrole=""
            this.currentuserid=""
        }
    }
};
</script>




<style lang="less" scoped>
.el-table {
    margin-top: 15px;
    font-size: 16px;
}
.el-pagination {
    margin-top: 15px;
}
</style>