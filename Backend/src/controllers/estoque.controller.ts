import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// =========================================================
// POST /estoqueController/entrada
// Registra uma nova entrada de lote (cria o ItemEstoque + a
// movimentação de ENTRADA correspondente).
// Body esperado: { escolaId, produtoId, lote, quantidade, unidade, validade }
// =========================================================
router.post("/entrada", async (req, res) => {
    try {
        const { escolaId, produtoId, lote, quantidade, unidade, validade } = req.body;

        if (!escolaId || !produtoId || !lote || quantidade === undefined || !validade) {
            return res.status(400).json({
                message: "Campos obrigatórios: escolaId, produtoId, lote, quantidade, validade.",
            });
        }

        // Garante que a escola já tem um estoque; se não tiver, cria um.
        let estoque = await prisma.estoque.findUnique({ where: { escolaId } });
        if (!estoque) {
            estoque = await prisma.estoque.create({ data: { escolaId } });
        }

        const item = await prisma.itemEstoque.create({
            data: {
                estoqueId: estoque.id,
                produtoId,
                lote,
                quantidade: Number(quantidade),
                unidade: unidade || "kg",
                validade: new Date(validade),
            },
        });

        await prisma.movimentacaoEstoque.create({
            data: {
                estoqueId: estoque.id,
                itemId: item.id,
                tipo: "ENTRADA",
                quantidade: Number(quantidade),
                motivo: "Nova entrada de lote",
            },
        });

        return res.status(201).json(item);
    } catch (error) {
        console.error("Erro ao registrar entrada de estoque:", error);
        return res.status(500).json({ message: "Erro ao registrar entrada de estoque." });
    }
});

// =========================================================
// PUT /estoqueController/ajuste
// Ajusta a quantidade de um lote já existente (retirada ou
// adição manual) e registra a movimentação de AJUSTE com o
// delta aplicado.
// Body esperado: { estoqueId, itemId, novaQuantidade, motivo }
// =========================================================
router.put("/ajuste", async (req, res) => {
    try {
        const { estoqueId, itemId, novaQuantidade, motivo } = req.body;

        if (!estoqueId || !itemId || novaQuantidade === undefined) {
            return res.status(400).json({
                message: "Campos obrigatórios: estoqueId, itemId, novaQuantidade.",
            });
        }

        const itemAtual = await prisma.itemEstoque.findUnique({ where: { id: itemId } });
        if (!itemAtual) {
            return res.status(404).json({ message: "Item de estoque não encontrado." });
        }

        const quantidadeNova = Number(novaQuantidade);
        if (Number.isNaN(quantidadeNova) || quantidadeNova < 0) {
            return res.status(400).json({ message: "novaQuantidade inválida." });
        }

        const delta = quantidadeNova - itemAtual.quantidade;

        const itemAtualizado = await prisma.itemEstoque.update({
            where: { id: itemId },
            data: { quantidade: quantidadeNova },
        });

        await prisma.movimentacaoEstoque.create({
            data: {
                estoqueId,
                itemId,
                tipo: "AJUSTE",
                quantidade: delta,
                motivo: motivo || (delta >= 0 ? "Adição manual" : "Retirada manual"),
            },
        });

        return res.json(itemAtualizado);
    } catch (error) {
        console.error("Erro ao ajustar lote de estoque:", error);
        return res.status(500).json({ message: "Erro ao ajustar lote de estoque." });
    }
});

export default router;