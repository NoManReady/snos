<template>
  <div class="network-static">
    <help-alert json-key="staticJson" :title="$t('network.static_alloc_list')">
      <!-- <div slot="content">{{ $t("network.static_alloc_list") }}</div> -->
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("network.static_alloc_list") }}
          <small></small>
        </span>
        <div class="fr">
          <el-button
            icon="el-icon-plus"
            plain
            size="medium"
            type="primary"
            v-auth="onAdd"
            >{{ $t("action.add") }}</el-button
          >
          <el-button
            icon="el-icon-delete"
            plain
            size="medium"
            type="primary"
            v-auth="onDel"
            >{{ $t("action.patch_delete") }}</el-button
          >
        </div>
      </div>
      <help-alert :show-icon="false" title>
        <div slot="content">
          <i18n path="tip.max_limit" tag="span">
            <b place="cnt" class="c-warning mlr5">{{ MAX_NUM }}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table
        :data="pageList"
        ref="multipleTable"
        row-key="macaddr"
        size="medium"
        stripe
      >
        <el-table-column
          align="center"
          type="selection"
          width="50"
        ></el-table-column>
        <el-table-column
          align="center"
          :label="$t('phrase.serial')"
          type="index"
        ></el-table-column>
        <el-table-column
          align="center"
          :label="$t('sysinfo.ip_addr')"
          prop="ipaddr"
        ></el-table-column>
        <el-table-column
          align="center"
          :label="$t('sysinfo.mac_addr')"
          prop="macaddr"
        ></el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button
              size="medium"
              type="text"
              v-auth="{ fn: onEdit, params: [scope.$index, scope.row] }"
              >{{ $t("action.edit") }}</el-button
            >
            <el-button
              size="medium"
              type="text"
              v-auth="{ fn: onDel, params: scope.row.macaddr }"
              >{{ $t("action.delete") }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="pageModel.pageSizes"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 静态地址编辑 -->
      <el-dialog
        :title="modalTitle"
        :visible.sync="isModalShow"
        @open="_clearValidate"
        width="500px"
      >
        <el-form
          :model="baseModel"
          :rules="baseRules"
          label-width="160px"
          ref="baseForm"
          size="medium"
          status-icon
        >
          <el-form-item :label="$t('sysinfo.ip_addr')" prop="ipaddr">
            <arp-input
              @select="onSelectIp"
              class="w260"
              filterType="LAN"
              :placeholder="$t('wan.ip_example')"
              v-model="baseModel.ipaddr"
            ></arp-input>
          </el-form-item>
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="macaddr">
            <el-input
              class="w260"
              :placeholder="$t('wan.mac_example')"
              v-model="baseModel.macaddr"
            ></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">{{
            $t("action.cancel")
          }}</el-button>
          <el-button
            :disabled="isSetting"
            :loading="isSetting"
            @click="onSubmitForm"
            size="medium"
            type="primary"
            >{{ $t("action.confirm") }}</el-button
          >
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import ArpInput from "@/common/ArpInput";
import { ipValidator, macValidator } from "@/utils/rules";
import pageMixins from "@/mixins/pageMixins";
import formMixins from "@/mixins/formMixins";
export default {
  name: "DhcpStatic",
  data() {
    const checkIpaddrUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(
        (item, index) =>
          item.ipaddr === value && index !== this.getRealIndex(this.editIndex)
      );
      if (_isExit) {
        cb(new Error(I18N.t("rules.ip_is_exist")));
      }
      cb();
    };
    const _compareVal = (v, v1) => {
      return v && v1 && v.toLocaleLowerCase() === v1.toLocaleLowerCase();
    };
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find(item => {
        return (
          _compareVal(item.macaddr, value) &&
          !_compareVal(
            this.editIndex > -1 ? this.pageList[this.editIndex].macaddr : "",
            value
          )
        );
      });
      if (_isExit) {
        cb(new Error(I18N.t("rules.mac_is_exist")));
      }
      cb();
    };
    return {
      MAX_NUM: 300,
      baseModel: {
        ipaddr: "",
        macaddr: ""
      },
      editIndex: -1,
      isSetting: false,
      isModalShow: false,
      baseRules: {
        ipaddr: [
          { required: true, message: I18N.t("wan.ip_no_empty") },
          { validator: ipValidator },
          { validator: checkIpaddrUnit }
        ],
        macaddr: [
          { required: true, message: I18N.t("wan.mac_no_empty") },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      }
    };
  },
  mixins: [pageMixins, formMixins],
  components: {
    ArpInput
  },
  computed: {
    modalTitle() {
      return this.editIndex !== -1
        ? I18N.t("action.edit")
        : I18N.t("action.add");
    }
  },
  methods: {
    async _loadList() {
      let _result = await this.$api.getStaticDhcpTable();
      return _result.dhcp_static || [];
    },
    // 删除静态dhcp绑定
    onDel(macArr) {
      macArr = macArr
        ? [macArr]
        : this.$refs.multipleTable.selection.map(item => item.macaddr);
      if (!macArr.length) {
        return this.$message.warning(I18N.t("tip.select_del_item"));
      }
      this._onDel(macArr);
    },
    // 删除
    _onDel(macArr) {
      this.$confirm(I18N.t("tip.confirm_delete")).then(() => {
        this.$api.delStaticDhcpTable(macArr).then(d => {
          macArr.forEach(mac => {
            let _index = this.pageList.findIndex(
              ({ macaddr }) => macaddr === mac
            );
            this.removeList(_index);
          });
          this.$message({
            message: I18N.t("tip.del_success"),
            type: "success"
          });
        });
      });
    },
    // 新增
    onAdd() {
      if (this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          I18N.t("tip.max_limit", { cnt: this.MAX_NUM })
        );
      }
      this.isModalShow = true;
      this.editIndex = -1;
      this.baseModel = { ipaddr: "", macaddr: "" };
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate();
      });
    },
    // 编辑添加静态dhcp
    onEdit(idx, row = {}) {
      this.isModalShow = true;
      this.editIndex = idx;
      this.baseModel = Object.assign({}, row);
    },
    // 提交数据
    onSubmitForm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          this.isSetting = true;
          let _promise = null;
          let _list = [this.baseModel];
          // 编辑
          if (this.editIndex > -1) {
            _promise = this.$api
              .updateStaticDhcpTable({
                new: this.baseModel,
                old: this.pageList[this.editIndex]
              })
              .then(() => {
                this.editList(this.editIndex, this.baseModel);
              });
          } else {
            _promise = this.$api.addStaticDhcpTable(_list).then(() => {
              this.addList(this.baseModel);
            });
          }
          _promise
            .then(d => {
              this.$message({
                message: I18N.t("tip.edit1_success"),
                type: "success"
              });
            })
            .finally(() => {
              this.isSetting = false;
              this.isModalShow = false;
            });
        }
      });
    },
    onSelectIp(item) {
      if (item.mac) {
        this.baseModel.macaddr = item.mac;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
