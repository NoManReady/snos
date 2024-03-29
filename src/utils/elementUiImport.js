/*
 * @Author: NoManReady
 * @Date: 2018-06-05 11:09:34
 * @LastEditors: NoManReady
 * @LastEditTime: 2018-06-05 11:55:07
 * @Description: 导入常用的elementUI控件
 */
import Vue from 'vue'
import {
  Pagination,
  Dialog,
  Input,
  Autocomplete,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  TableColumn,
  Popover,
  Tooltip,
  Form,
  FormItem,
  Loading,
  MessageBox,
  Message,
  Notification,
  Tabs,
  TabPane,
  Transfer,
  Divider,
  Row,
  Col,
  Progress
} from 'element-ui'

Vue.use(Transfer)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Input)
Vue.use(Autocomplete)
Vue.use(Radio)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Checkbox)
Vue.use(CheckboxButton)
Vue.use(CheckboxGroup)
Vue.use(Switch)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Popover)
Vue.use(Tooltip)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Divider)
Vue.use(Row)
Vue.use(Col)
Vue.use(Progress)

Vue.use(Loading.directive)

Vue.prototype.$loading = Loading.service
Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message