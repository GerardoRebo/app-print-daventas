import { ref } from 'vue';

export function useCurrency(defaultLocale = 'es-MX', defaultCurrency = 'MXN') {
  const locale = ref(defaultLocale);
  const currency = ref(defaultCurrency);

  /**
   * Formatea un número a moneda con símbolo ($, €, etc.)
   */
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat(locale.value, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: 2,
    }).format(value);
  };

  /**
   * Formatea sin símbolo de moneda (solo 1,234.00)
   */
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '';

    return new Intl.NumberFormat(locale.value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  /**
   * Cambiar la configuración en runtime
   */
  const setLocale = (newLocale) => {
    locale.value = newLocale;
  };

  const setCurrency = (newCurrency) => {
    currency.value = newCurrency;
  };

  return {
    locale,
    currency,
    formatCurrency,  // $12,000.00
    formatNumber,  // 12,000.00
    setLocale,
    setCurrency,
  };
}
