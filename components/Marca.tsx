import Image from "next/image";

/**
 * A marca: o letreiro branco da Ortobom (PNG com alfa, do próprio site
 * da marca) para as superfícies azuis. Sobre o branco entra a versão com
 * slogan. A loja é franqueada: a marca é da Ortobom, o "Aracaju" é
 * tipográfico, ao lado.
 */
export function Logo({ className = "", clara = true }: { className?: string; clara?: boolean }) {
  return (
    <Image
      src={clara ? "/marca/ortobom-branco.png" : "/marca/ortobom-slogan.png"}
      alt="Ortobom"
      width={clara ? 800 : 260}
      height={clara ? 117 : 39}
      priority
      sizes="(max-width: 640px) 140px, 200px"
      className={className}
    />
  );
}

/* a assinatura do estúdio, em máscara, pintada pela cor do texto */
export function MarcaEstudio({ altura, className = "" }: { altura: number; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Rafael Razeira Estúdio"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        height: altura,
        width: Math.round(altura * (956 / 519)),
        WebkitMaskImage: "url(/marca/rafael-razeira.png)",
        maskImage: "url(/marca/rafael-razeira.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
