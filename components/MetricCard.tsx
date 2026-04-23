export function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number | string;
  helper: string;
}) {
  return (
    <div className="card">
      <div className="eyebrow">{label}</div>
      <p className="metric">{value}</p>
      <div className="muted">{helper}</div>
    </div>
  );
}
