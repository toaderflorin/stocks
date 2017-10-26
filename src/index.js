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

app.get('/api/companies', (req, res) => {
  const contents = fs.readFileSync('src/stocks.json', 'utf8')
  const obj = JSON.parse(contents)
  const companies = []

  obj.forEach((c) => {
    companies.push(c.company)
  })

  res.send(companies)
})

app.get('/api/stocks/:id', (req, res) => {
  const id = req.params.id
  const contents = fs.readFileSync('src/stocks.json', 'utf8')
  const obj = JSON.parse(contents)
  const company = obj.filter((c) => c.company.id === id)[0]

  res.send({
    stockValues: company.stockValues
  })
})
