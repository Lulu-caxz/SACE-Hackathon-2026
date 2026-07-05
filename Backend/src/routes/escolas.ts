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


router.get('/:id/dashboard', async (req, res) => {
    const { id } = req.params;

    try {
        // =========================
        // ALUNOS (Contagem via salas)
        // =========================
        const contagens = await prisma.contagem.findMany({
            where: { escolaId: id },
            include: { salas: true }
        });

        const alunosContados = contagens.reduce((acc, c) => {
            const totalPorContagem = c.salas.reduce(
                (sum, s) =>
                    sum + (s.alunosComer ?? 0) + (s.alunosRestricao ?? 0),
                0
            );

            return acc + totalPorContagem;
        }, 0);

        // =========================
        // PRATOS / CONSUMO
        // =========================
        const registros = await prisma.registroInspecao.findMany({
            where: { escolaId: id }
        });

        const pratosServidos = registros.reduce(
            (acc, r) => acc + (r.pratosServidos ?? 0),
            0
        );

        const desperdicioKg = registros.reduce(
            (acc, r) => acc + (r.sobraKg ?? 0),
            0
        );

        // =========================
        // GRÁFICO ALUNOS (por data)
        // =========================
        const alunosPorDia = await prisma.contagem.groupBy({
            by: ['data'],
            where: {
                escolaId: id,
                data: { }
            },
            _sum: { totalAlunos: true }
        });

        // fallback correto (sem groupBy quebrado)
        const alunosPorDiaCorrigido = contagens.map(c => ({
            dia: new Date(c.data).toLocaleDateString('pt-BR'),
            valor: c.salas.reduce(
                (sum, s) => sum + (s.alunosComer ?? 0) + (s.alunosRestricao ?? 0),
                0
            ),
            max: 500
        }));

        // =========================
        // GRÁFICO DESPERDÍCIO
        // =========================
        const desperdicioPorDia = await prisma.registroInspecao.groupBy({
            by: ['data'],
            where: {
                escolaId: id,
                data: {  }
            },
            _sum: { sobraKg: true }
        });
        // =========================
        // ESTOQUE REAL
        // =========================
        const estoque = await prisma.itemEstoque.findMany({
            where: {
                estoque: { escolaId: id }
            },
            include: {
                produto: true
            }
        });

        // =========================
        // RESPONSE FINAL
        // =========================
        return res.json({
            totais: {
                alunosContados,
                pratosServidos,
                desperdicioKg
            },

            graficoAlunos: alunosPorDiaCorrigido,

            graficoDesperdicio: desperdicioPorDia.map(d => ({
                dia: new Date(d.data).toLocaleDateString('pt-BR'),
                valor: d._sum.sobraKg ?? 0,
                label: `${d._sum.sobraKg ?? 0}kg`
            })),

            itensEstoque: estoque.map(i => ({
                id: i.id,
                produto: {
                    nome: i.produto.nome
                },
                quantidade: i.quantidade,
                unidade: i.unidade,
                lote: i.lote,
                validade: i.validade
            }))
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro no dashboard' });
    }
});

export default router;