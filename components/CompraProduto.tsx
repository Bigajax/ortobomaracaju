"use client";

import { useState } from "react";
import { Icone } from "./Icones";
import { precoBRL } from "@/lib/formato";
import { medidaDoTamanho, nomeDoTamanho } from "@/lib/filtro";
import { linkPeca } from "@/lib/whatsapp";
import type { Produto } from "@/lib/tipos";

/**
 * O pedido, montado antes de sair: o tamanho (Solteiro, Casal, Queen,
 * King, com a medida embaixo, como o seletor do site da marca), a
 * quantidade e uma observação livre. Tudo vai numa mensagem estruturada
 * para o WhatsApp da loja, uma linha por coisa. Não existe carrinho: a
 * conversa é o pedido, e o valor é a loja que passa.
 */
export function CompraProduto({ produto, whatsapp, base }: { produto: Produto; whatsapp: string; base: string }) {
  const [tamanho, setTamanho] = useState<string | null>(produto.tamanhos.length === 1 ? produto.tamanhos[0] : null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  const preco = produto.preco_promocional ?? produto.preco;
  const total = preco !== null ? preco * quantidade : null;
  const faltaTamanho = produto.tamanhos.length > 1 && !tamanho;

  const link = linkPeca(produto, {
    whatsapp,
    base,
    tamanho: tamanho ?? undefined,
    cor: produto.cores[0],
    quantidade,
    observacao,
    preco,
  });

  return (
    <div className="space-y-6">
      {produto.tamanhos.length > 1 ? (
        <fieldset>
          <legend className="mb-2 flex w-full items-baseline justify-between gap-3">
            <span className="text-[0.9375rem] font-semibold text-azul-900">Selecionar tamanho</span>
            {faltaTamanho ? <span className="text-[0.8125rem] text-tinta-fraca">escolha um para montar o pedido</span> : null}
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {produto.tamanhos.map((t) => {
              const medida = medidaDoTamanho(t);
              const ativo = tamanho === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setTamanho(ativo ? null : t)}
                  className={`flex flex-col items-center rounded-[var(--raio-botao)] border px-3 py-2.5 text-center transition-colors ${ativo ? "border-azul-700 bg-azul-50 text-azul-900" : "border-linha text-tinta hover:border-azul-300"}`}
                >
                  <span className="text-[0.9375rem] font-semibold">{nomeDoTamanho(t)}</span>
                  {medida ? <span className="mt-0.5 text-[0.75rem] text-tinta-fraca">{medida}</span> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-end">
        <div>
          <p className="mb-2 text-[0.9375rem] font-semibold text-azul-900">Quantidade</p>
          <div className="inline-flex items-stretch overflow-hidden rounded-[var(--raio-botao)] border border-linha">
            <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} aria-label="Um a menos" className="px-4 text-[1.125rem] font-semibold text-tinta hover:bg-azul-50 disabled:opacity-40" disabled={quantidade <= 1}>
              −
            </button>
            <input
              type="number"
              min={1}
              max={20}
              inputMode="numeric"
              value={quantidade}
              onChange={(e) => setQuantidade(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              aria-label="Quantidade"
              className="w-14 border-x border-linha text-center text-[1rem] font-semibold text-tinta [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button type="button" onClick={() => setQuantidade((q) => Math.min(20, q + 1))} aria-label="Um a mais" className="px-4 text-[1.125rem] font-semibold text-tinta hover:bg-azul-50">
              +
            </button>
          </div>
        </div>

        <label className="campo-flutuante">
          <span>Alguma observação?</span>
          <input value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Entrega, medida especial, dúvida" maxLength={140} />
        </label>
      </div>

      <div className="cartao p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-[0.9375rem] text-tinta-fraca">
            {quantidade} {quantidade === 1 ? "unidade" : "unidades"}
            {tamanho ? `, ${nomeDoTamanho(tamanho)}` : ""}
            {preco !== null ? ` de ${precoBRL(preco)}` : ""}
          </span>
          <span className="preco text-[1.25rem] text-azul-900">{total !== null ? precoBRL(total) : "Valor pelo WhatsApp"}</span>
        </div>
        <a href={link} target="_blank" rel="noreferrer" className="btn btn--whats mt-4 w-full">
          <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
          Pedir pelo WhatsApp
        </a>
        <p className="miudo mt-3">A mensagem já vai com o modelo, o tamanho e a quantidade. A loja responde com o valor, as formas de pagamento e combina a entrega ou a retirada em Aracaju.</p>
      </div>

      {/* a barra fixa do celular: o mesmo link, sempre à mão */}
      <div className="pedido-barra">
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.8125rem] font-semibold text-azul-900">{produto.nome}</span>
          <span className="block text-[0.75rem] text-tinta-fraca">{tamanho ? `${nomeDoTamanho(tamanho)}, ` : ""}valor pelo WhatsApp</span>
        </span>
        <a href={link} target="_blank" rel="noreferrer" className="btn btn--whats btn--pequeno shrink-0">
          <Icone nome="whats" className="h-[1.125rem] w-[1.125rem]" />
          Pedir
        </a>
      </div>
    </div>
  );
}
