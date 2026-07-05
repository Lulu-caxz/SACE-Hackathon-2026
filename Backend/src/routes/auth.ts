import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res) => {
    try {
        const { cpf, password, role } = req.body

        const usuario = await prisma.usuario.findUnique({
            where: {
                cpf
            },
        })

        if (!usuario) {
            return res.json({ message: "nao achou o usuario" })
        }
        if (usuario.role !== role.toUpperCase()) {
            return res.json({ message: "o cargo esta errado" })
        }

        const senhaCerta = await bcrypt.compare(password, usuario.password)

        if (!senhaCerta) {
            return res.json({ message: "senha errada" })
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                role: usuario.role,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "1d",
            }
        )

        res.json({ token, usuario })

    } catch (error) {
        res.json(error)
    }
})

export default router;