'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function useAnalytics() {
 const pathname = usePathname();

 const trackEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
 try {
 await fetch('/api/analytics/track', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 event_type: eventType,
 path: window.location.pathname,
 metadata
 })
 });
 } catch (err) {
 // Ignore analytics tracking errors silently
 console.warn('Analytics tracking failed', err);
 }
 };

 useEffect(() => {
 // Automatically track page views when the pathname changes
 if (pathname) {
 trackEvent('page_view');
 }
 }, [pathname]);

 return { trackEvent };
}
