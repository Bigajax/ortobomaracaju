/**
 * Ícones de linha da loja, um traço fino só, no jeito dos ícones de
 * categoria do site da marca: o colchão de perfil com o pillow top, a
 * base com pés, a cabeceira estofada, o travesseiro, a loja, o
 * caminhão, o cartão. Herdam a cor do texto; o tamanho vem da className.
 */
export type NomeIcone =
  | "colchao"
  | "base"
  | "cabeceira"
  | "travesseiro"
  | "loja"
  | "caminhao"
  | "cartao"
  | "regua"
  | "estrela"
  | "etiqueta"
  | "conversa"
  | "garantia"
  | "lupa"
  | "whats"
  | "seta"
  | "seta-esq"
  | "fechar"
  | "check"
  | "pino";

const TRACOS: Record<Exclude<NomeIcone, "whats">, React.ReactNode> = {
  colchao: (
    <>
      <path d="M3 11.5h18v6a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z" />
      <path d="M4.5 11.5V9.8c0-1 .8-1.8 1.8-1.8h11.4c1 0 1.8.8 1.8 1.8v1.7" />
      <path d="M3 14.5h18" />
      <path d="M7 16.5h.01M12 16.5h.01M17 16.5h.01" />
    </>
  ),
  base: (
    <>
      <path d="M3 9.5h18v6H3z" />
      <path d="M5.5 15.5V19M18.5 15.5V19" />
      <path d="M3 12.5h18" />
    </>
  ),
  cabeceira: (
    <>
      <path d="M5.5 4.5h13a1.5 1.5 0 0 1 1.5 1.5v12H4V6a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M8 9h.01M12 9h.01M16 9h.01M10 13h.01M14 13h.01" />
      <path d="M4 18v1.5M20 18v1.5" />
    </>
  ),
  travesseiro: (
    <>
      <path d="M4 8.5c2.7-1 5.3-1.5 8-1.5s5.3.5 8 1.5c-.6 2.3-.6 4.7 0 7-2.7 1-5.3 1.5-8 1.5s-5.3-.5-8-1.5c.6-2.3.6-4.7 0-7z" />
      <path d="M8.5 11.5c1.2-.4 2.3-.6 3.5-.6s2.3.2 3.5.6" />
    </>
  ),
  loja: (
    <>
      <path d="M4 9.5 5.5 5h13L20 9.5" />
      <path d="M4 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5.5 11.5V19h13v-7.5" />
      <path d="M10 19v-4.5h4V19" />
    </>
  ),
  caminhao: (
    <>
      <path d="M3 6.5h11v10H3zM14 10h4l3 3v3.5h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  cartao: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 14.5h4" />
    </>
  ),
  regua: (
    <>
      <path d="M3 9h18v6H3z" />
      <path d="M7 9v2.5M11 9v3.5M15 9v2.5M19 9v3.5" />
    </>
  ),
  estrela: <path d="M12 3.4l2.5 5.6 6.1.6-4.6 4.1 1.4 6L12 16.6l-5.4 3.1 1.4-6-4.6-4.1 6.1-.6z" />,
  etiqueta: (
    <>
      <path d="M4 12.5V5h7.5l8.5 8.5-7.5 7.5z" />
      <path d="M8 9h.01" />
    </>
  ),
  conversa: (
    <>
      <path d="M4 5.5h16v10H9l-4 3.5z" />
      <path d="M8 9h8M8 12h5" />
    </>
  ),
  garantia: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  lupa: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4.2-4.2" />
    </>
  ),
  seta: <path d="M9.5 6l6 6-6 6" />,
  "seta-esq": <path d="M14.5 6l-6 6 6 6" />,
  fechar: <path d="M6 6l12 12M18 6L6 18" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  pino: (
    <>
      <path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
};

export function Icone({ nome, className = "h-6 w-6", peso = 1.5 }: { nome: NomeIcone; className?: string; peso?: number }) {
  if (nome === "whats") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="currentColor">
        <path d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.2 21.8l4.9-1.3A9.8 9.8 0 1 0 12 2.2zm0 17.9c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.1 8.1 0 1 1 12 20.1zm4.5-6c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.5 4c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2c.2-.6.2-1.1.2-1.2-.1-.2-.3-.3-.5-.4z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth={peso} strokeLinecap="round" strokeLinejoin="round">
      {TRACOS[nome]}
    </svg>
  );
}
