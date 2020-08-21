const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin")


// ROTAS DE CATEGORIAS

router.get('/', eAdmin, (req, res) => {
    res.render('admin/index')
})

router.get('/posts', eAdmin, (req, res) => {
    res.send('Página de Posts')
})

router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategoria')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
    var erros = []

    if(req.body.nome == ""){
        erros.push({text: "Nome inválido"})
    }
    if(req.body.slug == ""){
        erros.push({text: "Slug inválido"})
    }
    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.render("admin/categorias", {erros: erros})
        })
    }  
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req, res) => {//ATENÇÃO
    var erros = []
    if(req.body.nome == ""){
        erros.push({text: "Nome inválido!"})
    }
    if(req.body.slug == ""){
        erros.push({text: "Slug inválido"})
    }
    if(erros.length > 0){
        req.flash("error_msg", "Dados inválidos")
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            req.body.nome = categoria.nome
            req.body.slug = categoria.slug
            res.render("admin/editcategorias", {erros: erros, categoria: categoria})
        }).catch((err) => {
            req.flash("error_msg", "Falha")
            res.redirect("/admin/categorias")
            console.log(err)
        })
    }else{
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a categoria!")
            res.redirect('/admin/categorias')
            console.log("houve um erro " + err)
        })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar a categoria")
            res.redirect("/admin/categorias")
            console.log("houve um erro " + err)
        })
    }
    
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao deletar a categoria")
        console.log("Erro ao remover postagem! "+err)
        res.redirect("/admin/categorias")
    })
})



// ROTAS DE POSTAGENS

router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().populate("categoria").sort({date: "desc"}).then((postagens) => {
      res.render("admin/postagens", {postagens: postagens})  
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens!")
        res.redirect("/admin")
    })

    
})

router.get("/postagens/add", eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário")
        console.log("Houve um erro ao carregar o formulário! " + err)
    })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text: "Categoria inválida, registre uma categoria!"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria

        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
            res.redirect("/admin/postagens")
        })
    }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
    Postagem.findOne({_id: req.params.id}).then((postagem) => {
        Categoria.find().then((categorias) => {
            
            res.render("admin/editpostagens", {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            console.log("Houve um erro ao listar as categorias "+err)
            res.redirect("/admin/postagens")
        })
        
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição!")
        console.log("Houve um erro ao carregar o formulário de edição! "+err)
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", eAdmin, (req, res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({text: "Por favor, registre uma categoria primeiro!"})
    }
    if(erros.length > 0){
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            req.body.titulo = postagem.titulo
            req.body.slug = postagem.slug
            req.body.descricao = postagem.descricao
            req.body.conteudo = postagem.conteudo
            req.body.categoria = postagem.categoria
            res.render("admin/editpostagens", {erros: erros, postagem: postagem})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao encontrar a postagem")
            res.redirect("/admin/postagens")
            console.log("houve um erro " + err)
        })
    }else{
        Postagem.findOne({_id: req.body.id}).then((postagem) => {
            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash("success_msg", "Postagem editada com sucesso!")
                res.redirect("/admin/postagens")
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro interno ao salvar a postagem!")
                res.redirect('/admin/postagens')
                console.log("houve um erro " + err)
            })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao !!editar a postagem")
            res.redirect("/admin/postagens")
            console.log("houve um erro " + err)
        })

        
    }
})

router.post("/postagens/deletar", eAdmin, (req, res) => {
    Postagem.remove({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("Houve um erro ao deletar a postagem!")
        console.log("Houve um erro ao deletar a postagem! "+err)
        res.redirect("/admin/postagens")
    })
})

module.exports = router