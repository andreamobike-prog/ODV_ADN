import { getOrganizzazioneSettings, getTesseraSettings } from '@/lib/data';
import { ImpostazioniPageClient } from './ImpostazioniPageClient';

export default async function ImpostazioniPage() {
  const settings = (await getOrganizzazioneSettings()) as any;
  const tesseraSettings = (await getTesseraSettings()) as any;

  return (
    <ImpostazioniPageClient
      logoUrl={tesseraSettings?.logo_url ?? null}
      immagineCentraleUrl={tesseraSettings?.immagine_centrale_url ?? null}
      nomeAssociazione={settings?.nome_associazione ?? ''}
      sottotitoloAssociazione={settings?.sottotitolo_associazione ?? ''}
      logoGestionaleUrl={settings?.logo_gestionale_url ?? null}
      codiceFiscale={settings?.codice_fiscale ?? ''}
      partitaIva={settings?.partita_iva ?? ''}
      runtsNumero={settings?.runts_numero ?? ''}
      runtsSezione={settings?.runts_sezione ?? ''}
      runtsDataIscrizione={settings?.runts_data_iscrizione ?? ''}
      indirizzo={settings?.indirizzo ?? ''}
      cap={settings?.cap ?? ''}
      comune={settings?.comune ?? ''}
      provincia={settings?.provincia ?? ''}
      email={settings?.email ?? ''}
      pec={settings?.pec ?? ''}
      telefono={settings?.telefono ?? ''}
      sitoWeb={settings?.sito_web ?? ''}
      iban={settings?.iban ?? ''}
      intestatarioConto={settings?.intestatario_conto ?? ''}
      presidenteNome={settings?.presidente_nome ?? ''}
      testoRicevuta={settings?.testo_ricevuta ?? ''}
      ricevutaTestoIntro={settings?.ricevuta_testo_intro ?? ''}
      ricevutaTestoAttestazione={settings?.ricevuta_testo_attestazione ?? ''}
      ricevutaTestoNonCorrispettivo={
        settings?.ricevuta_testo_non_corrispettivo ?? ''
      }
      ricevutaTestoNotaFinale={settings?.ricevuta_testo_nota_finale ?? ''}
      bolloAttivo={Boolean(settings?.bollo_attivo)}
      bolloImporto={Number(settings?.bollo_importo ?? 0)}
      nomeAssociazioneTessera={tesseraSettings?.nome_associazione_tessera ?? ''}
      coloreSfondoTessera={tesseraSettings?.colore_sfondo ?? '#998DB4'}
      coloreTestoTessera={tesseraSettings?.colore_testo ?? '#FFFFFF'}
    />
  );
}