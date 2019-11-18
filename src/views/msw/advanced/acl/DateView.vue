<template>
  <div class="acl-date view">
    <template v-if="Object.keys(time.time).length">
      <el-popover :visible-arrow="false" trigger="click" width="450">
        <el-table :data="_getTimeArr(time.time)" size="mini">
          <el-table-column align="center" label="星期" property="label" width="100"></el-table-column>
          <el-table-column align="center" label="时间段" property="slot">
            <template slot-scope="{row}">
              <div class="pt5 pl5 tl">
                <el-tag :key="`${f}-${row.value}`" class="mr5 mb5" size="mini" v-for="f in row.slot">{{`${f[0]}-${f[1]}`}}</el-tag>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <i class="el-icon-date pointer c-success" slot="reference" v-if="icon"></i>
        <el-button size="mini" slot="reference" type="text" v-else>{{time.tmngtName}}</el-button>
      </el-popover>
    </template>
    <template v-else>所有时段</template>
  </div>
</template>
<script>
import { Tag } from 'element-ui'
export default {
  name: 'acl-date-view',
  components: {
    [Tag.name]: Tag
  },
  props: {
    time: {
      type: Object | Array,
      default: () => ({})
    },
    icon: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      weeks: Object.freeze([
        { label: '星期一', value: 'mon', sort: 1 },
        { label: '星期二', value: 'tue', sort: 2 },
        { label: '星期三', value: 'wed', sort: 3 },
        { label: '星期四', value: 'thu', sort: 4 },
        { label: '星期五', value: 'fri', sort: 5 },
        { label: '星期六', value: 'sat', sort: 6 },
        { label: '星期日', value: 'sun', sort: 7 }
      ])
    }
  },
  methods: {
    // 获取时间对象数组
    _getTimeArr(timeObj) {
      let _timeArr = []
      for (let key in timeObj) {
        if (timeObj[key].length) {
          let _item = this.weeks.find(week => week.value === key)
          _timeArr.push({
            ..._item,
            slot: timeObj[key]
          })
        }
      }
      return Object.freeze(_timeArr.sort((a, b) => a.sort - b.sort))
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
