<template>
  <div class="un-auth-components mb40">
    <div class="box-header">
      <span class="box-header-tit">
        {{ title }}
        <small></small>
      </span>
      <div class="fr">
        <el-button @click="onEdit(-1)" size="small" type="primary">
          <i class="el-icon-plus"></i>
          <span>新增</span>
        </el-button>
        <el-button @click="onDel(-1)" size="small" type="primary">
          <i class="el-icon-delete"></i>
          <span>批量删除</span>
        </el-button>
      </div>
    </div>
    <el-table :data="data" ref="multipleTable" size="small" tooltip-effect="dark">
      <el-table-column align="center" type="selection" width="50"></el-table-column>
      <template v-if="type == 'url'">
        <el-table-column align="center" label="免认证网址" prop="url"></el-table-column>
      </template>
      <template v-else>
        <el-table-column align="center" label="IP地址" prop="ipaddr"></el-table-column>
        <el-table-column align="center" label="有效期（分钟）" prop="time1"></el-table-column>
        <el-table-column align="center" label="已经生效时长（分钟）" prop="time2"></el-table-column>
        <el-table-column align="center" label="描述" prop="desc"></el-table-column>
      </template>
      <el-table-column align="center" label="操作" width="100px">
        <template slot-scope="scope">
          <el-button @click="onEdit(scope.$index,scope.row)" type="text">修改</el-button>
          <el-button @click="onDel(scope.$index,scope.row)" type="text">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="modalTitle" :visible.sync="isModalShow" @open="_clearValidate" width="400px">
      <el-form :model="modelData" :rules="baseRules" label-width="110px" ref="baseForm" status-icon>
        <template v-if="type == 'url'">
          <el-form-item label="免认证网址" prop="url">
            <el-input class="w200" v-model="modelData.url"></el-input>
          </el-form-item>
        </template>
        <template v-else>
          <el-form-item label="IP 地址" prop="ipaddr">
            <el-input class="w200" v-model="modelData.ipaddr"></el-input>
          </el-form-item>
          <el-form-item label="描述" prop="desc">
            <el-input class="w200" type="textarea" v-model="modelData.desc"></el-input>
          </el-form-item>
        </template>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="onClickFormBtn(false)">取 消</el-button>
        <el-button @click="onClickFormBtn(true)" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import formMixins from '@/mixins/formMixins'
import { ipValidator } from '@/utils/rules'
export default {
  name: 'UnAuthComponents',
  props: {
    title: '',
    type: '',
    data: {
      default: [],
      type: Array
    }
  },
  mixins: [formMixins],
  data() {
    return {
      modalTitle: '',
      isModalShow: false,
      modelData: {},
      baseRules: {
        url: [{ required: true, message: '请输入免认证网址' }],
        ipaddr: [
          { required: true, message: '请输入ip地址' },
          { validator: ipValidator }
        ],
        desc: [{ required: true, message: '请输入描述' }]
      }
    }
  },
  methods: {
    onEdit(idx, data) {
      this.modalTitle = (idx < 0 ? '新增' : '修改') + this.title
      this.isModalShow = true

      this.modelData = Object.assign({}, data)
    },
    onDel() {},
    onClickFormBtn(isConfirm) {
      if (!isConfirm) return (this.isModalShow = false)

      this.$refs.baseForm.validate(ok => {
        if (ok) {
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
