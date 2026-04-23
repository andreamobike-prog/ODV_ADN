'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Modal } from '@/components/dashboard/Modal';
import {
  preparaTesseraDigitaleAction,
  segnaEmailTesseraInviataAction,
  segnaWalletTesseraInviatoAction,
} from '@/app/(gestionale)/tessere/actions';
import type { DigitalCardRow, TesseraSettings } from '@/lib/types';
import { Mail, IdCard } from 'lucide-react';


type SocioAttivoPerTessera = {
  id: string;
  nome: string;
  cognome: string;
  codice_univoco: string;
  email: string;
  ha_tessera: boolean;
};

type Props = {
  initialCards: DigitalCardRow[];
  sociAttivi?: SocioAttivoPerTessera[];
  tesseraSettings?: TesseraSettings | null;
};

export function TesserePageClient({
  initialCards,
  sociAttivi = [],
  tesseraSettings: _tesseraSettings = null,
}: Props) {
  const router = useRouter();
  const cards = initialCards;
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSegnaEmailInviata(tesseraId: string) {
    setFeedback(null);

    startTransition(async () => {
      const result = await segnaEmailTesseraInviataAction({ tesseraId });

      if (!result.ok) {
        setFeedback(result.error);
        router.refresh();
        return;
      }

      setFeedback('Invio email tessera aggiornato.');
      router.refresh();
    });
  }

  function handleSegnaWalletInviato(tesseraId: string) {
    setFeedback(null);

    startTransition(async () => {
      const result = await segnaWalletTesseraInviatoAction({ tesseraId });

      if (!result.ok) {
        setFeedback(result.error);
        return;
      }

      setFeedback('Tessera wallet aggiornata.');
      router.refresh();
    });
  }

  function handlePreparaTessera(socioId: string) {
    setFeedback(null);

    startTransition(async () => {
      const result = await preparaTesseraDigitaleAction({ socioId });

      if (!result.ok) {
        setFeedback(result.error);
        return;
      }

      setFeedback('Tessera digitale preparata.');
      setShowCreateModal(false);
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title="Tessere digitali"
        subtitle="Validità gestita dal gestionale, distribuzione tramite email e wallet"
        action={
          <button
            className="button"
            type="button"
            onClick={() => setShowCreateModal(true)}
          >
            + Prepara tessera
          </button>
        }
      />

      {feedback && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p style={{ margin: 0 }}>{feedback}</p>
        </div>
      )}

      <div className="table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Socio</th>
                <th>Codice tessera</th>
                <th>Anno</th>
                <th>Scadenza</th>
                <th>Wallet</th>
                <th>Email</th>
                <th>Stato</th>
                <th>Azione</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id}>
                  <td>{card.socio}</td>
                  <td>{card.codice_tessera}</td>
                  <td>{card.anno_validita ?? '—'}</td>
                  <td>{card.scadenza_al ?? '—'}</td>
                  <td>{card.wallet_inviato ? 'Disponibile' : 'Da generare'}</td>
                  <td style={{ textAlign: 'left' }}>
                    {card.email_inviata ? 'Inviata' : 'Da inviare'}
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    {card.stato === 'attiva'
                      ? 'Attiva'
                      : card.stato === 'scaduta'
                        ? 'Scaduta'
                        : 'Revocata'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSegnaEmailInviata(card.id)}
                        title={card.email_inviata ? 'Reinvia email' : 'Invia email'}
                        aria-label={card.email_inviata ? 'Reinvia email' : 'Invia email'}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111827',
                        }}
                      >
                        <Mail size={22} strokeWidth={2.2} />
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSegnaWalletInviato(card.id)}
                        title={card.wallet_inviato ? 'Reinvia tessera' : 'Invia tessera'}
                        aria-label={card.wallet_inviato ? 'Reinvia tessera' : 'Invia tessera'}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#111827',
                        }}
                      >
                        <IdCard size={22} strokeWidth={2.2} />
                      </button>
                      {card.google_wallet_url?.startsWith('https://pay.google.com/gp/v/save/') ? (
                        <a
                          href={card.google_wallet_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Apri Google Wallet"
                          aria-label="Apri Google Wallet"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            padding: 0,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#111827',
                            textDecoration: 'none',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          G
                        </a>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}

              {cards.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    Nessuna tessera digitale presente.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={showCreateModal}
        title="Prepara tessera digitale"
        onClose={() => setShowCreateModal(false)}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {sociAttivi.length === 0 ? (
            <p className="muted" style={{ margin: 0 }}>
              Nessun socio attivo disponibile.
            </p>
          ) : (
            sociAttivi.map((socio) => (
              <div
                key={socio.id}
                style={{
                  border: '1px solid #e5e7eb',
                  padding: 12,
                  display: 'grid',
                  gap: 4,
                }}
              >
                <strong>
                  {socio.nome} {socio.cognome}
                </strong>
                <span className="muted">{socio.codice_univoco}</span>
                <span className="muted">{socio.email || '—'}</span>
                <span className="muted">
                  {socio.ha_tessera ? 'Tessera già presente' : 'Tessera da preparare'}
                </span>
                <button
                  type="button"
                  className="button"
                  style={{ marginTop: 8, width: 'fit-content' }}
                  onClick={() => handlePreparaTessera(socio.id)}
                >
                  {socio.ha_tessera ? 'Aggiorna tessera' : 'Prepara tessera'}
                </button>
              </div>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}