import React, { Component, PropTypes } from 'react'
import Candle from './Candle'
import Grid from './Grid'
import Line from './Line'
import Footer from './Footer'
import consts from './consts'
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
        console.log(error)
        alert('Error occured while getting company list from server.')
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

    if (!status || status !== consts.selected) {
      stock.status = consts.hover
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

    if (!status || status !== consts.selected) {
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
    stocks[i].status = consts.selected

    if (this.state.currentlySelected === i) {
      stocks[i].status = consts.hover
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
        console.log(error)
        alert('Error occured while getting company stock values from server.')
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
      const columnWidth =  consts.chartWidth / totalValues
      const scale = consts.chartHeight / (max - min)

      if (!sv.predicted) {
        svgItems.push(<Candle stock={sv} i={i} min={min} max={max} i={i} scale={scale} columnWidth={columnWidth}
          onStockOver={this.onStockOver.bind(this, i)}
          onStockOut={this.onStockOut.bind(this, i)}
          onStockClick={this.onStockClick.bind(this, i)}
          key={`candle-${i}`}
        />)

        if (i > 0 && this.state.showAverage) {
          svgItems.push(<Line i={i} scale={scale} sv1={stockValues[i - 1]} sv2={stockValues[i]}
            min={min} columnWidth={columnWidth} key={`average-${i}`}/>)
        }
      } else {
        const x = consts.marginLeft + columnWidth / 2 + i * columnWidth
        const y = consts.marginTop + consts.chartHeight - (sv.average - min) * scale
        const circle = <circle cx={x} cy={y} r="2" stroke="gray" strokeWidth="0.5"
          key={`proj-${i}`}/>

        svgItems.push(circle)

        const overlay = <rect x={x} y={consts.marginTop} height={consts.chartHeight} width={columnWidth}
          fill="gray" fillOpacity="0.01"
          key={`overlay-${i}`}
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

        <Footer stockHover={this.state.stockHover} prediction={this.state.prediction}/>
      </div>
    )
  }
}
