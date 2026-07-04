import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const diarios = await prisma.diarioCozinha.findMany({
            include: {
                cardapioDia: true,
            },
        });

        res.json(diarios);
    } catch (error) {
        res.json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const diario = await prisma.diarioCozinha.findUnique({
            where: {
                id,
            },
            include: {
                cardapioDia: true,
            },
        });

        res.json(diario);
    } catch (error) {
        res.json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            cardapioDiaId,
            data,
            alunosPresentes,
            comidaFeitaKg,
            sobraKg,
            observacoes,
        } = req.body;

        const diario = await prisma.diarioCozinha.create({
            data: {
                cardapioDiaId,
                data: new Date(data),
                alunosPresentes,
                comidaFeitaKg,
                sobraKg,
                observacoes,
            },
        });

        res.json(diario);
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
            data,
            alunosPresentes,
            comidaFeitaKg,
            sobraKg,
            observacoes,
        } = req.body;

        const diario = await prisma.diarioCozinha.update({
            where: {
                id,
            },
            data: {
                cardapioDiaId,
                data: new Date(data),
                alunosPresentes,
                comidaFeitaKg,
                sobraKg,
                observacoes,
            },
        });

        res.json(diario);
    } catch (error) {
        res.json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const diario = await prisma.diarioCozinha.delete({
            where: {
                id,
            },
        });

        res.json(diario);
    } catch (error) {
        res.json(error);
    }
});

export default router;