const { getStockValues, getCompanies } = require('./api/stocksApi')
const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')

const app = express()

app.use(express.static(__dirname + '/static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.listen(3000, () => console.log('Started successfully, open localhost:3000.'))

app.get('/', (req, res) => {
  let contents = fs.readFileSync('content/index.html', 'utf8')
  res.send(contents)
})

app.get('/api/companies', getCompanies)

app.get('/api/stocks/:id', getStockValues)
