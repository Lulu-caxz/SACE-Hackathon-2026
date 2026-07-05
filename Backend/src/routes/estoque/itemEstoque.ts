import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

/* =========================================================
   LISTAR ITENS (CRUD NORMAL)
========================================================= */
router.get("/", async (req, res) => {
    try {
        const itens = await prisma.itemEstoque.findMany({
            include: {
                produto: true,
                estoque: true,
            },
        });

        res.json(itens);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* =========================================================
   BUSCAR POR ID
========================================================= */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.itemEstoque.findUnique({
            where: { id },
            include: {
                produto: true,
                estoque: true,
            },
        });

        res.json(item);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* =========================================================
   CRIAR ITEM
========================================================= */
router.post("/criar", async (req, res) => {
    try {
        const {
            estoqueId,
            produtoId,
            lote,
            validade,
            quantidade,
            unidade
        } = req.body;

        if (!estoqueId || !produtoId || quantidade == null) {
            return res.status(400).json({ message: "Campos obrigatórios faltando" });
        }

        const item = await prisma.itemEstoque.create({
            data: {
                estoqueId,
                produtoId,
                lote,
                validade,
                quantidade,
                unidade: unidade || "kg",
            },
        });

        res.json(item);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* =========================================================
   ATUALIZAR ITEM
========================================================= */
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const { lote, validade, quantidade, unidade } = req.body;

        const data: any = {};

        if (lote !== undefined) data.lote = lote;
        if (quantidade !== undefined) data.quantidade = quantidade;
        if (unidade !== undefined) data.unidade = unidade;
        if (validade !== undefined) data.validade = new Date(validade);

        const item = await prisma.itemEstoque.update({
            where: { id },
            data,
        });

        res.json(item);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* =========================================================
   DELETAR ITEM
========================================================= */
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const item = await prisma.itemEstoque.delete({
            where: { id },
        });

        res.json(item);
    } catch (error) {
        res.status(500).json(error);
    }
});

/* =========================================================
   ESTOQUE AGRUPADO (PRODUTO → LOTES)
   USADO NO DASHBOARD
========================================================= */
router.get("/agrupado/escola/:escolaId", async (req, res) => {
    try {
        const { escolaId } = req.params;

        const itens = await prisma.itemEstoque.findMany({
            where: {
                estoque: {
                    escolaId
                }
            },
            include: {
                produto: true
            }
        });

        const agrupado = Object.values(
            itens.reduce((acc: any, item) => {
                const produtoId = item.produtoId;

                if (!acc[produtoId]) {
                    acc[produtoId] = {
                        produto: {
                            id: item.produtoId,
                            nome: item.produto.nome
                        },
                        total: 0,
                        lotes: []
                    };
                }

                acc[produtoId].total += item.quantidade;

                acc[produtoId].lotes.push({
                    id: item.id,
                    estoqueId: item.estoqueId, // necessário para o front chamar /estoqueController/ajuste
                    lote: item.lote,
                    validade: item.validade,
                    quantidade: item.quantidade,
                    unidade: item.unidade
                });

                return acc;
            }, {})
        );

        res.json(agrupado);
    } catch (error) {
        res.status(500).json(error);
    }
});

export default router;