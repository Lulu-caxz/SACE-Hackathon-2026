import { prisma } from "../../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const dias = await prisma.cardapioDia.findMany({
            include: {
                cardapio: true,
                refeicoes: true,
                registro: true, // <-- CORRIGIDO AQUI!
            },
        });

        res.json(dias);
    } catch (error) {
        res.status(500).json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const dia = await prisma.cardapioDia.findUnique({
            where: {
                id,
            },
            include: {
                cardapio: true,
                refeicoes: true,
                registro: true, // <-- CORRIGIDO AQUI!
            },
        });

        res.json(dia);
    } catch (error) {
        res.status(500).json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            cardapioId,
            dia,
        } = req.body;

        const cardapioDia = await prisma.cardapioDia.create({
            data: {
                cardapioId,
                dia,
            },
        });

        res.status(201).json(cardapioDia);
    } catch (error) {
        res.status(400).json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            cardapioId,
            dia,
        } = req.body;

        const cardapioDia = await prisma.cardapioDia.update({
            where: {
                id,
            },
            data: {
                cardapioId,
                dia,
            },
        });

        res.json(cardapioDia);
    } catch (error) {
        res.status(400).json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const cardapioDia = await prisma.cardapioDia.delete({
            where: {
                id,
            },
        });

        res.json(cardapioDia);
    } catch (error) {
        res.status(400).json(error);
    }
});

export default router;