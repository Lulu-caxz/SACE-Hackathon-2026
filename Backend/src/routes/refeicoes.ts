import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todas
router.get("/", async (req, res) => {
    try {
        const refeicoes = await prisma.refeicao.findMany({
            include: {
                cardapioDia: true,
                nutricionais: true,
            },
        });

        res.json(refeicoes);
    } catch (error) {
        res.json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const refeicao = await prisma.refeicao.findUnique({
            where: {
                id,
            },
            include: {
                cardapioDia: true,
                nutricionais: true,
            },
        });

        res.json(refeicao);
    } catch (error) {
        res.json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            cardapioDiaId,
            tipo,
            descricao,
        } = req.body;

        const refeicao = await prisma.refeicao.create({
            data: {
                cardapioDiaId,
                tipo,
                descricao,
            },
        });

        res.json(refeicao);
    } catch (error) {
        res.json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            cardapioDiaId,
            tipo,
            descricao,
        } = req.body;

        const refeicao = await prisma.refeicao.update({
            where: {
                id,
            },
            data: {
                cardapioDiaId,
                tipo,
                descricao,
            },
        });

        res.json(refeicao);
    } catch (error) {
        res.json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const refeicao = await prisma.refeicao.delete({
            where: {
                id,
            },
        });

        res.json(refeicao);
    } catch (error) {
        res.json(error);
    }
});

export default router;