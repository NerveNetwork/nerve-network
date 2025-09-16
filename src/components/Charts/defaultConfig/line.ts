const color = '#E17AFF'
const lineConfig = {
  color,
  xAxis: {
    type: 'category',
    axisLabel: {
      color: 'var(--colors-label)'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: 'var(--colors-label)'
    }
  },
  grid: {
    left: '10',
    right: '0',
    bottom: '5',
    top: '10',
    containLabel: true
  },
  series: [
    {
      type: 'line'
    }
  ]
}

export default lineConfig
