import dotenv from "dotenv";
dotenv.config()

import express from "express"
import cors from "cors";
import { prisma } from "./lib/prisma.js";

//==============================//

import usuariosRouter from "./routes/usuarios.js";
import escolasRouter from "./routes/escolas.js";
import refeicoesRouter from "./routes/refeicoes.js";
import referenciasRouter from "./routes/referencias.js";
import cardapiosRouter from "./routes/cardapios.js";
import diariosRouter from "./routes/diarios.js";
import nutricionaisRouter from "./routes/nutricionais.js";
import diasRouter from "./routes/dias.js";


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

//==============================//

app.listen(PORT, () => {
    console.log(`rodando em http://localhost:${PORT}`)
})