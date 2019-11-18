/**
 * 格式化时间（将数字转成天时分秒,含国际化）
 * @param {Int} time
 * @param {Boolean} isMilli
 */
export const formatTime = (time = 0, isMilli) => {
  if (!/^\d+$/.test(time)) {
    return time
  }
  if (isMilli) {
    time = parseInt(time / 1000)
  }
  let _d = Math.floor(time / (60 * 60 * 24))
  time = time - 60 * 60 * 24 * _d
  let _h = Math.floor(time / (60 * 60))
  time = time - 60 * 60 * _h
  let _m = Math.floor(time / 60)
  time = time - 60 * _m
  let _s = time
  return (
    (_d ? _d + I18N.tc('time.day', _d) : '') +
    (_h ? _h.toString().padStart(2, 0) + I18N.tc('time.hour', _h) : '') +
    (_m ? _m.toString().padStart(2, 0) + I18N.tc('time.minute', _m) : '') +
    _s.toString().padStart(2, 0) +
    I18N.tc('time.second', _s)
  )
}

/**
 * 格式化给定或当前时间（含国际化）
 * @param {Date} time
 */
export const formatDay = (time = new Date(), all = true) => {
  let d = new Date(time)
  let _y = d.getFullYear()
  let _m = (d.getMonth() + 1).toString().padStart(2, 0)
  let _d = d
    .getDate()
    .toString()
    .padStart(2, 0)
  let _h = d
    .getHours()
    .toString()
    .padStart(2, 0)
  let _mm = d
    .getMinutes()
    .toString()
    .padStart(2, 0)
  let _s = d
    .getSeconds()
    .toString()
    .padStart(2, 0)
  return all
    ? _y +
        I18N.tc('time.year', _y) +
        _m +
        I18N.tc('time.month', _m) +
        _d +
        I18N.tc('time.day_', _d) +
        '  ' +
        [_h, _mm, _s].join(':')
    : [_h, _mm, _s].join(':')
}
