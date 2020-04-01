import { Pagination } from 'element-ui'
export default {
  components: {
    [Pagination.name]: Pagination
  },
  data() {
    return {
      pageModel: {
        page: 1,
        size: 10,
        allItem: [],
        sizes: [5, 10, 20, 30, 50],
        searchValue: '',
        searchKey: ''
      },
      refresh_enable: 0,
      __refresh_timer: null
    }
  },
  async created() {
    // if (this.refresh_enable === 0) {
    await this._initPage()
    // }
  },
  beforeDestroy() {
    clearTimeout(this.__refresh_timer)
    this.__refresh_timer = null
  },
  computed: {
    pageSearchList() {
      if (!this.pageModel.searchKey) {
        return this.pageModel.allItem
      }
      return this.pageModel.allItem.filter(item => {
        return item[this.pageModel.searchKey].indexOf(this.pageModel.searchValue) > -1
      })
    },
    pageBeginIndex() {
      return (this.pageModel.page - 1) * this.pageModel.size
    },
    pageTotal() {
      return this.pageSearchList.length
    },
    pageList() {
      return this.pageSearchList.slice(
        this.pageBeginIndex,
        this.pageModel.page * this.pageModel.size
      )
    }
  },
  watch: {
    refresh_enable: {
      handler: '_autoRefresh',
      immediate: true
    }
  },
  methods: {
    async _initPage(page) {
      if (this._loadList && typeof this._loadList === 'function') {
        let _list = await this._loadList(this._applyQuery())
        this.pageModel.allItem = Array.isArray(_list) ? _list : []
        this.onCurrentChange(page || this.pageModel.page)
      }
    },
    _autoRefresh(v) {
      if (v > 0) {
        clearTimeout(this.__refresh_timer)
        this.__refresh_timer = setTimeout(async () => {
          await this._initPage()
          this._autoRefresh(v)
        }, v)
      }
    },
    async refresh() {
      await this._initPage()
    },
    onSizeChange(size) {
      this.pageModel.size = size
      this.pageModel.page = 1
    },
    onCurrentChange(index) {
      this.pageModel.page = index
    },
    _applyQuery() {
      let query = this[this.queryKey || 'query'] || {}
      Object.keys(query).forEach(key => {
        if (query[key] === '') {
          delete query[key]
        }
      })

      return query
    },
    removeList(idx) {
      if (!Number.isInteger(idx) || ids < 0) {
        return
      }
      let _index = this.pageBeginIndex + idx
      this.pageModel.allItem.splice(_index, 1)
    },
    editList(idx, item) {
      let _index = this.pageBeginIndex + idx
      this.pageModel.allItem.splice(_index, 1, item)
    },
    addList(item) {
      this.pageModel.allItem.push(item)
    },
    searchListFuzzy(word, key) {
      this.pageModel.searchValue = word
      this.pageModel.searchKey = key
      this.onCurrentChange(1)
    },
    getItem(idx) {
      if (idx < 0) {
        return null
      }
      let _index = this.pageBeginIndex + idx
      return this.pageModel.allItem[_index]
    },
    getRealIndex(idx) {
      return this.pageBeginIndex + idx
    }
  }
}
