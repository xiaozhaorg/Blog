import type { UIStrings } from "../types";

export default {
  site: {
    title: "小吒の部落格",
  },
  nav: {
    home: "首頁",
    posts: "文章",
    tags: "標籤",
    about: "關於",
    archives: "歸檔",
    search: "搜尋",
  },
  post: {
    publishedAt: "發佈於",
    updatedAt: "更新於",
    sharePostIntro: "分享本文：",
    sharePostOn: "在 {{platform}} 分享本文",
    sharePostViaEmail: "通過郵件分享本文",
    tagLabel: "標籤",
    backToTop: "返回頂部",
    goBack: "返回",
    editPage: "編輯頁面",
    previousPost: "上一篇",
    nextPost: "下一篇",
  },
  pagination: {
    prev: "上一頁",
    next: "下一頁",
    page: "第",
  },
  home: {
    socialLinks: "社交連結",
    recentPosts: "最新文章",
    allPosts: "全部文章",
    welcome: "歡迎",
    description:
      "歡迎來到小吒の部落格，這是一個分享技術心得、折腾經驗和自己日常記錄的個人部落格。如果你有什麼好的建議或者意見，有好點子或者資源分享，都可以透過下方的郵箱聯絡我。",
    contact: "聯絡我：",
  },
  footer: {
    copyright: "版權所有",
    allRightsReserved: "保留所有權利。",
  },
  language: {
    zh: "简体中文",
    "zh-TW": "繁體中文",
    en: "English",
    switchLang: "切換語言",
  },
  pages: {
    tagTitle: "標籤",
    tagDesc: "所有帶有標籤",

    tagsTitle: "標籤",
    tagsDesc: "文章中使用的所有標籤。",

    postsTitle: "文章",
    postsDesc: "我發佈的所有文章。",

    archivesTitle: "歸檔",
    archivesDesc: "我歸檔的所有文章。",

    searchTitle: "搜尋",
    searchDesc: "搜尋文章...",
  },
  a11y: {
    skipToContent: "跳轉到內容",
    openMenu: "開啟選單",
    closeMenu: "關閉選單",
    toggleTheme: "切換主題",
    searchPlaceholder: "搜尋文章...",
    noResults: "未找到結果",
    goToPreviousPage: "跳轉到上一頁",
    goToNextPage: "跳轉到下一頁",
  },
  notFound: {
    title: "404 未找到",
    message: "頁面未找到",
    goHome: "返回首頁",
  },
} satisfies UIStrings;
