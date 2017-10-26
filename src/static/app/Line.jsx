import React, { Component, PropTypes } from 'react'

export default class Line extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const marginLeft = 40.0
    const marginTop = 50.0
    const chartHeight = 200.0
    const chartWidth = 900.0
    const columnWidth = this.props.columnWidth
    const scale = this.props.scale
    const min = this.props.min
    const i = this.props.i

    const mx1 = marginLeft + columnWidth / 2 + (i - 1) * columnWidth
    const my1 = marginTop + chartHeight - (this.props.sv1.average - min) * scale
    const mx2 = marginLeft + columnWidth / 2 + i * columnWidth
    const my2 = marginTop + chartHeight - (this.props.sv2.average - min) * scale

    return <line x1={mx1} y1={my1} x2={mx2} y2={my2} stroke="black" strokeWidth="3"/>
  }
}
