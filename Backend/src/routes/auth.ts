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


router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "sem token" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "sem token" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

        const usuario = await prisma.usuario.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                nome: true,
                role: true,
                email: true,
                cpf: true
            }
        });

        if (!usuario) {
            return res.status(404).json({ message: "usuario nao existe" });
        }

        return res.json(usuario);

    } catch (err) {
        return res.status(401).json({ message: "token invalido" });
    }
});

export default router;