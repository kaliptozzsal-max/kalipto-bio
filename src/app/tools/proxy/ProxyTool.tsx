"use client";

import { useCallback, useEffect, useState } from "react";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { GlassCard } from "@/components/ui/GlassCard";
import { Tag } from "@/components/ui/Tag";
import { FiRefreshCw, FiCopy, FiCheckCircle } from "react-icons/fi";

interface Proxy {
  ip: string;
  port: string;
  protocol: string;
  lastChecked: string;
}

export function ProxyTool() {
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/proxies");
      const data = await response.json();
      if (data.success) {
        setProxies(data.proxies);
      } else {
        setError(data.error || "Failed to fetch proxies");
      }
    } catch (err) {
      setError("An unexpected error occurred while fetching proxies.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <ToolLayout
      title="Proxy Scraper"
      description="Scrape and list free HTTP, SOCKS4, and SOCKS5 proxies from public sources."
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="text-[0.8125rem] text-ink-muted">
          {proxies.length > 0 && `Found ${proxies.length} proxies`}
        </div>
        <button
          onClick={fetchList}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-electric-600 px-4 py-2 text-[0.8125rem] font-medium text-white transition-all hover:bg-electric-500 disabled:opacity-50"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh List"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-[0.8125rem] text-red-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && proxies.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-white/[0.03]" />
            ))
          : proxies.map((proxy, index) => (
              <GlassCard key={`${proxy.ip}:${proxy.port}`} className="p-4 transition-all hover:border-electric-500/30">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Tag variant={proxy.protocol === "http" ? "default" : "outline"}>
                      {proxy.protocol.toUpperCase()}
                    </Tag>
                    <button
                      onClick={() => copyToClipboard(`${proxy.ip}:${proxy.port}`, index)}
                      className="text-ink-muted transition-colors hover:text-electric-400"
                      title="Copy to clipboard"
                    >
                      {copiedIndex === index ? (
                        <FiCheckCircle className="text-green-400" />
                      ) : (
                        <FiCopy />
                      )}
                    </button>
                  </div>
                  <div>
                    <div className="text-[1rem] font-medium text-ink">
                      {proxy.ip}
                    </div>
                    <div className="text-[0.8125rem] text-ink-muted">
                      Port: {proxy.port}
                    </div>
                  </div>
                  <div className="text-[0.75rem] text-ink-muted/60">
                    Checked: {new Date(proxy.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              </GlassCard>
            ))}
      </div>

      {!loading && proxies.length === 0 && !error && (
        <div className="py-20 text-center text-ink-muted">
          No proxies found. Try refreshing the list.
        </div>
      )}
    </ToolLayout>
  );
}
