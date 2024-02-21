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

   static splitDatas(href) {
      let endHref = href.split("?")[1];
      let params = endHref.split("&");
      let dict = {};
      for (let param of params) {
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
         let jobCountTags = document.querySelectorAll(".tree-layout__tree-item-count");
         for (let jobCountTag of jobCountTags) {
            let jobImgTags = jobCountTag.querySelectorAll(".tree-profs__grid-row-image > img");
            let isFirst = false;
            for (let jobImgTag of jobImgTags) {
               if (isFirst) {
                  jobImgTag.parentElement.style.display = "none";
                  continue;
               }
               let urlParams = CalcReplacer.splitDatas(jobImgTag.src);
               jobImgTag.src = `https://static.divine-pride.net/images/jobs/icon_jobs_${urlParams["class"]}.png`;
               isFirst = true;
            }
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
         for (let i = 0; i < spanImageTags.length - 1; i++) {
            spanImageTags[i].style.display = "none";
         }
         if (spanImageTags === null) {
            continue;
         }
         let spanImageTag = spanImageTags[spanImageTags.length - 1];
         let imgTag = spanImageTag.querySelector("img");
         if (imgTag !== null) {
            let urlParams = CalcReplacer.splitDatas(imgTag.src);
            imgTag.src = `https://static.divine-pride.net/images/jobs/icon_jobs_${urlParams["class"]}.png`;
         }
      }
   }
}

let styles = `
   .tree-profs__grid-row-image img {
      min-width: 32px;
      min-height: 32px;
      max-width: 32px;
      max-height: 32px;
      margin: 48px;
   }
   .tree-layout__tree-item-count .tree-profs__grid-row-image img {
      margin: 0;
   }
   .tree-profs__grid-row-image {
      //padding-top: 20px;
   }
`;
let styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.append(styleSheet);

if ((document.readyState == "complete") || (document.readyState == "interactive")) {
   let replace = new CalcReplacer();
} else {
   document.addEventListener("DOMContentLoaded", () => {
      let replace = new CalcReplacer();
   });
}