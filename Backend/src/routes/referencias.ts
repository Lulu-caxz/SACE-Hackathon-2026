import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todas
router.get("/", async (req, res) => {
    try {
        const referencias = await prisma.referenciaNutricional.findMany();
        res.json(referencias);
    } catch (error) {
        res.status(500).json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const referencia = await prisma.referenciaNutricional.findUnique({
            where: {
                id,
            },
        });

        res.json(referencia);
    } catch (error) {
        res.status(500).json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            faixaEtaria,
            dieta,
            kcalAlvo,
            choMin,
            choMax,
            ptnMin,
            ptnMax,
            lipMin,
            lipMax,
            sodioMaxMg,
        } = req.body;

        const referencia = await prisma.referenciaNutricional.create({
            data: {
                faixaEtaria,
                dieta: dieta || "DIETA GERAL",
                kcalAlvo: Number(kcalAlvo),
                choMin: Number(choMin),
                choMax: Number(choMax),
                ptnMin: Number(ptnMin),
                ptnMax: Number(ptnMax),
                lipMin: Number(lipMin),
                lipMax: Number(lipMax),
                sodioMaxMg: Number(sodioMaxMg),
            },
        });

        res.status(201).json(referencia);
    } catch (error) {
        res.status(400).json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            faixaEtaria,
            dieta,
            kcalAlvo,
            choMin,
            choMax,
            ptnMin,
            ptnMax,
            lipMin,
            lipMax,
            sodioMaxMg,
        } = req.body;

        const referencia = await prisma.referenciaNutricional.update({
            where: {
                id,
            },
            data: {
                faixaEtaria,
                dieta,
                kcalAlvo: Number(kcalAlvo),
                choMin: Number(choMin),
                choMax: Number(choMax),
                ptnMin: Number(ptnMin),
                ptnMax: Number(ptnMax),
                lipMin: Number(lipMin),
                lipMax: Number(lipMax),
                sodioMaxMg: Number(sodioMaxMg),
            },
        });

        res.json(referencia);
    } catch (error) {
        res.status(400).json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const referencia = await prisma.referenciaNutricional.delete({
            where: {
                id,
            },
        });

        res.json(referencia);
    } catch (error) {
        res.status(400).json(error);
    }
});

export default router;