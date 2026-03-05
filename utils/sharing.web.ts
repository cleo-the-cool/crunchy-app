export async function isAvailableAsync() { return false; }
export async function shareAsync(_url: string, _options?: any) {
  // Web fallback: use navigator.share if available
  if (typeof navigator !== 'undefined' && navigator.share) {
    try { await navigator.share({ url: _url }); } catch {}
  }
}
