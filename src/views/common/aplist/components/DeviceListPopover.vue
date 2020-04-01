<template>
  <div class="ap-list-popover" style="display:inline-block">
    <el-popover placement="bottom-end" ref="searchPopover" trigger="click" v-model="showSearch" width="400">
      <el-form :model="query" label-width="90px" ref="form" size="medium">
        <div class="tc mb30" v-if="isAp">{{ $t("devlist.search_cur_group") }}</div>
        <el-form-item :label="$t('sysinfo.sn_num')">
          <el-input class="w260" v-model="query.sn"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.dev_type')">
          <el-input class="w260" v-model="query.devType"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.soft_version')">
          <el-input class="w260" v-model="query.software"></el-input>
        </el-form-item>
        <el-form-item :label="$t('sysinfo.mac_addr')">
          <el-input class="w260" v-model="query.mac"></el-input>
        </el-form-item>
        <el-form-item :label="$t('devlist.online_status')">
          <el-select :placeholder="$t('devlist.online_status')" class="w260" v-model="query.status">
            <el-option :label="$t('phrase.all')" value></el-option>
            <el-option :label="$t('devlist.online')" value="ON"></el-option>
            <el-option :label="$t('devlist.offline')" value="OFF"></el-option>
            <el-option :label="$t('devlist.never_online')" value="NEVER_ON"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="onSearchAplist()" type="primary">{{ $t("phrase.search") }}</el-button>
          <el-button @click="showSearch = false">{{ $t("action.cancel") }}</el-button>
        </el-form-item>
      </el-form>
    </el-popover>
    <el-popover placement="bottom-end" ref="propsPopover" trigger="click" v-model="showProp" width="140">
      <el-row class="pl20">
        <el-col :span="24">
          <el-checkbox :disabled="true" :label="$t('sysinfo.dev_name')" v-model="props.hostName"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('sysinfo.ip_addr')" v-model="props.ip"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('sysinfo.mac_addr')" v-model="props.mac"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('devlist.online_status')" v-model="props.status"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('sysinfo.dev_type')" v-model="props.deviceType"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('devlist.user_cnt')" v-model="props.staNum"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('sysinfo.soft_version')" v-model="props.update"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('devlist.sn')" v-model="props.serialNumber"></el-checkbox>
        </el-col>
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('devlist.group_name')" v-model="props.groupName"></el-checkbox>
        </el-col>
        <!-- <el-col :span="24" class="mt10">
            <el-checkbox label="软件版本" v-model="props.software"></el-checkbox>
        </el-col>-->
        <el-col :span="24" class="mt10">
          <el-checkbox :label="$t('devlist.channel')" v-model="props.channel"></el-checkbox>
        </el-col>
      </el-row>
    </el-popover>
    <el-button plain size="medium" type="primary" v-popover:searchPopover>
      <span>{{ $t("devlist.advanced_search") }}</span>
    </el-button>
    <el-button plain size="medium" type="primary" v-popover:propsPopover>
      <span>{{ $t("devlist.list_filter") }}</span>
    </el-button>
  </div>
</template>
<script>
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
