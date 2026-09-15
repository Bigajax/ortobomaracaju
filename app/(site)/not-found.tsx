import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="miolo flex items-center justify-center py-32">
      <div className="cartao max-w-md p-10 text-center">
        <p className="etiqueta">Página não encontrada</p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-tinta">O endereço mudou ou o produto saiu da vitrine. Comece pelo catálogo.</p>
        <Link href="/catalogo" className="btn btn--azul mt-7">
          Ver o catálogo
        </Link>
      </div>
    </div>
  );
}
