const m_settings = {
   "ms_mobs_info": false,
   "ms_image_replace": false,
   "ms_mobs_item_steal": false,
   "ms_vending_navi_clipboard": false,

   "ms_popup_collapses": {
      "ms_group_main": false,
      "ms_group_main_settings": false,
      "ms_group_main_functions": false,
      "ms_group_mobs": false,
      "ms_group_mobs_settings": false,
      "ms_group_mobs_functions": false,
      "ms_group_locations": false,
      "ms_group_locations_settings": false,
      "ms_group_locations_functions": false,
      "ms_group_vending": false,
      "ms_group_vending_settings": false,
      "ms_group_vending_functions": false
   }
}

class PopupController {

   constructor() {
      this.updateLocalStorage();
      this.setLogicEvents();
      this.uploadSettings();
   }

   async updateLocalStorage() {
      await this.getLocalStorage().then(async (ms_var) => {
         this.checkMap(ms_var, m_settings);
         await this.setLocalStorage(ms_var);
      });
   }

   checkMap(variable, map) {
      for (let key in map) {
         if (variable[key] === undefined) {
            variable[key] = map[key];
         } else {
            if (typeof (variable[key]) == "object") {
               this.checkMap(variable[key], map[key]);
            }
         }
      }
   }

   async uploadSettings() {
      await this.uploadCheckboxSettings();
      await this.uploadCollapseGroupSettings();
   }

   async uploadCheckboxSettings() {
      await this.getLocalStorage().then((motr_settings) => {
         let checkboxTags = document.querySelectorAll("label.checkbox > input[type=checkbox]");
         for (let checkboxTag of checkboxTags) {
            checkboxTag.checked = motr_settings[checkboxTag.name];
         }
      });
   }

   async uploadCollapseGroupSettings() {
      await this.getLocalStorage().then((motr_settings) => {
         console.log(motr_settings);
         let collapseGroupTags = document.querySelectorAll("div.settings-group.collapse");
         for (let collapseTag of collapseGroupTags) {
            if (motr_settings["ms_popup_collapses"][collapseTag.getAttribute("name")] == true) {
               this.collapseToggle(collapseTag);
            }
         }
      });
   }

   async setLogicEvents() {
      await this.setCheckboxFunctions();
      await this.setCollapseFunctions();
   }

   async setCheckboxFunctions() {
      let checkboxTags = document.querySelectorAll("label.checkbox > input[type=checkbox]");
      checkboxTags.forEach((checkboxTag) => {
         checkboxTag.addEventListener("change", async (event) => {
            await this.getLocalStorage().then(async (ms_var) => {
               let target = event.target;
               ms_var[target.name] = target.checked;
               await this.setLocalStorage(ms_var);
            });
         });
      });
   }

   async setCollapseFunctions() {
      let collapseGroupTags = document.querySelectorAll("div.settings-group.collapse");
      for (let collapseTag of collapseGroupTags) {
         let btn = collapseTag.children[0];
         btn.addEventListener("click", async (event) => {
            await this.getLocalStorage().then(async (ms_var) => {
               this.collapseToggle(collapseTag);
               ms_var["ms_popup_collapses"][collapseTag.getAttribute("name")] = collapseTag.classList.contains("active");
               await this.setLocalStorage(ms_var);
            });
         });
      }
   }

   collapseToggle(collapseTag) {
      collapseTag.classList.toggle("active");
      this.collapseBaubleUpdate(collapseTag);
   }

   collapseBaubleUpdate(collapseTag) {
      let contentTag = collapseTag.children[1];
      let height = contentTag.scrollHeight;

      let targetTag = collapseTag.parentElement;
      while (targetTag.tagName !== "BODY") {
         if (targetTag.tagName === "DIV") {
            if ((targetTag.classList.contains("collapse")) && (targetTag.classList.contains("settings-group"))) {
               if (collapseTag.classList.contains("active")) {
                  let contentTargetTag = targetTag.children[1];
                  contentTargetTag.style.maxHeight = parseFloat(contentTargetTag.style.maxHeight.split("px")[0]) + height + "px";
               }
            }
         }
         targetTag = targetTag.parentElement;
      }

      if (collapseTag.classList.contains("active")) {
         contentTag.style.maxHeight = height + "px";
      } else {
         contentTag.style.maxHeight = null;
      }
   }

   async getLocalStorage() {
      let obj = await chrome.storage.local.get("motr_settings");
      if (obj.motr_settings === undefined) {
         await chrome.storage.local.set({ motr_settings: m_settings });
         return m_settings;
      } else {
         return obj.motr_settings;
      }
   }

   async setLocalStorage(motr_settings) {
      await chrome.storage.local.set({ motr_settings: motr_settings });
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let controller = new PopupController();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let controller = new PopupController();
   });
}
