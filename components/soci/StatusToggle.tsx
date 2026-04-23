'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleSocioStatusAction } from '@/app/(gestionale)/soci/actions';
import { Modal } from '@/components/dashboard/Modal';

type Props = {
  socioId: string;
  stato: 'attivo' | 'sospeso';
};

export function StatusToggle({ socioId, stato }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStato, setCurrentStato] = useState<'attivo' | 'sospeso'>(stato);

  useEffect(() => {
    setCurrentStato(stato);
  }, [stato]);

  const isActive = currentStato === 'attivo';
  const nuovoStato = isActive ? 'sospeso' : 'attivo';

  function handleToggleClick() {
    setShowConfirm(true);
  }

  function handleConfirm() {
    setShowConfirm(false);

    startTransition(async () => {
      const result = await toggleSocioStatusAction({
        socioId,
        stato: nuovoStato,
      });

      if (!result.ok) {
        alert(result.error);
        return;
      }

      setCurrentStato(nuovoStato);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        className={`status-switch ${isActive ? 'is-active' : 'is-suspended'}`}
        onClick={handleToggleClick}
        disabled={isPending}
        aria-pressed={isActive}
        aria-label={isActive ? 'Imposta socio come sospeso' : 'Imposta socio come attivo'}
        title={isActive ? 'Clicca per sospendere il socio' : 'Clicca per attivare il socio'}
      >
        <div className="status-switch-track">
          <div className="status-switch-text">
            {isPending ? 'SALVATAGGIO...' : isActive ? 'ATTIVO' : 'SOSPESO'}
          </div>
          <div className="status-switch-knob" />
        </div>
      </button>

      <Modal
        open={showConfirm}
        title={nuovoStato === 'attivo' ? 'Attivare il socio?' : 'Sospendere il socio?'}
        onClose={() => setShowConfirm(false)}
      >
        <p style={{ marginTop: 0 }}>
          {nuovoStato === 'attivo'
            ? 'Sei sicura di voler attivare questo socio?'
            : 'Sei sicura di voler sospendere questo socio?'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            className="button"
            onClick={handleConfirm}
            disabled={isPending}
          >
            Conferma
          </button>
        </div>
      </Modal>
    </>
  );
}