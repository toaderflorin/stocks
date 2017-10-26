import React, { Component, PropTypes } from 'react'
import Candle from './Candle'
import Grid from './Grid'
const axios = require('axios')

export default class Chart extends Component {
  constructor() {
    super()
    this.onCompanyChanged = this.onCompanyChanged.bind(this)
    this.getStockValue = this.getStockValue.bind(this)
    this.onResetClick = this.onResetClick.bind(this)
    this.onShowAverageChanged = this.onShowAverageChanged.bind(this)
    this.onShowProjectionClick = this.onShowProjectionClick.bind(this)

    this.state = {
      selecting: false,
      companies: [],
      currentlySelected: -1,
      stockValues: [],
      showAverage: true,
      showProjection: false,
      prediction: ''
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

  onPredictionOver(i) {
    const stocks = [...this.state.stockValues]
    const stock = stocks[i]

    this.setState({
      prediction: `Predicted value for ${stock.dt} is ${stock.average}.`
    })
  }

  onPredictionOut(i) {
    this.setState({
      prediction: ''
    })
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

  onShowProjectionClick() {
    const delta = []
    const stockValues = [...this.state.stockValues]

    for (let i = 0; i < stockValues.length - 1; i++) {
      delta.push(stockValues[i + 1].average - stockValues[i].average)
    }

    const sum = delta.reduce(function(pv, cv) { return pv + cv }, 0)
    const averageDelta = sum  / delta.length
    const lastStockValue = stockValues[stockValues.length - 1].average
    const lastDate = stockValues[stockValues.length - 1].dt

    let i = 0
    let total = 0

    while (total < 21) {
      const date = new Date(lastDate)
      const value = parseFloat((lastStockValue + i * averageDelta).toFixed(2))
      const dt = new Date(date.setDate(date.getDate() + i))

      // we are only adding weekdays
      if (dt.getDay() >= 1 && dt.getDay() <= 5) {
        stockValues.push({
          average: value,
          min: value,
          max: value,
          predicted: true,
          dt: `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`
        })
        total++;
      }
      i++;
    }

    this.setState({
      stockValues,
      showProjection: true
    })
  }

  zoomIn(i) {
    const start = Math.min(this.state.currentlySelected, i)
    const end = Math.max(this.state.currentlySelected, i)

    const newStocks = this.state.stockValues.slice(start, end + 1)
    newStocks.forEach((stock) => {
      stock.status = undefined
    })

    const stocks = [...newStocks]

    this.setState({
      stockValues: stocks,
      currentlySelected: -1,
      showProjection: false
    })
  }

  getStockValue(id) {
    axios.get(`/api/stocks/${id}`)
      .then((response) => {
        this.setState({
          stockValues: response.data.stockValues,
          currentlySelected: -1,
          stockHover: undefined,
          showProjection: false
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
    const stockValues = this.state.stockValues
    const svgItems = []
    const totalValues = stockValues.length

    const min = Math.min(...stockValues.map((sv) => sv.min))
    const max = Math.max(...stockValues.map((sv) => sv.max))
    const dateMin = stockValues[0] ? stockValues[0].dt : undefined
    const dateMax = stockValues[stockValues.length - 1] ? stockValues[stockValues.length - 1].dt : undefined

    let i = 0

    for (let sv of stockValues) {
      const marginLeft = 40.0
      const marginTop = 50.0
      const chartHeight = 200.0
      const chartWidth = 900.0
      const columnWidth =  900 / totalValues
      const scale = chartHeight / (max - min)

      if (!sv.predicted) {
        svgItems.push(<Candle stock={sv} i={i} min={min} max={max}
          selectedCompany={this.state.selectedCompany}
          i={i} scale={scale}
          columnWidth={columnWidth}
          onStockOver={this.onStockOver.bind(this, i)}
          onStockOut={this.onStockOut.bind(this, i)}
          onStockClick={this.onStockClick.bind(this, i)}
          key={'candle-' + this.state.selectedCompany + i.toString()}
        />)

        if (i > 0 && this.state.showAverage) {
          const mx1 = marginLeft + columnWidth / 2 + (i - 1) * columnWidth
          const my1 = marginTop + chartHeight - (this.state.stockValues[i - 1].average - min) * scale
          const mx2 = marginLeft + columnWidth / 2 + i * columnWidth
          const my2 = marginTop + chartHeight - (sv.average - min) * scale
          const medianLine = <line x1={mx1} y1={my1} x2={mx2} y2={my2} stroke="black" strokeWidth="3"
            key={'average-' + this.state.selectedCompany + i.toString()}/>

          svgItems.push(medianLine)
        }
      } else {
        const x = marginLeft + columnWidth / 2 + i * columnWidth
        const y = marginTop + chartHeight - (sv.average - min) * scale
        const circle = <circle cx={x} cy={y} r="2" stroke="gray" strokeWidth="0.5"
          key={'proj-' + this.state.selectedCompany + i.toString()}/>

        svgItems.push(circle)

        const overlay = <rect x={x} y={marginTop} height={chartHeight} width={columnWidth}
          fill="gray" fillOpacity="0.01"
          key={'overlay-' + this.state.selectedCompany + i.toString()}
          onMouseOver={this.onPredictionOver.bind(this, i)}
          onMouseOut={this.onPredictionOut.bind(this, i)}>
        </rect>

        svgItems.push(overlay)
      }

      i++
    }

    return (
      <div>
        <p>
          Company
          <select value={this.state.selectedCompany} onChange={this.onCompanyChanged} >
            {companies}
          </select>
          <button onClick={this.onResetClick}>Reset</button>
          &nbsp;
          <input type="checkbox" checked={this.state.showAverage} onChange={this.onShowAverageChanged}/> Show daily average
          &nbsp;
          <button onClick={this.onShowProjectionClick} disabled={this.state.showProjection}>Show Projection</button>
        </p>

        <svg className="graph" width="960" height="300" viewBox="0 0 960 300">
          {svgItems}
          <Grid min={min} max={max} dateMin={dateMin} dateMax={dateMax}/>
        </svg>

        {this.state.stockHover ? <p>
          Date: {this.state.stockHover.dt},
          Average: <b>{this.state.stockHover.average}</b>,
          Open: {this.state.stockHover.open},
          Close: {this.state.stockHover.close},
          Min: {this.state.stockHover.min},
          Max: {this.state.stockHover.max}
        </p> : ""}

        {this.state.prediction != '' ?
          <p>
            {this.state.prediction}
          </p>
        : ''}
      </div>
    )
  }
}