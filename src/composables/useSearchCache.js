import { ref } from 'vue';

/**
 * Composable simple para caché de búsquedas por almacén
 * 
 * Responsabilidades:
 * - Mantener caché de datos por almacén y keyword
 * - Mantener timestamps de última actualización
 * - Validar si el caché está stale (basado en TTL)
 * - Invalidar caché para forzar refresh
 * - Auto-generar claves compuestas: almacenId:keyword
 * 
 * @param {Object} config
 * @param {Number} config.ttlMs - TTL en milisegundos (default: 5 minutos)
 * 
 * @returns {Object} { 
 *   cache: Object - { "almacenId:keyword": data }
 *   timestamps: Object - { "almacenId:keyword": timestamp }
 *   isDataStale: Function(almacenId, keyword) - valida si caché está expirado
 *   getFromCache: Function(almacenId, keyword) - obtiene data del caché
 *   setCache: Function(almacenId, keyword, data) - guarda en caché
 *   invalidate: Function(almacenId, keyword) - invalida caché para refresh forzado
 *   clear: Function - limpia todo el caché
 * }
 */
export function useSearchCache(config = {}) {
  const { ttlMs = 5 * 60 * 1000 } = config;

  // Almacenamiento de caché: { "almacenId:keyword": data }
  const cache = ref({});
  
  // Timestamps de última actualización: { "almacenId:keyword": timestamp }
  const timestamps = ref({});

  /**
   * Genera clave compuesta para caché
   * @param {Number|String} almacenId
   * @param {String} keyword
   * @returns {String} clave compuesta: "almacenId:keyword"
   */
  const makeKey = (almacenId, keyword) => {
    return `${almacenId}:${keyword}`;
  };

  /**
   * Valida si el caché para un almacén+keyword específico está stale
   * @param {Number|String} almacenId
   * @param {String} keyword
   * @returns {Boolean} true si está stale o no existe
   */
  const isDataStale = (almacenId, keyword) => {
    const key = makeKey(almacenId, keyword);
    const lastTime = timestamps.value[key] || 0;
    if (!lastTime) return true;
    
    const currentTime = new Date().getTime();
    return currentTime - lastTime >= ttlMs;
  };

  /**
   * Obtiene datos del caché
   * @param {Number|String} almacenId
   * @param {String} keyword
   * @returns {any} data guardada o undefined
   */
  const getFromCache = (almacenId, keyword) => {
    const key = makeKey(almacenId, keyword);
    return cache.value[key];
  };

  /**
   * Guarda datos en el caché con timestamp
   * @param {Number|String} almacenId
   * @param {String} keyword
   * @param {any} data - datos a guardar
   */
  const setCache = (almacenId, keyword, data) => {
    const key = makeKey(almacenId, keyword);
    cache.value[key] = data;
    timestamps.value[key] = new Date().getTime();
  };

  /**
   * Limpia todo el caché y timestamps
   */
  const clear = () => {
    cache.value = {};
    timestamps.value = {};
  };

  /**
   * Invalida el caché para un almacén+keyword específico
   * Usado para forzar refresh ignorando TTL
   * @param {Number|String} almacenId
   * @param {String} keyword
   */
  const invalidate = (almacenId, keyword) => {
    const key = makeKey(almacenId, keyword);
    delete cache.value[key];
    delete timestamps.value[key];
  };

  

  return {
    cache,
    timestamps,
    isDataStale,
    getFromCache,
    setCache,
    clear,
    invalidate,
  };
}
