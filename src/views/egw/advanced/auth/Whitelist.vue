<template>
  <div class="whitelist">
    <help-alert title="配置为免认证的用户IP或者MAC，可以直接上网不需要认证。" json-key="exampleJson"></help-alert>
    <white-table @delete="onDel" @edit="onEdit" :whitelist="whitelist.srcip" title="免认证用户" type="srcip"></white-table>
    <white-table @delete="onDel" @edit="onEdit" :whitelist="whitelist.dstip" title="免认证外网IP" type="dstip"></white-table>
    <white-table @delete="onDel" @edit="onEdit" :whitelist="whitelist.url" title="URL白名单" type="url"></white-table>
    <white-table @delete="onDel" @edit="onEdit" :whitelist="whitelist.mac" :opposite-mac="whitelist.deny_mac" title="用户MAC白名单" type="mac"></white-table>
    <white-table @delete="onDel" @edit="onEdit" :whitelist="whitelist.deny_mac" :opposite-mac="whitelist.mac" title="用户MAC黑名单" type="deny_mac"></white-table>
  </div>
</template>
<script>
import WhiteTable from './components/WhiteTable'
export default {
  name: 'Whitelist',
  data() {
    return {
      whitelist: {},
      apis: {
        srcip: 'setSrcip',
        dstip: 'setDstip',
        url: 'setDirectUrl',
        mac: 'setDirectMac',
        deny_mac: 'setDenyMac'
      }
    }
  },
  components: {
    WhiteTable
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.$api.getAuthLess().then(d => {
        this.whitelist = d || {
          srcip: [],
          dstip: [],
          url: [],
          mac: [],
          deny_mac: []
        }
      })
    },
    onDel(type, delData) {
      let setData = {
        type: type
      }
      setData.data = this.whitelist[type].filter(
        item => delData.indexOf(item) < 0
      )
      this.onSetWhitelist(type, setData)
    },
    onEdit(type, data, row) {
      let setData = {
        type: type
      }
      setData.data = this.whitelist[type].slice(0)
      // let idx = row.idx < 0 ? setData.data.length + 1 : row.idx
      if (row.idx < 0) {
        setData.data.push(data)
      } else {
        setData.data.splice(row.idx, 1, data)
      }
      this.onSetWhitelist(type, setData)
    },
    onSetWhitelist(type, data) {
      let api = this.apis[type]
      this.$api[api](data, true).then(d => {
        this.whitelist[type] = data.data
        this.$message({
          message: '配置成功',
          type: 'success'
        })
      })
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
