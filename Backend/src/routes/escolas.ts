import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();


router.get("/", async (req, res) => {
    try {
        const escolas = await prisma.escola.findMany();
        res.json(escolas);
    } catch (error) {
        res.status(500).json(error);
    }
});


router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const escola = await prisma.escola.findUnique({
            where: {
                id,
            },
        });

        res.json(escola);
    } catch (error) {
        res.status(500).json(error);
    }
});


router.post("/criar", async (req, res) => {
    try {
        const { nome, bairro, endereco, email, telefone, diretor, supervisor, indiceSace } = req.body;

        const escola = await prisma.escola.create({
            data: {
                nome,
                bairro,
                endereco,
                email,
                telefone,
                diretor,
                supervisor
            },
        });

        res.status(201).json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, bairro, endereco, email, telefone, diretor, supervisor, indiceSace } = req.body;

        const escola = await prisma.escola.update({
            where: {
                id,
            },
            data: {
                nome,
                bairro,
                endereco,
                email,
                telefone,
                diretor,
                supervisor,
            },
        });
        res.json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const escola = await prisma.escola.delete({
            where: {
                id
            }
        });
        res.json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


export default router;