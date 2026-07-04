import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();

//buscar todas
router.get("/", async (req, res) => {
    try {
        const escolas = await prisma.escola.findMany();
        res.json(escolas);
    } catch (error) {
        res.json(error);
    }
})

//buscar por id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const escola = await prisma.escola.findUnique({
            where: {
                id,
            },
        });

    res.json(escola);
    } catch (error) {
        res.json(error);
    }
})

//criar 
router.post("/criar", async (req, res) => {
    try {
        const { nome } = req.body;

        const escola = await prisma.escola.create({
            data: {
                nome
            },
        });

        res.json(escola);
    } catch (error) {
        res.json(error);
    }
});

//atualizar
router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        const escola = await prisma.escola.update({
            where: {
                id,
            },
            data: {
                nome
            },
        });
    res.json(escola);
    } catch (error) {
        res.json(error);
    }
})

//deletar
router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const escola = await prisma.escola.delete({
            where: {
                id
            }
        })
    res.json(escola);
    } catch (error) {
        res.json(error);
    }
})

export default router;