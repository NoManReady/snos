<template>
  <div class="net-neighbor">
    <div class="head">
      {{
        $t("quickmacc.found_dev_tip", {
          total: myCount + otherCount,
          newcnt: otherCount
        })
      }}
    </div>
    <help-alert
      :showIcon="false"
      class="text-help"
      :help-tip="$t('quickmacc.cnt_help')"
      json-key="netNeighborJson"
      title
    >
      <div class="info" slot="content">
        <label class="c-info">{{ $t("quickmacc.confirm_dev_cnt") }}</label>
      </div>
      <span class="c-success pointer fs14" slot="helpContent">
        <i class="rjucd-help vm"></i>
        <span class="xs-hide">{{ $t("quickmacc.cnt_help") }}</span>
      </span>
      <span slot="collapseFoot">
        <span>{{ $t("quickmacc.weixin_scan") }}</span>
        <div class="mg15">
          <qrcode-vue :value="helpUrl" level="L" size="150"></qrcode-vue>
        </div>
      </span>
    </help-alert>
    <net-view
      :is-macc="true"
      :other-count="otherCount"
      class="mtb15"
    ></net-view>
    <neighbor :is-macc="true" @change="_onChange"></neighbor>
  </div>
</template>
<script>
import NetView from "@/views/common/overview/components/NetView";
import Neighbor from "@/views/common/menuout/Neighbor";
import QrcodeVue from "qrcode.vue";
export default {
  name: "NetVeighbor",
  data() {
    return {
      myCount: 0,
      otherCount: 0,
      isNew: true,
      helpUrl: 'http://faq.rj.link/ryfaq'
    }
  },
  computed: {},
  components: {
    NetView,
    Neighbor,
    QrcodeVue
  },
  async created() {},
  methods: {
    _onChange(data) {
      this.isNew = data.myNetwork[0].networkId === "0";
      this.myCount = data.myNetwork[0].subDevice.length || 1;
      this.otherCount = data.neighbor.reduce(
        (t, c) => t + c.subDevice.length,
        0
      );
      if (data.newDevice[0]) {
        this.otherCount += data.newDevice[0].subDevice.length;
      }
      this.$log(data);
    }
  }
};
</script>
<style lang="scss">
.text-help {
  .el-alert {
    padding: 0;
    background-color: inherit !important;
    &__content {
      padding: 0;
    }
  }
}
</style>
<style lang="scss" scoped>
.net-neighbor {
  .head {
    line-height: 28px;
    font-size: 20px;
    margin-bottom: 8px;
  }
  .info {
    line-height: 20px;
    font-size: 14px;
  }
  .text-help {
    .info {
      padding-right: 150px;
      overflow: auto;
    }
    .rjucd-help {
      line-height: 14px;
    }
    @media screen and (max-width: 768px) {
      .xs-hide {
        display: none;
      }
      .info {
        padding-right: 0;
      }
    }
  }
}
</style>
