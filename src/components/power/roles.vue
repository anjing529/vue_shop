<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 添加角色按钮 -->
            <el-button type="primary" @click="addDialogVisible=true">添加角色</el-button>
            <!-- 角色列表 -->
            <el-table :data="rolesList" stripe style="width: 100%" border>
                <!-- 展开列内容 -->
                <el-table-column type="expand">
                    <template v-slot="{row}">
                        <!-- <pre>{{row.children}}</pre> -->
                        <el-row v-for="item1 in row.children" :key="item1.id" class="bdbottom hc">
                            <!-- 一级权限 -->
                            <el-col :span="5">
                                <el-tag
                                    closable
                                    @close="delRightById(row,item1.id)"
                                >{{item1.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 二/三级权限 -->
                            <el-col :span="19">
                                <el-row
                                    v-for="item2 in item1.children"
                                    :key="item2.id"
                                    class="bdtop hc"
                                >
                                    <!-- 二级权限 -->
                                    <el-col :span="6">
                                        <el-tag
                                            closable
                                            @close="delRightById(row,item2.id)"
                                            type="success"
                                        >{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <!-- 三级权限 -->
                                    <el-col :span="18" class="hc">
                                        <el-tag
                                            closable
                                            @close="delRightById(row,item3.id)"
                                            v-for="item3 in item2.children"
                                            :key="item3.id"
                                            type="warning"
                                        >{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template v-slot="{row}">
                        <!-- {{row.level}} -->
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="edit(row.id)"
                        >编辑</el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            size="mini"
                            @click="del(row.id)"
                        >删除</el-button>
                        <el-button
                            type="warning"
                            icon="el-icon-setting"
                            size="mini"
                            @click="showRight(row)"
                        >分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加角色dialog -->
        <el-dialog
            title="添加角色"
            :visible.sync="addDialogVisible"
            width="30%"
            @closed="addDialogClosed"
            :close-on-click-modal="false"
        >
            <el-form
                :model="addUserForm"
                :rules="addUserRules"
                label-width="80px"
                ref="addUserFormRef"
            >
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addUserForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addUserForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑角色 -->
        <el-dialog
            title="编辑角色"
            :visible.sync="editDialogVisible"
            width="30%"
            @closed="editDialogClosed"
            :close-on-click-modal="false"
        >
            <el-form
                :model="editUserForm"
                :rules="addUserRules"
                label-width="120px"
                ref="editUserFormRef"
            >
                <el-form-item label="修改角色名称" prop="roleName">
                    <el-input v-model="editUserForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="修改角色描述" prop="roleDesc">
                    <el-input v-model="editUserForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 分配权限 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="30%"
            @closed="setRightDialogClosed"
            :close-on-click-modal="false"
        >
            <!-- Tree -->
            <el-tree
                :data="setRightForm"
                :props="defaultProps"
                show-checkbox
                node-key="id"
                default-expand-all
                :default-checked-keys="defkeys"
                @close="treeclose"
                ref="treeRef"
            ></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="setRight">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            rolesList: [],
            addDialogVisible: false,
            editDialogVisible: false,
            addUserForm: {},
            editUserForm: {},
            addUserRules: {
                roleName: [
                    {
                        required: true,
                        message: "请输入角色名称"
                    },
                    {
                        min: 2,
                        max: 6,
                        message: "长度在 2 到 6 个字符",
                        trigger: "blur"
                    }
                ]
            },
            setRightDialogVisible: false,
            setRightForm: [],
            defaultProps: {
                children: "children",
                label: "authName"
            },
            defkeys: [],
            roleId: ""
        };
    },
    created() {
        this.getRolesList();
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http.get("roles");
            // console.log(res)
            if (res.meta.status !== 200)
                return this.$message.error("获取角色列表失败");
            // 渲染列表
            this.rolesList = res.data;
            // console.log(this.rolesList);
        },
        addDialogClosed() {
            this.$refs.addUserFormRef.resetFields();
        },
        async addUser() {
            // console.log(this.addUserForm)
            const { data: res } = await this.$http.post(
                "roles",
                this.addUserForm
            );
            // console.log(res)
            if (res.meta.status !== 201)
                return this.$message.error("创建角色失败");
            this.addDialogVisible = false;
            this.getRolesList();
            this.$message.success("创建角色成功");
        },
        edit(id) {
            this.editDialogVisible = true;
            this.editUserForm.id = id;
        },
        async editUser() {
            // console.log(this.editUserForm)
            const { data: res } = await this.$http.put(
                "roles/" + this.editUserForm.id,
                this.editUserForm
            );
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error("修改角色失败");
            }
            this.editDialogVisible = false;
            this.getRolesList();
            this.$message.success("修改角色成功");
        },
        editDialogClosed() {
            this.$refs.editUserFormRef.resetFields();
        },
        async del(id) {
            const confirm = await this.$confirm(
                "此操作将永久删除该角色, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            // console.log(confirm)
            if (confirm !== "confirm") {
                return this.$message.info("取消删除");
            }
            const { data: res } = await this.$http.delete("roles/" + id);
            if (res.meta.status !== 200) {
                return this.$message.error("删除角色失败");
            }
            this.$message({
                type: "success",
                message: "删除角色成功"
            });
            this.getRolesList();
            this.addDialogVisible = false;
        },
        async delRightById(user, rightId) {
            const confirm = await this.$confirm(
                "此操作将永久删除该权限, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            // console.log(confirm);
            if (confirm !== "confirm") return this.$message.error("取消删除");
            const { data: res } = await this.$http.delete(
                "roles/" + user.id + "/rights/" + rightId
            );
            // console.log(res)
            if (res.meta.status !== 200)
                return this.$message.error("删除权限失败");
            // this.getRolesList()
            this.$message.success("删除权限成功");
            user.children = res.data;
        },
        async showRight(role) {
            this.roleId = role.id;
            this.getLeafKeys(role, this.defkeys);
            this.setRightDialogVisible = true;
            const { data: res } = await this.$http.get("rights/tree");
            // console.log(res)
            if (res.meta.status !== 200) {
                return this.$message.error("获取权限列表失败");
            }
            this.setRightForm = res.data;
            // console.log(this.setRightForm)
        },
        setRightDialogClosed() {},
        async setRight() {
            // console.log(this.$refs.treeRef.getCheckedKeys())
            // console.log(this.$refs.treeRef.getHalfCheckedKeys())
            let arr = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ];
            // console.log(arr)
            const idStr = arr.join(",");
            // console.log(idStr)
            // console.log(this.roleId);
            const { data: res } = await this.$http.post(
                'roles/' + this.roleId + '/rights',
                { rids: idStr }
            );
            // console.log(res);
            if(res.meta.status!==200){
              return this.$message.error('角色授权失败')
            }
            this.setRightDialogVisible=false
            this.getRolesList()
            this.$message.success('角色授权成功')
        },
        getLeafKeys(node, arr) {
            if (!node.children) {
                return arr.push(node.id);
            }
            node.children.forEach(item => {
                this.getLeafKeys(item, arr);
            });
        },
        treeclose() {
            this.defkeys = [];
        }
    }
};
</script>

<style lang="less" scoped>
.el-card {
    margin-top: 15px;
    .el-table {
        margin-top: 15px;
    }
}
.el-tag {
    margin: 7px;
}
.bdtop {
    border-top: 1px solid #eee;
}
.bdtop:nth-of-type(1) {
    border-top: none;
}
.bdbottom {
    border-bottom: 1px solid #eee;
}
.bdbottom:nth-of-type(1) {
    border-top: 1px solid #eee;
}
.hc {
    display: flex;
    align-items: center;
}
</style>