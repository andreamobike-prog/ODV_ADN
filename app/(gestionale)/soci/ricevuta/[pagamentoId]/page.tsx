import { notFound } from 'next/navigation';
import { getOrganizzazioneSettings, getPagamentoSocioReceiptData } from '@/lib/data';
import { ReceiptPrintButton } from '@/components/soci/ReceiptPrintButton';
import { Bebas_Neue } from 'next/font/google';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
});

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RicevutaPagamentoPage({
  params,
}: {
  params: Promise<{ pagamentoId: string }>;
}) {
  const { pagamentoId } = await params;

  const [data, organizzazioneSettings] = await Promise.all([
    getPagamentoSocioReceiptData(pagamentoId),
    getOrganizzazioneSettings(),
  ]);

  if (!data) return notFound();

  const { pagamento, socio, tutore } = data;

  const annoAssociativo = pagamento.data_pagamento
    ? new Date(pagamento.data_pagamento).getFullYear()
    : new Date().getFullYear();

  const dataDocumento = pagamento.data_pagamento ?? '';

  const dataDocumentoFormatted = dataDocumento
    ? new Date(dataDocumento).toLocaleDateString('it-IT')
    : '—';

  const identificativo =
    pagamento.metodo === 'contanti'
      ? 'Pagamento in contanti'
      : pagamento.numero_transazione || '—';

  const numeroDocumento = `${annoAssociativo}/0001`;

  const notaTutore =
    socio.e_minorenne && pagamento.tipo_pagatore === 'tutore'
      ? `Versamento effettuato dal tutore legale ${tutore?.nome ?? ''} ${tutore?.cognome ?? ''} per il socio ${socio.nome} ${socio.cognome}.`
      : '';

  const notaAltro =
    pagamento.tipo_pagatore === 'altro'
      ? `Versamento effettuato da ${pagamento.intestatario_transazione ?? ''} per il socio ${socio.nome} ${socio.cognome}.`
      : '';

  const nomeAssociazione =
    organizzazioneSettings?.nome_associazione?.trim() || 'Angeli dei Navigli ODV';

  const logoGestionaleUrl =
    organizzazioneSettings?.logo_gestionale_url?.trim() || '/logo-ricevuta.png';

  const presidenteNome =
    organizzazioneSettings?.presidente_nome?.trim() || 'Il Presidente';

  const introText =
    organizzazioneSettings?.ricevuta_testo_intro?.trim() ||
    `L’associazione ${nomeAssociazione} dichiara di aver ricevuto un versamento a titolo di quota associativa annuale.`;

  const attestazioneText =
    organizzazioneSettings?.ricevuta_testo_attestazione?.trim() ||
    `Il presente documento attesta l’incasso della quota associativa annuale relativa all’anno ${annoAssociativo}.`;

  const nonCorrispettivoText =
    organizzazioneSettings?.ricevuta_testo_non_corrispettivo?.trim() ||
    `L’importo versato è riferito al rapporto associativo interno e non costituisce corrispettivo per cessione di beni o prestazione di servizi.`;

  const notaFinaleText =
    organizzazioneSettings?.ricevuta_testo_nota_finale?.trim() ||
    `Regime fiscale e imposta di bollo applicati secondo la normativa vigente.`;

  const infoEnte: string[] = [];

  if (organizzazioneSettings?.indirizzo?.trim()) {
    const rigaSede = [
      organizzazioneSettings.indirizzo?.trim(),
      [organizzazioneSettings.cap?.trim(), organizzazioneSettings.comune?.trim()]
        .filter(Boolean)
        .join(' '),
      organizzazioneSettings.provincia?.trim()
        ? `(${organizzazioneSettings.provincia.trim()})`
        : '',
    ]
      .filter(Boolean)
      .join(', ');

    if (rigaSede) infoEnte.push(rigaSede);
  }

  if (organizzazioneSettings?.codice_fiscale?.trim()) {
    infoEnte.push(`CF ${organizzazioneSettings.codice_fiscale.trim()}`);
  }

  if (organizzazioneSettings?.partita_iva?.trim()) {
    infoEnte.push(`P.IVA ${organizzazioneSettings.partita_iva.trim()}`);
  }

  const runtsParts = [
    organizzazioneSettings?.runts_numero?.trim()
      ? `RUNTS ${organizzazioneSettings.runts_numero.trim()}`
      : '',
    organizzazioneSettings?.runts_sezione?.trim()
      ? `Sezione ${organizzazioneSettings.runts_sezione.trim()}`
      : '',
    organizzazioneSettings?.runts_data_iscrizione?.trim()
      ? `Iscrizione ${new Date(organizzazioneSettings.runts_data_iscrizione).toLocaleDateString('it-IT')}`
      : '',
  ].filter(Boolean);

  if (runtsParts.length > 0) {
    infoEnte.push(runtsParts.join(' • '));
  }

  if (organizzazioneSettings?.email?.trim()) {
    infoEnte.push(organizzazioneSettings.email.trim());
  }

  if (organizzazioneSettings?.pec?.trim()) {
    infoEnte.push(organizzazioneSettings.pec.trim());
  }

  if (organizzazioneSettings?.telefono?.trim()) {
    infoEnte.push(organizzazioneSettings.telefono.trim());
  }

  if (organizzazioneSettings?.sito_web?.trim()) {
    infoEnte.push(organizzazioneSettings.sito_web.trim());
  }

  return (
    <>
      <style>{`
        body {
          font-family: Arial, sans-serif;
          color: #111827;
          margin: 0;
          background: #ffffff;
        }

        .shell {
          display: block !important;
        }

        aside {
          display: none !important;
        }

        .main {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .page {
          max-width: 980px;
          margin: 0 auto;
          padding: 40px 5px;
        }

        .top {
  display: grid;
  grid-template-columns: 420px 420px;
  column-gap: 140px;
  align-items: start;
  margin-bottom: 44px;
}

        .org {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .brandLogo {
  display: block;
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-top: 18px;
  margin-bottom: 20px;
}

        .org h1 {
          margin: 0 0 8px;
          font-size: 20px;
          line-height: 1.1;
          font-weight: 700;
        }

        .org p {
          margin: 0;
          font-size: 20px;
          line-height: 1.35;
        }

        .rightcol {
          display: grid;
          gap: 18px;
        }

        .title {
  height: 120px;
  display: flex;
  align-items: flex-end;
  font-size: 86px;
  font-weight: 400;
  text-align: left;
  line-height: 0.9;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

        .recipient {
  display: grid;
  gap: 6px;
  margin: 0;
}

.recipient p {
  margin: 0;
  font-size: 20px;
  line-height: 1.35;
}

.recipient strong {
  font-size: 20px;
  line-height: 1.35;
}

        .docmeta {
          display: grid;
          gap: 6px;
          margin: 0;
        }

        .docmeta p {
          margin: 0;
          font-size: 20px;
        }

        .paymentDetails {
          display: grid;
          gap: 8px;
        }

        .paymentDetails p {
          margin: 0;
          font-size: 20px;
          line-height: 1.45;
        }

        .intro {
          margin: 0 0 34px;
          font-size: 20px;
          line-height: 1.45;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 18px;
          margin-bottom: 24px;
        }

        th, td {
          border-top: 1px solid #111827;
          border-bottom: 1px solid #111827;
          border-left: none;
          border-right: none;
          padding: 14px 0;
          text-align: left;
          font-size: 20px;
        }

        th {
          background: transparent;
          color: #111827;
        }

        thead th {
          border-top: none;
        }

        .right {
          text-align: right;
          color: #111827;
        }

        .section-title {
  font-size: 22px;
  font-weight: 700;
  margin: 22px 0 9px;
}
        }

        .footer {
          margin-top: 36px;
          font-size: 20px;
          line-height: 1.6;
        }

        .signature {
          margin-top: 50px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .signatureImage {
          display: block;
          margin-left: auto;
          margin-top: 12px;
          width: 380px;
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }

        .signature p {
          margin: 0 0 8px;
          font-size: 20px;
          font-weight: 700;
          width: 340px;
          text-align: center;
        }

        .printbar {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 40px 0;
          display: flex;
          justify-content: flex-end;
        }

        .printbutton {
          border: none;
          background: #eee8f6;
          color: #9082a9;
          padding: 12px 18px;
          font-size: 20px;
          cursor: pointer;
        }

        @media print {
          .printbar {
            display: none;
          }

          .page {
            padding-top: 10px;
          }
        }
      `}</style>

      <div className="printbar">
        <ReceiptPrintButton />
      </div>

      <div className="page">
        <div className="top">
          <div className="org">
            <img
              src={logoGestionaleUrl}
              alt={nomeAssociazione}
              className="brandLogo"
            />
            <h1>{nomeAssociazione}</h1>
            {infoEnte.map((riga, index) => (
              <p key={index}>{riga}</p>
            ))}
          </div>

          <div className="rightcol">
            <div className={`title ${bebasNeue.className}`}>RICEVUTA</div>

            <div className="recipient">
              <p><strong>{pagamento.intestatario_transazione || '—'}</strong></p>
              <p>{pagamento.indirizzo || '—'}</p>
              <p>CF {pagamento.codice_fiscale_pagatore || '—'}</p>
              <p>{socio.email || '—'}</p>
            </div>

            <div className="docmeta">
              <p><strong>Documento n.</strong> {numeroDocumento}</p>
              <p><strong>Data documento</strong> {dataDocumentoFormatted}</p>
            </div>
          </div>
        </div>

        <p className="intro">{introText}</p>

        <table>
          <thead>
            <tr>
              <th>Descrizione</th>
              <th className="right">Importo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Quota associativa annuale</td>
              <td className="right">
                Euro {Number(pagamento.importo).toFixed(2).replace('.', ',')}
              </td>
            </tr>
            <tr>
              <td>Imposta di bollo, ove dovuta</td>
              <td className="right">Euro -</td>
            </tr>
            <tr>
              <td><strong>Totale versato</strong></td>
              <td className="right">
                <strong>
                  Euro {Number(pagamento.importo).toFixed(2).replace('.', ',')}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="section-title">Dettagli pagamento</div>
        <div className="paymentDetails">
          <p><strong>Metodo pagamento:</strong> {pagamento.metodo}</p>
          <p><strong>Identificativo:</strong> {identificativo}</p>
          <p><strong>Data pagamento:</strong> {dataDocumentoFormatted}</p>
          <p><strong>Anno associativo:</strong> {annoAssociativo}</p>
          <p><strong>Nome socio:</strong> {socio.nome} {socio.cognome}</p>
        </div>

        {notaTutore && <p style={{ marginTop: 20 }}>{notaTutore}</p>}
        {notaAltro && <p style={{ marginTop: 12 }}>{notaAltro}</p>}

        <div className="footer">
          {attestazioneText && <p>{attestazioneText}</p>}
          {nonCorrispettivoText && <p>{nonCorrispettivoText}</p>}
          {notaFinaleText && <p>{notaFinaleText}</p>}
        </div>

        <div className="signature">
          <p><strong>{presidenteNome}</strong></p>
          <img
            src="/firma-presidente.png"
            alt="Firma del Presidente"
            className="signatureImage"
          />
        </div>
      </div>
    </>
  );
}