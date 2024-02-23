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

class VendingInfo {
   constructor() {
      getLocalStorage().then(motr_settings => {
         if (motr_settings["ms_vending_navi_clipboard"]) {
            if (window.location.href.indexOf("https://motr-online.com/members/vendingstat") >= 0) {
               this.clipboardNavi();
            }
         }
      });
   }

   clipboardNavi() {
      document.styleSheets[0].insertRule(`
         .motrSettings-smallLinkButton {
            width: 12;
            height: 12;
            padding: 2;
            cursor: pointer;
            margin-right: 5;
            border: 1px solid #8796A3;
            border-radius: 3px;
         }
      `);
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

      let tdTags;
      if (document.querySelector("input[name=searchVendingHistory]").checked) {
         tdTags = document.querySelectorAll(".top1 td:nth-child(2), .top2 td:nth-child(2)")
      } else {
         tdTags = document.querySelectorAll(".top1 td:nth-child(1), .top2 td:nth-child(1)");
      }

      for (let tdTag of tdTags) {
         let image = createTag("img", ["motrSettings-smallLinkButton"], []);
         image.src = "https://cdn-icons-png.flaticon.com/128/7263/7263329.png";
         image.addEventListener("click", (event) => {
            window.navigator.clipboard.writeText(event.target.parentElement.innerText);
            clearInterval(window.popupTimeout);
            let popup_container = document.querySelector(".popup-container");
            popup_container.classList.add("show");
            popup_container.innerText = "Навигация скопирована в буфер обмена";
            window.popupTimeout = setTimeout(()=>{
               document.querySelector(".popup-container").classList.remove("show");
            }, 1500);
         });
         tdTag.insertBefore(image, tdTag.childNodes[0]);
      }
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let mobInfo = new VendingInfo();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let mobInfo = new VendingInfo();
   });
}