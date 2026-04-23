import {
  getDigitalCards,
  getSociAttiviPerTessera,
  getTesseraSettings,
} from '@/lib/data';
import { TesserePageClient } from '@/components/tessere/TesserePageClient';

export default async function TesserePage() {
  const [cards, sociAttivi, tesseraSettings] = await Promise.all([
    getDigitalCards(),
    getSociAttiviPerTessera(),
    getTesseraSettings(),
  ]);

  return (
    <TesserePageClient
      initialCards={cards}
      sociAttivi={sociAttivi}
      tesseraSettings={tesseraSettings}
    />
  );
}