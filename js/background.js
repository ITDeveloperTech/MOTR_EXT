async function getLocalStorage() {
   let obj = await chrome.storage.local.get("motr_settings");
   return obj.motr_settings;
}

chrome.tabs.onUpdated.addListener(
   (tabId, changeInfo, tab) => {
      if (changeInfo.status != undefined) {
         if (changeInfo.status == "complete") {
            if (tab.url.indexOf("https://motr-online.com/database/monsters/") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_mobs_info":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/addMobsInfo.js"]
                              });
                        break;
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if (tab.url.indexOf("https://motr-online.com/members/vendingstat") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if (tab.url.indexOf("https://motr-online.com/database/quicksearch") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if (tab.url.indexOf("https://motr-online.com/database/items/") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if (tab.url.indexOf("https://motr-online.com/database/maps/") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if (tab.url.indexOf("https://motr-online.com/database/cards/") >= 0) {
               getLocalStorage().then(result => {
                  for(let key in result) {
                     if (!result[key]) {
                        continue;
                     }
                     switch (key) {
                        case "ms_image_replace":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/imageReplace.js"]
                              });
                        break;
                     }
                  }
               });
            }
         }
      }
   }
);