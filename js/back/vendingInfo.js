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