const isLoopback = (hostname) =>
  hostname === "localhost" || hostname === "[::1]" || /^127\./.test(hostname);

export async function resolveApiUrl(configuredUrl, location, onWarning) {
  const candidates = [];

  if (configuredUrl) {
    try {
      const url = new URL(configuredUrl, location.origin);
      if (!["http:", "https:"].includes(url.protocol)) {
        throw new Error("Protocolo não suportado");
      }
      if (isLoopback(url.hostname) && !isLoopback(location.hostname)) {
        onWarning(`URL configurada ignorada: ${url.origin} aponta para o computador do usuário.`);
      } else {
        candidates.push(url.href.replace(/\/$/, ""));
      }
    } catch (error) {
      onWarning(`VITE_API_URL inválida: ${error.message}`);
    }
  }

  if (!candidates.includes(location.origin)) {
    candidates.push(location.origin);
  }

  for (const url of candidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`${url}/api/versao`, {
        signal: controller.signal,
        cache: "no-cache",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!(await response.text()).startsWith("Bia ")) {
        throw new Error("Resposta inesperada da API");
      }
      return url;
    } catch (error) {
      onWarning(`Falha ao testar ${url}: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Não foi possível conectar à API nas URLs testadas.");
}
