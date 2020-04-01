import { loadFromLocal, saveToLocal } from "@/utils/localStorage";
// import { navigatorLang } from "@/utils/browser";
const STORAGE_KEY = "APP_LANG";
const SERV_DEF_LANG = window.LANG || "zh_cn";
const acLangSet = new Set(["zh_cn", "en", SERV_DEF_LANG]);
// 判断是否可接受语言
export function isAcceptLang(lang) {
  return acLangSet.has(lang);
}
export function setAcceptLang(lang, def = SERV_DEF_LANG) {
  saveToLocal(STORAGE_KEY, isAcceptLang(lang) ? lang : def);
}
export function getAcceptLang(def = SERV_DEF_LANG) {
  let lang = loadFromLocal(STORAGE_KEY) || SERV_DEF_LANG;
  return isAcceptLang(lang) ? lang : def;
}
export const DEF_LANG = getAcceptLang();
