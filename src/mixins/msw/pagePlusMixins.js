import { Pagination } from 'element-ui'
export default {
  components: {
    [Pagination.name]: Pagination
  },
  data() {
    return {
      pageList: [],
      pageModel: {
        index: 1,
        size: 10,
        sizes: [5, 10, 20, 50],
        total: 0
      }
    }
  },
  async created() {
    await this._initPage()
  },
  methods: {
    async _initPage() {
      if (this._loadList && typeof this._loadList === 'function') {
        let result = await this._loadList(this._applyQuery())
        this.pageList = result.list
        this.pageModel.total = Number(result.total) || 0
        this.$refs.multipleTable && this.$refs.multipleTable.clearSelection()
      }
    },
    onSizeChange(size) {
      this.pageModel.size = size
      this._initPage()
    },
    onCurrentChange(index) {
      this.pageModel.index = index
      this._initPage()
    },
    _applyQuery() {
      let query = Object.assign(
        {
          index: this.pageModel.index,
          size: this.pageModel.size
        },
        this[this.queryKey || 'query'] || {}
      )

      Object.keys(query).forEach(key => {
        if (query[key] === '') {
          delete query[key]
        }
      })

      return query
    },
    // 查询
    doQuery() {
      this.onCurrentChange(1)
    },
    // 删除
    removeList(index) {
      if (index > -1 && index < this.pageList.length) {
        this.pageList.splice(index, 1)
      }
    },
    // 编辑
    editList(index, item) {
      if (index > -1 && index < this.pageList.length) {
        this.pageList.splice(index, 1, item)
      }
    }
  }
}
