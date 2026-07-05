import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todas
router.get("/", async (req, res) => {
    try {
        const nutricionais = await prisma.informacaoNutricional.findMany({
            include: {
                refeicao: true,
            },
        });

        res.json(nutricionais);
    } catch (error) {
        res.json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const nutricional = await prisma.informacaoNutricional.findUnique({
            where: {
                id,
            },
            include: {
                refeicao: true,
            },
        });

        res.json(nutricional);
    } catch (error) {
        res.json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            refeicaoId,
            faixaEtaria,
            dieta,
            kcal,
            cho,
            ptn,
            lip,
            sodioMg,
            observacoes,
        } = req.body;

        const nutricional = await prisma.informacaoNutricional.create({
            data: {
                refeicaoId,
                faixaEtaria,
                dieta,
                kcal,
                cho,
                ptn,
                lip,
                sodioMg,
                observacoes,
            },
        });

        res.json(nutricional);
    } catch (error) {
        res.json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            refeicaoId,
            faixaEtaria,
            dieta,
            kcal,
            cho,
            ptn,
            lip,
            sodioMg,
            observacoes,
        } = req.body;

        const nutricional = await prisma.informacaoNutricional.update({
            where: {
                id,
            },
            data: {
                refeicaoId,
                faixaEtaria,
                dieta,
                kcal,
                cho,
                ptn,
                lip,
                sodioMg,
                observacoes,
            },
        });

        res.json(nutricional);
    } catch (error) {
        res.json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const nutricional = await prisma.informacaoNutricional.delete({
            where: {
                id,
            },
        });

        res.json(nutricional);
    } catch (error) {
        res.json(error);
    }
});

export default router;