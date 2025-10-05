const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const pool = require('./database/')
const env = require("dotenv").config()
const flash = require("connect-flash")
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities")

app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))
 
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})


app.use(express.json())
app.use(express.urlencoded({ extended: true })) 

app.use(static)


app.get("/", utilities.handleErrors(baseController.buildHome))


app.use("/inv", utilities.handleErrors(inventoryRoute))


app.use(async (req, res, next) => {
  next({status: 404, message: "Slow down, Speed Racer! That page does not exist."});
});

app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

const port = process.env.PORT
const host = process.env.HOST

app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
