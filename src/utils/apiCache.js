const cacheStore = new Map();
const inflightStore = new Map();

const DEFAULT_TTL_MS = 60 * 1000;

export const getCachedValue = key => {
  const entry = cacheStore.get(key);
  if (!entry) {
    return null;
  }

  const now = Date.now();
  const isExpired = now - entry.updatedAt > entry.ttlMs;
  return {
    data: entry.data,
    isExpired,
  };
};

export const setCachedValue = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  cacheStore.set(key, {
    data,
    ttlMs,
    updatedAt: Date.now(),
  });
  return data;
};

export const deleteCachedValue = key => {
  cacheStore.delete(key);
};

export const clearCacheByPrefix = prefix => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

export const getOrFetchWithCache = async ({
  key,
  ttlMs = DEFAULT_TTL_MS,
  staleWhileRevalidate = true,
  fetcher,
}) => {
  const cached = getCachedValue(key);
  if (cached && !cached.isExpired) {
    return cached.data;
  }

  if (cached && cached.isExpired && staleWhileRevalidate) {
    const inflight = inflightStore.get(key);
    if (!inflight) {
      const backgroundFetch = fetcher()
        .then(data => setCachedValue(key, data, ttlMs))
        .catch(() => null)
        .finally(() => inflightStore.delete(key));
      inflightStore.set(key, backgroundFetch);
    }
    return cached.data;
  }

  const inflight = inflightStore.get(key);
  if (inflight) {
    return inflight;
  }

  const request = fetcher()
    .then(data => setCachedValue(key, data, ttlMs))
    .finally(() => inflightStore.delete(key));
  inflightStore.set(key, request);
  return request;
};

export default {
  getCachedValue,
  setCachedValue,
  deleteCachedValue,
  clearCacheByPrefix,
  getOrFetchWithCache,
};
