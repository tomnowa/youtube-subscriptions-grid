
(() => {
  const fixUrl = (url, base) => {
    try {
      const u = new URL(url, base || location.href);
      if (u.pathname === '/feed/subscriptions') {
        if (u.searchParams.get('flow') !== '1') {
          u.searchParams.set('flow','1');
        }
      }
      return u.href;
    } catch {
      return url;
    }
  };

  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);

  history.pushState = function(state, title, url) {
    const fixed = url ? fixUrl(url) : undefined;
    return origPush(state, title, fixed);
  };

  history.replaceState = function(state, title, url) {
    const fixed = url ? fixUrl(url) : undefined;
    return origReplace(state, title, fixed);
  };

  const ensureNow = () => {
    if (location.pathname === '/feed/subscriptions') {
      const fixed = fixUrl(location.href);
      if (fixed !== location.href) {
        // do a silent URL bar update to avoid reload loops
        origReplace(history.state, document.title, fixed);
      }
    }
  };

  const patchLinks = root => {
    const scope = root || document;
    scope.querySelectorAll('a[href*="/feed/subscriptions"]').forEach(a => {
      const original = a.getAttribute('href') || '';
      const updated = fixUrl(original, location.origin);
      if (updated && updated !== original) a.setAttribute('href', updated);
    });
  };

  // run early and on SPA nav
  document.addEventListener('yt-navigate-start', ensureNow);
  document.addEventListener('yt-navigate-finish', () => {
    ensureNow();
    patchLinks(document);
  });

  window.addEventListener('popstate', ensureNow);

  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      if ((m.type === 'childList' && m.addedNodes.length) || m.type === 'attributes') {
        patchLinks(document);
        break;
      }
    }
  });
  mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });

  // initial
  ensureNow();
  patchLinks(document);
})();
