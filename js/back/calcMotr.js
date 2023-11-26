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

function splitDatas(href) {
   let endHref = href.split("?")[1];
   let params = endHref.split("&");
   let dict = {};
   for (let param of params) {
      let splits = param.split("=");
      dict[splits[0]] = splits[1];
   }
   return dict;
}

class CalcReplacer {
   funcsMap = undefined;
   constructor() {
      this.mapGenerator();
      getLocalStorage().then(motr_settings => {
         if (motr_settings["ms_calc_motr"]) {
            for (let [key, value] of this.funcsMap) {
               this.funcMatcher(key, value);
            }
         }
      });
   }

   mapGenerator() {
      this.funcsMap = new Map();
      this.funcsMap.set("calc.motr-online.com", this.fixMain);
   }

   funcMatcher(href, func) {
      if (document.location.href.indexOf(href) >= 0) {
         func.call();
      }
   }

   splitDatas(href) {
      console.log(href);
      let endHref = href.split("?")[1];
      let params = endHref.split("&");
      let dict = {};
      for (param of params) {
         let splits = param.split("=");
         dict[splits[0]] = splits[1];
      }
      return dict;
   }

   fixMain() {
      if (document.location.href.split("calc.motr-online.com/")[1].length > 1) {
         let skill_imgs = document.querySelectorAll(".tree-item__img > img");
         for (let imageTag of skill_imgs) {
            imageTag.src = imageTag.src.replace("dbpic/", "dbpic_/").toLowerCase();
         }
         return;
      }
      let loaderTag = document.querySelector("div.tree-profs__table-loading");
      if (loaderTag !== null) {
         loaderTag.style.display = "none";
      }
      let span_animation = document.querySelector("span.cssload-loader");
      if (span_animation !== null) {
         span_animation.style.display = "none";
      }
      let spanTags = document.querySelectorAll("a.tree-profs__grid-row-cell");
      for (let spanTag of spanTags) {
         let spanImageTags = spanTag.querySelectorAll(".tree-profs__grid-row-image");
         for (let i = 0; i < spanImageTags.length; i++) {
            let spanImageTag = spanTag.children[i];
            let imageTag = spanImageTag.children[0];
            imageTag.alt = "";
         }
      }
   }
}

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let replace = new CalcReplacer();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let replace = new CalcReplacer();
   });
}