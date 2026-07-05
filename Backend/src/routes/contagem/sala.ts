import { prisma } from "../../lib/prisma.js";
import { Router } from "express";

const router = Router();

// LISTAR
router.get("/", async (req, res) => {
  try {
    const salas = await prisma.sala.findMany({
      include: {
        restricoes: true,
      },
    });

    res.json(salas);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POR ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sala = await prisma.sala.findUnique({
      where: { id },
      include: { restricoes: true },
    });

    res.json(sala);
  } catch (error) {
    res.status(500).json(error);
  }
});

// CRIAR
router.post("/criar", async (req, res) => {
  try {
    const {
      contagemId,
      nome,
      alunosComer,
      alunosRestricao,
    } = req.body;

    const sala = await prisma.sala.create({
      data: {
        contagemId,
        nome,
        alunosComer: Number(alunosComer ?? 0),
        alunosRestricao: Number(alunosRestricao ?? 0),
      },
    });

    res.status(201).json(sala);
  } catch (error) {
    res.status(400).json(error);
  }
});

// ATUALIZAR
router.put("/atualizar/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, alunosComer, alunosRestricao } = req.body;

    const sala = await prisma.sala.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(alunosComer != null && { alunosComer: Number(alunosComer) }),
        ...(alunosRestricao != null && { alunosRestricao: Number(alunosRestricao) }),
      },
    });

    res.json(sala);
  } catch (error) {
    res.status(400).json(error);
  }
});

// DELETE
router.delete("/deletar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const sala = await prisma.sala.delete({
      where: { id },
    });

    res.json(sala);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;