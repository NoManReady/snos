<template>
  <div class="edit-popover">
    <el-popover ref="popoverRef" placement="top" trigger="click" width="300" v-model="popoverShow">
      <el-form ref="baseForm" size="mini">
        <p class="tc fs15 mb10">修改设备信道</p>
        <el-form-item :label="`${radio.type}信道`" v-for="radio in channelList" label-width='80px' :key="radio.type">
          <el-select class="w200" v-model="radio.channel">
            <el-option label="自动" value="auto"></el-option>
            <template v-if="radio.type==='2.4G'">
              <el-option v-for="channel in channel2G.items" :key="channel.v" :label="channel.v+'（'+channel.k+'）'" :value="channel.v"></el-option>
            </template>
            <template v-else>
              <el-option v-for="channel in channel5G.items" :key="channel.v" :label="channel.v+'（'+channel.k+'）'" :value="channel.v"></el-option>
            </template>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="tc">
        <el-button size="mini" type="text" @click="popoverShow = false">取消</el-button>
        <el-button type="primary" size="mini" @click="onSubmit">确定</el-button>
      </div>
    </el-popover>
    <label v-popover:popoverRef class="eweb-static-form--label pointer ssidname">
      <a href="javascript:;" class="c-success">{{channel}}</a>
      <i class="el-icon-edit fs16 c-success ml5"></i>
    </label>
  </div>
</template>
<script>
export default {
  name: 'ChannelPopover',
  props: {
    ap: Object
  },
  data() {
    return {
      popoverShow: false,
      channel2G: {
        items: [],
        cur: ''
      },
      channel5G: {
        items: [],
        cur: ''
      },
      channelList: []
    }
  },
  computed: {
    channel() {
      return this.ap.channel || ''
    },
    ip() {
      return this.ap.ip
    },
    sn() {
      return this.ap.serialNumber
    }
  },
  watch: {
    popoverShow(v) {
      if (v) {
        this.channelList = this._strToList()
      } /*  else {
        this.$nextTick(() => {
          this.$refs.baseForm.clearValidate()
        })
      } */
    }
  },
  async created() {
    await this._loadChannels()
    this._loadRadio()
  },
  methods: {
    // 加载射频（设备）
    async _loadRadio() {
      let _radios = await this.$api.getRadio()
      this.radios = _radios
    },
    // 提交hostname
    onSubmit() {
      let _str = this._listToStr()
      this.$emit('submit', _str)
      this.setApChannel()
      this.popoverShow = false
    },
    async setApChannel() {
      let data = await this.$api.cmd('devConfig.set', {
        module: 'radio',
        data: { }
      }, { timeout: 0}) // 流表信息可能很多，设置最大超时
    },
    _strToList() {
      let _tmpArr = this.channel.split(/\s*,\s*/)
      let _res = []
      _tmpArr.forEach((ch, i) => {
        _res.push({
          type: i === 0 ? '2.4G' : '5G',
          channel: ch.includes('auto') ? 'auto' : ch,
          channelStr: ch
        })
      })
      return _res
    },
    _listToStr() {
      let _str = ''
      this.channelList.forEach((radio, i) => {
        if (i !== 0) {
          _str += ','
        }
        _str +=
          radio.channel === 'auto'
            ? radio.channelStr.includes('auto')
              ? radio.channelStr
              : 'auto'
            : radio.channel
      })
      return _str
    },
    // 加载信道列表
    async _loadChannels() {
      let _channelStr = await this.$api.getChannel()
      this.channel2G = this._formatChannel(_channelStr.channel2G)
      this.channel5G = this._formatChannel(_channelStr.channel5G)
    },
    // 格式化信道
    _formatChannel(str) {
      let _arr = []
      let _curArr = ['auto', null]
      if (str) {
        let _temp = str.split(/[↵,\n]/)
        let _last = _temp.pop()
        _arr = _temp.slice(0, _temp.length - 1).map(item => {
          let _item = item.replace(
            /\s*Channel\s*0?(\d+)\s*:\s*(\d+(.\d+)?\s*GHz)/,
            '$1,$2'
          )
          let _itemArr = _item.split(',')
          return {
            v: _itemArr[0],
            k: _itemArr[1]
          }
        })
        _curArr = _last
          .replace(/.*:(\d+(.\d+)?\s*GHz)\s*\(Channel\s*0?(\d+)\)/, '$1,$3')
          .split(',')
      }
      return {
        items: _arr,
        cur: _curArr[0],
        channel: _curArr[1]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.edit-popover {
  .ssidname:hover > .el-icon-edit {
    display: inline;
  }
  .el-icon-edit {
    display: none;
  }
}
</style>