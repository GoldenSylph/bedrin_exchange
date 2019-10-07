import React, { Component } from 'react';
import { connect } from 'react-redux';
import Spinner from '../Spinner/Spinner.js';
import Chart from 'react-apexcharts';
import { chartOptions } from './PriceChart.config.js';
import {
  priceChartSelector,
  priceChartLoadedSelector
} from '../../store/selectors'
import { POS_SIGN, NEG_SIGN, TRIANGLE_UP, TRIANGLE_DOWN, QUESTION_SIGN } from '../../helpers.js';



class PriceChart extends Component {

  getPriceSymbol() {
    if (this.props.priceChartData.lastPriceChange === POS_SIGN) {
      return TRIANGLE_UP;
    } else if (this.props.priceChartData.lastPriceChange === NEG_SIGN) {
      return TRIANGLE_DOWN;
    } else {
      return QUESTION_SIGN;
    }
  }

  showPriceChart() {
    return(
      <div className="price-chart">
        <div className="price">
          <h4>BUT/ETH &nbsp; {this.getPriceSymbol()} &nbsp; {this.props.priceChartData.lastPrice}</h4>
        </div>
        <Chart options={chartOptions} series={this.props.priceChartData.series} type="candlestick" width="100%" height="100%" />
      </div>
    );
  }

  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          {this.props.isPriceChartLoaded ? this.showPriceChart() : <Spinner />}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const result = {
    isPriceChartLoaded: priceChartLoadedSelector(state),
    priceChartData: priceChartSelector(state)
  };
  // console.log(result);
  return result;
}

export default connect(mapStateToProps)(PriceChart);
