// service-worker.js
const INITIATING_ORIGINS   = ['https://makerworld.com', 'https://www.printables.com'];

function tabInOrigins(tab, origins) {
  return (origins.some(o => tab.url?.startsWith(o)))
}

// Identify the source page initiating the download by
// tracking the most recently active tab.

let lastActiveTabId = null;

// Focusing a tracked domain
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError) return;
    if (tabInOrigins(tab, INITIATING_ORIGINS)) {
      lastActiveTabId = tabId;
    }
  });
});

// Leaving a tracked domain
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === lastActiveTabId && !tabInOrigins(tab, INITIATING_ORIGINS)) {
    lastActiveTabId = null;
  }
});

// Closing a tab
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === lastActiveTabId) lastActiveTabId = null;
});

// Actual hook to suggest alternate filename

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  if (!lastActiveTabId) {
    // console.debug('[MWRenamer] no active makerworld.com tab — skipping rename');
    suggest();
    return;
  }

  const tabId = lastActiveTabId;

  // GET_FILENAME_PREFIX -> response[{ filename_prefix }]
  chrome.tabs.sendMessage(tabId, { type: 'GET_FILENAME_PREFIX' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('[MWRenamer] could not reach content script:', chrome.runtime.lastError.message);
      suggest();
      return;
    }

    const filename_prefix = response?.filename_prefix;

    if (!filename_prefix) {
      console.error('[MWRenamer] content script response contained no filename_prefix — skipping rename', response);
      suggest();
      return;
    }

    const newFilename = `${filename_prefix} ${downloadItem.filename}`;

    console.debug('[MWRenamer] renaming download to:', newFilename);

    suggest({
      filename: newFilename,
      conflictAction: 'uniquify',
    });
  });

  return true; // suggest() will be called asynchronously
});

