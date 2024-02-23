class InventorySearchController {
   itemsData = undefined; // Стандартные группы предметов
   searchIDs = undefined; // Все ID которые нужно найти объект типа Set
   searchCharIDs = undefined; // Все ID чаров в которых нужно искать
   vendingSearchBuyResults = undefined; // Результаты поиска на вендинге
   searchCount = 0; //Кол-во выполненных запросов
   searchMax = 0; //Кол-во максимальных запросов

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

   async fetch_query(href) {
      return await fetch(href).then(res => res.text()).then(text => {
         if (text.length < 10) {
            return null;
         }
         let dom_parser = new DOMParser();
         return dom_parser.parseFromString(text, "text/html");
      });
   }

   async fetch_quick_search(search, search_type = 2) {
      let encoded_search = encodeURI(search);
      return await fetch("https://motr-online.com/database/quicksearch",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `quicksearchmob=${search_type == 1 ? encoded_search: ""}` +
               `&quicksearchitem=${search_type == 2 ? encoded_search: ""}` +
               `&quicksearchskill=${search_type == 3 ? encoded_search: ""}`
         }
      ).then(res => res.text()).then(text => {
         let dom_parser = new DOMParser();
         return dom_parser.parseFromString(text, "text/html");
      });
   }

   async fetch_vending(item_id, vendingType = 0, page = 0) {
      return await fetch("https://motr-online.com/members/vendingstat",
         {
            method: "POST",
            headers: {
               "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `vendingType=${vendingType}&name=${item_id}&searchItemTypes%5B%5D=0&` +
               `searchItemTypes%5B%5D=1&searchItemTypes%5B%5D=2&searchItemTypes%5B%5D=3&` +
               `searchItemTypes%5B%5D=4&weapontypes%5B%5D=1&weapontypes%5B%5D=2&weapontypes%5B%5D=3&` +
               `weapontypes%5B%5D=4&weapontypes%5B%5D=5&weapontypes%5B%5D=6&weapontypes%5B%5D=7&` +
               `weapontypes%5B%5D=8&weapontypes%5B%5D=9&weapontypes%5B%5D=10&weapontypes%5B%5D=11&` +
               `weapontypes%5B%5D=12&weapontypes%5B%5D=13&weapontypes%5B%5D=14&weapontypes%5B%5D=15&` +
               `weapontypes%5B%5D=16&weapontypes%5B%5D=17&weapontypes%5B%5D=18&weapontypes%5B%5D=19&` +
               `weapontypes%5B%5D=20&weapontypes%5B%5D=21&weapontypes%5B%5D=22&weapontypes%5B%5D=23&` +
               `equipJobs%5B%5D=1&equipJobs%5B%5D=2&equipJobs%5B%5D=4&equipJobs%5B%5D=8&equipJobs%5B%5D=16&` +
               `equipJobs%5B%5D=32&equipJobs%5B%5D=64&equipJobs%5B%5D=128&equipJobs%5B%5D=256&equipJobs%5B%5D=512&` +
               `equipJobs%5B%5D=1024&equipJobs%5B%5D=2048&equipJobs%5B%5D=4096&equipJobs%5B%5D=16384&` +
               `equipJobs%5B%5D=32768&equipJobs%5B%5D=65536&equipJobs%5B%5D=131072&equipJobs%5B%5D=262144&` +
               `equipJobs%5B%5D=524288&equipJobs%5B%5D=2097152&equipJobs%5B%5D=4194304&equipJobs%5B%5D=8388608&` +
               `equipJobs%5B%5D=16777216&equipJobs%5B%5D=33554432&equipJobs%5B%5D=1073741824&equipJobs%5B%5D=2147483648&` +
               `equipLocations%5B%5D=0&equipLocations%5B%5D=1&equipLocations%5B%5D=2&equipLocations%5B%5D=3&` +
               `equipLocations%5B%5D=4&equipLocations%5B%5D=5&equipLocations%5B%5D=6&equipLocations%5B%5D=7&` +
               `equipLocations%5B%5D=8&equipLocations%5B%5D=9&equipLocations%5B%5D=10&equipLocations%5B%5D=11&` +
               `equipLocations%5B%5D=12&equipLocations%5B%5D=13&equipLocations%5B%5D=14&equipLocations%5B%5D=15&` +
               `equipLocations%5B%5D=16&equipLocations%5B%5D=17&equipLocations%5B%5D=18&equipLocations%5B%5D=19&` +
               `equipLocations%5B%5D=20&minAtk=0&minMatk=0&weaponLv=0&charLv=175&minSlots=0&maxSlots=4&page=${page}`
         }
      ).then(res => res.text()).then(text => {
         let dom_parser = new DOMParser();
         return dom_parser.parseFromString(text, "text/html");
      });
   }

   async fetch_json(href) {
      return await fetch(href).then(res => res.json()).then(json => json);
   }

   constructor() {
      this.initialize_settings();
   }

   async initialize_settings() {
      await this.initialize_chars();
      await this.initialize_item_database();
      this.initialize_search_button();
      this.initialize_quick_search_button();
   }

   initialize_quick_search_button() {
      document.querySelector("#quick_search_input").addEventListener("input", window.controller.quickSearchTrigger);
   }

   initialize_search_button() {
      document.querySelector("#search-submit").addEventListener("click", window.controller.goSearch);
   }

   searchObjectFromPath(path) {
      let path_split = path.split("-");
      let now_object = this.itemsData;
      let resumeFlag = false;
      for (let path_part of path_split) {
         if (!resumeFlag) {
            for (let searchItem of now_object) {
               if (searchItem.id === path_part) {
                  now_object = searchItem;
                  break;
               }
            }
            resumeFlag = true;
         } else {
            for (let searchItem of now_object.items) {
               if (searchItem.id === path_part) {
                  now_object = searchItem;
                  break;
               }
            }
         }
      }
      return now_object;
   }

   searchDOMFromPath(path) {
      let defaultDOM = document.querySelector("#default_item_groups > ul");
      if (path.length == 0) {
         return defaultDOM;
      }
      return defaultDOM.querySelector(`li:has( > label > input[name=${path}]) ul`);
   }

   init_json_group(itemData, prev_path = "", name = "") {
      let parentDOM = this.searchDOMFromPath(prev_path);
      switch (itemData.type) {
         case `hidden-group`:
         case `group`:
            let itemGroup = this.createGroup(prev_path + itemData.id, name.length > 0 ? name : itemData.name);
            if (itemData.type === `hidden-group`) {
               this.hiddenGroup(itemGroup);
            }
            parentDOM.append(itemGroup);
            for (let itemDataChild of itemData.items) {
               this.init_json_group(itemDataChild, prev_path + itemData.id);
            }
            break;
         case `item`:
            let item = this.createItem(prev_path + itemData.id, name.length > 0 ? name : itemData.name, itemData.item_id);
            parentDOM.append(item);
            break;
         case `link`:
            let searchData = this.searchObjectFromPath(itemData.link);
            this.init_json_group(searchData, prev_path, itemData.name);
            break;
      }
   }

   hiddenGroup(template) {
      template.querySelector("label.plus-minus").style.display = "none";
   }

   checkBounceCheckboxes(event) {
      function checkRightFromTheTarget(target, flag) {
         let ul = target.parentElement.nextElementSibling;
         target.parentElement.classList.remove("active");
         if (ul === null) {
            return;
         }
         for (let li of ul.children) {
            li.classList.remove("active");
            let input = li.children[1].children[0];
            input.checked = flag;
            checkRightFromTheTarget(input, flag);
         }
      }
      function checkLeftFromTheTarget(target) {
         let ul = target.parentElement.parentElement.parentElement;
         if (ul.parentElement.children.length == 1) {
            return;
         }
         if (target.parentElement.classList.contains("active")) {
            let prev_label = ul.previousElementSibling;
            prev_label.classList.add("active");
            prev_label.children[0].checked = true;
            checkLeftFromTheTarget(prev_label.children[0]);
            return;
         }

         let allOfAnd = true;
         let allOfOr = false;
         for (let li of ul.children) {
            let checked = li.children[1].children[0].checked;
            allOfAnd = allOfAnd && checked;
            allOfOr = allOfOr || checked;
         }
         let inputTag = ul.previousElementSibling.children[0];
         inputTag.checked = allOfOr;
         if ((allOfAnd) || (!allOfOr)) {
            ul.previousElementSibling.classList.remove("active");
         } else {
            ul.previousElementSibling.classList.add("active");
         }
         checkLeftFromTheTarget(inputTag);
      }
      // bounce right
      checkRightFromTheTarget(event.target, event.target.checked);
      // bounce left
      checkLeftFromTheTarget(event.target);
   }

   createItem(path, name, item_id) {
      let template = document.querySelector("template#MOTREXT_search_group_item").content.cloneNode(true);
      template.querySelector("label.plus-minus").style.display = "none";
      let inputTag = template.querySelector("label:nth-child(2) > input");
      inputTag.setAttribute("name", path);
      inputTag.setAttribute("item_id", item_id);
      inputTag.addEventListener("click", this.checkBounceCheckboxes);
      template.querySelector("span").innerText = name;
      return template;
   }

   createGroup(path, name) {
      let template = document.querySelector("template#MOTREXT_search_group_item").content.cloneNode(true);
      let inputTag = template.querySelector("label:nth-child(2) > input");
      inputTag.setAttribute("name", path);
      inputTag.addEventListener("click", this.checkBounceCheckboxes);
      let spanTag = template.querySelector("span");
      spanTag.classList.add("display-block")
      spanTag.innerText = name;
      let ulTag = document.createElement("UL");
      let liTag = template.querySelector("li");
      liTag.append(ulTag);
      return template;
   }

   async initialize_item_database() {
      this.itemsData = await this.fetch_json(`chrome-extension://${chrome.runtime.id}/js/back/search_items.json`);
      for (let itemData of this.itemsData) {
         this.init_json_group(itemData);
      }
   }

   async initialize_chars() {
      this.show_loader("Загружаются персонажи", "");
      let charsDOM = await this.fetch_query("https://motr-online.com/members");
      let charsTable = charsDOM.querySelector(".tableBord > tbody");
      let settingsTag = document.querySelector("#char-settings").children[0];
      if (charsTable !== null) {
         let trs = charsTable.children;
         this.update_loader(`0 из ${trs.length - 1}`);
         for (let i = 1; i < trs.length; i++) {
            let charLabel = `${trs[i].children[1].innerText} - ${trs[i].children[2].innerText} | ${trs[i].children[3].innerText} |`;
            let isDisable = (trs[i].children[1].children.length == 0);
            let charInputName = `char_id${i}`;
            if (!isDisable) {
               let charIdSplit = trs[i].children[1].children[0].href.split('/');
               charInputName = charIdSplit[charIdSplit.length - 1];
            }
            let appendSetting = this.createChar(charInputName, charLabel, isDisable);
            settingsTag.append(appendSetting);
            this.update_loader(`${i - 1} из ${trs.length - 1}`);
         }
         this.hide_loader();
      } else {
         if (charsDOM.querySelector("h3.allhead") !== null) {
            if (charsDOM.querySelector("h3.allhead").innerText === "Личный раздел") {
               let descriptionTag = this.createWarning(`Необходимо создать персонажей, для того, чтобы иметь возможность искать в них`);
               settingsTag.append(descriptionTag);
            }
         } else {
            let descriptionTag = this.createWarning(`Необходимо `);
            let aTag = document.createElement(`A`);
            aTag.href = "https://motr-online.com/login";
            aTag.target = "_blank";
            aTag.innerText = "залогиниться";
            descriptionTag.querySelector("span").append(aTag);
            descriptionTag.querySelector("span").append(document.createTextNode(` на сайте, чтобы получить доступ к персонажам. `))
            settingsTag.append(descriptionTag);
         }
      }
   }

   createChar(name, value, disabled = false) {
      let template = document.querySelector("template#MOTREXT_settings_item").content.cloneNode(true);
      let inputTag = template.querySelector("input");
      inputTag.name = name;
      inputTag.checked = true;
      if (disabled) {
         inputTag.checked = false;
         inputTag.disabled = true;
      }
      template.querySelector("span").innerText = value;
      return template;
   }

   createWarning(desc) {
      let template = document.querySelector("template#MOTREXT_warning_item").content.cloneNode(true);
      let span = template.querySelector("span");
      span.innerText = desc;
      return template;
   }

   clearResultDatas() {
      let buy_result = document.querySelector("#vending_search_buy_result > ul > table > tbody");
      let sell_result = document.querySelector("#vending_search_sell_result > ul > table > tbody");
      let storage_result = document.querySelector("#storage_search_result > ul > table > tbody");
      let inventory_result = document.querySelector("#inventory_search_result > ul > table > tbody");
      let equip_result = document.querySelector("#equip_search_result > ul > table > tbody");
      while (buy_result.children.length > 0) {
         buy_result.removeChild(buy_result.children[0]);
      }
      while (sell_result.children.length > 0) {
         sell_result.removeChild(sell_result.children[0]);
      }
      while (storage_result.children.length > 0) {
         storage_result.removeChild(storage_result.children[0]);
      }
      while (inventory_result.children.length > 0) {
         inventory_result.removeChild(inventory_result.children[0]);
      }
      while (equip_result.children.length > 0) {
         equip_result.removeChild(equip_result.children[0]);
      }
   }

   async goSearch() {
      let defaultSearch = document.querySelector("#default_item_groups > ul");
      let this_object = window.controller;
      this_object.searchIDs = new Set(this_object.harvestCheckboxValues(defaultSearch));

      let isVendingSearchBuy = document.querySelector("input[name=vending_buy_search]").checked;
      let isVendingSearchSell = document.querySelector("input[name=vending_sell_search]").checked;
      let isStorageSearch = document.querySelector("input[name=storage_search]").checked;
      let isInventorySearch = document.querySelector("input[name=inventory_search]").checked;
      let isEquipSearch = document.querySelector("input[name=equip_search]").checked;

      this_object.searchCharIDs = new Set(this_object.getCharValues());

      this_object.searchCount = 0;
      this_object.searchMax = (isVendingSearchBuy + isVendingSearchSell) * this_object.searchIDs.size + isStorageSearch * 1 +
         (isInventorySearch + isEquipSearch) * this_object.searchCharIDs.size;
      console.log(`Необходимо провести ${this_object.searchMax} запросов`);

      this_object.clearResultDatas();

      this_object.show_loader("Выполняется запросы", `0 из ${this_object.searchMax}`);

      if (isVendingSearchBuy) {
         let check_vending_stat = await this_object.check_vending_stat();
         if (check_vending_stat) {
            for (let item_id of this_object.searchIDs) {
               this_object.getVendingInfo(item_id);
            }
         } else {
            let warningTag = this_object.createWarning(`Чтобы искать вендинг необходимо иметь премиум статус на аккаунте`);
            document.querySelector("#vending_search_buy_result table > tbody").append(warningTag);
            this_object.searchCount += this_object.searchIDs.size;
            this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax}`);
            if (this_object.searchCount >= this_object.searchMax) {
               this_object.hide_loader();
            }
         }
      }

      if (isVendingSearchSell) {
         let check_vending_stat = await this_object.check_vending_stat();
         if (check_vending_stat) {
            for (let item_id of this_object.searchIDs) {
               this_object.getVendingInfo(item_id, 1);
            }
         } else {
            let warningTag = this_object.createWarning(`Чтобы искать вендинг необходимо иметь премиум статус на аккаунте`);
            document.querySelector("#vending_search_sell_result table > tbody").append(warningTag);
            this_object.searchCount += this_object.searchIDs.size;
            this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax}`);
            if (this_object.searchCount >= this_object.searchMax) {
               this_object.hide_loader();
            }
         }
      }

      if (isStorageSearch) {
         let inputTag = document.querySelector("#char-settings input:checked:not(:disabled)");
         if (inputTag !== null) {
            let char_id = inputTag.getAttribute("name");
            this_object.checkStorage(char_id);
         } else {
            let warningTag = this_object.createWarning(`Для доступа к складу нужен любой выбранный чар`);
            document.querySelector("#storage_search_result table > tbody").append(warningTag);
         }
      }

      if (isInventorySearch) {
         for (let charID of this_object.searchCharIDs) {
            this_object.checkInventory(charID);
         }
      }

      if (isEquipSearch) {
         for (let charID of this_object.searchCharIDs) {
            this_object.checkEquip(charID);
         }
      }

      if (this_object.searchCount >= this_object.searchMax) {
         this_object.hide_loader();
      }
   }

   async checkEquip(char_id) {
      let this_object = window.controller;
      let finded_trs = [];
      let inventoryDOM = await this_object.fetch_query(`https://motr-online.com/members/charinfo/equip//${char_id}`);
      let equipTable = inventoryDOM.querySelector(".tableBord > tbody");
      if (equipTable !== null) {
         let trs = equipTable.children;
         for (let i = 1; i < trs.length; i++) {
            for (let j = 0; j < trs[i].children.length; j++) {
               if ((i == 1) && (j == 1)) {
                  continue;
               }
               if (trs[i].children[j].children.length == 0) {
                  continue;
               }
               let aTag = trs[i].children[j].children[1];
               if (aTag !== null) {
                  let aTagSplit = aTag.href.split("/");
                  let item_id = aTagSplit[aTagSplit.length - 1];
                  if (this_object.searchIDs.has(item_id)) {
                     let trTag = document.createElement("TR");
                     let tdTag = document.createElement("TD");
                     tdTag.append(trs[i].children[j].children[0].cloneNode(true));
                     trTag.append(tdTag);

                     tdTag = document.createElement("TD");
                     tdTag.append(trs[i].children[j].children[1].cloneNode(true));
                     trTag.append(tdTag);

                     tdTag = document.createElement("TD");
                     if (trs[i].children[j].children.length > 2) {
                        tdTag.append(trs[i].children[j].children[2].cloneNode(true));
                     }
                     trTag.append(tdTag);

                     finded_trs.push(trTag);
                  }
               }
            }
         }
      }

      if (finded_trs.length > 0) {
         let equipTag = document.querySelector("#equip_search_result tbody");
         let spanTag = document.querySelector(`input[name="${char_id}"] + svg + span`);
         let trTag = document.createElement("TR");
         let tdTag = document.createElement("TD");
         trTag.append(tdTag);
         tdTag.setAttribute("colspan", 3);
         tdTag.innerText = spanTag.innerText;
         let domFragment = document.createDocumentFragment();
         domFragment.append(trTag);
         for (let trTag of finded_trs) {
            let img = trTag.querySelector("img");
            if (img !== null) {
               img.src = img.src.replaceAll("//", "https://").replaceAll("dbpic/", "dbpic_/").replaceAll("chrome-extension:", "");
            }
            domFragment.append(trTag);
         }
         equipTag.append(domFragment);
      }

      this_object.searchCount += 1;
      this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax} - Экипировка Персонажей`);
      if (this_object.searchCount >= this_object.searchMax) {
         this_object.hide_loader();
      }
   }

   async checkInventory(char_id) {
      let this_object = window.controller;
      let finded_trs = [];
      let inventoryDOM = await this_object.fetch_query(`https://motr-online.com/members/charinfo/invertory/${char_id}`);
      let inventoryTable = inventoryDOM.querySelector("#idTbl1 > tbody");
      if (inventoryTable !== null) {
         let trs = inventoryTable.children;
         for (let i = 1; i < trs.length; i++) {
            let aTag = trs[i].children[1].children[0];
            if (aTag !== null) {
               let aTagSplit = aTag.href.split("/");
               let item_id = aTagSplit[aTagSplit.length - 1];
               if (this_object.searchIDs.has(item_id)) {
                  finded_trs.push(trs[i].cloneNode(true));
               }
            }
         }
      }

      if (finded_trs.length > 0) {
         let inventoryTag = document.querySelector("#inventory_search_result tbody");
         let spanTag = document.querySelector(`input[name="${char_id}"] + svg + span`);
         let trTag = document.createElement("TR");
         let tdTag = document.createElement("TD");
         trTag.append(tdTag);
         tdTag.setAttribute("colspan", 4);
         tdTag.innerText = spanTag.innerText;
         let domFragment = document.createDocumentFragment();
         domFragment.append(trTag);
         for (let trTag of finded_trs) {
            let img = trTag.querySelector("img");
            if (img !== null) {
               img.src = img.src.replaceAll("//", "https://").replaceAll("dbpic/", "dbpic_/").replaceAll("chrome-extension:", "");
            }
            domFragment.append(trTag);
         }
         inventoryTag.append(domFragment);
      }

      this_object.searchCount += 1;
      this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax} - Инвентарь Персонажей`);
      if (this_object.searchCount >= this_object.searchMax) {
         this_object.hide_loader();
      }
   }

   async checkStorage(char_id) {
      let this_object = window.controller;
      let finded_trs = [];
      let storageDOM = await this_object.fetch_query(`https://motr-online.com/members/charinfo/invertory/${char_id}`);
      let storageTable = storageDOM.querySelector("#idTbl2 > tbody");
      if (storageTable !== null) {
         let trs = storageTable.children;
         for (let i = 1; i < trs.length; i++) {
            let aTag = trs[i].children[1].children[0];
            if (aTag !== null) {
               let aTagSplit = aTag.href.split("/");
               let item_id = aTagSplit[aTagSplit.length - 1];
               if (this_object.searchIDs.has(item_id)) {
                  finded_trs.push(trs[i].cloneNode(true));
               }
            }
         }
      }

      let storageTag = document.querySelector("#storage_search_result tbody");
      for (let trTag of finded_trs) {
         let img = trTag.querySelector("img");
         if (img !== null) {
            img.src = img.src.replaceAll("//", "https://").replaceAll("dbpic/", "dbpic_/").replaceAll("chrome-extension:", "");
         }
         storageTag.append(trTag);
      }

      this_object.searchCount += 1;
      this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax} - Склад`);
      if (this_object.searchCount >= this_object.searchMax) {
         this_object.hide_loader();
      }
   }

   async check_vending_stat() {
      let this_object = window.controller;
      let vendingDOM = await this_object.fetch_query("https://motr-online.com/members/vendingstat");
      return (vendingDOM.querySelector(".tableBord > tbody") !== null);
   }

   show_loader(title, desc) {
      let loaderTag = document.querySelector(".loading-layout");
      loaderTag.classList.add("show");
      loaderTag.querySelector("h2").innerText = title;
      loaderTag.querySelector("span.description").innerText = desc;
   }

   update_loader(desc) {
      document.querySelector(".loading-layout > span.description").innerText = desc;
   }

   hide_loader() {
      document.querySelector(".loading-layout").classList.remove("show");
   }

   show_popup(desc) {
      let this_object = window.controller;
      clearTimeout(this_object.popupTimeout);
      let popup_container = document.querySelector(".popup-container");
      popup_container.classList.add("show");
      popup_container.innerText = desc;
      this_object.popupTimeout = setTimeout(this_object.close_popup, 2000);
   }

   close_popup() {
      let popup_container = document.querySelector(".popup-container");
      popup_container.classList.remove("show");
   }

   async getVendingInfo(item_id, vending_type = 0) {
      let this_object = window.controller;
      let vending_result_DOM = [];
      let vendingDOM = await this_object.fetch_vending(item_id, vending_type);
      if (vendingDOM.querySelector(".tableBord > tbody") === null) {
         if (vending_type == 0) {
            let warningTag = this.createWarning(`Чтобы искать вендинг необходимо иметь премиум статус на аккаунте`);
            document.querySelector("#vending_search_buy_result table > tbody").append(warningTag);
         } else {
            let warningTag = this.createWarning(`Чтобы искать вендинг необходимо иметь премиум статус на аккаунте`);
            document.querySelector("#vending_search_sell_result table > tbody").append(warningTag);
         }
         this_object.searchCount += 1;
         this.update_loader(`${this_object.searchCount} из ${this_object.searchMax}`);
         return;
      }
      let submitButtons = vendingDOM.querySelectorAll(".mainItemCell button[type=submit]");
      vending_result_DOM = [...vending_result_DOM, ...this_object.getVendingTrs(vendingDOM)];
      while (submitButtons.length > 1) {
         vendingDOM = await this_object.fetch_vending_buy(item_id, vending_type, submitButtons[submitButtons.length - 1].value);
         submitButtons = vendingDOM.querySelectorAll(".mainItemCell button[type=submit]");
         vending_result_DOM = [...vending_result_DOM, ...this_object.getVendingTrs(vendingDOM)];
      }

      let tbodyTag;
      if (vending_type == 0) {
         tbodyTag = document.querySelector("#vending_search_buy_result > ul > table > tbody");
      } else {
         tbodyTag = document.querySelector("#vending_search_sell_result > ul > table > tbody");
      }
      for (let vendingTr of vending_result_DOM) {
         tbodyTag.append(vendingTr);
      }

      this_object.searchCount += 1;
      if (this_object.searchCount >= this_object.searchMax) {
         this_object.hide_loader();
         return;
      }
      if (vending_type == 0) {
         this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax} - Вендинг (продажа)`);
      } else {
         this_object.update_loader(`${this_object.searchCount} из ${this_object.searchMax} - Вендинг (скупка)`);
      }
   }

   getVendingTrs(vendingDOM) {
      let return_result = [];
      let trs = vendingDOM.querySelector(".tableBord > tbody").children;
      for (let i = 1; i < trs.length; i++) {
         let cloneTRTag = trs[i].cloneNode(true);
         let img = cloneTRTag.querySelector("img");
         let firstTD = cloneTRTag.querySelector("td:nth-child(1)");
         if (firstTD !== null) {
            let doc_fragment = document.createDocumentFragment()
            while (firstTD.childNodes.length > 0) {
               doc_fragment.append(firstTD.childNodes[0]);
            }
            
            let mainDiv = document.createElement("DIV");
            mainDiv.classList.add("flex-row-center")
            let spanTag = document.createElement("SPAN");
            spanTag.append(doc_fragment);

            let imgTag = document.createElement("IMG");
            imgTag.classList.add("motrSettings-smallLinkButton");
            imgTag.src = `https://cdn-icons-png.flaticon.com/128/7263/7263329.png`;
            imgTag.addEventListener("click", (event) => {
               window.navigator.clipboard.writeText(event.target.parentElement.innerText);
               let this_object = window.controller;
               this_object.show_popup("Навигация скопирована в буфер обмена");
            })
            // firstTD.insertAdjacentElement("afterBegin", imgTag);
            
            mainDiv.append(imgTag);
            mainDiv.append(spanTag);
            firstTD.append(mainDiv);
         }
         if (img !== null) {
            img.src = img.src.replaceAll("//", "https://").replaceAll("dbpic/", "dbpic_/").replaceAll("chrome-extension:", "");
         }
         return_result.push(cloneTRTag);
      }
      return return_result;
   }

   getCharValues() {
      let result_array = [];
      let charInputTags = document.querySelectorAll("#char-settings > ul > li > label > input");
      for (let inputTag of charInputTags) {
         if (inputTag.checked) {
            result_array.push(inputTag.getAttribute("name"));
         }
      }
      return result_array;
   }

   harvestCheckboxValues(startDOM) {
      let result_array = [];
      let checkboxes = startDOM.querySelectorAll("li:not(:has( > ul)) > label:nth-child(2) > input");
      for (let checkbox of checkboxes) {
         if (checkbox.checked) {
            result_array.push(checkbox.getAttribute("item_id"));
         }
      }
      let quick_search = document.querySelector("#quick_search_input");
      if (quick_search.value.length > 0) {
         result_array.push(quick_search.value);
      }
      return result_array;
   }

   quickSearchTrigger(event) {
      let this_object = window.controller;
      clearTimeout(this_object.quickSearchTimeout);
      this_object.quickSearchTimeout = setTimeout(this_object.openSearchFrame, 1000);
   }

   async openSearchFrame() {
      let this_object = window.controller;
      let inputTag = document.querySelector("input#quick_search_input");
      let search_modal = inputTag.nextElementSibling;
      if (inputTag.value.trim().length < 3) {
         search_modal.classList.remove("show");
         inputTag.value = "";
         return;
      }
      
      search_modal.classList.add("show");
      let tbody = search_modal.querySelector("tbody");
      while (tbody.children.length > 0) {
         tbody.removeChild(tbody.children[0]);
      }
      let searchDOM = await this_object.fetch_quick_search(inputTag.value);
      let tables = searchDOM.querySelectorAll(".mainItemCell td > table");
      let needTable = tables[tables.length - 1].querySelector("tbody");
      if (needTable !== null) {
         let trs = needTable.children;
         for (let i = 0; i < Math.ceil(trs.length / 2); i++) {
            let trTag = document.createElement("TR");

            let nameTag = document.createElement("TD");
            nameTag.append(trs[2*i+1].children[0].children[0].cloneNode(true));
            let titleTag = document.createElement("SPAN");
            titleTag.innerText = trs[2*i].children[0].innerText;
            nameTag.append(titleTag);
            trTag.append(nameTag);

            trTag.append(trs[2*i+1].children[1].cloneNode(true));
            trTag.append(trs[2*i+1].children[2].cloneNode(true));

            trTag.addEventListener("click", this_object.selectQuickSearchItem, 1);
            tbody.append(trTag);
            let img = nameTag.querySelector("img");
            if (img !== null) {
               img.src = img.src.replaceAll("//", "https://").replaceAll("dbpic/", "dbpic_/").replaceAll("chrome-extension:", "");
            }
         }
      }
   }

   selectQuickSearchItem(event) {
      let aTag = this.querySelector("a");
      let aTagSplit = aTag.href.split("/");
      let itemID = aTagSplit[aTagSplit.length - 1];
      let inputTag = document.querySelector("input#quick_search_input");
      inputTag.value = itemID;
      inputTag.nextElementSibling.classList.remove("show");
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   window.controller = new InventorySearchController();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      window.controller = new InventorySearchController();
   });
}
