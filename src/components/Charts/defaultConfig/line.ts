const color = '#2688f7';
const lineConfig = {
  color,
  xAxis: {
    type: 'category',
    axisLabel: {
      color: '#475472'
    }
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      color: '#475472'
    }
  },
  grid: {
    left: '5',
    right: '5',
    bottom: '5',
    top: '10',
    containLabel: true
  },
  series: [
    {
      type: 'bar'
    }
  ]
};

export default lineConfig;
