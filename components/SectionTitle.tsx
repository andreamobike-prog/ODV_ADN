export function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      {action}
    </div>
  );
}
