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
   }

   funcMatcher(href, func) {
      if (document.location.href.indexOf(href) >= 0) {
         func.call();
      }
   }

   replaceMob() {
      let mobTdTag = document.querySelector("table.tableBord > tbody > tr:nth-child(2) > td:nth-child(1)");
      if (mobTdTag !== null) {
         if (mobTdTag.childNodes[0].nodeType == 3) {
            let image = createTag("img", [], []);
            let splits = document.location.href.split("/");
            let id = splits[splits.length - 1];
            image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
            image.onerror = (event) => { event.onerror = undefined; event.target.src = "https://static.divine-pride.net/images/mobs/png/" + id + ".png" };
            image.alt = document.querySelector("table.tableBord > tbody > tr:nth-child(1) > td:nth-child(1)").innerText;
            mobTdTag.replaceChild(image, mobTdTag.childNodes[0]);
         } else if (mobTdTag.children[0].tagName == "IMG") {
            let image = mobTdTag.children[0];
            let splits = document.location.href.split("/");
            let id = splits[splits.length - 1];
            image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
            image.onerror = (event) => { event.onerror = undefined; event.target.src = "https://static.divine-pride.net/images/mobs/png/" + id + ".png" };
         }
      }

      let dropItemsTag = document.querySelectorAll("table.tabl1:nth-child(1) td:nth-child(1) > a.alllink");
      for (let imgTag of dropItemsTag) {
         let splashes_split = imgTag.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
         image.alt = imgTag.innerText;
         image.style.verticalAlign = "middle";
         let td = imgTag.parentElement;
         td.replaceChild(image, imgTag);
      }
   }

   replaceVending() {
      let imgTags = document.querySelectorAll("table.tableBord td > img, table.tableBord td > a > img");
      for (let imgTag of imgTags) {
         let splashes_split = imgTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1].split(".")[0];
         imgTag.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
         imgTag.style.verticalAlign = "middle";
      }
   }

   replaceQuickSearch() {
      let allTables = document.querySelectorAll(".mainItemCell > table table");
      if (allTables.length < 2) {
         return;
      }
      let imgTags = allTables[1].querySelectorAll("tbody > tr a > img");
      for (let imgTag of imgTags) {
         let splashes_split = imgTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1].split(".")[0];
         if (imgTag.src.indexOf("/item") >= 0) {
            imgTag.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
         } else if (imgTag.src.indexOf("/monster") >= 0) {
            imgTag.src = "https://db.irowiki.org/image/monster/" + id + ".png";
            imgTag.onerror = (event) => { event.onerror = undefined; event.target.src = "https://static.divine-pride.net/images/mobs/png/" + id + ".png" };
         }
         imgTag.style.verticalAlign = "middle";
      }
   }

   replaceItem() {
      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td");
      if (itemImageTag !== null) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         if (itemImageTag.children[0].tagName == "IMG") {
            let image = itemImageTag.children[0];
            if (image.src.indexOf("card") >= 0) {
               image.src = "https://static.divine-pride.net/images/items/cards/" + id + ".png";
            } else {
               image.src = "https://www.divine-pride.net/img/items/collection/iRO/" + id;
            }
         } else {
            let image = createTag("img", [], []);
            if (itemImageTag.innerText.indexOf("Карта ") == 0) {
               image.src = "https://static.divine-pride.net/images/items/cards/" + id + ".png";
            } else {
               image.src = "https://www.divine-pride.net/img/items/collection/iRO/" + id;
            }
            image.alt = itemImageTag.innerText;
            image.style.verticalAlign = "middle";
            itemImageTag.replaceChild(image, itemImageTag.childNodes[0]);
         }
      }

      let itemImageTags = document.querySelectorAll("td > table.tabl1 > tbody > tr > td:nth-child(1) > a.alllink");
      for (let itemImageTag of itemImageTags) {
         let splashes_split = itemImageTag.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
         image.onerror = (event) => { event.onerror = undefined; event.target.src = "https://static.divine-pride.net/images/mobs/png/" + id + ".png" };
         image.alt = itemImageTag.innerText;
         image.style.maxWidth = "48";
         image.style.maxHeight = "48";
         image.style.verticalAlign = "middle";
         itemImageTag.replaceChild(image, itemImageTag.childNodes[0]);
         let td = itemImageTag.parentElement;
         td.style.height = "50";
      }
   }

   replaceMap() {
      let mob_mapsImgTags = document.querySelectorAll("table.tabl1 > tbody > tr > td > img");
      for (let mob_mapTag of mob_mapsImgTags) {
         let splashes_split = mob_mapTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1];
         if (mob_mapTag.src.indexOf("/monster") >= 0) {
            mob_mapTag.src = "https://db.irowiki.org/image/monster/" + id;
            mob_mapTag.onerror = (event) => { event.onerror = undefined; event.target.src = "https://static.divine-pride.net/images/mobs/png/" + id };
            mob_mapTag.style.maxWidth = "50";
            mob_mapTag.style.maxHeight = "50";
         } else {
            mob_mapTag.src = "https://www.divine-pride.net/img/map/original/" + id.split(".")[0];
            mob_mapTag.style.maxWidth = "100";
            mob_mapTag.style.maxHeight = "100";
         }
         mob_mapTag.style.verticalAlign = "middle";
      }

      let mainMapImgTag = document.querySelector("div[align=center] div[align=center] > table > tbody > tr > td:nth-child(2) img");
      if (mainMapImgTag !== null) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         mainMapImgTag.src = "https://www.divine-pride.net/img/map/original/" + id;
         mainMapImgTag.parentElement.style.verticalAlign = "top";
      }
   }

   replaceCharItems() {
      let imgTags = document.querySelectorAll(".top2 td img, .top1 td img");
      for (let imgTag of imgTags) {
         let splits = imgTag.src.split("/");
         let id = splits[splits.length - 1].split(".")[0];
         imgTag.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
      }
   }

   replaceEquip() {
      let imgTags = document.querySelectorAll("table.tableBord td[align=left] img");
      for (let imgTag of imgTags) {
         let splits = imgTag.src.split("/");
         let id = splits[splits.length - 1].split(".")[0];
         imgTag.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
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