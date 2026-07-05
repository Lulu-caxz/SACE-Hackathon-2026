import { prisma } from "../../lib/prisma.js";
import { Router } from "express";

const router = Router();

// LISTAR TODOS OS ESTOQUES
router.get("/", async (req, res) => {
    try {
        const estoques = await prisma.estoque.findMany({
            include: {
                itens: true,
                movimentacoes: true,
                escola: true,
            },
        });

        res.json(estoques);
    } catch (error) {
        res.status(500).json(error);
    }
});

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const estoque = await prisma.estoque.findUnique({
            where: { id },
            include: {
                itens: true,
                movimentacoes: true,
                escola: true,
            },
        });

        res.json(estoque);
    } catch (error) {
        res.status(500).json(error);
    }
});

// CRIAR ESTOQUE
router.post("/criar", async (req, res) => {
    try {
        const { escolaId } = req.body;

        const estoque = await prisma.estoque.create({
            data: {
                escolaId,
            },
        });

        res.json(estoque);
    } catch (error) {
        res.status(500).json(error);
    }
});

// ATUALIZAR ESTOQUE
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { escolaId } = req.body;

        const estoque = await prisma.estoque.update({
            where: { id },
            data: {
                escolaId,
            },
        });

        res.json(estoque);
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETAR ESTOQUE
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const estoque = await prisma.estoque.delete({
            where: { id },
        });

        res.json(estoque);
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;