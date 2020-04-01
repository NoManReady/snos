export const global = () => {
  return {
    class_lldp: 0,
    mode: 2,
    reserve_power: 0,
    ups: 0
  }
}

export const port = () => {
  return {
    enable: 1,//开关
    legacy: 0,//非标供电
    max_power: '',//软件限额功率
    portid: [],
    priority: 3,//优先级
    poe_off_timerange: ''//时间
  }
}
