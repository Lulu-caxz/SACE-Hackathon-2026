import { prisma } from "../../lib/prisma.js";
import { Router } from "express";

const router = Router();

// LISTAR
router.get("/", async (req, res) => {
    try {
        const contagens = await prisma.contagem.findMany({
            include: {
                salas: true,
            },
        });

        res.json(contagens);
    } catch (error) {
        res.status(500).json(error);
    }
});

// POR ESCOLA (CORRIGIDO)
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const contagens = await prisma.contagem.findMany({
            where: { escolaId: id },
            include: { salas: true }
        });

        const alunosContados = contagens.reduce((acc, c) => {
            const porContagem = c.salas.reduce((sum, s) => {
                return sum + (s.alunosComer ?? 0) + (s.alunosRestricao ?? 0);
            }, 0);

            return acc + porContagem;
        }, 0);

        return res.json({
            alunosContados,
            contagens
        });

    } catch (error) {
        return res.status(500).json(error);
    }
});

// CRIAR
router.post("/criar", async (req, res) => {
    try {
        const { data, escolaId } = req.body;

        const contagem = await prisma.contagem.create({
            data: {
                data: new Date(data),
                escolaId,
            },
        });

        res.status(201).json(contagem);
    } catch (error) {
        res.status(400).json(error);
    }
});

// ATUALIZAR (remove totalAlunos porque não faz sentido no teu modelo atual)
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        const contagem = await prisma.contagem.update({
            where: { id },
            data: {
                ...(data && { data: new Date(data) }),
            },
        });

        res.json(contagem);
    } catch (error) {
        res.status(400).json(error);
    }
});

// DELETE
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const contagem = await prisma.contagem.delete({
            where: { id },
        });

        res.json(contagem);
    } catch (error) {
        res.status(400).json(error);
    }
});

export default router;