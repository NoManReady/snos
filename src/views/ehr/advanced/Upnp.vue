<template>
  <div class="network-neighbor">
    <help-alert json-key="exampleJson" title>
      <div slot="content">
        <strong>UPnP（Universal Plug and Play)</strong>
        {{$t('ehr.upnp.upnp_tip')}}
        <el-tooltip effect="light" placement="bottom">
          <i class="el-icon-info fs16"></i>
          <div class="w300" slot="content">
            {{$t('ehr.upnp.upnp_content1')}}
            {{$t('ehr.upnp.upnp_content2')}}
            <p>{{$t('ehr.upnp.upnp_content3')}}</p>
            <p>{{$t('ehr.upnp.upnp_content4')}}</p>
            <p>{{$t('ehr.upnp.upnp_content5')}}</p>
          </div>
        </el-tooltip>
      </div>
    </help-alert>
    <div class="box-header">
      <span class="box-header-tit">
        {{$t('ehr.upnp.upnp_list')}}
        <small></small>
      </span>
    </div>
    <div class="mb10">
      <label>{{$t('ehr.upnp.upnp_switch')}}</label>
      <el-switch active-value="true" inactive-value="false" v-model="upnp.enable_upnp"></el-switch>
    </div>
    <el-table :data="upnp.upnpds" :empty-text="emptyText" size="medium" stripe>
      <el-table-column :label="$t('ehr.upnp.proto')" align="center" prop="proto">
        <template slot-scope="scope">{{scope.row.proto.toLocaleUpperCase()}}</template>
      </el-table-column>
      <el-table-column :label="$t('ehr.upnp.app_name')" align="center" prop="name"></el-table-column>
      <el-table-column :label="$t('ehr.upnp.client_ip')" align="center" prop="sip"></el-table-column>
      <el-table-column :label="$t('ehr.upnp.inside_port')" align="center" prop="sport"></el-table-column>
      <el-table-column :label="$t('ehr.upnp.outside_port')" align="center" prop="dport"></el-table-column>
    </el-table>
  </div>
</template>
<script>
export default {
  name: 'Upnp',
  data() {
    return {
      ignoreEnable: true,
      upnp: {
        enable_upnp: 'first',
        upnpds: []
      }
    }
  },
  async created() {
    await this.loadUpnp()
  },
  computed: {
    emptyText() {
      return this.upnp.enable_upnp === 'false'
        ? this.$t('ehr.upnp.upnp_disabled')
        : this.$t('ehr.upnp.no_upnp_dev')
    }
  },
  watch: {
    'upnp.enable_upnp': {
      handler(v, o) {
        if (this.ignoreEnable) {
          return
        }
        this.$confirm(
          this.$t('ehr.upnp.upnp_confirm', {
            enable: v === 'false' ? '关闭' : '开启'
          })
        ).then(
          _ok => {
            this.toggle()
          },
          _cancel => {
            this.upnp.enable_upnp = o
            this.ignoreEnable = true
            this.$nextTick(_ => {
              this.ignoreEnable = false
            })
          }
        )
      },
      immediate: false
    }
  },
  methods: {
    async loadUpnp() {
      this.upnp = await this.$api.cmd('devSta.get', { module: 'upnp' })
      this.$nextTick(_ => {
        this.ignoreEnable = false
      })
    },
    async toggle() {
      this.$api
        .cmd('devSta.set', {
          module: 'upnp',
          data: {
            enable_upnp: this.upnp.enable_upnp
          }
        })
        .then(_ => {
          this.$message.success(this.$t('tip.edit1_success'))
          setTimeout(() => {
            this.loadUpnp()
          }, 1000)
        })
    }
  }
}
</script>
