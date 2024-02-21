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

class AddMobInfo {
   mobInfo = {};
   mobStatTags = undefined;
   id = 0;
   divineDOM = undefined;

   constructor() {
      this.initAll();
   }

   async initAll() {
      this.initializeCSS();
      await this.initDivine();
      this.configureHTML();
      this.uploadFromDivine();

      this.getMobInfo();
      if (this.mobInfo === null) {
         return;
      }
      getLocalStorage().then(motr_settings => {
         for (let key in motr_settings) {
            let flag = motr_settings[key];
            if (flag) {
               switch (key) {
                  case 'ms_divine_pride':
                     this.change();
                     break;
               }
            }
         }
      });
   }

   static DecodeHTMLEntity(text) {
      return encodeURI(text.replaceAll(" ", "")).replaceAll("%A0", "").replaceAll("%C2", "").replaceAll("%0A", "");
   }

   uploadFromDivine() {
      let statsTable = undefined;
      let h3s = this.divineDOM.querySelectorAll("div[class*=col] > h3");
      for (let childTag of h3s[0].parentElement.children) {
         if (childTag.tagName === "DIV") {
            if (childTag.style.display !== "none") {
               statsTable = childTag.querySelector("tbody");
               break;
            }
         }
      }
      let trs = statsTable.children;
      let elementTable = undefined;
      for (let childTag of h3s[1].parentElement.children) {
         if (childTag.tagName === "DIV") {
            if (childTag.style.display !== "none") {
               elementTable = childTag.querySelector("tbody");
               break;
            }
         }
      }
      let statsMap = [
         [4, 0, 1, 3],
         [4, 1, 2, 3],
         [4, 2, 3, 3],
         [5, 0, 4, 3],
         [5, 1, 5, 3],
         [5, 2, 6, 3],
         [7, 0, 4, 1],
         [7, 1, 7, 1],
         [7, 2, 8, 1],
         [8, 0, 0, 4],
         [8, 1, 5, 1],
         [8, 2, 6, 1],
         [12, 0, 7, 3],
         [13, 0, 8, 3]
      ];
      for (let statsMapInfo of statsMap) {
         this.trs[statsMapInfo[2]].children[statsMapInfo[3]].innerText =
            AddMobInfo.DecodeHTMLEntity(trs[statsMapInfo[0]].children[statsMapInfo[1]].children[0].innerText);
      }
      for (let i = 0; i < elementTable.children.length; i++) {
         this.trs[i].children[5 + (i == 0 ? 1 : 0)].innerText = elementTable.children[i].children[1].innerText;
      }
   }

   async initDivine() {
      let idSplit = document.location.href.split("/");
      this.id = Number.parseInt(idSplit[idSplit.length - 1]);
      await fetch(`https://www.divine-pride.net/database/monster/${this.id}/`).then((res) => res.text()).then(text => {
         let domParser = new DOMParser();
         this.divineDOM = domParser.parseFromString(text, "text/html");
      });
   }

