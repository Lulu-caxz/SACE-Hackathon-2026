import { prisma } from "../lib/prisma.js";
import { Router } from "express";

const router = Router();


router.get("/", async (req, res) => {
    try {
        const escolas = await prisma.escola.findMany();
        res.json(escolas);
    } catch (error) {
        res.status(500).json(error);
    }
});


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
        res.status(500).json(error);
    }
});


router.post("/criar", async (req, res) => {
    try {
        const { nome, bairro, endereco, email, telefone, diretor, supervisor, indiceSace } = req.body;

        const escola = await prisma.escola.create({
            data: {
                nome,
                bairro,
                endereco,
                email,
                telefone,
                diretor,
                supervisor
            },
        });

        res.status(201).json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.put("/atualizar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, bairro, endereco, email, telefone, diretor, supervisor, indiceSace } = req.body;

        const escola = await prisma.escola.update({
            where: {
                id,
            },
            data: {
                nome,
                bairro,
                endereco,
                email,
                telefone,
                diretor,
                supervisor,
            },
        });
        res.json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.delete("/deletar/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const escola = await prisma.escola.delete({
            where: {
                id
            }
        });
        res.json(escola);
    } catch (error) {
        res.status(400).json(error);
    }
});


router.get("/:id/dashboard", async (req, res) => {
    try {
        const { id } = req.params;

        
        const estoque = await prisma.estoque.findUnique({
            where: { escolaId: id },
            include: {
                itens: {
                    include: { produto: true },
                    orderBy: { validade: 'asc' }
                }
            }
        });

      
        const inspecoes = await prisma.registroInspecao.findMany({
            where: {
                inspetora: {
                    escolaId: id
                }
            },
            orderBy: { data: 'asc' }
        });

        
        const totalAlunos = inspecoes.reduce((acc, curr) => acc + (curr.alunosPresentes || 0), 0);
        const totalPratos = inspecoes.reduce((acc, curr) => acc + (curr.pratosServidos || 0), 0);
        const totalDesperdicio = inspecoes.reduce((acc, curr) => acc + (curr.sobraKg || 0), 0);

       
        const diasSemanaMap: Record<string, string> = {
            '0': 'Dom.', '1': 'Seg.', '2': 'Ter.', '3': 'Qua.', '4': 'Qui.', '5': 'Sex.', '6': 'Sáb.'
        };

        const graficoAlunosMap: Record<string, number> = { 'Seg.': 0, 'Ter.': 0, 'Qua.': 0, 'Qui.': 0, 'Sex.': 0 };
        const graficoDesperdicioMap: Record<string, number> = { 'Seg.': 0, 'Ter.': 0, 'Qua.': 0, 'Qui.': 0, 'Sex.': 0 };

        inspecoes.forEach(reg => {
            const dataObj = new Date(reg.data);
            const diaStr = diasSemanaMap[dataObj.getUTCDay().toString()];
            
            
            if (diaStr && diaStr in graficoAlunosMap) {
                graficoAlunosMap[diaStr] = (graficoAlunosMap[diaStr] || 0) + (reg.alunosPresentes || 0);
                graficoDesperdicioMap[diaStr] = (graficoDesperdicioMap[diaStr] || 0) + (reg.sobraKg || 0);
            }
        });

        const graficoAlunos = Object.keys(graficoAlunosMap).map(dia => ({
            dia,
            valor: graficoAlunosMap[dia] || 0,
            max: Math.max(500, totalAlunos)
        }));

        const graficoDesperdicio = Object.keys(graficoDesperdicioMap).map(dia => {
            const val = graficoDesperdicioMap[dia] || 0;
            const porc = totalDesperdicio > 0 ? Math.min(100, Math.round((val / (totalPratos || 1)) * 100)) : 0;
            return { dia, valor: porc, label: `${val}kg` };
        });

        res.json({
            totais: {
                alunosContados: totalAlunos,
                pratosServidos: totalPratos,
                desperdicioKg: totalDesperdicio
            },
            graficoAlunos,
            graficoDesperdicio,
            itensEstoque: estoque?.itens || []
        });

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard da escola:", error);
        res.status(500).json({ error: "Erro ao buscar dados reais no banco." });
    }
});

export default router;