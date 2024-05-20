chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ name: "Jack" });
});

chrome.storage.local.get("name", (data) => {});

const enURL = "https://astronize.com/market";
const thURL = "https://astronize.com/th/market";
const injectedTabs = new Set();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    if (tab.url && (tab.url.includes(enURL) || tab.url.includes(thURL))) {
      if (!injectedTabs.has(tabId)) {
        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            files: ["./foreground.js"],
          })
          .then(() => {
            console.log("injected");
            injectedTabs.add(tabId);
          })
          .catch((err) => console.log(err));
      }
    }
  }

  if (
    changeInfo.url &&
    (changeInfo.url.includes(enURL) || changeInfo.url.includes(thURL))
  ) {
    chrome.tabs.reload(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading" && !changeInfo.url) {
    injectedTabs.delete(tabId);
  }
});
