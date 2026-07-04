import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const cardapios = await prisma.cardapioSemanal.findMany({
            include: {
                escola: true,
                dias: true,
            },
        });

        res.json(cardapios);
    } catch (error) {
        res.json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const cardapio = await prisma.cardapioSemanal.findUnique({
            where: {
                id,
            },
            include: {
                escola: true,
                dias: {
                    include: {
                        refeicoes: true,
                    },
                },
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            escolaId,
            mes,
            ano,
            semana,
        } = req.body;

        const cardapio = await prisma.cardapioSemanal.create({
            data: {
                escolaId,
                mes,
                ano,
                semana: new Date(semana),
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            escolaId,
            mes,
            ano,
            semana,
        } = req.body;

        const cardapio = await prisma.cardapioSemanal.update({
            where: {
                id,
            },
            data: {
                escolaId,
                mes,
                ano,
                semana: new Date(semana),
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const cardapio = await prisma.cardapioSemanal.delete({
            where: {
                id,
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.json(error);
    }
});

export default router;