<template>
  <div class="pie-chart clear" v-loading="loading">
    <ve-pie height="100%" :data="chartData" :extend="chartExtends" :after-set-option-once="getChart">
    </ve-pie>
    <div class="chart-legend">
      <div class="legend-item scroll" v-for="(item,index) in this.chartData.rows" :key="item.key">
        <i class="legend-circle" :style="{backgroundColor: color[index]}"></i>
        <span class="legend-symbol">{{item.key}}</span>
        <!--        <span style="width: 110px">{{parseFloat(item.amount)}}</span>-->
        <!--        <span style="width: 110px">${{item.value | toThousands}}</span>-->
        <span>{{item.rate}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import {toThousands, Plus, Division, Times} from "../api/util";

export default {
  data() {
    this.color = ['#759bf5', '#76e9a7', '#f3a83c', '#9f95f0', '#67d1fe'];
    return {
      chartData: {
        columns: ['key', 'value'],
        rows: [...this.data]
      },
      chartExtends: {},
      chart: null
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    extends: {
      type: Object
    },
    total: {
      type: String,
    }
  },
  watch: {
    data(val) {
      val.forEach(v => {
        v.value = Number(v.value).toFixed(2)
      });
      const sortVal = this.sortData([...val])
      this.chartData = {
        columns: ['key', 'value'],
        rows: sortVal
      };
      // this.chartExtends.series.data = sortVal
    },
    '$i18n.locale'(lang) {
      //中英文切换 其他 Others
      const data = [...this.chartData.rows]
      data.map(v=>{
        if (v.key==='其他' || v.key === 'Others') {
          v.key = lang === 'cn' ? '其他' : 'Others'
        }
      })
      this.chartData.rows = data
      this.chartExtends.series.data = data
    }
  },
  computed: {},
  mounted() {
    const defaultExtend = {
      color: this.color,
      legend: {
        show: false,
      },
      tooltip: {
        position: 'top',
        formatter: (item) => {
          // console.log(item, 123)
          return `<div class="pie-chart-tooltip">
                      <i style="background-color: ${this.color[item.dataIndex]}"></i>
                        ${item.name}:${toThousands(this.chartData.rows[item.dataIndex].amount)} ≈ $${toThousands(item.value)}
                  </div>`
        }
      },
      series: {
        type: 'pie',
        // data: this.data,
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
            formatter: '{d}%'
          }
        },
        center: ['45%', '50%'],
        radius: ['45%', '70%'],
        minAngle: 5,
        itemStyle: {
          normal: {
            borderWidth: 3,
            borderColor: '#ffffff',
          },
        }
      }
    };
    this.chartExtends = _.merge({}, defaultExtend, this.extends);
  },
  methods: {
    getChart(charts) {
      this.chart = charts;
    },
    sortData(data) {
      data.sort((a, b)=>{
        return b.rate.split('%')[0] - a.rate.split('%')[0]
      })
      let other = {key: this.$t('public.others'), value: 0, rate: 0, amount: 0}
      let res = []
      // console.log(data, 999)
      data.map((v, i) => {
        if (i>3) {
          other.value = Plus(other.value, v.value)
          other.amount = Plus(other.amount, v.amount)
          other.rate = Plus(other.rate, Division(v.rate.split('%')[0],100))
        } else {
          res.push(v)
        }
      })
      if (other.rate) {
        other.rate = Times(other.rate, 100) + '%'
        res.push(other)
      }
      return res
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose();
    this.chart = null
  }
}
</script>

<style lang="less">
.pie-chart {
  height: 100%;
  .ve-pie {
    float: left;
    width: 40% !important;
  }
  .chart-legend {
    float: left;
    width: 60%;
    padding-right: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    .legend-item {
      width: 100%;
      white-space: nowrap;
      overflow: auto;
    }
    .legend-circle {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin-right: 5px;
      margin-bottom: 1px;
      border-radius: 50%;
    }
    span {
      display: inline-block;
      color: #8794b1;
      font-size: 16px;
      &.legend-symbol {
        color: #4f5b78;
        font-size: 14px;
        // width: 70px;
        width: auto;
        margin-right: 10px;
        & + span {
          margin-right: 10px;
          /*min-width: 80px;*/
        }
      }
    }
  }
  @media screen and (max-width: 1200px) {
    .ve-pie {
    }
    .chart-legend {
      .legend-item {
      }
      .legend-circle {
        width: 0.16rem;
        height: 0.16rem;
        margin-right: 0.1rem;
      }
      span {
        font-size: 0.28rem;
        &.legend-symbol {
          font-size: 0.28rem;
          width: 1.4rem;
          margin-right: 0.2rem;
          & + span {
            margin-right: 0.2rem;
          }
        }
      }
    }
  }
}

.pie-chart-tooltip {
  background-color: transparent;
  color: #fff;
  line-height: 20px;
  i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 2px;
  }
}
</style>
