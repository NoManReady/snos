export const gpsFn = () => {
  return {
    mode: '0',
    gnss: ['gps', 'glonass'],
    rtcm: ['1005'],
    tmode: {
      mode: '1',
      time: 0,
      accu1: 0,
      x: 0,
      y: 0,
      z: 0,
      accu2: 0
    }
  }
}
