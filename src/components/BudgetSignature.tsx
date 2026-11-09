import Image from "next/image";

export function BudgetSignature() {
  return (
    <div className="mt-14 flex justify-end break-inside-avoid">
      <div className="w-56 text-center">
        <Image src="/images/firma-nina.png" alt="Firma de Nina Marquina" width={900} height={239} className="mx-auto h-auto w-44" />
        <p className="mt-2 border-t border-black/20 pt-2 font-serif text-[16px]">Nina Marquina</p>
        <p className="label text-[9px] text-muted">Arquitecta · Fundadora</p>
      </div>
    </div>
  );
}
