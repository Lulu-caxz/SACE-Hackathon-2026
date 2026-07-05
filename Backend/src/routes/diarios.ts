import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

// LISTAR TODOS
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

// BUSCAR POR ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const diario = await prisma.registroInspecao.findUnique({
      where: { id },
      include: {
        cardapioDia: true,
      },
    });

    res.json(diario);
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRIAR
router.post("/criar", async (req, res) => {
  try {
    const {
      escolaId,
      cardapioDiaId,
      data,
      pratosServidos,
      comidaFeitaKg,
      sobraKg,
      observacoes,
    } = req.body;

    if (!escolaId || !cardapioDiaId || !data) {
      return res.status(400).json({
        error: "escolaId, cardapioDiaId e data são obrigatórios",
      });
    }

    const diario = await prisma.registroInspecao.create({
      data: {
        escolaId,
        cardapioDiaId,
        data: new Date(data),
        pratosServidos: Number(pratosServidos ?? 0),
        comidaFeitaKg: Number(comidaFeitaKg ?? 0),
        sobraKg: Number(sobraKg ?? 0),
        observacoes,
      },
    });

    return res.status(201).json(diario);
  } catch (error) {
    return res.status(400).json(error);
  }
});

// ATUALIZAR
router.put("/atualizar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      cardapioDiaId,
      data,
      pratosServidos,
      comidaFeitaKg,
      sobraKg,
      observacoes,
    } = req.body;

    const diario = await prisma.registroInspecao.update({
      where: { id },
      data: {
        ...(cardapioDiaId && { cardapioDiaId }),
        ...(data && { data: new Date(data) }),
        pratosServidos: Number(pratosServidos ?? 0),
        comidaFeitaKg: Number(comidaFeitaKg ?? 0),
        sobraKg: Number(sobraKg ?? 0),
        observacoes,
      },
    });

    return res.json(diario);
  } catch (error) {
    return res.status(400).json(error);
  }
});

// DELETAR
router.delete("/deletar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const diario = await prisma.registroInspecao.delete({
      where: { id },
    });

    return res.json(diario);
  } catch (error) {
    return res.status(400).json(error);
  }
});

export default router;  