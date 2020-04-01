<template>
  <div :element-loading-text="loadingMsg" class="m-homepage" v-loading.fullscreen.lock="!!loadingMsg">
    <transition mode="out-in" name="fade">
      <m-view @toMenu="menuId = $event" @userNum="userNum = $event" class="m-view clearfix" v-show="!menuId"></m-view>
    </transition>
    <div class="menu-list clearfix">
      <transition-group mode="out-in" name="fade">
        <div :key="menu.name" @click="onClickMenu(menu)" v-for="menu in menus" v-show="!menuId">
          <div>
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left" height="70" width="20%">
                  <i :class="menu.icon"></i>
                </td>
                <td :width="menu.icon2 ? '60%' : '70%'" align="left">
                  <table align="left" border="0" cellpadding="1" cellspacing="0">
                    <tr>
                      <td class="title">{{menu.name}}</td>
                    </tr>
                    <tr class="tips" v-if="menu.tips">
                      <td class="c-info">{{menu.tips}}</td>
                      <td v-if="menu.data">{{menu.data}}</td>
                    </tr>
                  </table>
                </td>
                <td :width="menu.icon2 ? '20%' : '10%'" align="right">
                  <template v-if="menu.icon2 === 'custom'">
                    <led-switch></led-switch>
                  </template>
                  <i :class="menu.icon2" class="middle" v-else-if="menu.icon2"></i>
                  <i :class="menu.icon3 ? menu.icon3 : 'el-icon-arrow-right'"></i>
                </td>
              </tr>
            </table>
          </div>
          <hr color="#d5deea" noshade />
        </div>
      </transition-group>
      <transition mode="out-in" name="fade">
        <m-menus :id="menuId" @post="getMsgFromTabs" v-if="menuId"></m-menus>
      </transition>
    </div>
  </div>
</template>
<script>
import MView from './MView'
import LedSwitch from './components/LedSwitch'
import { default as MMenus, menus as menuList } from './MMenus'
export default {
  name: 'MHomepage',
  props: {
    showMenu: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      loadingMsg: false,
      menuId: false,
      menus: menuList,
      wanProto: '动态获取(DHCP)'
    }
  },
  components: {
    MView,
    MMenus,
    LedSwitch
  },
  watch: {
    showMenu(v) {
      this.menuId = false
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {},
    onClickMenu(menu) {
      if (menu.id && menu.vue) {
        return (this.menuId = menu.id)
      }
      switch (menu.id) {
        case 'test':
          this.test()
          break
        case 'pcWeb':
          this.$router.push({ name: 'admin/alone' })
          break
        case 'mQuick':
          this.$router.push({ name: 'm/quick' })
          break
        default:
          break
      }
    },
    test() {
      this.$message.info('test')
    },
    getMsgFromTabs(data) {
      // console.log(data)
      if (data.loadingMsg) {
        // MNetwork
        this.loadingMsg = data.loadingMsg
      } else if (data.menuId) {
        // NotFound
        this.menuId = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/style/utils/_variable';
.m-homepage {
  .m-view {
    // position: fixed;
    // left: 1%;
    // height: 105px;
    float: left;
    width: 100%;
    margin: 0 auto;
    padding: 10px 5px;
  }
  .menu-list {
    // margin: 105px 5% 0;
    float: left;
    margin: 0 5%;
    width: 90%;
    padding: 10px 0;
    table {
      border-collapse: collapse;
      padding: 0px 0px 0px 0px;
      background-position: center;
      border: 0px;
      tr {
        td:first-child i {
          font-size: 46px;
        }
        td:last-child i {
          font-size: 22px;
        }
        td i.middle {
          font-size: 26px;
        }
      }
    }
    .title {
      // color: $--color-primary-light-3;
      height: 20px;
      font-size: 16px;
    }
    .tips {
      height: 20px;
      font-size: 12px;
    }
  }
}
</style>
