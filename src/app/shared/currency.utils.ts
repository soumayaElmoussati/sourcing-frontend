/**
 * Conversion des montants (stockés en USD) vers la devise locale du pays
 * de la commande / du produit, pour l'affichage uniquement.
 *
 * Les 7 pays gérés par la plateforme ont tous une devise dont le taux de
 * change est fixe (« pegged ») par rapport au dollar américain, donc ces
 * taux constants restent fiables dans la durée (pas besoin d'API de change
 * en temps réel).
 */

export interface CountryCurrency {
  code: string;    // Code ISO de la devise (ex: 'AED')
  rate: number;    // 1 USD = `rate` unités de cette devise
  decimals: number; // Nombre de décimales conventionnel pour cette devise
}

export const COUNTRY_CURRENCY_MAP: Record<string, CountryCurrency> = {
  KSA: { code: 'SAR', rate: 3.75, decimals: 2 },   // Arabie Saoudite — Riyal saoudien
  UAE: { code: 'AED', rate: 3.6725, decimals: 2 }, // Émirats arabes unis — Dirham
  KW: { code: 'KWD', rate: 0.308, decimals: 3 },   // Koweït — Dinar koweïtien (3 décimales)
  QA: { code: 'QAR', rate: 3.64, decimals: 2 },    // Qatar — Riyal qatari
  OM: { code: 'OMR', rate: 0.3845, decimals: 3 },  // Oman — Rial omanais (3 décimales)
  BH: { code: 'BHD', rate: 0.376, decimals: 3 },   // Bahreïn — Dinar bahreïni (3 décimales)
  IQ: { code: 'IQD', rate: 1310, decimals: 0 },    // Irak — Dinar irakien (pas de décimales à l'usage)
};

/**
 * Convertit un montant en USD vers la devise locale du pays donné.
 * Si le pays n'est pas reconnu, retourne le montant tel quel en USD.
 */
export function convertFromUsd(amountUsd: number, countryCode?: string | null): { amount: number; currency: string; decimals: number } {
  const entry = countryCode ? COUNTRY_CURRENCY_MAP[countryCode] : undefined;

  if (!entry || amountUsd == null) {
    return { amount: amountUsd ?? 0, currency: 'USD', decimals: 2 };
  }

  return {
    amount: amountUsd * entry.rate,
    currency: entry.code,
    decimals: entry.decimals
  };
}

/**
 * Formate directement un montant USD dans la devise locale du pays,
 * prêt à afficher (ex: "1 909,00 AED", "160,192 KWD").
 */
export function formatCountryCurrency(amountUsd: number | null | undefined, countryCode?: string | null): string {
  const { amount, currency, decimals } = convertFromUsd(amountUsd ?? 0, countryCode);

  const formattedNumber = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return `${formattedNumber} ${currency}`;
}
