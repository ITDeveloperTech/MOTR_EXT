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

   constructor() {
      this.initializeCSS();
      this.getMobInfo();
      if (this.mobInfo === null) {
         return;
      }
      getLocalStorage().then(motr_settings => {
         for (let key in motr_settings) {
            let flag = motr_settings[key];
            if (flag) {
               switch (key) {
                  case 'ms_mobs_info':
                     this.change();
                     break;
               }
            }
         }
      });
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
         exp: mobStatBodyTag.querySelector("tr:nth-child(10) td:nth-child(2)"),
         radius: mobStatBodyTag.querySelector("tr:nth-child(1) td:nth-child(5)"),
         str: mobStatBodyTag.querySelector("tr:nth-child(2) td:nth-child(4)"),
         agi: mobStatBodyTag.querySelector("tr:nth-child(3) td:nth-child(4)"),
         vit: mobStatBodyTag.querySelector("tr:nth-child(4) td:nth-child(4)"),
         int: mobStatBodyTag.querySelector("tr:nth-child(5) td:nth-child(4)"),
         dex: mobStatBodyTag.querySelector("tr:nth-child(6) td:nth-child(4)"),
         luk: mobStatBodyTag.querySelector("tr:nth-child(7) td:nth-child(4)"),
         mSpeed: mobStatBodyTag.querySelector("tr:nth-child(8) td:nth-child(4)"),
         jExp: mobStatBodyTag.querySelector("tr:nth-child(10) td:nth-child(4)"),
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
         "int", "dex", "luk", "mSpeed", "exp", "jExp"
      ].forEach((key) => {
         this.mobInfo[key] = Number.parseInt(mobStatTags[key].innerText);
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
      let mobImageTag = this.mobStatBodyTag.querySelector("tr:nth-child(2) > td:nth-child(1)");

      this.mobInfo.superFlee = 170 + this.mobInfo.bLvl + this.mobInfo.dex + Math.floor(this.mobInfo.luk / 3.0);
      this.mobInfo.superHit = 200 + this.mobInfo.bLvl + this.mobInfo.agi + Math.floor(this.mobInfo.luk / 3.0);

      mobImageTag.rowSpan = 10;
      let fleeTag = createTag("td", ["td_h1_left", "motrSettings-newPulse"], ["95% Flee"]);
      let fleeValueTag = createTag("td", ["td_v1_left", "motrSettings-newPulse"], [this.mobInfo.superFlee.toString()]);
      let hitTag = createTag("td", ["td_h1_left", "motrSettings-newPulse"], ["100% Hit"]);
      let hitValueTag = createTag("td", ["td_v1_left", "motrSettings-newPulse"], [this.mobInfo.superHit.toString()]);
      let emptyTag = createTag("td", ["td_h1_left"], []);
      let emptyValueTag = createTag("td", ["td_v1_left"], []);
      let rowTag = createTag("tr", [], [fleeTag, fleeValueTag, hitTag, hitValueTag, emptyTag, emptyValueTag]);
      this.mobStatBodyTag.appendChild(rowTag);
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let mobInfo = new AddMobInfo();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let mobInfo = new AddMobInfo();
   });
}