(() => {
  'use strict';

  const measurementId = window.PF_GA4_ID || 'G-CY7LK0E6M4';
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { anonymize_ip: true });

  if (!document.querySelector(`script[data-pf-ga4="${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.dataset.pfGa4 = measurementId;
    document.head.appendChild(script);
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-analytics]');
    if (!target) return;
    window.gtag('event', target.dataset.analytics, {
      link_url: target.href || '',
      link_text: (target.textContent || '').trim().slice(0, 120),
      page_location: window.location.href
    });
  });
})();
