<template>
  <div class="ap-list-popover" style="display:inline-block">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="400">
      <el-form :model="query" label-width="90px" ref="form">
        <div class="tc mb30" v-if="isAp">搜索当前分组</div>
        <el-form-item label="设备序列号" size="small">
          <el-input class="w260" v-model="query.sn"></el-input>
        </el-form-item>
        <el-form-item label="设备型号" size="small">
          <el-input class="w260" v-model="query.devType"></el-input>
        </el-form-item>
        <el-form-item label="软件版本" size="small">
          <el-input class="w260" v-model="query.software"></el-input>
        </el-form-item>
        <el-form-item label="设备MAC" size="small">
          <el-input class="w260" v-model="query.mac"></el-input>
        </el-form-item>
        <el-form-item label="在线状态" size="small">
          <el-select class="w260" placeholder="在线状态" v-model="query.status">
            <el-option label="全部" value></el-option>
            <el-option label="在线" value="ON"></el-option>
            <el-option label="离线" value="OFF"></el-option>
            <el-option label="从未上线" value="NEVER_ON"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearchAplist()" plain type="primary">搜索</el-button>
          <el-button @click="showSearch=false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <el-popover placement="bottom-end" ref="propsPopover" trigger="click" v-model="showProp" width="140">
      <el-form ref="filterForm">
        <el-row class="pl20">
          <el-col :span="24">
            <el-checkbox :disabled="true" label="设备名称" v-model="props.hostName"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="IP地址" v-model="props.ip"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="MAC地址" v-model="props.mac"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="在线状态" v-model="props.status"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="型号" v-model="props.deviceType"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="用户数" v-model="props.staNum"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="软件版本" v-model="props.update"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="序列号" v-model="props.serialNumber"></el-checkbox>
          </el-col>
          <el-col :span="24" class="mt10">
            <el-checkbox label="分组名称" v-model="props.groupName"></el-checkbox>
          </el-col>
          <!-- <el-col :span="24" class="mt10">
            <el-checkbox label="软件版本" v-model="props.software"></el-checkbox>
          </el-col>-->
          <el-col :span="24" class="mt10">
            <el-checkbox label="信道" v-model="props.channel"></el-checkbox>
          </el-col>
        </el-row>
      </el-form>
    </el-popover>
    <el-button plain size="small" type="primary" v-popover:searchPopover>
      <span>高级搜索</span>
    </el-button>
    <el-button plain size="small" type="primary" v-popover:propsPopover>
      <span>列表筛选</span>
    </el-button>
  </div>
</template>
<script>
import { Col, Row, Tree } from 'element-ui'
export default {
  name: 'ApListPopover',
  props: {
    isAp: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      query: {
        sn: '',
        groupId: '',
        devType: '',
        status: '',
        software: '',
        mac: ''
      },
      props: {
        hostName: true,
        mac: true,
        ip: true,
        status: true,
        deviceType: true,
        staNum: true,
        serialNumber: true,
        software: false,
        channel: false,
        update: true,
        groupName: false
      },
      showSearch: false,
      showProp: false
    }
  },
  components: {
    [Col.name]: Col,
    [Row.name]: Row
  },
  created() {
    this.$emit('oncrated', {
      props: this.props,
      query: this.query
    })
  },
  methods: {
    onSearchAplist() {
      this.showSearch = false
      this.$emit('search', this.query)
    }
  }
}
</script>
<style lang="scss">
</style>
