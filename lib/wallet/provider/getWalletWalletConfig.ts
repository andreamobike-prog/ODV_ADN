import { getSupabaseServerClient } from '@/lib/supabase-server';
import { normalizeWalletWalletVisualConfig } from '@/lib/wallet/provider/normalizeWalletWalletConfig';
import {
  DEFAULT_WALLETWALLET_VISUAL_CONFIG,
  type WalletWalletVisualConfig,
} from '@/lib/wallet/provider/types';

const ORGANIZZAZIONE_ID = '11111111-1111-1111-1111-111111111111';

function parseConfigValue(value: unknown) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  if (typeof value === 'object') {
    return value;
  }

  return null;
}

function mapLegacyWalletConfig(
  tesseraSettings: Record<string, unknown> | null,
  associationName: string | null
) {
  const legacyColorPreset =
    typeof tesseraSettings?.colorPreset === 'string' && tesseraSettings.colorPreset.trim()
      ? tesseraSettings.colorPreset
      : typeof tesseraSettings?.colore_sfondo === 'string' &&
          ['dark', 'light', 'blue', 'green', 'red', 'purple'].includes(
            tesseraSettings.colore_sfondo.trim()
          )
        ? tesseraSettings.colore_sfondo
        : DEFAULT_WALLETWALLET_VISUAL_CONFIG.colorPreset;

  return {
    logoText:
      typeof tesseraSettings?.nome_associazione_tessera === 'string' &&
      tesseraSettings.nome_associazione_tessera.trim()
        ? tesseraSettings.nome_associazione_tessera
        : associationName || DEFAULT_WALLETWALLET_VISUAL_CONFIG.logoText,
    colorPreset: legacyColorPreset,
    logoURL:
      typeof tesseraSettings?.logo_url === 'string' && tesseraSettings.logo_url.trim()
        ? tesseraSettings.logo_url.trim()
        : '',
    stripURL:
      typeof tesseraSettings?.immagine_centrale_url === 'string' &&
      tesseraSettings.immagine_centrale_url.trim()
        ? tesseraSettings.immagine_centrale_url.trim()
        : '',
  };
}

export async function getWalletWalletConfig(): Promise<WalletWalletVisualConfig> {
  const supabase = await getSupabaseServerClient();

  const [{ data: tesseraSettings, error: tesseraError }, { data: organizzazione, error: orgError }] =
    await Promise.all([
      supabase.from('tessera_settings').select('*').eq('organizzazione_id', ORGANIZZAZIONE_ID).maybeSingle(),
      supabase
        .from('organizzazione_settings')
        .select('nome_associazione')
        .eq('organizzazione_id', ORGANIZZAZIONE_ID)
        .maybeSingle(),
    ]);

  if (tesseraError) {
    throw new Error(tesseraError.message);
  }

  if (orgError) {
    throw new Error(orgError.message);
  }

  const associationName =
    typeof organizzazione?.nome_associazione === 'string'
      ? organizzazione.nome_associazione.trim()
      : null;

  const storedConfig = parseConfigValue(
    (tesseraSettings as Record<string, unknown> | null)?.walletwallet_visual_config
  );

  const legacyConfig = mapLegacyWalletConfig(
    (tesseraSettings as Record<string, unknown> | null) ?? null,
    associationName
  );

  return normalizeWalletWalletVisualConfig({
    ...legacyConfig,
    ...storedConfig,
  });
}
