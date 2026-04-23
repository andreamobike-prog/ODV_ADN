import Link from 'next/link';
import { getSocioById } from '@/lib/data';
import { SocioDetailClient } from '@/components/soci/SocioDetailClient';

function SocioDetailFallback({ message }: { message?: string }) {
  return (
    <div className="card">
      <div className="eyebrow">Dettaglio socio</div>
      <h2 style={{ marginTop: 0 }}>Socio non trovato</h2>
      {message && <p className="muted">{message}</p>}
      <Link className="button secondary" href="/soci">
        Torna alla lista soci
      </Link>
    </div>
  );
}

export default async function SocioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const socio = await getSocioById(id).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Impossibile caricare il socio.';

    return { error: message };
  });

  if (!socio) {
    return <SocioDetailFallback />;
  }

  if ('error' in socio) {
    return <SocioDetailFallback message={socio.error} />;
  }

  return <SocioDetailClient socio={socio} />;
}
