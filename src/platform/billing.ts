import { Capacitor } from '@capacitor/core';
import {
  PURCHASES_ERROR_CODE,
  Purchases,
  type CustomerInfo,
  type PurchasesPackage,
} from '@revenuecat/purchases-capacitor';
import { PLUS_ENTITLEMENT, REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from '../config';
import { setPremium } from './entitlements';

/**
 * WordLock Plus purchases through RevenueCat (Google Play Billing / StoreKit underneath).
 * Native apps only, and only once a RevenueCat key is configured; everything is a no-op otherwise.
 * The store is the source of truth: every customer-info update re-sets isPremium().
 */
let ready = false;

function apiKey(): string {
  const platform = Capacitor.getPlatform();
  return platform === 'android' ? REVENUECAT_ANDROID_KEY : platform === 'ios' ? REVENUECAT_IOS_KEY : '';
}

const hasPlus = (info: CustomerInfo) => info.entitlements.active[PLUS_ENTITLEMENT] != null;

/** Whether purchases can be offered at all (native app with a configured key). */
export const billingAvailable = () => Capacitor.isNativePlatform() && apiKey() !== '';

/** Starts RevenueCat and restores the player's Plus status from the store. Safe to call once at start-up. */
export async function initBilling(): Promise<void> {
  if (!billingAvailable() || ready) return;
  try {
    await Purchases.configure({ apiKey: apiKey() });
    ready = true;
    await Purchases.addCustomerInfoUpdateListener((info) => setPremium(hasPlus(info)));
    const { customerInfo } = await Purchases.getCustomerInfo();
    setPremium(hasPlus(customerInfo));
  } catch (err) {
    // Offline or store unavailable: keep the last known premium state.
    console.warn('Billing unavailable', err);
  }
}

/** The WordLock Plus package from the current RevenueCat offering, with its localised price. */
export async function getPlusOffer(): Promise<{ pkg: PurchasesPackage; price: string } | null> {
  if (!ready) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages[0];
    return pkg ? { pkg, price: pkg.product.priceString } : null;
  } catch {
    return null;
  }
}

export type PurchaseOutcome = 'purchased' | 'cancelled' | 'failed';

export async function buyPlus(pkg: PurchasesPackage): Promise<PurchaseOutcome> {
  try {
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    setPremium(hasPlus(customerInfo));
    return hasPlus(customerInfo) ? 'purchased' : 'failed';
  } catch (err) {
    const e = err as { code?: string; userCancelled?: boolean | null };
    if (e.userCancelled || e.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) return 'cancelled';
    console.warn('Purchase failed', err);
    return 'failed';
  }
}

/** Restores an earlier purchase (new phone, reinstall). Returns whether Plus is now active. */
export async function restorePlus(): Promise<boolean> {
  if (!ready) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    setPremium(hasPlus(customerInfo));
    return hasPlus(customerInfo);
  } catch {
    return false;
  }
}
