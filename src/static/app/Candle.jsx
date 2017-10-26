import React, { Component, PropTypes } from 'react'

export default class Candle extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const marginLeft = 40.0
    const marginTop = 50.0
    const chartHeight = 200.0
    const chartWidth = 900.0

    const min = this.props.min
    const max = this.props.max
    const scale = this.props.scale
    const i = this.props.i
    const columnWidth = this.props.columnWidth

    const svgItems = []

    const bullish = this.props.stock.close > this.props.stock.open
    const color = bullish ? '#4f4' : 'red'

    const a1 = marginLeft + columnWidth / 2 + i * columnWidth
    const a2 = a1
    const b1 = marginTop + chartHeight - (this.props.stock.min - min) * scale
    const b2 = marginTop + chartHeight - (this.props.stock.max - min) * scale

    const height =  Math.abs(this.props.stock.close - this.props.stock.open) * scale
    const width = columnWidth - 2
    const x = marginLeft + (1 + i * columnWidth)
    const y1 = marginTop + chartHeight - (this.props.stock.open - min) * scale
    const y2 = marginTop + chartHeight - (this.props.stock.close - min) * scale
    const y = Math.min(y1, y2)

    const candle = <rect x={x} y={y} height={height} width={width} fill={color}
      strokeWidth="0" key={this.props.selectedCompany + i.toString()}/>

    let opacity = 0.01

    if (this.props.stock.status === 'selected') {
      opacity = 0.3
    } else if (this.props.stock.status === 'hover') {
      opacity = 0.12
    }

    const line = <line x1={a1} y1={b1} x2={a2} y2={b2} stroke="black" strokeWidth="0.5"
      key={'line-' + this.props.selectedCompany + i.toString()}/>

    const overlay = <rect x={x} y={marginTop} height={chartHeight} width={columnWidth}
      fill="gray" fillOpacity={opacity}
      onMouseOver={this.props.onStockOver}
      onMouseOut={this.props.onStockOut}
      onClick={this.props.onStockClick}
      key={'overlay-' + this.props.selectedCompany + i.toString()}>
    </rect>

    svgItems.push(candle)
    svgItems.push(line)
    svgItems.push(overlay)

    return <g>
      {svgItems}
    </g>
  }
}
