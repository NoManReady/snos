<template>
  <div class="diagnose-alarm">
    <help-alert json-key :title="$t('diagnose.fault_alarm')">
      <div slot="content">{{ $t("diagnose.fault_alarm_tip") }}</div>
    </help-alert>
    <div class="box">
      <div class="box-header">
        <span class="box-header-tit">
          {{ $t("diagnose.fault_alarm_list") }}
          <small></small>
        </span>
        <div class="fr">
          <el-button @click="showUnFocus" plain size="medium" type="primary">{{
            unFocusText
          }}</el-button>
        </div>
      </div>
      <el-table :data="pageList" ref="table" size="medium" stripe>
        <el-table-column
          align="center"
          :label="$t('action.expand')"
          type="expand"
          v-if="!isNotMaster"
          width="80px"
        >
          <template slot-scope="{ row }">
            <el-table
              :data="row.detail"
              class="table-expand"
              size="medium"
              stripe
              tooltip-effect="light"
            >
              <el-table-column
                align="center"
                :label="$t('sysinfo.dev_name')"
                show-overflow-tooltip
                width="150"
              >
                <template slot-scope="{ row }">{{
                  (snMap[row.sn] && snMap[row.sn].nm) ||
                    localDev[`${row.sn}_nm`] ||
                    `-`
                }}</template>
              </el-table-column>
              <el-table-column
                align="center"
                :label="$t('devlist.sn')"
                prop="sn"
                width="145"
              ></el-table-column>
              <el-table-column
                align="center"
                :label="$t('phrase.type')"
                width="100"
              >
                <template slot-scope="{ row }">{{
                  (snMap[row.sn] && snMap[row.sn].dt) ||
                    localDev[`${row.sn}_dt`] ||
                    `-`
                }}</template>
              </el-table-column>
              <el-table-column
                align="center"
                :label="$t('diagnose.alarm_time')"
                width="170"
              >
                <template slot-scope="{ row }">{{
                  new Date(Number(row.time * 1000)).toLocaleString()
                }}</template>
              </el-table-column>
              <el-table-column
                align="left"
                :label="$t('diagnose.alarm_desc')"
                min-width="200"
                show-overflow-tooltip
              >
                <template slot-scope="{ row }">{{ row.msg }}</template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          :label="$t('diagnose.alarm_info')"
          min-width="160"
          prop="msg"
        >
          <template slot-scope="{ row }">
            <span class="c-warning">{{
              alarmMap[row.id].msg || `${row.id}${$t("diagnose.no_alarm_info")}`
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="left"
          :label="$t('phrase.suggest')"
          min-width="220"
          prop="suggest"
        >
          <template slot-scope="{ row }">
            <span>{{
              alarmMap[row.id].suggest ||
                `${row.id}${$t("diagnose.no_suggest_info")}`
            }}</span>
          </template>
        </el-table-column>
        <template v-if="isNotMaster">
          <el-table-column
            align="center"
            :label="$t('diagnose.alarm_time')"
            min-width="170"
          >
            <template slot-scope="{ row }">{{
              new Date(Number(row.detail[0].time * 1000)).toLocaleString()
            }}</template>
          </el-table-column>
          <el-table-column
            align="left"
            :label="$t('diagnose.alarm_desc')"
            min-width="200"
          >
            <template slot-scope="{ row }">{{
              row.detail[0].msg || "-"
            }}</template>
          </el-table-column>
        </template>

        <el-table-column
          align="center"
          :label="$t('action.ope')"
          min-width="140"
        >
          <template slot-scope="scope">
            <el-button
              @click="onDel(scope.row.id, scope.$index)"
              size="medium"
              type="text"
              >{{ $t("action.delete") }}</el-button
            >
            <el-button
              @click="onDisableAlarmUpload(scope.row.id, scope.$index)"
              size="medium"
              type="text"
              >{{ $t("diagnose.cancel_follow") }}</el-button
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

      <!-- 查看取消关注的告警 -->
      <el-dialog :title="unFocusText" :visible.sync="isModalShow" width="700px">
        <div class="clearfix">
          <el-card
            :key="id"
            class="w200 fl mb5 mr5"
            v-for="id in alarmUpload.id"
          >
            <div class="clearfix" v-if="typeof alarmMap[id] === 'object'">
              <div>{{ alarmMap[id].msg }}</div>
              <div>
                <el-button
                  @click="onEnableAlarmUpload(id)"
                  class="fr"
                  size="medium"
                  type="text"
                  >{{ $t("diagnose.re_follow") }}</el-button
                >
              </div>
            </div>
          </el-card>
        </div>
        <span class="dialog-footer" slot="footer">
          <el-button @click="isModalShow = false" size="medium">{{
            $t("action.cancel")
          }}</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { Card } from "element-ui";
import pageMixins from "@/mixins/pageMixins";

export default {
  name: "DiagnoseAlarm",
  data() {
    return {
      unFocusText: I18N.t("diagnose.view_alarm_cancel"),
      isModalShow: false,
      alarmMap: false,
      snMap: false,
      alarmUpload: {
        enable: "0",
        serverUrl: "",
        id: []
      } /*  ,
      mocklist: [
        {
          id: '42',
          detail: [
            {
              sn: 'H1MQ3W9000474',
              time: '1561030570',
              msg: '协商速率5M'
            },
            {
              sn: 'MACC522376524',
              time: '1559030572',
              msg: '最近协商速率8M'
            }
          ]
        }
      ] */
    };
  },
  mixins: [pageMixins],
  components: {
    [Card.name]: Card
  },
  computed: {
    isNotMaster() {
      let _roles = this.$roles();
      return _roles.includes("slave") || _roles.includes("alone");
    },
    localDev() {
      let sys = this.$store.getters.sysinfo;
      return {
        [`${sys.serial_num}_nm`]: I18N.t("devlist.local"),
        [`${sys.serial_num}_dt`]: sys.model
      };
    }
  },
  methods: {
    async _loadList() {
      if (!this.snMap) {
        await this._getApListLite();
      }
      if (!this.alarmMap) {
        await this._getAlarmMap();
        this._getAlarmUpload();
      }

      let _result = await this.$api.getAlarm();
      return (_result.list || []).filter(o => !!this.alarmMap[o.id]); // 过滤掉map中找不到的告警
    },
    async _getApListLite() {
      let _res = await this.$api.getAplistLite({
        status: "ON",
        productType: "EAP"
      });
      let _map = {};
      (_res.list || []).forEach(o => {
        _map[o.sn] = o;
      });
      this.snMap = _map;
    },
    async _getAlarmMap() {
      let _result = await this.$api.getAlarmMap();
      let _map = {};
      (_result.list || []).forEach(o => {
        _map[o.id] = o;
      });
      this.alarmMap = _map;
    },
    async _getAlarmUpload() {
      let _result = await this.$api.getAlarmUpload();
      _result.id.filter(id => typeof this.alarmMap[id] === "object");
      this.alarmUpload = _result;
    },
    // 删除
    async onDel(id, idx) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>${I18N.t("diagnose.del_alarm_tip1")}</li>
          <li>${I18N.t("diagnose.del_alarm_tip2")}</li>
          <li>${I18N.t("diagnose.del_alarm_tip3")}</li>
        </ul>`,
        I18N.t("diagnose.del_alarm_tip4"),
        {
          dangerouslyUseHTMLString: true
        }
      );
      await this.$api.delAlarm(id);
      this.removeList(idx);
      this.$message.info(I18N.t("tip.del_success"));
    },
    // 取消关注
    async onDisableAlarmUpload(id, idx) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>${I18N.t("diagnose.cancel_follow_tip1")}</li>
          <li>${I18N.t("diagnose.cancel_follow_tip2")}</li>
        </ul>`,
        I18N.t("diagnose.cancel_follow_tip3"),
        {
          dangerouslyUseHTMLString: true
        }
      );
      this.alarmUpload.id.push(id);
      await this.$api.updateAlarmUpload(this.alarmUpload);
      this.removeList(idx);
      this.$message.info(I18N.t("diagnose.cancel_follow_success"));
    },
    // 重新关注
    async onEnableAlarmUpload(id) {
      await this.$confirm(
        `<ul class="c-info alarm-tip ml15 mb10">
          <li>${I18N.t("diagnose.re_follow_tip1")}</li>
          <li>${I18N.t("diagnose.re_follow_tip2")}</li>
        </ul>`,
        I18N.t("diagnose.re_follow_tip3"),
        {
          dangerouslyUseHTMLString: true
        }
      );
      this.alarmUpload.id = this.alarmUpload.id.filter(i => i !== id);
      await this.$api.updateAlarmUpload(this.alarmUpload);
      this.$message.info(I18N.t("diagnose.re_follow_success"));
      this.showUnFocus();
    },
    showUnFocus() {
      if (this.alarmUpload.id.length === 0) {
        this.isModalShow = false;
        return this.$message.info(I18N.t("diagnose.show_all_alarm_tip"));
      }
      this.isModalShow = true;
    }
  }
};
</script>
<style lang="scss">
.alarm-tip li {
  list-style: decimal;
}
.diagnose-alarm {
  .el-table__expanded-cell[class*="cell"] {
    padding: 0 5px;
  }
}
</style>
