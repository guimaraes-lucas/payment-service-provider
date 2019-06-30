const http = require('http')
const express = require('express')
const status = require('http-status')
const transactionsRoute = require('./routes/transactions')
const sequelize = require('./database/database')

const isProduction = process.env.NODE_ENV === 'production'

const app = express()

app.use(express.json())

app.use('/api', transactionsRoute)

app.use((request, response, next) => {
  response.status(status.NOT_FOUND).send()
})

app.use((error, request, response, next) => {
  response.status(status.INTERNAL_SERVER_ERROR).json({ error })
})

sequelize.sync({ force: !isProduction }).then(() => {
  const port = process.env.PORT || 8080
  const hostname = process.env.HOST

  app.set('port', port)

  const server = http.createServer(app)

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  })
})
