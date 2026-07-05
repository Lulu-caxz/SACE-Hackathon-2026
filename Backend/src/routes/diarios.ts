import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// buscar todos
router.get("/", async (req, res) => {
    try {
        const diarios = await prisma.registroInspecao.findMany({
            include: {
                cardapioDia: true,
            },
        });

        res.json(diarios);
    } catch (error) {
        res.status(500).json(error);
    }
});

// buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const diario = await prisma.registroInspecao.findUnique({
            where: {
                id,
            },
            include: {
                cardapioDia: true,
            },
        });

        res.json(diario);
    } catch (error) {
        res.status(500).json(error);
    }
});

// criar
router.post("/criar", async (req, res) => {
    try {
        const {
            cardapioDiaId,
            inspetoraId,
            data,
            alunosPresentes,
            pratosServidos,
            comidaFeitaKg,
            sobraKg,
            observacoes,
        } = req.body;

        const diario = await prisma.registroInspecao.create({
            data: {
                cardapioDiaId,
                inspetoraId,
                data: new Date(data),
                alunosPresentes: Number(alunosPresentes),
                pratosServidos: Number(pratosServidos || 0),
                comidaFeitaKg: Number(comidaFeitaKg),
                sobraKg: Number(sobraKg),
                observacoes,
            },
        });

        res.status(201).json(diario);
    } catch (error) {
        res.status(400).json(error);
    }
});

// atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            cardapioDiaId,
            inspetoraId,
            data,
            alunosPresentes,
            pratosServidos,
            comidaFeitaKg,
            sobraKg,
            observacoes,
        } = req.body;

        const diario = await prisma.registroInspecao.update({
            where: {
                id,
            },
            data: {
                cardapioDiaId,
                inspetoraId,
                data: new Date(data),
                alunosPresentes: Number(alunosPresentes),
                pratosServidos: Number(pratosServidos || 0),
                comidaFeitaKg: Number(comidaFeitaKg),
                sobraKg: Number(sobraKg),
                observacoes,
            },
        });

        res.json(diario);
    } catch (error) {
        res.status(400).json(error);
    }
});

// deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const diario = await prisma.registroInspecao.delete({
            where: {
                id,
            },
        });

        res.json(diario);
    } catch (error) {
        res.status(400).json(error);
    }
});

export default router;