const colors = ['#1674E8', '#F7931A', '#5BABFF', '#FFD33C', '#67d1fe'];
const pieConfig = {
  color: colors,
  legend: {
    show: false
  },
  tooltip: {
    backgroundColor: 'var(--colors-card2)',
    borderColor: 'var(--colors-line)',
    borderWidth: 1,
    textStyle: {
      color: 'var(--colors-text)'
    }
  },
  series: [
    {
      type: 'pie',
      label: {
        normal: {
          show: false,
          position: 'center'
        },
        emphasis: {
          show: true,
          textStyle: {
            fontSize: '18',
            fontWeight: 'bold'
          },
          formatter: ''
        }
      },
      center: ['45%', '50%'],
      radius: ['52%', '76%'],
      minAngle: 5,
      itemStyle: {
        normal: {
          borderWidth: 4,
          borderColor: 'var(--colors-card)'
        }
      }
    }
  ]
};

export default pieConfig;
