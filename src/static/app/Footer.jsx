import React, { Component, PropTypes } from 'react'

export default class Footer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        {this.props.stockHover ? <p>
          Date: {this.props.stockHover.dt},
          Average: <b>{this.props.stockHover.average}</b>,
          Open: {this.props.stockHover.open},
          Close: {this.props.stockHover.close},
          Min: {this.props.stockHover.min},
          Max: {this.props.stockHover.max}
        </p> : ""}

        {this.props.prediction != '' ?
          <p>
            {this.props.prediction}
          </p>
        : ''}
      </div>
    )
  }
}
