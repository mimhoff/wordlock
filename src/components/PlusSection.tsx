import { useEffect, useState } from 'react';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { billingAvailable, buyPlus, getPlusOffer, restorePlus } from '../platform/billing';

/** The WordLock Plus row in Settings: buy and restore, or a thank-you once bought. */
export function PlusSection({ premium }: { premium: boolean }) {
  const [offer, setOffer] = useState<{ pkg: PurchasesPackage; price: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const available = billingAvailable();

  useEffect(() => {
    if (available && !premium) void getPlusOffer().then(setOffer);
  }, [available, premium]);

  if (!premium && !available) return null; // website, or billing not set up yet

  const buy = async () => {
    if (!offer) return;
    setBusy(true);
    setMessage(null);
    const outcome = await buyPlus(offer.pkg);
    setBusy(false);
    if (outcome === 'failed') setMessage("The purchase didn't go through. Please try again.");
  };

  const restore = async () => {
    setBusy(true);
    setMessage(null);
    const restored = await restorePlus();
    setBusy(false);
    setMessage(restored ? null : 'No WordLock Plus purchase found for this account.');
  };

  return (
    <section className="setting plus-section">
      <h3>
        WordLock Plus <span className="plus-badge">Plus</span>
      </h3>
      {premium ? (
        <p className="plus-thanks">Thanks for supporting WordLock! Ads are off and Expert is unlocked.</p>
      ) : (
        <>
          <p className="plus-pitch">Remove ads and unlock Expert. A one-time purchase.</p>
          <div className="plus-actions">
            <button className="button primary" onClick={buy} disabled={busy || !offer}>
              {offer ? 'Get Plus' : 'Loading…'}
            </button>
            <button className="link-button" onClick={restore} disabled={busy}>
              Restore purchase
            </button>
          </div>
        </>
      )}
      {message && <p className="setting-note">{message}</p>}
    </section>
  );
}
