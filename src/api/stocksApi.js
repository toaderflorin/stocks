const fs = require('fs')

function getStockValues(req, res) {
  const id = req.params.id
  const contents = fs.readFileSync('src/stocks.json', 'utf8')
  const obj = JSON.parse(contents)
  const company = obj.filter((c) => c.company.id === id)[0]

  res.send({
    stockValues: company.stockValues
  })
}

function getCompanies(req, res) {
  const contents = fs.readFileSync('src/stocks.json', 'utf8')
  const obj = JSON.parse(contents)
  const companies = []

  obj.forEach((c) => {
    companies.push(c.company)
  })

  res.send(companies)
}

// webpack isn't configured to compile on the serverside, so we need to use CommonJS modules
exports.getCompanies = getCompanies
exports.getStockValues = getStockValues
