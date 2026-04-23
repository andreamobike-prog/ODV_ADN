import { PageHeader } from '@/components/PageHeader';
import { getGroups } from '@/lib/data';

export default async function GruppiPage() {
  const groups = await getGroups();

  return (
    <>
      <PageHeader title="Gruppi" subtitle="Associa soci e volontari ai gruppi e scarica il CSV" action={<button className="button">+ Crea gruppo</button>} />
      <div className="grid-2">
        <div className="card">
          <div className="eyebrow">Nuovo gruppo</div>
          <div className="form-grid">
            <input className="input" placeholder="Nome gruppo" />
            <input className="input" placeholder="Numero soci da associare" />
            <input className="input" placeholder="Numero volontari da associare" />
          </div>
          <div style={{ marginTop: 14 }}><button className="button">Salva gruppo</button></div>
        </div>
        <div className="card">
          <div className="eyebrow">Esportazione</div>
          <p className="muted">Ogni gruppo può esportare CSV con elenco soci e volontari associati.</p>
          <button className="button secondary">Scarica CSV gruppo selezionato</button>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: 24 }}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Gruppo</th><th>Soci</th><th>Volontari</th><th>Totale</th><th>Azioni</th></tr></thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id}>
                  <td>{group.nome}</td>
                  <td>{group.soci}</td>
                  <td>{group.volontari}</td>
                  <td>{group.totale}</td>
                  <td><button className="button secondary">Apri gruppo</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
