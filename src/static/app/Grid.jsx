import React, { Component, PropTypes } from 'react'

export default class Grid extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <g>
        <line x1="40" y1="251" x2="940" y2="251" stroke="black" strokeWidth="0.5"/>
        <line x1="940" y1="251" x2="940" y2="258" stroke="black" strokeWidth="0.5"/>
        <line x1 ="40" y1="251" x2="40" y2="30" stroke="black" strokeWidth="0.5"/>
        <line x1 ="33" y1="50" x2="40" y2="50" stroke="black" strokeWidth="0.5"/>

        <text x="5" y="255" fontFamily="Verdana" fontSize="11">
          {this.props.min}
        </text>

        <text x="5" y="54" fontFamily="Verdana" fontSize="11" width="64">
          {this.props.max}
        </text>

        <text x="38" y="275" fontFamily="Verdana" fontSize="11">
          {this.props.dateMin}
        </text>

        <text x="882" y="275" fontFamily="Verdana" fontSize="11">
          {this.props.dateMax}
        </text>
      </g>
    )
  }
}
