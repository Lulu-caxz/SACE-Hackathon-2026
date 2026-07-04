import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todas
router.get("/", async (req, res) => {
    try {
        const referencias = await prisma.referenciaNutricional.findMany();
        res.json(referencias);
    } catch (error) {
        res.json(error);
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
        res.json(error);
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
                dieta,
                kcalAlvo,
                choMin,
                choMax,
                ptnMin,
                ptnMax,
                lipMin,
                lipMax,
                sodioMaxMg,
            },
        });

        res.json(referencia);
    } catch (error) {
        res.json(error);
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
                kcalAlvo,
                choMin,
                choMax,
                ptnMin,
                ptnMax,
                lipMin,
                lipMax,
                sodioMaxMg,
            },
        });

        res.json(referencia);
    } catch (error) {
        res.json(error);
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
        res.json(error);
    }
});

export default router;