   configureHTML() {
      if (this.divineDOM === undefined) {
         return;
      }
      let tableBodyTag = document.querySelector(".alltext > .tableBord > tbody");
      let trs = tableBodyTag.children;
      this.trs = trs;
      for (let i = 0; i < 8; i++) {
         tableBodyTag.insertBefore(document.createElement("TR"), trs[trs.length - 1]);
      }
      let changeMap = [[1, 2, 2, 1], [1, 0, 2, 2], [0, 3, 2, 3]];
      let assetTD = [];
      for (let changeMapInfo of changeMap) {
         let tdMass = [];
         for (let j = 0; j < changeMapInfo[2]; j++) {
            tdMass.push(trs[changeMapInfo[0]].children[changeMapInfo[1] + j]);
         }
         assetTD.push(tdMass);
      }
      for (let changeMapInfo of changeMap) {
         for (let j = 0; j < changeMapInfo[2]; j++) {
            trs[changeMapInfo[0]].removeChild(trs[changeMapInfo[0]].children[changeMapInfo[1]]);
         }
      }
      for (let i = 0; i < changeMap.length; i++) {
         for (let appendTD of assetTD[i]) {
            trs[changeMap[i][3]].append(appendTD);
         }
      }
      trs[0].children[0].rowSpan = trs.length - 1;
      let maxOptions = 3;
      console.log("here");
      for (let i = 0; i < trs.length - 1; i++) {
         let count = Math.ceil((trs[i].children.length - (i == 0 ? 1 : 0)) / 2);
         for (let j = 0; j < maxOptions - count; j++) {
            let td_one = document.createElement("TD");
            let td_two = document.createElement("TD");
            td_one.classList.add("td_h1_left");
            td_two.classList.add("td_v1_left");
            trs[i].append(td_one, td_two);
         }
      }
      trs[trs.length - 1].children[0].colSpan = 7;
      let nameMap = [
         [4, 0, 'HP'],
         [5, 0, 'ATK'],
         [6, 0, 'MATK'],
         [7, 0, 'DEF'],
         [8, 0, 'MDEF'],
         [9, 0, '95%Flee'],
         [0, 3, 'Радиус'],
         [1, 2, 'STR'],
         [2, 2, 'AGI'],
         [3, 2, 'VIT'],
         [4, 2, 'INT'],
         [5, 2, 'DEX'],
         [6, 2, 'LUK'],
         [7, 2, 'Move Speed'],
         [8, 2, 'ASPD'],
         [9, 2, '100% Hit'],
         [0, 5, 'Нейтрал'],
         [1, 4, 'Вода'],
         [2, 4, 'Земля'],
         [3, 4, 'Огонь'],
         [4, 4, 'Ветер'],
         [5, 4, 'Яд'],
         [6, 4, 'Свет'],
         [7, 4, 'Тень'],
         [8, 4, 'Призрачн'],
         [9, 4, 'Нежить']
      ];
      for (let nameMapInfo of nameMap) {
         trs[nameMapInfo[0]].children[nameMapInfo[1]].innerText = nameMapInfo[2];
      }
   }

   initializeCSS() {
      document.styleSheets[0].insertRule(`
         @keyframes motrSettingsNewPulse {
            50% { background: #E2AEE4;}
         }
      `);
      document.styleSheets[0].insertRule(`
         .motrSettings-newPulse {
            animation: motrSettingsNewPulse ease-in 0.75s normal;
         }
      `);
   }

