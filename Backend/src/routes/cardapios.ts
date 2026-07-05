import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const cardapios = await prisma.cardapioSemanal.findMany({
            include: {
                dias: true,
            },
        });

        res.json(cardapios);
    } catch (error) {
        res.status(500).json(error);
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
                dias: {
                    include: {
                        refeicoes: true,
                    },
                },
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.status(500).json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            mes,
            ano,
            semana,
            status,
        } = req.body;

        const cardapio = await prisma.cardapioSemanal.create({
            data: {
                mes: Number(mes),
                ano: Number(ano),
                semana: new Date(semana),
                status: status || "Esperando",
            },
        });

        res.status(201).json(cardapio);
    } catch (error) {
        res.status(400).json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            mes,
            ano,
            semana,
            status,
        } = req.body;

        const cardapio = await prisma.cardapioSemanal.update({
            where: {
                id,
            },
            data: {
                mes: Number(mes),
                ano: Number(ano),
                semana: new Date(semana),
                status,
            },
        });

        res.json(cardapio);
    } catch (error) {
        res.status(400).json(error);
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
        res.status(400).json(error);
    }
});

export default router;