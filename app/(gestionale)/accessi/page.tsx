import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';

const users = [
  { email: 'admin@odv.it', ruolo: 'super_admin', stato: 'attivo', accesso: 'Tutto il sistema' },
  { email: 'eventi@odv.it', ruolo: 'responsabile_eventi', stato: 'attivo', accesso: 'Solo eventi e gruppi' },
  { email: 'segreteria@odv.it', ruolo: 'operatore_segreteria', stato: 'attivo', accesso: 'Soci e volontari' },
];

export default function AccessiPage() {
  return (
    <>
      <PageHeader title="Utenti e livelli" subtitle="Email, password, ruoli e permessi granulari" action={<button className="button">+ Nuovo utente</button>} />
      <div className="card">
        <div className="form-grid">
          <input className="input" placeholder="Email" />
          <input className="input" placeholder="Password" type="password" />
          <select className="select"><option>Seleziona livello</option><option>super_admin</option><option>admin_organizzazione</option><option>operatore_segreteria</option><option>responsabile_eventi</option><option>custom</option></select>
          <select className="select"><option>Funzioni abilitate</option><option>Tutto il sistema</option><option>Solo eventi</option><option>Solo lettura</option></select>
        </div>
        <div style={{ marginTop: 14 }}><button className="button">Salva utente</button></div>
      </div>

      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Email</th><th>Ruolo</th><th>Stato</th><th>Permessi</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.email}</td>
                  <td>{user.ruolo}</td>
                  <td><StatusBadge value={user.stato} /></td>
                  <td>{user.accesso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
