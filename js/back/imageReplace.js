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

async function getLocalStorage() {
   let obj = await chrome.storage.local.get("motr_settings");
   return obj.motr_settings;
}

class ImageReplacer {
   funcsMap = undefined;
   constructor() {
      this.mapGenerator();
      getLocalStorage().then(motr_settings => {
         if (motr_settings["ms_image_replace"]) {
            for (let [key, value] of this.funcsMap) {
               this.funcMatcher(key, value);
            }
         }
      });
   }

   mapGenerator() {
      this.funcsMap = new Map();
      this.funcsMap.set("motr-online.com/database/monsters/", this.replaceMob);
      this.funcsMap.set("motr-online.com/members/vendingstat", this.replaceVending);
      this.funcsMap.set("motr-online.com/database/quicksearch", this.replaceQuickSearch);
      this.funcsMap.set("motr-online.com/database/items/", this.replaceItem);
      this.funcsMap.set("motr-online.com/database/cards/", this.replaceItem);
      this.funcsMap.set("motr-online.com/database/wearables/", this.replaceItem);
      this.funcsMap.set("motr-online.com/database/maps/", this.replaceMap);
      this.funcsMap.set("motr-online.com/members/charinfo/invertory/", this.replaceCharItems);
      this.funcsMap.set("motr-online.com/members/charinfo/equip/", this.replaceEquip);
      this.funcsMap.set("motr-online.com/database/skills/", this.replaceSkill);
      this.funcsMap.set("motr-online.com/members/charinfo/skills/", this.replaceCharSkill);
   }

   funcMatcher(href, func) {
      if (document.location.href.indexOf(href) >= 0) {
         func.call();
      }
   }

   replaceMob() {
      let mobTdTag = document.querySelector("table.tableBord > tbody > tr:nth-child(1) > td:nth-child(1) > img");
      if (mobTdTag !== null) {
         mobTdTag.src = mobTdTag.src.replace("dbpic/", "dbpic_/").replace("%20%20alt=", "");
      }

      let dropItemsTag = document.querySelectorAll("table.tabl1:nth-child(1) td:nth-child(1) > a.alllink2 > img");
      for (let imgTag of dropItemsTag) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }

   replaceVending() {
      let imgTags = document.querySelectorAll("table.tableBord td > img, table.tableBord td > a > img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }

   replaceQuickSearch() {
      let allTables = document.querySelectorAll(".mainItemCell > table table");
      if (allTables.length < 2) {
         return;
      }
      let imgTags = allTables[1].querySelectorAll("tbody > tr a > img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").replace("%20%20alt=", "");
      }
      if (imgTags.length == 0) {
         imgTags = allTables[1].querySelectorAll("tbody > tr td.td_h1_center > img");
         for (let imgTag of imgTags) {
            imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/");
         }
      }
   }

   replaceItem() {
      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td > img");
      if (itemImageTag !== null) {
         itemImageTag.src = itemImageTag.src.replace("dbpic/", "dbpic_/").replace("%20%20alt=", "");
      }

      let itemImageTags = document.querySelectorAll("a.alllink2 > img");
      for (let itemImageTag of itemImageTags) {
         itemImageTag.src = itemImageTag.src.replace("dbpic/", "dbpic_/");
      }
   }

   replaceMap() {
      let mob_mapsImgTags = document.querySelectorAll("table.tabl1 > tbody > tr > td > img");
      for (let mob_mapTag of mob_mapsImgTags) {
         let splashes_split = mob_mapTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1];
         if (mob_mapTag.src.indexOf("/monster") >= 0) {
            mob_mapTag.src = mob_mapTag.src.replace("dbpic/", "dbpic_/");
            mob_mapTag.style.maxWidth = "50";
            mob_mapTag.style.maxHeight = "50";
         } else {
            mob_mapTag.src = mob_mapTag.src.replace("dbpic/", "dbpic_/");
            mob_mapTag.style.maxWidth = "100";
            mob_mapTag.style.maxHeight = "100";
         }
         mob_mapTag.style.verticalAlign = "middle";
      }

      let mainMapImgTag = document.querySelector("div[align=center] div[align=center] > table > tbody > tr > td:nth-child(2) img");
      if (mainMapImgTag !== null) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         mainMapImgTag.src = mainMapImgTag.src.replace("dbpic/", "dbpic_/");
         mainMapImgTag.parentElement.style.verticalAlign = "top";
      }
   }

   replaceCharItems() {
      let imgTags = document.querySelectorAll(".top2 td img, .top1 td img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }

   replaceEquip() {
      let imgTags = document.querySelectorAll("table.tableBord td[align=left] img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }

   replaceSkill() {
      let imgTags = document.querySelectorAll("table.tabl1 td > img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }

   replaceCharSkill() {
      let imgTags = document.querySelectorAll("table.tableBord td > img");
      for (let imgTag of imgTags) {
         imgTag.src = imgTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
      }
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let replace = new ImageReplacer();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let replace = new ImageReplacer();
   });
}