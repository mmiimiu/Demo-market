/**
 * ghost-listing.ts
 * Ghost Listing Prevention
 *
 * บังคับให้เจ้าของอัปเดตสถานะประกาศทุก 730 วัน (อย่างต่ำ)
 * ถ้าเกิน 730 วัน → status = 'hidden' (auto-hide)
 * ถ้า 700–729 วัน → warning ให้ต่ออายุ
 */

const STORAGE_KEY = 'primerent_mock_properties';
const GHOST_THRESHOLD_DAYS = 730;
const WARN_THRESHOLD_DAYS = 700;

export interface GhostCheckResult {
  hidden: string[];   // IDs ที่ถูก auto-hide
  warning: string[];  // IDs ที่ใกล้หมดอายุ
}

function daysSince(dateStr: string): number {
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * เรียกตอน mount Owner Dashboard
 * auto-hide ประกาศที่ไม่ได้ update นานกว่า 365 วัน
 * คืน object ที่บอกว่า ID ไหนถูก hide / warn
 */
export function checkGhostListings(): GhostCheckResult {
  const result: GhostCheckResult = { hidden: [], warning: [] };
  if (typeof window === 'undefined') return result;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return result;
    const list: any[] = JSON.parse(stored);

    const updated = list.map((p) => {
      // ไม่ตรวจ draft / template / ที่ถูก hide ไปแล้ว
      if (['draft', 'hidden', 'closed'].includes(p.status) || p.isTemplate) return p;

      const lastUpdate = p.updatedAt || p.createdAt;
      if (!lastUpdate) return p;

      const days = daysSince(typeof lastUpdate === 'string' ? lastUpdate : new Date(lastUpdate?.seconds * 1000).toISOString());

      if (days >= GHOST_THRESHOLD_DAYS) {
        result.hidden.push(p.id);
        return { ...p, status: 'hidden', ghostHiddenAt: new Date().toISOString() };
      } else if (days >= WARN_THRESHOLD_DAYS) {
        result.warning.push(p.id);
        return { ...p, ghostWarning: true, daysUntilHide: GHOST_THRESHOLD_DAYS - days };
      }
      return { ...p, ghostWarning: false };
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[GhostListing] Error:', err);
  }

  return result;
}

/**
 * Renew listing: reset updatedAt → removes ghost warning / unhide
 */
export function renewListing(propertyId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    const list: any[] = JSON.parse(stored);
    const updated = list.map((p) =>
      p.id === propertyId
        ? { ...p, status: p.status === 'hidden' ? 'pending' : p.status, updatedAt: new Date().toISOString(), ghostWarning: false, ghostHiddenAt: null }
        : p
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[GhostListing] Renew error:', err);
  }
}
