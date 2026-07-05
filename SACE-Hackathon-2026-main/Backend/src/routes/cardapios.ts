import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();



router.get("/", async (req, res) => {
    try {

        const cardapios = await prisma.cardapioSemanal.findMany({
            include: {
                dias: {
                    include: {
                        refeicoes: true
                    }
                }
            }
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
            where: { id },
            include: {
                dias: {
                    include: {
                        refeicoes: {
                            include: {
                                nutricionais: true, // <-- AQUI TAMBÉM!
                            },
                        },
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


router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, motivoReprovacao } = req.body;

       
        const cardapioAtualizado = await prisma.cardapioSemanal.update({
            where: { id },
            data: {
                status,
                motivoReprovacao: motivoReprovacao || null,
            }
        });

        res.json(cardapioAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar status do cardápio:", error);
        res.status(500).json({ error: "Erro ao atualizar cardápio no banco." });
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