// 全局定时器，定时获取设备状态信息，更新到vuex中，各组件获取vuxe信息来获取设备状态
import store from '@/store'
import timer from './timer'

export const getNetStatusInter = () => {
	store.dispatch('getNetStatus')
	timer.setInterval(async _ => {
		store.dispatch('getNetStatus')
	}, 30000)
}

