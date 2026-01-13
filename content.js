(() => {
  'use strict';

  const SUBS_PATH = '/feed/subscriptions';
  const FLOW_PARAM = 'flow';
  const FLOW_VALUE = '1';
  const FLOW_REGEX = /[?&]flow=1(?:&|$)/;

  /**
   * Fixes a URL to include flow=1 if it's the subscriptions page.
   * Preserves existing query parameters.
   * @param {string} url - The URL to fix
   * @param {string} [base] - Base URL for relative URLs
   * @returns {string|null} - Fixed URL or null if invalid/unchanged
   */
  const fixUrl = (url, base) => {
    try {
      const u = new URL(url, base || location.href);
      if (u.pathname === SUBS_PATH && u.searchParams.get(FLOW_PARAM) !== FLOW_VALUE) {
        u.searchParams.set(FLOW_PARAM, FLOW_VALUE);
        return u.href;
      }
      return null;
    } catch {
      return null;
    }
  };

  /**
   * Checks if a URL already has flow=1 parameter.
   * More reliable than string includes() which could match 'overflow=1'.
   * @param {string} url
   * @returns {boolean}
   */
  const hasFlowParam = (url) => FLOW_REGEX.test(url);

  // Store original history methods
  const origPush = history.pushState.bind(history);
  const origReplace = history.replaceState.bind(history);

  history.pushState = function(state, title, url) {
    if (url) {
      const fixed = fixUrl(url);
      if (fixed) url = fixed;
    }
    return origPush(state, title, url);
  };

  history.replaceState = function(state, title, url) {
    if (url) {
      const fixed = fixUrl(url);
      if (fixed) url = fixed;
    }
    return origReplace(state, title, url);
  };

  /**
   * Ensures the current URL has flow=1 if on subscriptions page.
   * Uses replaceState to avoid adding history entries.
   */
  const ensureFlowParam = () => {
    if (location.pathname !== SUBS_PATH) return;
    
    const fixed = fixUrl(location.href);
    if (fixed) {
      // Use empty string for title if document.title not yet available
      origReplace(history.state, document.title || '', fixed);
    }
  };

  /**
   * Patches subscription links within a given root element.
   * @param {Element|Document} [root=document]
   */
  const patchLinks = (root = document) => {
    const links = root.querySelectorAll(`a[href*="${SUBS_PATH}"]`);
    
    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href || hasFlowParam(href)) continue;
      
      const fixed = fixUrl(href, location.origin);
      if (fixed) {
        link.setAttribute('href', fixed);
      }
    }
  };

  // Debounce with requestIdleCallback for better performance
  let patchScheduled = false;
  const schedulePatch = () => {
    if (patchScheduled) return;
    patchScheduled = true;
    
    const doPatch = () => {
      patchScheduled = false;
      patchLinks();
    };
    
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(doPatch, { timeout: 200 });
    } else {
      setTimeout(doPatch, 100);
    }
  };

  // YouTube SPA navigation events
  document.addEventListener('yt-navigate-start', ensureFlowParam);
  document.addEventListener('yt-navigate-finish', () => {
    ensureFlowParam();
    patchLinks();
  });

  // Handle browser back/forward
  window.addEventListener('popstate', ensureFlowParam);

  // MutationObserver for dynamically added links
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          
          // Check if the node itself or its HTML contains subscription path
          // Using innerHTML check is faster than querySelector for detection
          const el = /** @type {Element} */ (node);
          if (el.tagName === 'A' && el.getAttribute('href')?.includes(SUBS_PATH)) {
            schedulePatch();
            return;
          }
          if (el.innerHTML?.includes(SUBS_PATH)) {
            schedulePatch();
            return;
          }
        }
      } else if (mutation.type === 'attributes') {
        const target = /** @type {Element} */ (mutation.target);
        if (target.tagName === 'A' && target.getAttribute('href')?.includes(SUBS_PATH)) {
          schedulePatch();
          return;
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href']
  });

  // Initial run
  ensureFlowParam();
  
  // Patch links once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', patchLinks, { once: true });
  } else {
    patchLinks();
  }
})();
