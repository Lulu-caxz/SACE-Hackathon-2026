import dotenv from "dotenv";
dotenv.config()

import express from "express"
import cors from "cors";

//==============================//

import usuariosRouter from "./routes/usuarios.js";
import escolasRouter from "./routes/escolas.js";
import refeicoesRouter from "./routes/refeicoes.js";
import referenciasRouter from "./routes/referencias.js";
import cardapiosRouter from "./routes/cardapios.js";
import diariosRouter from "./routes/diarios.js";
import nutricionaisRouter from "./routes/nutricionais.js";
import diasRouter from "./routes/dias.js";

import estoqueRouter from "./routes/estoque/estoque.js";
import itemEstoqueRouter from "./routes/estoque/itemEstoque.js";
import produtoRouter from "./routes/estoque/produto.js";

import estoqueControllerRouter from "./controllers/estoque.controller.js"

import authRouter from "./routes/auth.js";


//==============================//

export const app = express()

app.use(cors())
app.use(express.json())

dotenv.config()

const PORT = process.env.DB_PORT

//==============================//

app.get("/", (req, res) => {
    res.send("ta certo")
})

app.use("/usuarios", usuariosRouter)
app.use("/escolas", escolasRouter)
app.use("/refeicoes", refeicoesRouter)
app.use("/referencias", referenciasRouter)
app.use("/cardapios", cardapiosRouter)
app.use("/diarios", diariosRouter)
app.use("/nutricionais", nutricionaisRouter)
app.use("/dias", diasRouter)

app.use("/estoque", estoqueRouter)
app.use("/itemEstoque", itemEstoqueRouter)
app.use("/produto", produtoRouter)

app.use("/estoqueController", estoqueControllerRouter)

app.use("/auth", authRouter)

//==============================//

app.listen(PORT, () => {
    console.log(`rodando em http://localhost:${PORT}`)
})