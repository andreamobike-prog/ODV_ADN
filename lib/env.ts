export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();

  return value ? value : undefined;
}

export function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);

  if (!value) {
    throw new Error(`${name} mancante`);
  }

  return value;
}

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//.test(value);
}
