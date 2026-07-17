(function initPruefBlickBrand(root, doc) {
  'use strict';

  const brand = Object.freeze({
    name: 'PrüfBlick',
    productName: 'PrüfBlick Büromanagement',
    shortName: 'PrüfBlick',
    proProductName: 'PrüfBlick Büromanagement Pro',
    tagline: 'Prüfungen klar im Blick.',
    status: 'CANDIDATE_NOT_LEGALLY_CLEARED',
    gates: Object.freeze({
      professionalTrademarkReviewCompleted: false,
      trademarkApplicationAuthorized: false,
      domainPurchaseAuthorized: false,
      paidLaunchAuthorized: false,
      checkoutAuthorized: false
    })
  });

  root.PRUEFBLICK_BRAND = brand;
  if (!doc) return;

  function applyBrand() {
    doc.documentElement.dataset.brand = 'pruefblick';
    doc.documentElement.dataset.brandStatus = brand.status;

    doc.querySelectorAll('[data-brand-text]').forEach(element => {
      const key = element.dataset.brandText;
      if (typeof brand[key] === 'string') element.textContent = brand[key];
    });

    doc.querySelectorAll('[data-brand-content]').forEach(element => {
      const key = element.dataset.brandContent;
      if (typeof brand[key] === 'string') element.setAttribute('content', brand[key]);
    });
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', applyBrand, { once: true });
  } else {
    applyBrand();
  }
})(window, typeof document === 'undefined' ? null : document);
