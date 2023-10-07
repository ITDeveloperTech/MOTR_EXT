

chrome.tabs.onUpdated.addListener(
   (tabId, changeInfo, tab) =>
   {
      if (changeInfo.status != undefined) {
         if (changeInfo.status == "complete") {
            console.log("Загрузка завершена");
            console.log(tab);
            if (tab.url.indexOf("https://motr-online.com/database/monsters/") >= 0) {
               chrome.scripting.executeScript(
               {
                  target: {tabId: tabId},
                  files: ["js/back/addMobsInfo.js"]
               });
            }
         }
      }
   }
);