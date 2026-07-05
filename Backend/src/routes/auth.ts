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

        console.log("CPF:", cpf);
        console.log("ROLE:", role);
        console.log("USER:", usuario);

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

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET não definido no .env");
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                role: usuario.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );
        console.log({
            token,
            usuario
        });

        res.json({ token, usuario, message: "login feito com sucesso" })


    } catch (error) {
        res.json(error)
    }
})

export default router;