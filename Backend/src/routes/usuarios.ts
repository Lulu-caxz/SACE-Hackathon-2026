import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

//buscar todas os usuarios
router.get("/", async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany();
        res.json(usuarios);
    } catch (error) {
        res.json(error);
    }
})

//buscar usuario por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.findUnique({
            where: {
                id,
            },
        });

    res.json(usuario);
    } catch (error) {
        res.json(error);
    }
})

//criar um novo usuario
router.post("/criar", async (req, res) => {
    try {
        const { role, nome, email, password, cpf, escolaId } = req.body;

        const usuario = await prisma.usuario.create({
            data: {
                role,
                nome,
                email,
                password,
                cpf,
                escolaId,
            },
        });

        res.json(usuario);
    } catch (error) {
        res.json(error);
    }
});

//atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { role, nome, email, password, cpf, escolaId } = req.body;

        const usuario = await prisma.usuario.update({
            where: {
                id,
            },
            data: {
                role,
                nome,
                email,
                password,
                cpf,
                escolaId,
            },
        });
    res.json(usuario);
    } catch (error) {
        res.json(error);
    }
})

//deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await prisma.usuario.delete({
            where: {
                id,
            }
        })
    res.json(usuario);
    } catch (error) {
        res.json(error);
    }
})

export default router;