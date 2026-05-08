// requires getFilename defined before
// getFilename() -> { ..., filename_prefix }

function sanitizeFilename(name) {
  return name
    .replace(/[/\\:*?"<>|]/g, '_')  // illegal chars → underscore
    .replace(/\s+/g, ' ')           // collapse whitespace
    .trim()
    .slice(0, 200);
}

// GET_FILENAME_PREFIX -> response[{ filename }]
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== 'GET_FILENAME_PREFIX') return;

  const metadata = getMetadata();
  const raw = metadata.filename_prefix
  const filename_prefix = raw ? sanitizeFilename(raw) : null;

  console.debug('[MWRenamer] responding with filename_prefix:', filename_prefix);
  sendResponse({ filename_prefix });
});
