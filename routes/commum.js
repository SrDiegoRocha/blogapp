const express = require('express')
const commum = express.Router()
const mongoose = require('mongoose')
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
require("../models/Categoria")
const Categoria = mongoose.model("categorias")

commum.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({date: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens!")
        console.log("Houve um erro ao listar as postagens! "+err)
        res.redirect("/404")
    })
})

commum.get("/categorias", (req, res) => {
    Categoria.find().then((categorias) => {
        res.render("categorias/index", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias!")
        console.log("Houve um erro interno ao listar as categorias! "+err)
        res.redirect("/")
    })
})

commum.get("/categorias/:nome", (req, res) => {
    Categoria.findOne({nome: req.params.nome}).then((categoria) => {

        if(categoria){

            Postagem.find({categoria: categoria._id}).then((postagens) => {
                res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar as postagens!")
                console.log("Houve um erro ao listar as postagens! "+err)
                res.redirect("/")
            })

        }else{
            req.flash("error_msg", "Esta categoria não existe!")
            res.redirect("/")
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria!")
        console.log("Houve um erro interno ao carregar a página desta categoria! "+err)
        res.redirect("/")
    })
})

commum.get("/postagem/:id", (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {

        if(postagem){
            res.render("postagem/index", {postagem: postagem})
        }else{
            req.flash("error_msg", "Esta postagem não existe!")
            console.log("error_msg", "Esta postagem não existe! "+err)
            res.redirect("/")
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno!")
        console.log("Houve um erro interno! "+err)
        res.redirect("/")
    })
})

commum.get("/404", (req, res) =>{
    res.send("Erro 404")
})

module.exports = commum