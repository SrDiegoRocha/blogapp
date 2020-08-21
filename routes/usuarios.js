const express = require("express")
const usuarios = express.Router()
const mongoose = require("mongoose")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")


// ROTAS DE REGISTRO
usuarios.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

usuarios.post("/registro", (req, res) =>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({text: "Nome inválido!"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({text: "E-mail inválido!"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({text: "Senha inválido!"})
    }

    if(req.body.senha.length < 4){
        erros.push({text: "Senha muito curta!"})
    }

    if(req.body.senha !== req.body.senha2){
        erros.push({text: "As senhas são direfentes, tente novamente!"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "este e-mail já foi cadastrado!")
                res.redirect("/usuarios/registro")
            }else{

                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (err, hash) => {
                        if(err){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário!")
                            console.log("Houve um erro durante o salvamento do usuário! "+err)
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário, tente novamente!")
                            console.log("Houve um erro ao criar o usuário, tente novamente! "+err)
                            res.redirect("/usuarios/registro")
                        })
                    })
                })

            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno!")
            console.log("Houve um erro interno! "+err)
            res.redirect("/")
        })
    }

})

// ROTAS DE LOGIN
usuarios.get("/login", (req, res) => {
    res.render("usuarios/login")
})

usuarios.post("/login", (req, res, next) => {

    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)

})

//ROTAS DE LOGOUT
usuarios.get("/logout", (req, res) => {

    req.logout()
    req.flash("success_msg", "Deslogado com sucesso!")
    res.redirect("/")

})

module.exports = usuarios