type Props = {
  value: string;
};

export function StatusBadge({ value }: Props) {
  const normalized = value.toLowerCase();

  let className = 'badge';

  if (normalized === 'attivo') className += ' badge-lilla';
  else if (normalized === 'sospeso') className += ' badge-grigio';
  else if (normalized === 'sì' || normalized === 'si') className += ' badge-info';
  else className += ' badge-info';

  return <span className={className}>{value}</span>;
}