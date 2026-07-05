import { prisma } from "./lib/prisma.js";
import bcrypt from "bcrypt";

/**
 * SEED — popula o banco com dados de teste realistas.
 *
 * Este arquivo está em src/seed.ts (junto do server.ts), então o import
 * do prisma acima aponta para "./lib/prisma.js" (mesma pasta lib que as
 * rotas usam). Se você mover o arquivo de lugar, ajuste esse import.
 *
 * Como rodar — veja instruções completas na resposta do chat.
 */

async function main() {
  console.log("🌱 Iniciando seed...");

  // =========================================================
  // LIMPEZA (ordem importa por causa das FKs)
  // =========================================================
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.itemEstoque.deleteMany();
  await prisma.solicitacaoEstoque.deleteMany();
  await prisma.estoque.deleteMany();
  await prisma.produto.deleteMany();

  await prisma.registroInspecao.deleteMany();
  await prisma.informacaoNutricional.deleteMany();
  await prisma.refeicao.deleteMany();
  await prisma.cardapioDia.deleteMany();
  await prisma.cardapioSemanal.deleteMany();
  await prisma.referenciaNutricional.deleteMany();

  await prisma.restricao.deleteMany();
  await prisma.sala.deleteMany();
  await prisma.contagem.deleteMany();

  await prisma.usuario.deleteMany();
  await prisma.escola.deleteMany();

  console.log("🧹 Tabelas limpas.");

  // =========================================================
  // ESCOLAS
  // =========================================================
  const escola1 = await prisma.escola.create({
    data: {
      nome: "EMEI Jardim das Flores",
      bairro: "Centro",
      endereco: "Rua das Palmeiras, 120",
      email: "jardimdasflores@caraguatatuba.sp.gov.br",
      telefone: "(12) 3882-1010",
      diretor: "Ana Paula Ferreira",
      supervisor: "Carlos Eduardo Souza",
    },
  });

  const escola2 = await prisma.escola.create({
    data: {
      nome: "CEI Pequeno Príncipe",
      bairro: "Indaiá",
      endereco: "Av. Rio de Janeiro, 480",
      email: "pequenoprincipe@caraguatatuba.sp.gov.br",
      telefone: "(12) 3882-2020",
      diretor: "Marcos Vinícius Lima",
      supervisor: "Fernanda Alves",
    },
  });

  const escola3 = await prisma.escola.create({
    data: {
      nome: "EMEF Professor João Batista",
      bairro: "Massaguaçu",
      endereco: "Rua das Andorinhas, 33",
      email: "joaobatista@caraguatatuba.sp.gov.br",
      telefone: "(12) 3882-3030",
      diretor: "Luciana Martins",
      supervisor: "Rodrigo Cardoso",
    },
  });

  console.log("🏫 3 escolas criadas.");

  // =========================================================
  // USUÁRIOS (senha padrão: "123456" para todos)
  // =========================================================
  const senhaHash = await bcrypt.hash("123456", 10);

  await prisma.usuario.createMany({
    data: [
      {
        role: "SECRETARIA",
        nome: "Juliana Rocha",
        email: "juliana.secretaria@caraguatatuba.sp.gov.br",
        password: senhaHash,
        cpf: "11122233344",
        escolaId: null,
      },
      {
        role: "INSPETOR",
        nome: "Roberto Nogueira",
        email: "roberto.inspetor@caraguatatuba.sp.gov.br",
        password: senhaHash,
        cpf: "22233344455",
        escolaId: escola1.id,
      },
      {
        role: "NUTRICIONISTA",
        nome: "Camila Andrade",
        email: "camila.nutri@caraguatatuba.sp.gov.br",
        password: senhaHash,
        cpf: "33344455566",
        escolaId: null,
      },
      {
        role: "DIRECAO",
        nome: "Ana Paula Ferreira",
        email: "ana.diretora@caraguatatuba.sp.gov.br",
        password: senhaHash,
        cpf: "44455566677",
        escolaId: escola1.id,
      },
      {
        role: "INSPETOR",
        nome: "Patrícia Gomes",
        email: "patricia.inspetor@caraguatatuba.sp.gov.br",
        password: senhaHash,
        cpf: "55566677788",
        escolaId: escola2.id,
      },
    ] as any,
  });

  console.log("👤 5 usuários criados (senha de todos: 123456).");

  // =========================================================
  // REFERÊNCIAS NUTRICIONAIS (uma por faixa etária)
  // =========================================================
  await prisma.referenciaNutricional.createMany({
    data: [
      {
        faixaEtaria: "CRECHE_0_A_3",
        dieta: "DIETA GERAL",
        kcalAlvo: 550,
        choMin: 70,
        choMax: 95,
        ptnMin: 18,
        ptnMax: 25,
        lipMin: 8,
        lipMax: 14,
        sodioMaxMg: 500,
      },
      {
        faixaEtaria: "INFANTIL_4_A_5",
        dieta: "DIETA GERAL",
        kcalAlvo: 700,
        choMin: 90,
        choMax: 120,
        ptnMin: 22,
        ptnMax: 30,
        lipMin: 10,
        lipMax: 16,
        sodioMaxMg: 650,
      },
      {
        faixaEtaria: "FUNDAMENTAL_6_A_10",
        dieta: "DIETA GERAL",
        kcalAlvo: 850,
        choMin: 110,
        choMax: 145,
        ptnMin: 28,
        ptnMax: 36,
        lipMin: 12,
        lipMax: 20,
        sodioMaxMg: 750,
      },
      {
        faixaEtaria: "FUNDAMENTAL_11_A_15",
        dieta: "DIETA GERAL",
        kcalAlvo: 950,
        choMin: 125,
        choMax: 160,
        ptnMin: 32,
        ptnMax: 40,
        lipMin: 14,
        lipMax: 22,
        sodioMaxMg: 850,
      },
      {
        faixaEtaria: "EJA",
        dieta: "DIETA GERAL",
        kcalAlvo: 800,
        choMin: 100,
        choMax: 130,
        ptnMin: 25,
        ptnMax: 32,
        lipMin: 10,
        lipMax: 18,
        sodioMaxMg: 700,
      },
    ] as any,
  });

  console.log("📊 5 referências nutricionais criadas.");

  // =========================================================
  // PRODUTOS (catálogo global, compartilhado entre escolas)
  // =========================================================
  const nomesProdutos = [
    { nome: "Arroz", marca: "Tio João" },
    { nome: "Feijão", marca: "Camil" },
    { nome: "Leite", marca: "Piracanjuba" },
    { nome: "Macarrão", marca: "Adria" },
    { nome: "Banana", marca: null },
    { nome: "Óleo", marca: "Soya" },
    { nome: "Frango", marca: "Seara" },
    { nome: "Açúcar", marca: "União" },
  ];

  const produtosCriados = [];
  for (const p of nomesProdutos) {
    produtosCriados.push(await prisma.produto.create({ data: p as any }));
  }

  console.log(`📦 ${produtosCriados.length} produtos criados.`);

  // =========================================================
  // ESTOQUE + ITENS (LOTES) POR ESCOLA
  // =========================================================
  const escolas = [escola1, escola2, escola3];

  for (const escola of escolas) {
    const estoque = await prisma.estoque.create({
      data: { escolaId: escola.id },
    });

    // Cada escola recebe 2-3 lotes por produto, com validades e quantidades variadas
    for (let pi = 0; pi < produtosCriados.length; pi++) {
      const produto = produtosCriados[pi];
      if (!produto) continue; // guarda de tipo (noUncheckedIndexedAccess)

      const quantidadeLotes = pi % 3 === 0 ? 3 : 2;

      for (let li = 0; li < quantidadeLotes; li++) {
        const quantidade = 10 + (pi * 7 + li * 5) % 90; // varia entre lotes
        const validade = new Date();
        validade.setMonth(validade.getMonth() + 1 + li); // lotes com validades escalonadas

        const item = await prisma.itemEstoque.create({
          data: {
            estoqueId: estoque.id,
            produtoId: produto.id,
            lote: `${String(pi + 1).padStart(2, "0")}${String(li + 1).padStart(2, "0")}${Math.floor(
              Math.random() * 90 + 10
            )}`,
            validade,
            quantidade,
            unidade: produto.nome === "Leite" ? "cxs." : produto.nome === "Óleo" ? "l" : "kg",
          },
        });

        await prisma.movimentacaoEstoque.create({
          data: {
            estoqueId: estoque.id,
            itemId: item.id,
            tipo: "ENTRADA" as any,
            quantidade,
            motivo: "Entrada inicial (seed)",
          },
        });
      }
    }
  }

  console.log("🥫 Estoque com lotes criado para as 3 escolas.");

  // =========================================================
  // CARDÁPIOS (um em cada status: Esperando, Aprovado, Reprovado)
  // =========================================================
  const diasSemana = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA"] as const;

  const refeicoesPorDia = [
    { tipo: "CAFE_MANHA", descricao: "Leite com achocolatado e pão com margarina" },
    { tipo: "ALMOCO", descricao: "Arroz, feijão, frango grelhado e salada de alface e tomate" },
    { tipo: "CAFE_TARDE", descricao: "Banana com aveia" },
  ];

  async function criarCardapioCompleto(
    mes: number,
    ano: number,
    semana: Date,
    status: string,
    motivoReprovacao?: string
  ) {
    const cardapio = await prisma.cardapioSemanal.create({
      data: {
        mes,
        ano,
        semana,
        status: status as any,
        motivoReprovacao: motivoReprovacao ?? null,
      },
    });

    for (const dia of diasSemana) {
      const cardapioDia = await prisma.cardapioDia.create({
        data: {
          cardapioId: cardapio.id,
          dia: dia as any,
        },
      });

      for (const ref of refeicoesPorDia) {
        const refeicao = await prisma.refeicao.create({
          data: {
            cardapioDiaId: cardapioDia.id,
            tipo: ref.tipo as any,
            descricao: ref.descricao,
          },
        });

        // Informação nutricional para a faixa CRECHE_0_A_3 (exemplo — pode duplicar pra outras faixas se precisar)
        await prisma.informacaoNutricional.create({
          data: {
            refeicaoId: refeicao.id,
            faixaEtaria: "CRECHE_0_A_3" as any,
            dieta: "DIETA GERAL",
            kcal: 524.08,
            cho: 87.58,
            ptn: 21.82,
            lip: 9.88,
            sodioMg: 469.99,
          },
        });
      }
    }

    return cardapio;
  }

  const cardapioEsperando = await criarCardapioCompleto(
    7,
    2026,
    new Date("2026-07-13"),
    "Esperando"
  );

  const cardapioAprovado = await criarCardapioCompleto(
    7,
    2026,
    new Date("2026-07-06"),
    "Aprovado"
  );

  const cardapioReprovado = await criarCardapioCompleto(
    7,
    2026,
    new Date("2026-06-29"),
    "Reprovado",
    "Foram identificadas inadequações na distribuição de sódio e poucas opções de fibras nas refeições da semana."
  );

  console.log("📅 3 cardápios criados (Esperando, Aprovado, Reprovado), cada um com 5 dias e 3 refeições/dia.");

  // =========================================================
  // CONTAGEM + SALAS + RESTRIÇÕES (uma contagem por escola)
  // =========================================================
  const nomesSalasPorEscola = [
    ["Berçário I", "Berçário II", "Maternal"],
    ["Infantil A", "Infantil B"],
    ["1º Ano A", "1º Ano B", "2º Ano A"],
  ];

  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    if (!escola) continue; // guarda de tipo (noUncheckedIndexedAccess)

    const contagem = await prisma.contagem.create({
      data: {
        data: new Date(),
        escolaId: escola.id,
      },
    });

    const salasDaEscola = nomesSalasPorEscola[i] ?? [];

    for (const nomeSala of salasDaEscola) {
      const sala = await prisma.sala.create({
        data: {
          contagemId: contagem.id,
          nome: nomeSala,
          alunosComer: 18 + Math.floor(Math.random() * 15),
          alunosRestricao: Math.floor(Math.random() * 4),
        },
      });

      if (sala.alunosRestricao > 0) {
        await prisma.restricao.create({
          data: {
            salaId: sala.id,
            descricao: "Intolerância à lactose",
          },
        });
      }
    }
  }

  console.log("🧑‍🎓 Contagens, salas e restrições criadas para as 3 escolas.");

  // =========================================================
  // REGISTROS DE INSPEÇÃO (liga escola + dia do cardápio aprovado)
  // =========================================================
  const diasDoCardapioAprovado = await prisma.cardapioDia.findMany({
    where: { cardapioId: cardapioAprovado.id },
  });

  for (let i = 0; i < escolas.length; i++) {
    const escola = escolas[i];
    if (!escola) continue; // guarda de tipo (noUncheckedIndexedAccess)

    const diaCorrespondente = diasDoCardapioAprovado[i % diasDoCardapioAprovado.length];
    if (!diaCorrespondente) continue; // guarda de tipo (noUncheckedIndexedAccess)

    await prisma.registroInspecao.create({
      data: {
        escolaId: escola.id,
        cardapioDiaId: diaCorrespondente.id,
        data: new Date(),
        pratosServidos: 60 + i * 15,
        comidaFeitaKg: 25 + i * 3,
        sobraKg: 2 + i,
        observacoes: "Registro gerado pelo seed para testes.",
      },
    });
  }

  console.log("📋 Registros de inspeção criados.");

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });