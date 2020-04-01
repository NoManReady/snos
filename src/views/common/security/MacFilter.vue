<template>
  <div class="security-macfilter">
    <help-alert json-key="macFilterJson" :title="$t('arp_filter.mac_filter')">
      <div slot="content">{{ $t("arp_filter.filter_tip") }}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">{{ $t("arp_filter.mac_filter") }}</span>
      </div>
      <el-form :model="pageData" class="w500" label-width="160px" size="medium">
        <el-form-item :label="$t('arp_filter.mac_filter')" prop="enable">
          <el-switch
            active-value="1"
            inactive-value="0"
            v-model="pageData.enable"
          ></el-switch>
          <strong class="vm ml10 c-warning" v-if="pageData.enable === '0'">{{
            $t("arp_filter.enable_tip")
          }}</strong>
          <strong
            class="vm ml10 c-warning"
            v-else-if="pageData.model === 'white'"
            >{{ $t("arp_filter.allow_list") }}</strong
          >
          <strong
            class="vm ml10 c-warning"
            v-else-if="pageData.model === 'black'"
            >{{ $t("arp_filter.forbid_list") }}</strong
          >
        </el-form-item>
        <el-form-item :label="$t('arp_filter.filter_type')">
          <el-select class="w300" v-model="pageData.model">
            <el-option
              :label="$t('arp_filter.black_list')"
              value="black"
            ></el-option>
            <el-option
              :label="$t('arp_filter.white_list')"
              value="white"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            class="w160"
            size="medium"
            type="primary"
            v-auth="onSwitchMode"
            >{{ $t("action.save_edit") }}</el-button
          >
        </el-form-item>
      </el-form>
      <div class="box-header">
        <span class="box-header-tit">{{ $t("arp_filter.rule_list") }}</span>
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
          <i18n path="arp_filter.filter_limit" tag="span">
            <b class="c-warning mlr5" place="max">{{ MAX_NUM }}</b>
          </i18n>
        </div>
      </help-alert>
      <el-table
        :data="pageList"
        ref="baseTable"
        row-key="mac"
        size="medium"
        stripe
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column
          align="center"
          :label="$t('sysinfo.mac_addr')"
          prop="mac"
        ></el-table-column>
        <el-table-column
          align="center"
           :label="$t('phrase.remark')"
          prop="comment"
        ></el-table-column>
        <el-table-column align="center" :label="$t('action.ope')">
          <template slot-scope="scope">
            <el-button
              @click="onEdit(scope.$index)"
              size="medium"
              type="text"
              >{{ $t("action.edit") }}</el-button
            >
            <el-button
              size="medium"
              type="text"
              v-auth="{ fn: onDel, params: scope.row }"
              >{{ $t("action.delete") }}</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="pageModel.pageIndex"
        :page-size="pageModel.pageSize"
        :page-sizes="[5, 10, 20, 50]"
        :total="pageTotal"
        @current-change="onCurrentChange"
        @size-change="_onSizeChange"
        background
        class="mt20"
        layout="total, sizes, prev, pager, next, jumper"
      ></el-pagination>

      <!-- 新增/编辑 -->
      <el-dialog :title="modalTitle" :visible.sync="modalShow" width="550px">
        <el-form
          :model="baseModel"
          :rules="baseRules"
          label-width="160px"
          ref="baseForm"
          size="medium"
        >
          <el-form-item :label="$t('sysinfo.mac_addr')" prop="mac">
            <arp-input
              class="w260"
              filterType="LAN"
              :placeholder="$t('arp_bind.select_mac')"
              v-model="baseModel.mac"
              valueKey="mac"
            ></arp-input>
          </el-form-item>
          <el-form-item :label="$t('phrase.remark')" prop="comment">
            <el-input class="w260" v-model="baseModel.comment"></el-input>
          </el-form-item>
        </el-form>
        <span class="dialog-footer" slot="footer">
          <el-button @click="modalShow = false" size="medium">{{
            $t("action.cancel")
          }}</el-button>
          <el-button @click="onModalConfirm" size="medium" type="primary">{{
            $t("action.confirm")
          }}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import pageMixins from "@/mixins/pageMixins";
