function createTag(tagName, tagClasses, inner) {
   let tag = document.createElement(tagName);
   tagClasses.forEach((tagClass) => {
      tag.classList.add(tagClass);
   });
   inner.forEach((innerElement) => {
      if (typeof (innerElement) == "string") {
         tag.innerHTML = inner;
      } else {
         tag.appendChild(innerElement);
      }
   });
   return tag;
}

async function fetch_query(href) {
   return await fetch(href).then(res => res.text()).then(text => {
      if (text.length < 10) {
         return null;
      }
      let dom_parser = new DOMParser();
      return dom_parser.parseFromString(text, "text/html");
   });
}

function show_popup(desc) {
   clearInterval(window.popupTimeout);
   let popup_container = document.querySelector(".popup-container");
   popup_container.classList.add("show");
   popup_container.innerText = desc;
   window.popupTimeout = setTimeout(() => {
      document.querySelector(".popup-container").classList.remove("show");
   }, 1500);
}

async function getLocalStorage() {
   let obj = await chrome.storage.local.get("motr_settings");
   return obj.motr_settings;
}

class DevToolItemID {
   funcsMap = undefined;
   constructor() {
      this.mapGenerator();
      getLocalStorage().then(motr_settings => {
         if (motr_settings["ms_dev_items_id"]) {
            for (let [key, value] of this.funcsMap) {
               this.funcMatcher(key, value);
            }
         }
      });
   }

   mapGenerator() {
      this.funcsMap = new Map();
      this.funcsMap.set("motr-online.com/database/quicksearch", this.replaceQuickSearch);
      this.funcsMap.set("motr-online.com/database/items/", this.replaceItem);
      this.funcsMap.set("motr-online.com/database/cards/", this.replaceItem);
      this.funcsMap.set("motr-online.com/database/wearables/", this.replaceItem);
   }

   funcMatcher(href, func) {
      if (document.location.href.indexOf(href) >= 0) {
         func.call();
      }
   }

   replaceQuickSearch() {
      document.addEventListener("keyup", (event) => {
         if (event.code == "KeyZ" && event.ctrlKey) {
            if (window.MOTRDEV !== undefined) {
               if (window.MOTRDEV.itemID === true) {
                  return;
               }
            }
            let allTables = document.querySelectorAll(".mainItemCell > table table");
            if (allTables.length < 2) {
               return;
            }
            let needTable = allTables[1].querySelector("tbody");
            let tableType = needTable.children[0].children[1].innerText;
            if (tableType !== "Вес") {
               return;
            }

            for (let i = 0; i < Math.ceil(needTable.children.length / 2); i++) {
               needTable.children[i * 2].addEventListener("click", async (event) => {
                  let aTag = event.target.querySelector("a");
                  if (aTag !== null) {
                     let aTagSplit = aTag.href.split("/");
                     let itemIDLink = aTagSplit[aTagSplit.length - 1];
                     let itemDOM = await fetch_query(`https://motr-online.com/database/items/${itemIDLink}`);

                     let itemTable = itemDOM.querySelector(".tabl1 tbody");
                     if (itemTable !== null) {
                        let itemName = itemTable.children[0].children[0].innerText;

                        let lastTR = itemTable.children[itemTable.children.length - 1];
                        let lastTD = lastTR.children[lastTR.children.length - 1];
                        let allSpans = lastTD.children;
                        let itemID = undefined;
                        for (let span of allSpans) {
                           if (span.innerText.indexOf('Англ: ') >= 0) {
                              itemID = span.nextElementSibling.innerText;
                              break;
                           }
                        }

                        let itemITEMID = itemIDLink;
                        window.navigator.clipboard.writeText([
                           `{`,
                           `\t"type": "item",`,
                           `\t"name": "${itemName}",`,
                           `\t"id": "${itemID.replaceAll(" ", "_").toLowerCase()}",`,
                           `\t"item_id": ${itemITEMID}`,
                           `}`
                        ].join("\n"));
                        show_popup("ITEM ID Скопирован в буфер обмена");
                     }
                  }
               }, 1);
            }
            show_popup("Добавлены Слушатели для ITEM ID");
         }
      });
   }

   replaceItem() {
      document.addEventListener("keyup", (event) => {
         if (event.code == "KeyZ" && event.ctrlKey) {
            let itemTable = document.querySelector(".tabl1 tbody");
            if (itemTable !== null) {
               let itemName = itemTable.children[0].children[0].innerText;

               let lastTR = itemTable.children[itemTable.children.length - 1];
               let lastTD = lastTR.children[lastTR.children.length - 1];
               let allSpans = lastTD.children;
               let itemID = undefined;
               for (let span of allSpans) {
                  if (span.innerText.indexOf('Англ: ') >= 0) {
                     itemID = span.nextElementSibling.innerText;
                     break;
                  }
               }

               let linkSplit = document.location.href.split("/");
               let itemITEMID = linkSplit[linkSplit.length - 1];
               window.navigator.clipboard.writeText([
                  `{`,
                  `\t"type": "item",`,
                  `\t"name": "${itemName}",`,
                  `\t"id": "${itemID.replaceAll(" ", "_").toLowerCase()}",`,
                  `\t"item_id": ${itemITEMID}`,
                  `}`
               ].join("\n"));
               show_popup("ITEM ID Скопирован в буфер обмена");
            }
         }
      });

      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td > img");
      if (itemImageTag !== null) {
         itemImageTag.src = itemImageTag.src.replace("dbpic/", "dbpic_/").replace("%20%20alt=", "");
      }

      let itemImageTags = document.querySelectorAll("a.alllink2 > img");
      for (let itemImageTag of itemImageTags) {
         itemImageTag.src = itemImageTag.src.replace("dbpic/", "dbpic_/");
      }
   }
}

document.styleSheets[0].insertRule(`
   .popup-container {
      font-family: Tahoma, Verdana, Arial, Helvetica, sans-serif;
      position:fixed;
      padding: 5px;
      border-radius: 5px;
      background: #e2c6a5;
      border: 1px solid #917657;
      height: 25px;
      transition: transform 0.3s ease-out;
      display: inline-flex;
      align-items: center;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, 100%);
      z-index: 20;
   }
`);
document.styleSheets[0].insertRule(`
   .popup-container.show {
      transform: translate(-50%, -15px);
   }
`);

if (document.querySelector(".popup-container") === null) {
   let popup_container = document.createElement("div");
   popup_container.classList.add("popup-container");
   document.body.append(popup_container);
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let replace = new DevToolItemID();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let replace = new DevToolItemID();
   });
}

