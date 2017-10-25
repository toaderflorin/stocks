import React, { Component, PropTypes } from 'react'
const axios = require('axios')

export default class App extends Component {
  constructor() {
    super()
    this.onCompanyChanged = this.onCompanyChanged.bind(this)
    this.getStockValue = this.getStockValue.bind(this)

    this.state = {
      companies: [],
      stockValues: []
    }
  }

  componentWillMount() {
    axios.get('/api/companies')
      .then((response) => {
        this.setState({
          companies: response.data,
          selectedCompany: response.data[0].id
        })

        this.getStockValue(response.data[0].id)
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  onCompanyChanged(e) {
    this.setState({
      selectedCompany: e.target.value
    })

    this.getStockValue(e.target.value)
  }

  getStockValue(id) {
    axios.get(`/api/stocks/${id}`)
      .then((response) => {
        this.setState({
          stockValues: response.data.stockValues,
          min: response.data.min,
          max: response.data.max
        })
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  render() {
    const companies = this.state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
    const candles = []
    const lines = []

    const totalValues = this.state.stockValues.length

    let i = 0

    for (let sv of this.state.stockValues) {
      const marginLeft = 40.0
      const marginTop = 50.0
      const chartHeight = 200.0
      const chartWidth = 900.0

      const columnWidth =  900 / totalValues
      const scale = chartHeight / (this.state.max - this.state.min)

      const bullish = sv.close > sv.open
      const color = bullish ? '#3f3' : 'red'





      const min = (sv.min - this.state.min) * scale
      const max = (sv.max - this.state.min) * scale
      const a1 = marginLeft + columnWidth / 2 + i * columnWidth
      const a2 = a1
      const b1 = marginTop + chartHeight - min
      const b2 = marginTop + chartHeight - max

      const height =  Math.abs(sv.close - sv.open) * scale
      const width = columnWidth - 2
      const x = marginLeft + (1 + i * columnWidth)

      const open = (sv.open - this.state.min) * scale
      const close = (sv.close - this.state.min) * scale
      const y1 = marginTop + chartHeight - open
      const y2 = marginTop + chartHeight - close
      const y = Math.min(y1, y2)

      const candle = <rect x={x} y={y} height={height} width={width} fill={color}
        strokeWidth="0" key={this.state.selectedCompany + i.toString()}/>

      const line = <line x1={a1} y1={b1} x2={a2} y2={b2} stroke="black" strokeWidth="0.5"
        key={'line' + this.state.selectedCompany + i.toString()}/>
      candles.push(candle)
      lines.push(line)
      i++
    }

    return (
      <div>
        <div className="header">
          <div className="content">
            <h1>Vitamin Stocks Demo</h1>
          </div>
        </div>
        <div className="content">
          <p>
            Company: <select value={this.state.selectedCompany} onChange={this.onCompanyChanged} >
              {companies}
            </select>
          </p>
          <svg className="graph" width="960" height="300" viewBox="0 0 960 300">

            {candles}
            {lines}

            <line x1="40" y1="251" x2="950" y2="251" stroke="black" strokeWidth="0.5"/>
            <line x1="940" y1="251" x2="940" y2="258" stroke="black" strokeWidth="0.5"/>
            <line x1 ="40" y1="251" x2="40" y2="30" stroke="black" strokeWidth="0.5"/>
            <line x1 ="33" y1="50" x2="40" y2="50" stroke="black" strokeWidth="0.5"/>

            <text x="5" y="255" fontFamily="Verdana" fontSize="11">
              {this.state.min}
            </text>

            <text x="5" y="54" fontFamily="Verdana" fontSize="11" width="64">
              {this.state.max}
            </text>

          </svg>
        </div>
      </div>
    )
  }
}
