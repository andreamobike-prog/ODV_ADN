import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { getTickets } from '@/lib/data';

export default async function AssistenzaPage() {
  const tickets = await getTickets();

  return (
    <>
      <PageHeader title="Assistenza tecnica" subtitle="Contatti e ticket supporto" />
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">Apri ticket</div>
          <div className="form-grid">
            <input className="input" placeholder="Nome" />
            <input className="input" placeholder="Cognome" />
            <input className="input" placeholder="Email" />
            <input className="input" placeholder="Società" />
            <input className="input" placeholder="Oggetto" />
            <textarea className="textarea" placeholder="Descrizione problema" />
          </div>
          <div style={{ marginTop: 14 }}><button className="button">Invia ticket</button></div>
        </div>
        <div className="card">
          <div className="eyebrow">Contatti</div>
          <p className="muted">supporto@tua-odv.it</p>
          <p className="muted">Lun–Ven, 09:00–18:00</p>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nominativo</th><th>Email</th><th>Società</th><th>Oggetto</th><th>Stato</th></tr></thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.nominativo}</td>
                  <td>{ticket.email}</td>
                  <td>{ticket.societa}</td>
                  <td>{ticket.oggetto}</td>
                  <td><StatusBadge value={ticket.stato} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
