import { PageHeader } from '@/components/PageHeader';
import { getEvents } from '@/lib/data';
import { DateSplitInput } from '@/components/form/DateSplitInput';

export default async function EventiPage() {
  const eventi = await getEvents();

  return (
    <>
      <PageHeader title="Eventi" subtitle="Crea eventi, collega gruppi ed esporta PDF" action={<button className="button">+ Crea evento</button>} />
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">Crea evento</div>
          <div className="form-grid">
            <DateSplitInput name="data_evento_filtro" />
            <input className="input" placeholder="Nome evento" />
            <textarea className="textarea" placeholder="Mini descrizione evento" />
            <select className="select"><option>Seleziona gruppi</option><option>Protezione Civile</option><option>Eventi Solidali</option></select>
          </div>
          <div style={{ marginTop: 14 }}><button className="button">Salva evento</button></div>
        </div>
        <div className="card">
          <div className="eyebrow">Output evento</div>
          <p className="muted">Nel dettaglio evento è previsto il download PDF con dettagli evento, gruppi associati, soci e volontari coinvolti.</p>
          <button className="button secondary">Scarica PDF esempio</button>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Evento</th><th>Data</th><th>Descrizione</th><th>Gruppi</th></tr></thead>
            <tbody>
              {eventi.map((evento) => (
                <tr key={evento.id}>
                  <td>{evento.nome}</td>
                  <td>{evento.data_evento}</td>
                  <td>{evento.descrizione}</td>
                  <td>{evento.gruppi.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
