import { Router } from "express";
import {
    entradaEstoque,
    saidaEstoque,
    ajusteEstoque
} from "../services/movimentacaoEstoque.service.js";

const router = Router();

//entrada
router.post("/entrada", async (req, res) => {
    try {
        const {
            estoqueId,
            produtoId,
            lote,
            validade,
            quantidade,
            unidade,
            motivo
        } = req.body;

        if (!estoqueId || !produtoId || !lote || !validade || quantidade == null) {
            return res.status(400).json({ error: "Campos obrigatórios faltando" });
        }

        const result = await entradaEstoque({
            estoqueId,
            produtoId,
            lote,
            validade: new Date(validade),
            quantidade: Number(quantidade),
            unidade,
            motivo: motivo ?? "Entrada de estoque"
        });

        return res.json(result);

    } catch (error) {
        return res.status(500).json({ error: "Erro na entrada de estoque" });
    }
});

//saida
router.post("/saida", async (req, res) => {
    try {
        const {
            estoqueId,
            produtoId,
            quantidade,
            motivo
        } = req.body;

        if (!estoqueId || !produtoId || quantidade == null) {
            return res.status(400).json({ error: "Campos obrigatórios faltando" });
        }

        await saidaEstoque({
            estoqueId,
            produtoId,
            quantidade: Number(quantidade),
            motivo
        });

        return res.json({ message: "Saída registrada com sucesso" });

    } catch (error: any) {
        return res.status(400).json({
            error: error?.message ?? "Erro na saída de estoque"
        });
    }
});

//ajuste
router.post("/ajuste", async (req, res) => {
    try {
        const {
            estoqueId,
            itemId,
            novaQuantidade,
            motivo
        } = req.body;

        if (!estoqueId || !itemId || novaQuantidade == null) {
            return res.status(400).json({ error: "Campos obrigatórios faltando" });
        }

        const result = await ajusteEstoque({
            estoqueId,
            itemId,
            novaQuantidade: Number(novaQuantidade),
            motivo: motivo ?? "Ajuste de estoque"
        });

        return res.json(result);

    } catch (error: any) {
        return res.status(400).json({
            error: error.message ?? "Erro no ajuste de estoque"
        });
    }
});

export default router;