import { nameLengthValidator, macValidator } from "@/utils/rules";
import ArpInput from "@/common/ArpInput";
export default {
  name: "SecurityMacfilter",
  data() {
    const checkMacUnit = (rule, value, cb) => {
      let _isExit = this.pageModel.allItem.find((item, index) => {
        let _mac = item.mac.toLocaleLowerCase();
        let _editmac = this.baseModel.oldmac || "";
        return _mac === value.toLocaleLowerCase() && _mac !== _editmac;
      });
      if (_isExit) {
        cb(new Error(I18N.t("arp_bind.mac_exist")));
      }
      cb();
    };
    return {
      MAX_NUM: 80,
      pageData: {
        model: "black", // 默认为黑名单：black  白名单对应：white
        list: []
      },
      baseModel: {
        comment: "",
        mac: ""
      },
      baseRules: {
        comment: [
          {
            validator: nameLengthValidator,
            size: 32,
            message: I18N.t("arp_filter.remark_rule")
          }
        ],
        mac: [
          { required: true, message: I18N.t("wan.mac_no_empty") },
          { validator: macValidator },
          { validator: checkMacUnit }
        ]
      },
      editIndex: -1,
      modalShow: false
    };
  },
  mixins: [pageMixins],
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
    // 加载
    async _loadList() {
      let _res = await this.$api.getMacFilter();
      this.MAX_NUM = +_res.maxLen || 80;
      this.pageData = _res;
      return _res.list || [];
    },
    _getStaListLite() {
      return new Promise(async (res, rej) => {
        let _res = await this.$api.getStaListLite();
        let _list = [];
        _res.list &&
          _res.list.forEach(item => {
            _list.push({
              mac: item.mac,
              comment: item.hostName || ""
            });
          });
        res(_list);
      });
    },
    // 新增
    onAdd() {
      if (this.pageTotal >= this.MAX_NUM) {
        return this.$message.warning(
          I18N.t("arp_filter.filter_limit", { max: this.MAX_NUM })
        );
      }
      this.modalShow = true;
      this.editIndex = -1;
      this.baseModel = { comment: "", mac: "" };
      this.$nextTick(() => {
        this.$refs.baseForm.clearValidate();
      });
    },
    // 编辑
    onEdit(index) {
      this.modalShow = true;
      this.editIndex = index;
      this.baseModel = this.getItem(index);
      this.baseModel.oldmac = this.baseModel.mac; // 编辑时记录修改前的mac
    },
    //删除
    onDel(item) {
      let _items = [];
      if (item) {
        _items = [item];
      } else {
        _items = this.$refs.baseTable.selection;
        if (_items.length === 0) {
          return this.$message.warning(I18N.t("tip.select_del_item"));
        }
      }
      this.$confirm(I18N.t("tip.confirm_delete")).then(() => {
        this.$api.delMacFilter(_items).then(() => {
          let _map = _items.map(o => o.mac);
          // 更新本地数据
          this.$message({
            message: I18N.t("tip.del_success"),
            type: "success"
          });
          this.pageModel.allItem = this.pageModel.allItem.filter(item => {
            return !_map.includes(item.mac);
          });
        });
      });
    },
    // 确认
    onModalConfirm() {
      this.$refs.baseForm.validate(valid => {
        if (valid) {
          let _item = { ...this.baseModel };
          let _promise = null;
          if (this.editIndex === -1) {
            _promise = this.$api.addMacFilter([_item]).then(() => {
              this.addList(_item);
            });
          } else {
            _promise = this.$api.updateMacFilter(_item).then(() => {
              let _data = { ..._item };
              delete _data.oldmac;
              this.editList(this.editIndex, _data);
            });
          }
          _promise
            .then(() => {
              this.$message({
                message: I18N.t("tip.edit_success"),
                type: "success"
              });
            })
            .finally(() => {
              this.modalShow = false;
            });
        }
      });
    },
    // 提交数据
    onSwitchMode() {
      this.$api
        .updateMacFilter({
          enable: this.pageData.enable,
          model: this.pageData.model
        })
        .then(() => {
          this.$message({
            message: I18N.t("tip.edit_success"),
            type: "success"
          });
        });
    }
  }
};
</script>
<style lang="scss" scoped>
</style>
