import React, { Component, PropTypes } from 'react'
import Chart from './Chart'
const axios = require('axios')

export default class App extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div>
        <div className="header">
          <div className="content">
            <h1>Vitamin Stocks Demo</h1>
          </div>
        </div>
        <div className="content">
          <p>
            Hover over a candle to see details. Select two candles to zoom in to a time span,
            click Reset to reset the zoom level. The application shows values only for weekdays (Monday to Friday),
            while Show Projection creates a prediction graph with the estimated values of the next 21 workdays.
          </p>
          <Chart />
        </div>
      </div>
    )
  }
}
