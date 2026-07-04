import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const dias = await prisma.cardapioDia.findMany({
            include: {
                cardapio: true,
                refeicoes: true,
                diario: true,
            },
        });

        res.json(dias);
    } catch (error) {
        res.json(error);
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
                diario: true,
            },
        });

        res.json(dia);
    } catch (error) {
        res.json(error);
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

        res.json(cardapioDia);
    } catch (error) {
        res.json(error);
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
        res.json(error);
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
        res.json(error);
    }
});

export default router;