async function getLocalStorage() {
   let obj = await chrome.storage.local.get("motr_settings");
   return obj.motr_settings;
}

chrome.tabs.onUpdated.addListener(
   async (tabId, changeInfo, tab) => {
      await chrome.tabs.query({active: true, lastFocusedWindow: true}).then(result => console.log(result));
      console.log(changeInfo);
      if (changeInfo.status != undefined) {
         if (changeInfo.status == "loading") {
            if ((tab.url.indexOf("https://motr-online.com/database/monsters/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/monsters/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/members/vendingstat") >= 0) || (tab.url.indexOf("http://motr-online.com/members/vendingstat")) >= 0) {
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
                        case "ms_vending_navi_clipboard":
                           chrome.scripting.executeScript(
                              {
                                 target: { tabId: tabId },
                                 files: ["js/back/vendingInfo.js"]
                              });
                        break;
                     }
                  }
               });
            }
            if ((tab.url.indexOf("https://motr-online.com/database/quicksearch") >= 0) || (tab.url.indexOf("http://motr-online.com/database/quicksearch") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/database/items/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/items/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/database/maps/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/maps/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/database/cards/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/cards/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/database/wearables/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/wearables/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/members/charinfo/invertory/") >= 0) || (tab.url.indexOf("http://motr-online.com/members/charinfo/invertory/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/members/charinfo/equip/") >= 0) || (tab.url.indexOf("http://motr-online.com/members/charinfo/equip/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/database/skills/") >= 0) || (tab.url.indexOf("http://motr-online.com/database/skills/") >= 0)) {
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
            if ((tab.url.indexOf("https://motr-online.com/members/charinfo/skills/") >= 0) || (tab.url.indexOf("http://motr-online.com/members/charinfo/skills/") >= 0)) {
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