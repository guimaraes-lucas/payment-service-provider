const Payable = require('../service/payable').Payable
const httpStatus = require('http-status')
const httpUtil = require('../util/http.js')
const sequelize = require('../database/database')
const getPayableFromTransaction = require('../service/payable').getPayableFromTransaction

function PayableException(message) {
  this.message = message;
  this.name = "PayableException";
}

exports.findByPk = (request, response, next) => {
  try {
    const payable = Payable.findByPk(request.params.id)
    if (!payable) {
      response.status(httpStatus.NOT_FOUND).send()
      return
    }

    response.status(httpStatus.OK).send(payable)
  } catch (error) {
    next(error)
  }
}

exports.findAll = (request, response, next) => {
  Payable.findAll(httpUtil.treatPageAndLimit(request.query.limite, request.query.page))
    .then(payables => response.send(payables))
    .catch(error => response.status(httpStatus.BAD_REQUEST).send())
}

exports.createPayableFromTransaction = (transaction) => {
  Payable.create(
    getPayableFromTransaction(transaction)
  )
  .catch((error) => {
    throw new PayableException(error);
  })
}

exports.findBalance = (request, response, next) => {
  Payable.findAll({
    attributes: [[sequelize.fn('SUM', sequelize.col('value')), 'value']],
    where: {
      status: eStatusPayable.PAID
    }
  })
    .then(available => {
      Payable.findAll({
        attributes: [[sequelize.fn('SUM', sequelize.col('value')), 'value']],
        where: {
          status: eStatusPayable.WAITING_FUNDS
        }
      })
        .then(waiting_funds => {
          const balance = { 
            "available": available[0].value || 0,
            "waiting_funds": waiting_funds[0].value || 0
          }
          response.send(balance)
        })
        .catch(error => next(error))
    })
    .catch(error => next(error))
}
