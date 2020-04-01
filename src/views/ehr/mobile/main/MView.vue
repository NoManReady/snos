<template>
  <div class="m-view">
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
      <tr>
        <td @click="onToMenu('network')" align="center" class="pointer" width="16%">
          <div class="view-icon mt5 vm">
            <i class="rjucd-network icon-inner" data-icon></i>
            <p class="c-success">互联网</p>
          </div>
        </td>
        <td @click="onToMenu('network')" align="center" class="pointer" width="18%">
          <div class="flow-tips">
            <i class="el-icon-top vm"></i>
            <span class="vm">{{ flow.up || 0 | rateTrans }}</span>bps
          </div>
          <hr :class="netStatusClass" class="hr mtb5" />
          <div class="flow-tips">
            <i class="el-icon-bottom vm"></i>
            <span class="vm">{{ flow.down || 0 | rateTrans }}</span>bps
          </div>
        </td>
        <td @click="onToMenu('system')" align="center" class="pointer" width="30%">
          <img :src="require('@/assets/eg/ew1200.png')" class="ew" width="100%" />
        </td>
        <td @click="onToMenu('wifi')" align="center" class="pointer" width="18%">
          <div class="view-icon-line dashed">
            <i class="rjucd-wifi icon-bottom c-success" data-icon="无线"></i>
          </div>
          <div class="view-icon-line">
            <i class="rjucd-upport icon-bottom" data-icon="有线"></i>
          </div>
        </td>
        <td @click="onToMenu('user')" align="center" class="pointer" width="16%">
          <div class="view-icon mt5 vm">
            <i :data-icon="`${userNum}台`" class="el-icon-mobile-phone icon-inner"></i>
            <p class="c-success">终端</p>
          </div>
        </td>
      </tr>
    </table>
  </div>
</template>
<script>
import { rateTrans } from '@/utils/utils'
import { mapGetters } from 'vuex'
export default {
  name: 'MView',
  filters: {
    rateTrans
  },
  data() {
    return {
      product: 'EW1200G PRO',
      userNum: '-',
      flow: {
        up: 123456.45,
        down: 999999
      }
    }
  },
  created() {
    this.loadData()
  },
  computed: {
    ...mapGetters(['netStatus', 'sysinfo']),
    netStatusClass() {
      return {
        true: 'c-success',
        false: 'c-warning',
        '': 'loading'
      }[this.netStatus.connnected]
    }
  },
  methods: {
    async loadData() {
      let params = [
        {
          method: 'devSta.get',
          params: { module: 'flow', data: 'interface_info' }
        },
        {
          method: 'devSta.get',
          params: {
            module: 'user_list',
            data: { devType: 'all', dataType: 'timely' }
          }
        }
      ]
      const _res = await this.$api.cmd(
        'cmdArr',
        { params },
        { isSilence: true, noParse: true }
      )
      // this.flow = Object.assign({}, this.flow, ..._res[0].data.wan)
      const userList = _res[1].list || []
      this.userNum = userList.length || 0
      this.$emit('userNum', this.userNum)
    },
    onToMenu(menuId) {
      this.$emit('toMenu', menuId)
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable.scss';
.m-view {
  background-color: $box-bgc;
  // width: 100%;
  // margin: 0 auto;
  // box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2), 0px 2px 1px rgba(0, 0, 0, 0.12),
  //   0px 1px 1px rgba(0, 0, 0, 0.14);
  table {
    border-collapse: collapse;
    padding: 0;
    background-position: center;
    border: 0;
    .ew {
      min-width: 80px;
      // transform: scale(1.1);
    }
    .flow-tips {
      word-wrap: break-word;
      min-width: 84px;
      font-size: 10px;
      i {
        float: left;
        font-size: 16px;
      }
      span {
        vertical-align: top;
      }
    }

    .view-icon {
      display: inline-block;
      width: 62px;
      height: 100px;
      overflow: hidden;
      i {
        font-size: 66px;
        &.icon-inner {
          &::after {
            font-size: 16px;
            top: 45%;
            left: 50%;
            // color: $--color-primary;
            transform: translate(-50%, -58%);
          }
        }
      }
    }
    .hr {
      color: $--color-info;
    }
    .view-icon-line {
      min-width: 44px;
      height: 36px;
      color: $--color-text-regular;
      i {
        font-size: 20px;
        background-color: $box-bgc;
        &.icon-bottom {
          position: relative;

          &::after {
            position: absolute;
            content: attr(data-icon);
            font-size: 12px;
            display: inline-block;
            width: 34px;
            top: 100%;
            left: 50%;
            color: $--color-info;
            transform: translate(-50%, 0%) scale(1);
          }
        }
      }
      position: relative;
      &:before {
        content: '';
        display: block;
        border: 1px solid $--color-info;
        position: absolute;
        width: 100%;
        top: 30%;
        z-index: 0;
      }
      &.dashed:before {
        border: 1px dashed $--color-info;
      }
    }
  }
}
</style>
