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
   constructor() {
      getLocalStorage().then(motr_settings => {
         if (motr_settings["ms_image_replace"]) {
            if (document.location.href.indexOf("https://motr-online.com/database/monsters/") >= 0) {
               this.replaceMob();
            }
         }
         if (document.location.href.indexOf("https://motr-online.com/members/vendingstat") >= 0) {
            this.replaceVending();
         }
         if (document.location.href.indexOf("https://motr-online.com/database/quicksearch") >= 0) {
            this.replaceQuickSearch();
         }
         if (document.location.href.indexOf("https://motr-online.com/database/items/") >= 0) {
            this.replaceItem();
         }
         if (document.location.href.indexOf("https://motr-online.com/database/maps/") >= 0) {
            this.replaceMap();
         }
         if (document.location.href.indexOf("https://motr-online.com/database/cards/") >= 0) {
            this.replaceCard();
         }
         if (document.location.href.indexOf("https://motr-online.com/database/wearables/") >= 0) {
            this.replaceWearable();
         }
      });
   }

   replaceMob() {
      let mobTdTag = document.querySelector("table.tableBord > tbody > tr:nth-child(2) > td:nth-child(1)");
      if (mobTdTag.childNodes[0].nodeType == 3) {
         let image = createTag("img", [], []);
         let id = Number.parseInt(document.location.href.replace("https://motr-online.com/database/monsters/", ""));
         image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
         image.alt = document.querySelector("table.tableBord > tbody > tr:nth-child(1) > td:nth-child(1)").innerText;
         mobTdTag.removeChild(mobTdTag.childNodes[0]);
         mobTdTag.appendChild(image);
      }

      let dropItemsTag = document.querySelector("#drop_mode_text").nextElementSibling.nextElementSibling.querySelectorAll("table > tbody > tr > td.td_v1_center:nth-child(1)");
      let tdName = undefined;
      for (let td of dropItemsTag) {
         if (td.children[0].tagName == "A") {
            let splashes_split = td.children[0].href.split("/");
            let id = splashes_split[splashes_split.length - 1];
            let image = createTag("img", [], []);
            image.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
            image.alt = td.children[0].innerText;
            td.removeChild(td.children[0]);
            td.appendChild(image);
         }
         tdName = td;
      }

      if (tdName.nextElementSibling.innerText.indexOf("Карта") >= 0) {
         let linkTag = tdName.nextElementSibling.children[0];
         if (linkTag.tagName == "A") {
            linkTag.href = linkTag.href.replace("/items", "/cards");
         }
      }
   }

   replaceVending() {
      let imgTags = document.querySelectorAll("table.tableBord td > img, table.tableBord td > a > img");
      for (let imgTag of imgTags) {
         let td = imgTag.parentElement;
         let splashes_split = imgTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1].split(".")[0];
         let image = createTag("img", [], []);
         image.src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
         image.alt = td.children[0].innerText;
         td.replaceChild(image, imgTag);
      }
   }

   replaceQuickSearch() {
      if (document.querySelector("h4").parentElement.querySelectorAll("table")[1] === undefined) {
         return;
      }
      let imgTags = document.querySelector("h4").parentElement.querySelectorAll("table")[1].querySelectorAll("tbody > tr a > img");
      for (let imgTag of imgTags) {
         let td = imgTag.parentElement;
         let splashes_split = imgTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1].split(".")[0];
         let src = ""
         if (imgTag.src.indexOf("/item") >= 0) {
            src = "https://www.divine-pride.net/img/items/item/iRO/" + id;
         } else if (imgTag.src.indexOf("/monster") >= 0) {
            src = "https://db.irowiki.org/image/monster/" + id + ".png";
         }
         let image = createTag("img", [], []);
         image.src = src;
         image.alt = td.children[0].innerText;
         td.replaceChild(image, imgTag);
      }
   }

   replaceItem() {
      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td");
      if (itemImageTag !== undefined) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://www.divine-pride.net/img/items/collection/iRO/" + id;
         image.alt = itemImageTag.innerText;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }

      let itemImageTags = document.querySelectorAll("td > table.tabl1 > tbody > tr > td:nth-child(1) > a.alllink");
      for (let itemImageTag of itemImageTags) {
         let td = itemImageTag.parentElement;
         let splashes_split = itemImageTag.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
         image.height = 48;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }
   }

   replaceMap() {
      let mobImageTags = document.querySelectorAll("table.tabl1 > tbody > tr > td > img");
      for (let mobImageTag of mobImageTags) {
         let td = mobImageTag.parentElement;
         let splashes_split = mobImageTag.src.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         if (mobImageTag.src.indexOf("/monster") >= 0) {
            image.src = "https://db.irowiki.org/image/monster/" + id;
         } else {
            image.src = "https://www.divine-pride.net/img/map/original/" + id.split(".")[0];
         }
         image.style.maxHeight = "160";
         td.replaceChild(image, mobImageTag);
      }


      let divAlignTag = document.querySelectorAll("table.tabl1")[0].parentElement.nextElementSibling.children[0];
      let td = divAlignTag.parentElement;
      let splashes_split = document.location.href.split("/");
      let id = splashes_split[splashes_split.length - 1];
      let image = createTag("img", [], []);
      image.src = "https://www.divine-pride.net/img/map/original/" + id;
      td.replaceChild(image, divAlignTag);
      td.style.verticalAlign = "top";
   }

   replaceCard() {
      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td");
      if (itemImageTag !== undefined) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://static.divine-pride.net/images/items/cards/" + id + ".png";
         image.alt = itemImageTag.innerText;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }

      let itemImageTags = document.querySelectorAll("td > table.tabl1 > tbody > tr > td:nth-child(1) > a.alllink");
      for (let itemImageTag of itemImageTags) {
         let td = itemImageTag.parentElement;
         let splashes_split = itemImageTag.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
         image.height = 48;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }
   }

   replaceWearable() {
      let itemImageTag = document.querySelector("table.tabl1 > tbody > tr:nth-child(2) > td");
      if (itemImageTag !== undefined) {
         let splashes_split = document.location.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://www.divine-pride.net/img/items/collection/iRO/" + id;
         image.alt = itemImageTag.innerText;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }

      let itemImageTags = document.querySelectorAll("td > table.tabl1 > tbody > tr > td:nth-child(1) > a.alllink");
      for (let itemImageTag of itemImageTags) {
         let td = itemImageTag.parentElement;
         let splashes_split = itemImageTag.href.split("/");
         let id = splashes_split[splashes_split.length - 1];
         let image = createTag("img", [], []);
         image.src = "https://db.irowiki.org/image/monster/" + id + ".png";
         image.height = 48;
         itemImageTag.innerHTML = "";
         itemImageTag.appendChild(image);
      }
   }
}

if (document.readyState == "complete") {
   let replace = new ImageReplacer();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let replace = new ImageReplacer();
   });
}