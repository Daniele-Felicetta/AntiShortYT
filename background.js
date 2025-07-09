chrome.webNavigation.onCompleted.addListener(({ tabId, url }) => {
  if (url.includes("youtube.com/shorts")) {
    chrome.tabs.update(tabId, { url: "https://www.youtube.com/" });
  }
});
