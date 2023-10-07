const m_settings = {
   "ms_mobs_info": false,
   "ms_mobs_item_steal": false
}

class PopupController {

   constructor() {
      
   }

   addCollapseItem(className) {
      let collapses = document.getElementsByClassName(className);
      for (let collapse of collapses) {
         let btn = collapse.querySelector("button");
         btn.addEventListener("click", ()=>{
            let btn = collapse.querySelector("button");
            let content = collapse.querySelector(".content");
            btn.classList.toggle("active");
            if (content.style.maxHeight) {
               content.style.maxHeight = null;
            } else {
               content.style.maxHeight = content.scrollHeight + "px";
            }
         });
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

   async setCheckSettings() {
      await this.setCheckBoxSettings();
   }

   async setCheckBoxSettings() {
      let checkboxes = document.querySelectorAll("label.checkbox > input[type=checkbox]");
      checkboxes.forEach((checkbox) => {
         checkbox.addEventListener("change", (event) => {
            let motr_settings = this.getLocalStorage().then((result)=>{
               this.changeCheckboxEvent(event.target, result);
            });
         });
      });
   }

   changeCheckboxEvent(target, settings) {
      settings[target.name] = target.checked;
      this.setLocalStorage(settings);
   }

   updateCheckboxes() {
      this.getLocalStorage().then((motr_settings) => {
         for (let key in motr_settings) {
            let checkbox = document.querySelector("label.checkbox > input[type=checkbox][name=" + key + "]");
            if (checkbox != null) {
               checkbox.checked = motr_settings[key];
            }
         }
      });
   }
}

let controller = new PopupController();

controller.updateCheckboxes();
controller.setCheckSettings();
controller.addCollapseItem("collapse");