   getMobInfo() {
      let mobStatBodyTag = document.querySelector("table.tableBord > tbody");
      if (mobStatBodyTag === null) {
         this.mobInfo = null;
         return;
      }
      let mobStatTags = {
         bLvl: mobStatBodyTag.querySelector("tr:nth-child(1) td:nth-child(3)"),
         size: mobStatBodyTag.querySelector("tr:nth-child(2) td:nth-child(2)"),
         race: mobStatBodyTag.querySelector("tr:nth-child(3) td:nth-child(2)"),
         element: mobStatBodyTag.querySelector("tr:nth-child(4) td:nth-child(2)"),
         hp: mobStatBodyTag.querySelector("tr:nth-child(5) td:nth-child(2)"),
         atk: mobStatBodyTag.querySelector("tr:nth-child(6) td:nth-child(2)"),
         matk: mobStatBodyTag.querySelector("tr:nth-child(7) td:nth-child(2)"),
         def: mobStatBodyTag.querySelector("tr:nth-child(8) td:nth-child(2)"),
         mdef: mobStatBodyTag.querySelector("tr:nth-child(9) td:nth-child(2)"),
         radius: mobStatBodyTag.querySelector("tr:nth-child(1) td:nth-child(5)"),
         str: mobStatBodyTag.querySelector("tr:nth-child(2) td:nth-child(4)"),
         agi: mobStatBodyTag.querySelector("tr:nth-child(3) td:nth-child(4)"),
         vit: mobStatBodyTag.querySelector("tr:nth-child(4) td:nth-child(4)"),
         int: mobStatBodyTag.querySelector("tr:nth-child(5) td:nth-child(4)"),
         dex: mobStatBodyTag.querySelector("tr:nth-child(6) td:nth-child(4)"),
         luk: mobStatBodyTag.querySelector("tr:nth-child(7) td:nth-child(4)"),
         mSpeed: mobStatBodyTag.querySelector("tr:nth-child(8) td:nth-child(4)"),
         aspd: mobStatBodyTag.querySelector("tr:nth-child(9) td:nth-child(4)"),
         resists: {
            neutral: mobStatBodyTag.querySelector("tr:nth-child(1) td:nth-child(7)"),
            water: mobStatBodyTag.querySelector("tr:nth-child(2) td:nth-child(6)"),
            earth: mobStatBodyTag.querySelector("tr:nth-child(3) td:nth-child(6)"),
            fire: mobStatBodyTag.querySelector("tr:nth-child(4) td:nth-child(6)"),
            wind: mobStatBodyTag.querySelector("tr:nth-child(5) td:nth-child(6)"),
            poison: mobStatBodyTag.querySelector("tr:nth-child(6) td:nth-child(6)"),
            holy: mobStatBodyTag.querySelector("tr:nth-child(7) td:nth-child(6)"),
            dark: mobStatBodyTag.querySelector("tr:nth-child(8) td:nth-child(6)"),
            ghost: mobStatBodyTag.querySelector("tr:nth-child(9) td:nth-child(6)"),
            undead: mobStatBodyTag.querySelector("tr:nth-child(10) td:nth-child(6)"),
         }
      };
      this.mobStatBodyTag = mobStatBodyTag;
      this.mobStatTags = mobStatTags;

      ["bLvl", "hp", "radius", "str", "agi", "vit",
         "int", "dex", "luk"
      ].forEach((key) => {
         this.mobInfo[key] = Number.parseInt(mobStatTags[key].innerText);
      });

      ["mSpeed", "aspd"].forEach((key) => {
         this.mobInfo[key] = Number.parseFloat(mobStatTags[key].innerText.replaceAll(",", "."));
      });

      ["race", "size"].forEach((key) => {
         this.mobInfo[key] = mobStatTags[key].innerText;
      });

      let elem = mobStatTags.element.innerText.split(' ');
      this.mobInfo.element = { type: elem[0], lvl: Number.parseInt(elem[1]) };

      ["atk", "matk"].forEach((key) => {
         let double = mobStatTags[key].innerText.split(" - ");
         this.mobInfo[key] = {};
         this.mobInfo[key].min = Number.parseInt(double[0]);
         this.mobInfo[key].max = Number.parseInt(double[1]);
      });

      this.mobInfo.resists = {};
      for (let key in mobStatTags.resists) {
         let percents = Number.parseInt(mobStatTags.resists[key].innerText.replace("%", ""));
         this.mobInfo.resists[key] = percents / 100.0;
      }
   }

   change() {
      this.mobInfo.superFlee = 170 + this.mobInfo.bLvl + this.mobInfo.dex + Math.floor(this.mobInfo.luk / 3.0);
      this.mobInfo.superHit = 200 + this.mobInfo.bLvl + this.mobInfo.agi + Math.floor(this.mobInfo.luk / 3.0);

      this.trs[9].children[1].classList.add("motrSettings-newPulse");
      this.trs[9].children[3].classList.add("motrSettings-newPulse");
      this.trs[9].children[1].innerText = this.mobInfo.superFlee;
      this.trs[9].children[3].innerText = this.mobInfo.superHit;
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let mobInfo = new AddMobInfo();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let mobInfo = new AddMobInfo();
   });
}