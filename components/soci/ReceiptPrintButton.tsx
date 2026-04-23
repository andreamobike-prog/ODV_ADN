'use client';

export function ReceiptPrintButton() {
  return (
    <button
      className="printbutton"
      type="button"
      onClick={() => window.print()}
    >
      Stampa / Salva PDF
    </button>
  );
}