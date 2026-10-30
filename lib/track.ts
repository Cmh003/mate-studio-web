// Envío de visitas y eventos al registro propio (/api/t). Sin cookies.

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) navigator.sendBeacon("/api/t", new Blob([body], { type: "application/json" }));
    else fetch("/api/t", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  } catch {
    /* las estadísticas nunca deben romper la web */
  }
}

export function track(name: string) {
  send({ k: "event", n: name });
}

export function trackView(path: string) {
  let entry = false;
  try {
    entry = sessionStorage.getItem("mate-entry") !== "1";
    sessionStorage.setItem("mate-entry", "1");
  } catch {
    entry = true;
  }
  const utm = new URLSearchParams(location.search).get("utm_source") ?? "";
  send({ k: "view", n: path, e: entry, r: entry ? document.referrer : "", s: entry ? utm : "" });
}
