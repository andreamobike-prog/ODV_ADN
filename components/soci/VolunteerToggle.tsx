'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleSocioVolunteerAction } from '@/app/(gestionale)/soci/actions';
import { Modal } from '@/components/dashboard/Modal';

type Props = {
  socioId: string;
  isVolunteer: boolean;
};

export function VolunteerToggle({ socioId, isVolunteer }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleToggleClick() {
    if (isVolunteer || isPending) return;
    setError(null);
    setShowConfirm(true);
  }

  function handleConfirm() {
    setError(null);

    startTransition(async () => {
      const result = await toggleSocioVolunteerAction({
        socioId,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setShowConfirm(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        className={`status-switch ${isVolunteer ? 'is-active' : 'is-suspended'}`}
        onClick={handleToggleClick}
        disabled={isPending}
        aria-pressed={isVolunteer}
        aria-label="Volontario attivo"
        title={
          isVolunteer
            ? 'Questo socio è già volontario'
            : 'Clicca per attivare il socio come volontario'
        }
      >
        <span className="status-switch-track">
          <span className="status-switch-text">{isVolunteer ? 'ON' : 'OFF'}</span>
          <span className="status-switch-knob" />
        </span>
      </button>

      <Modal
        open={showConfirm}
        title="Attivare come volontario?"
        onClose={() => {
          if (!isPending) {
            setShowConfirm(false);
            setError(null);
          }
        }}
      >
        <p style={{ marginTop: 0 }}>
          Confermando, questo socio verrà inserito nel Registro
          volontari come volontario occasionale.
        </p>

        {error && (
          <p style={{ color: '#dc2626', marginTop: 12, marginBottom: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="button"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'SALVATAGGIO...' : 'Conferma'}
          </button>
        </div>
      </Modal>
    </>
  );
}