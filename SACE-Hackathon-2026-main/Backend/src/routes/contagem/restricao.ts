import { prisma } from "../../lib/prisma.js";
import { Router } from "express";

const router = Router();

// LISTAR
router.get("/", async (req, res) => {
  try {
    const restricoes = await prisma.restricao.findMany({
      include: {
        sala: true,
      },
    });

    res.json(restricoes);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POR ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restricao = await prisma.restricao.findUnique({
      where: { id },
      include: { sala: true },
    });

    res.json(restricao);
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRIAR
router.post("/criar", async (req, res) => {
  try {
    const { salaId, descricao } = req.body;

    const restricao = await prisma.restricao.create({
      data: {
        salaId,
        descricao,
      },
    });

    res.status(201).json(restricao);
  } catch (error) {
    res.status(400).json(error);
  }
});

// ATUALIZAR
router.put("/atualizar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao } = req.body;

    const restricao = await prisma.restricao.update({
      where: { id },
      data: {
        ...(descricao && { descricao }),
      },
    });

    res.json(restricao);
  } catch (error) {
    res.status(400).json(error);
  }
});

// DELETE
router.delete("/deletar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restricao = await prisma.restricao.delete({
      where: { id },
    });

    res.json(restricao);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;