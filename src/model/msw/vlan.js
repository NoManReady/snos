// vlan基础model
export const base = () => {
  return {
    v: '',
    n: ''
  }
}

// trunk口
export const trunk = () => {
  return {
    permitvlan: '1-4094',
    pvid: '1',
    portid: []
  }
}
