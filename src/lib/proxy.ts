/**
 * Proxy Scraper Library
 * Fetches and parses free proxies from various public sources.
 */

export interface Proxy {
  ip: string;
  port: string;
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  lastChecked?: string;
}

const SOURCES = [
  {
    url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    protocol: 'http' as const,
  },
  {
    url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    protocol: 'http' as const,
  },
  {
    url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks4.txt',
    protocol: 'socks4' as const,
  },
  {
    url: 'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/socks5.txt',
    protocol: 'socks5' as const,
  },
];

export async function fetchProxies(): Promise<Proxy[]> {
  const allProxies: Proxy[] = [];
  
  const results = await Promise.allSettled(
    SOURCES.map(async (source) => {
      const response = await fetch(source.url, { next: { revalidate: 3600 } });
      if (!response.ok) throw new Error(`Failed to fetch from ${source.url}`);
      const text = await response.text();
      return { text, protocol: source.protocol };
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { text, protocol } = result.value;
      const lines = text.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && trimmed.includes(':')) {
          const [ip, port] = trimmed.split(':');
          if (ip && port) {
            allProxies.push({
              ip,
              port,
              protocol,
              lastChecked: new Date().toISOString(),
            });
          }
        }
      }
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return allProxies.filter((p) => {
    const key = `${p.ip}:${p.port}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
