import { notFound } from 'next/navigation';
import { getVolontarioDetail } from '@/lib/data';
import { VolontarioDetailClient } from '@/components/volontari/VolontarioDetailClient';

export default async function VolontarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const volontario = await getVolontarioDetail(id);

  if (!volontario) return notFound();

  return <VolontarioDetailClient volontario={volontario} />;
}