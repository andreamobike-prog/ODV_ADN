import { Users } from 'lucide-react';
import { DashboardUploadCards } from '@/components/dashboard/DashboardUploadCards';
import { getSoci, getVolontari } from '@/lib/data';

export default async function DashboardPage() {
  const soci = await getSoci();
  const volontari = await getVolontari();

  return (
    <>
      <section className="dashboard-section">
        <div className="dashboard-row dashboard-row-2">
          <div className="dashboard-feature-card">
            <Users size={42} strokeWidth={1.6} className="dashboard-feature-icon" />
            <h3>Libro soci</h3>
            <strong>{soci.length}</strong>
            <p>Soci registrati</p>
          </div>

          <div className="dashboard-feature-card">
            <Users size={42} strokeWidth={1.6} className="dashboard-feature-icon" />
            <h3>Registro volontari</h3>
            <strong>{volontari.length}</strong>
            <p>Volontari registrati</p>
          </div>
        </div>
      </section>

      <section className="dashboard-section dashboard-section-plain">
        <div className="dashboard-row">
          <div className="dashboard-section-title-only">
            <h2>Gestione dati e archivi</h2>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-row">
          <DashboardUploadCards />
        </div>
      </section>
    </>
  );
}