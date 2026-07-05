import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

// LISTAR PRODUTOS
router.get("/", async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            include: {
                itens: true,
            },
        });

        res.json(produtos);
    } catch (error) {
        res.status(500).json(error);
    }
});

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await prisma.produto.findUnique({
            where: { id },
            include: {
                itens: true,
            },
        });

        res.json(produto);
    } catch (error) {
        res.status(500).json(error);
    }
});

// CRIAR PRODUTO
router.post("/criar", async (req, res) => {
    try {
        const { nome, marca } = req.body;

        if (!nome) {
            return res.status(400).json({ message: "Nome é obrigatório" });
        }

        const produto = await prisma.produto.create({
            data: {
                nome,
                marca,
            },
        });

        res.json(produto);
    } catch (error) {
        res.status(500).json(error);
    }
});

// ATUALIZAR PRODUTO
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, marca } = req.body;

        const data: any = {};

        if (nome !== undefined) data.nome = nome;
        if (marca !== undefined) data.marca = marca;

        const produto = await prisma.produto.update({
            where: { id },
            data,
        });

        res.json(produto);
    } catch (error) {
        res.status(500).json(error);
    }
});

// DELETAR PRODUTO
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const produto = await prisma.produto.delete({
            where: { id },
        });

        res.json(produto);
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;