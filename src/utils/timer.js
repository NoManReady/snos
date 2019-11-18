/**
 * timer（暂停、恢复）
 */
const timer = (new function () {
	let stos = [], sivs = [], that = this
	this.setTimeout = function (fn, delay) {
		let id = stos.length
		stos[id] = {
			fn: fn,
			paused: false,
			delay: delay,
			start: new Date().getTime(),
			id: setTimeout(function () {
				fn && fn()
				timer.clearTimeout(id)
			}, delay)
		}
		return id
	}
	this.clearTimeout = function (id) {
		let sto = stos[id]
		if (sto === undefined) return false
		// 清空Timeout
		clearTimeout(sto.id)
		// 删除 id
		stos.splice(id, 1)
		return true
	}
	this.pauseTimeout = function (id) {
		let sto = stos[id]
		if (sto === undefined || sto.paused === true) return false
		// 标记暂停
		sto.paused = true
		// 清空Timeout
		clearTimeout(sto.id)
		let elapse = new Date().getTime() - sto.start
		// 重置 delay
		sto.delay = sto.delay - elapse
		return true
	}
	this.resumeTimeout = function (id) {
		let sto = stos[id]
		if (sto === undefined || sto.paused === false) return false
		// 标记为恢复
		sto.paused = false
		// 新建一个 timeout 表示继续 
		sto.id = stos[timer.setTimeout(sto.fn, sto.delay)].id
		return true
	}
	this.setInterval = function (fn, delay) {
		let id = sivs.length
		sivs[id] = {
			fn: fn,
			paused: false,
			delay: delay,
			start: new Date().getTime(),
			id: setInterval(fn, delay)
		}
		return id
	}
	this.clearInterval = function (id) {
		let siv = sivs[id]
		if (siv === undefined) return false
		// 清空Interval
		clearInterval(siv.id)
		// 删除 id
		sivs.splice(id, 1)
		return true
	}
	// 清空所有的 timeout
	this.cleanTimeout = function () {
		for (let i = 0; i < stos.length; ++i) {
			let sto = stos[i]
			// 清空Timeout
			sto === undefined || clearTimeout(sto.id)
		}
		// 清空 stos 数组
		stos = []
	}
	// 清空所有的 interval
	this.cleanInterval = function () {
		for (let i = 0; i < sivs.length; ++i) {
			let siv = sivs[i]
			// 清空Timeout
			clearInterval(siv.id)
		}
		// 清空 stos 数组
		sivs = []
	}
	// 清空所有的 timeout 和 interval
	this.clean = function () {
		this.cleanTimeout()
		this.cleanInterval()
		return true
	}
	this.pauseInterval = function (id) {
		let siv = sivs[id]
		if (siv === undefined || siv.paused === true) return false
		// 标记暂停
		siv.paused = true
		// 清空 Interval
		clearInterval(siv.id)
		let elapse = (new Date().getTime() - siv.start) % siv.delay
		// 添加一个 wait 属性
		siv.wait = siv.delay - elapse
		return true
	}
	this.resumeInterval = function (id) {
		let siv = sivs[id]
		if (siv === undefined || siv.paused === false) return false
		// 标记恢复
		siv.paused = false
		// 调一个 setTimeout 执行 wait 的时间
		this.setTimeout(function () {
			siv.fn()
			// 新建一个 interval 表示继续
			siv.id = sivs[timer.setInterval(siv.fn, siv.delay)].id
		}, siv.wait)
	}

	// 综合 API
	this.pause = function (id) {
		if (id === undefined) {
			// 表示暂停全部 timeout & interval
			stos.forEach(function (item, id) {
				that.pauseTimeout(id)
			})
			sivs.forEach(function (item, id) {
				that.pauseInterval(id)
			})
			return true
		}
		else if (stos[id] !== undefined) {
			this.pauseTimeout(id)
			return true
		}
		else if (sivs[id] !== undefined) {
			this.pauseInterval(id)
			return true
		}
		return false
	}
	this.resume = function (id) {
		if (id === undefined) {
			// 表示暂停全部 timeout & interval
			stos.forEach(function (item, id) {
				that.resumeTimeout(id)
			})
			sivs.forEach(function (item, id) {
				that.resumeInterval(id)
			})
			return true
		}
		else if (stos[id] !== undefined) {
			this.resumeTimeout(id)
			return true
		}
		else if (sivs[id] !== undefined) {
			this.resumeInterval(id)
			return true
		}
		return false
	}
}())

export default timer