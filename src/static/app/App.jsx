import React, { Component, PropTypes } from 'react'
const axios = require('axios')

export default class App extends Component {
  constructor() {
    super()
    this.onCompanyChanged = this.onCompanyChanged.bind(this)
    this.getStockValue = this.getStockValue.bind(this)
    this.onResetClick = this.onResetClick.bind(this)
    this.onShowAverageChanged = this.onShowAverageChanged.bind(this)

    this.state = {
      selecting: false,
      companies: [],
      currentlySelected: -1,
      stockValues: [],
      showAverage: true
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

  onStockOver(i) {
    const stocks = [...this.state.stockValues]
    const stock = stocks[i]
    const status = stock.status

    this.setState({
      stockHover: stock
    })

    if (!status || status !== 'selected') {
      stock.status = 'hover'
      this.setState({
        stockValues: stocks
      })
    }
  }

  onStockOut(i) {
    const stocks = [...this.state.stockValues]
    const stock = stocks[i]
    const status = stock.status

    this.setState({
      stockHover: undefined
    })

    if (!status || status !== 'selected') {
      stock.status = undefined
      this.setState({
        stockValues: stocks
      })
    }
  }

  onStockClick(i) {
    const stocks = [...this.state.stockValues]
    stocks[i].status = 'selected'

    if (this.state.currentlySelected === i) {
      stocks[i].status = 'hover'
      this.setState({
        stockValues: stocks,
        currentlySelected: -1
      })
    } else if (this.state.currentlySelected !== i) {
      if (this.state.currentlySelected === -1) {
        this.setState({
          stockValues: stocks,
          currentlySelected: i
        })
      } else {
        this.zoomIn(i)
      }
    }
  }

  zoomIn(i) {
    let start = Math.min(this.state.currentlySelected, i)
    let end = Math.max(this.state.currentlySelected, i)

    const newStocks = this.state.stockValues.slice(start, end + 1)
    newStocks.forEach((stock) => {
      stock.status = undefined
    })

    const stocks = [...newStocks]

    this.setState({
      stockValues: stocks,
      currentlySelected: -1
    })
  }

  getStockValue(id) {
    axios.get(`/api/stocks/${id}`)
      .then((response) => {
        const min = Math.min(...response.data.stockValues.map((sv) => sv.min))
        const max = Math.max(...response.data.stockValues.map((sv) => sv.max))

        const dateMin = response.data.stockValues[0].dt
        const dateMax = response.data.stockValues[response.data.stockValues.length - 1].dt

        this.setState({
          stockValues: response.data.stockValues,
          min,
          max,
          dateMin,
          dateMax,
          currentlySelected: -1,
          stockHover: undefined
        })
      })
      .catch(function (error) {
        console.log(error);
      })
  }

  onResetClick() {
    this.getStockValue(this.state.selectedCompany)
  }

  onShowAverageChanged() {
    this.setState ({
      showAverage: !this.state.showAverage
    })
  }

  render() {
    const companies = this.state.companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
    const svgItems = []

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
      const color = bullish ? '#4f4' : 'red'

      const a1 = marginLeft + columnWidth / 2 + i * columnWidth
      const a2 = a1
      const b1 = marginTop + chartHeight - (sv.min - this.state.min) * scale
      const b2 = marginTop + chartHeight - (sv.max - this.state.min) * scale

      const height =  Math.abs(sv.close - sv.open) * scale
      const width = columnWidth - 2
      const x = marginLeft + (1 + i * columnWidth)
      const y1 = marginTop + chartHeight - (sv.open - this.state.min) * scale
      const y2 = marginTop + chartHeight - (sv.close - this.state.min) * scale
      const y = Math.min(y1, y2)

      const candle = <rect x={x} y={y} height={height} width={width} fill={color}
        strokeWidth="0" key={this.state.selectedCompany + i.toString()}/>

      let opacity = 0.01

      if (sv.status === 'selected') {
        opacity = 0.3
      } else if (sv.status === 'hover') {
        opacity = 0.12
      }

      const line = <line x1={a1} y1={b1} x2={a2} y2={b2} stroke="black" strokeWidth="0.5"
        key={'line-' + this.state.selectedCompany + i.toString()}/>

      const overlay = <rect x={x} y={marginTop} height={chartHeight} width={columnWidth}
        fill="gray" fillOpacity={opacity}
        key={'overlay-' + this.state.selectedCompany + i.toString()}
        onMouseOver={this.onStockOver.bind(this, i)}
        onMouseOut={this.onStockOut.bind(this, i)}
        onClick={this.onStockClick.bind(this, i)}>
      </rect>

      svgItems.push(candle)
      svgItems.push(line)
      svgItems.push(overlay)

      if (i > 0 && this.state.showAverage) {
        const mx1 = marginLeft + columnWidth / 2 + (i - 1) * columnWidth
        const my1 = marginTop + chartHeight - (this.state.stockValues[i - 1].average - this.state.min) * scale
        const mx2 = marginLeft + columnWidth / 2 + i * columnWidth
        const my2 = marginTop + chartHeight - (sv.average - this.state.min) * scale
        const medianLine = <line x1={mx1} y1={my1} x2={mx2} y2={my2} stroke="black" strokeWidth="3"
          key={'average-' + this.state.selectedCompany + i.toString()}/>

        svgItems.push(medianLine)
      }

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
          <p>Hover over a candle to see details. Select two candles to zoom in to a time span, click Reset to reset the zoom level.</p>
          <p>
            Company
            <select value={this.state.selectedCompany} onChange={this.onCompanyChanged} >
              {companies}
            </select>

            <button onClick={this.onResetClick}>Reset</button>

            &nbsp;

            <input type="checkbox" checked={this.state.showAverage} onChange={this.onShowAverageChanged}/> Show daily average
          </p>

          <svg className="graph" width="960" height="300" viewBox="0 0 960 300">

            {svgItems}

            <line x1="40" y1="251" x2="940" y2="251" stroke="black" strokeWidth="0.5"/>
            <line x1="940" y1="251" x2="940" y2="258" stroke="black" strokeWidth="0.5"/>
            <line x1 ="40" y1="251" x2="40" y2="30" stroke="black" strokeWidth="0.5"/>
            <line x1 ="33" y1="50" x2="40" y2="50" stroke="black" strokeWidth="0.5"/>

            <text x="5" y="255" fontFamily="Verdana" fontSize="11">
              {this.state.min}
            </text>

            <text x="5" y="54" fontFamily="Verdana" fontSize="11" width="64">
              {this.state.max}
            </text>

            <text x="38" y="275" fontFamily="Verdana" fontSize="11">
              {this.state.dateMin}
            </text>

            <text x="877" y="275" fontFamily="Verdana" fontSize="11">
              {this.state.dateMax}
            </text>

          </svg>

          {this.state.stockHover ? <p>
            Date: {this.state.stockHover.dt},
            Average: <b>{this.state.stockHover.average}</b>,
            Open: {this.state.stockHover.open},
            Close: {this.state.stockHover.close},
            Min: {this.state.stockHover.min},
            Max: {this.state.stockHover.max}
          </p> : ""}
        </div>
      </div>
    )
  }
}
