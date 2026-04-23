import { PageHeader } from '@/components/PageHeader';
import { getTutorials } from '@/lib/data';

export default async function TutorialPage() {
  const tutorials = await getTutorials();

  return (
    <>
      <PageHeader title="Tutorial e video guide" subtitle="Guide pratiche e video tutorial organizzati per modulo" action={<button className="button">+ Nuovo tutorial</button>} />
      <div className="grid-2">
        {tutorials.map((item) => (
          <div className="card" key={item.id}>
            <div className="eyebrow">{item.categoria}</div>
            <h3 style={{ marginTop: 0 }}>{item.titolo}</h3>
            <p className="muted">{item.descrizione}</p>
            <button className="button secondary">Apri video tutorial</button>
          </div>
        ))}
      </div>
    </>
  );
}
