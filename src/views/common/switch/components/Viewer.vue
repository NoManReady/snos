<template>
  <div class="switch-viewer">
    <el-tabs :lazy="true" :stretch="true" v-model="activeTab">
      <el-tab-pane name="sys">
        <span slot="label">
          <i class="rjucd-project vm"></i>
          <span class="vm">系统信息</span>
        </span>
        <keep-alive>
          <switch-sys v-bind="$attrs" v-if="activeTab==='sys'" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane name="basic">
        <span slot="label">
          <i class="rjucd-network vm"></i>
          <span class="vm">基本配置</span>
        </span>
        <keep-alive>
          <switch-basic v-bind="$attrs" v-if="activeTab==='basic'" />
        </keep-alive>
      </el-tab-pane>
      <el-tab-pane name="upgrade">
        <span slot="label">
          <i class="rjucd-cloud vm"></i>
          <span class="vm">系统升级</span>
        </span>
        <switch-upgrade v-bind="$attrs" v-if="activeTab==='upgrade'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
import Sys from './Sys'
import Basic from './Basic'
import Upgrade from './Upgrade'
import switchModule from '@/store/modules/switch'
import store from '@/store'
import { mapActions } from 'vuex'
export default {
  name: 'switch-viewer',
  components: {
    [Sys.name]: Sys,
    [Basic.name]: Basic,
    [Upgrade.name]: Upgrade
  },
  props: {
    item: {
      type: Object
    }
  },
  data() {
    return {
      activeTab: 'sys'
    }
  },
  beforeCreate() {
    store.registerModule('switch', switchModule())
  },
  async created() {
    await this.setCurrentItem(this.item)
    this.fetchUplink()
    await this.fetchPortInfo()
    await this.fetchVMode()
  },
  mounted() {
    this.$bus.$on('PORT_LIST_UPDATE', this.fetchPortInfo)
  },
  beforeDestroy() {
    store.unregisterModule('switch')
    this.$bus.$off('PORT_LIST_UPDATE')
  },
  methods: {
    ...mapActions('switch', [
      'setCurrentItem',
      'fetchPortInfo',
      'fetchVMode',
      'fetchUplink'
    ])
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/variable';
.switch-viewer {
  width: 550px;
  // padding: 0 15px;

  /deep/ .el-loading-spinner {
    transform: none;
    background-color: transparent;
    width: 100%;
    left: auto;
  }
  /deep/ .el-table th.is-leaf {
    background-color: #f5f7fa !important;
  }

  /deep/ .vue-treeselect {
    &__control {
      height: 28px;
      // line-height: 28px;
    }
    &__multi-value-item-container {
      line-height: 1;
      padding: 0;
    }
    &__multi-value {
      margin-bottom: 0;
    }
    &__input {
      padding: 0;
    }
    &__input-container {
      padding: 0 !important;
    }
    &__placeholder {
      font-size: 12px;
      line-height: 28px;
    }
    &__multi-value-label {
      padding: 0;
    }
  }
  /deep/ .collapse-group {
    &__title {
      padding: 12px 0 6px 6px;
      font-weight: bold;
      font-size: 13px;
      // opacity: 0.8;
      color: lighten($--color-info, 10%);
    }
  }
  /deep/ .el-collapse {
    border-radius: 3px;
    border: none;
    &-item__header,
    &-item__content {
      padding: 0 6px;
    }
    &-item__header {
      height: 40px;
      line-height: 40px;
      &.is-active strong {
        color: $theme !important;
      }
    }
    &-item__arrow {
      line-height: 40px;
    }
    &-item__content {
      padding-bottom: 20px;
    }
  }
}
</style>
