// Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const app = express()
    const admin = require('./routes/admin')
    const commum = require('./routes/commum')
    const usuarios = require('./routes/usuarios')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require("express-session")
    const flash = require("connect-flash");
    const passport = require("passport")
    require("./config/auth")(passport)
// Configurações
    // Sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))

        app.use(passport.initialize())
        app.use(passport.session())

        app.use(flash())
    //Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    // Body-Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log('Conectado ao mongo')
        }).catch((err) => {
            console.log('Falha ao se conectar ao mongo! ' + err)
        })
    // Public
        app.use(express.static(path.join(__dirname,"public")))
// Rotas
    app.use('/', commum)
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)
// Outros
    const PORTA = process.env.PORT || 8087
    app.listen(PORTA, () => {
        console.log(`Servidor rodando na porta ${PORTA}!`)
    })