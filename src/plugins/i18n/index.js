/**
 * 由于加载问题，语言包全部加载，不做按需加载！！！
 */

//i18n-setup.js
import Vue from "vue";
import VueI18n from "vue-i18n";
import ElementLocale from "element-ui/lib/locale";
import { DEF_LANG, isAcceptLang } from "@/lang/def";
import zh_cn from "@/lang/zh-cn.js";
import en from "@/lang/en.js";

Vue.use(VueI18n);
export const i18n = new VueI18n({
  locale: null,
  fallbackLocale: DEF_LANG,
  messages: { zh_cn, en }
});

ElementLocale.i18n((key, value) => i18n.t(key, value));

// 已加载过的语言
const loadedLangs = ["zh_cn","en"];

function setI18nLanguage(lang) {
  if (!isAcceptLang(lang)) {
    lang = DEF_LANG;
  }
  i18n.locale = lang;
  // axios.defaults.headers.common["Accept-Language"] = lang;
  document.querySelector("html").setAttribute("lang", lang);
  return lang;
}
/**
 * 设置i18n语言，异步加载语言包并设置语言环境
 */
export function setLangAsync(lang) {
  if (i18n.locale !== lang) {
    if (!loadedLangs.includes(lang)) {
      let _promise = null;
      if (lang === "zh_cn") {
        _promise = import(
          /* webpackChunkName: "lang-zh_cn" */ "@/lang/zh-cn.js"
        );
      } else {
        _promise = import(/* webpackChunkName: "lang_en" */ "@/lang/en.js");
      }
      return _promise.then(pack => {
        i18n.setLocaleMessage(lang, pack.default);
        loadedLangs.push(lang);
        return setI18nLanguage(lang);
      });
    }
    return Promise.resolve(setI18nLanguage(lang));
  }
  return lang;
}

window.I18N = i18n;
setLangAsync(DEF_LANG);
