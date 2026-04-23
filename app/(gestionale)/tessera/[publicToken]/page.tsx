import { getDigitalCardByPublicToken } from '@/lib/data';
import { TesseraPreviewCard } from '@/components/tessere/TesseraPreviewCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function TesseraPubblicaPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  const data = await getDigitalCardByPublicToken(publicToken);

  if (!data) {
    return (
      <div style={{ padding: 40, fontFamily: 'Arial, sans-serif' }}>
        <h1>Tessera non trovata</h1>
        <p><strong>Token ricevuto:</strong> {publicToken}</p>
      </div>
    );
  }

  const { tessera, socio, tesseraSettings } = data;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <TesseraPreviewCard
        nome={socio?.nome ?? ''}
        cognome={socio?.cognome ?? ''}
        codiceTessera={tessera.codice_tessera ?? ''}
        annoValidita={tessera.anno_validita ?? ''}
        nomeAssociazione={
          tesseraSettings?.nome_associazione_tessera ?? 'Tessera associativa'
        }
        titoloTessera={tesseraSettings?.titolo_tessera ?? 'TESSERA'}
        coloreSfondo={tesseraSettings?.colore_sfondo ?? '#1f2947'}
        coloreTesto={tesseraSettings?.colore_testo ?? '#f3ead7'}
        coloreAccento={tesseraSettings?.colore_accento ?? '#d4af37'}
        logoUrl={tesseraSettings?.logo_url ?? null}
        immagineCentraleUrl={tesseraSettings?.immagine_centrale_url ?? null}
        publicToken={tessera.public_token ?? null}
      />
    </div>
  );
}