import { prisma } from "../lib/prisma.js";
import { TipoMovimentacao } from "../generated/prisma/client.js";

//ENTRADA DE PRODUTOS NO ESTOQUE
export async function entradaEstoque({
    estoqueId,
    produtoId,
    lote,
    validade,
    quantidade,
    unidade,
    motivo
}: {
    estoqueId: string;
    produtoId: string;
    lote: string;
    validade: Date;
    quantidade: number;
    unidade?: string;
    motivo: string;
}
) {
    //procurar se tem
    let item = await prisma.itemEstoque.findFirst({
        where: {
            estoqueId,
            produtoId,
            lote
        }
    })

    //se nao, criar

    if (!item) {
        item = await prisma.itemEstoque.create({
            data: {
                estoqueId,
                produtoId,
                lote,
                validade,
                quantidade,
                unidade: unidade ?? "kg"
            }
        })
    } else {
        //se sim, somar
        item = await prisma.itemEstoque.update({
            where: {
                id: item.id
            },
            data: {
                quantidade: item.quantidade + quantidade
            }
        })
    }

    //registrar movimentacao
    await prisma.movimentacaoEstoque.create({
        data: {
            estoqueId,
            itemId: item.id,
            tipo: TipoMovimentacao.ENTRADA,
            quantidade,
            motivo
        }
    })

    return item
}

//SAÍDA DE PRODUTOS DO ESTOQUE
export async function saidaEstoque({
    estoqueId,
    produtoId,
    quantidade,
    motivo,
}: {
    estoqueId: string;
    produtoId: string;
    quantidade: number;
    motivo?: string;
}) {
    let itens = await prisma.itemEstoque.findMany({
        where: {
            estoqueId,
            produtoId,
            quantidade: { gt: 0 }
        },
        orderBy: {
            validade: 'asc'
        }
    })

    let restante = quantidade

    for (const item of itens) {
        if (restante <= 0) break;

        const disponivel = item.quantidade;

        const retirada = Math.min(disponivel, restante);

        await prisma.itemEstoque.update({
            where: { id: item.id },
            data: {
                quantidade: item.quantidade - retirada,
            },
        });

        await prisma.movimentacaoEstoque.create({
            data: {
                estoqueId,
                itemId: item.id,
                tipo: TipoMovimentacao.SAIDA,
                quantidade: retirada,
                motivo: motivo ?? null,
            },
        });

        restante -= retirada;

    }

    if (restante > 0) {
        throw new Error("Estoque insuficiente")
    }

}


//AJUSTE DE PRODUTOS NO ESTOQUE

export async function ajusteEstoque({
    estoqueId,
    itemId,
    novaQuantidade,
    motivo,
}: {
    estoqueId: string;
    itemId: string;
    novaQuantidade: number;
    motivo: string;
}) {
    const item = await prisma.itemEstoque.findUnique({
        where: {
            id: itemId
        }
    })

    if (!item) {
        throw new Error("item não encontrado")
    }

    const diferenca = novaQuantidade - item.quantidade

    const atualizacao = await prisma.itemEstoque.update({
        where: { id: itemId },
        data: {
            quantidade: novaQuantidade
        }
    })

    await prisma.movimentacaoEstoque.create({
        data: {
            estoqueId,
            itemId,
            tipo: TipoMovimentacao.AJUSTE,
            quantidade: diferenca,
            motivo
        }
    })

    return atualizacao
}