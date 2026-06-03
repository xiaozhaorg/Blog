import type { UIStrings } from "../types";

export default {
  nav: {
    home: "Home",
    posts: "Posts",
    tags: "Tags",
    about: "About",
    archives: "Archives",
    search: "Search",
  },
  post: {
    publishedAt: "Published at",
    updatedAt: "Updated",
    sharePostIntro: "Share this post:",
    sharePostOn: "Share this post on {{platform}}",
    sharePostViaEmail: "Share this post via email",
    tagLabel: "Tags",
    backToTop: "Back to top",
    goBack: "Go back",
    editPage: "Edit page",
    previousPost: "Previous Post",
    nextPost: "Next Post",
  },
  pagination: {
    prev: "Prev",
    next: "Next",
    page: "Page",
  },
  home: {
    socialLinks: "Social Links",
    recentPosts: "Recent Posts",
    allPosts: "All Posts",
    welcome: "Welcome",
    description:
      "Welcome to Xiaozha's Blog, a personal blog sharing technical insights, tinkering experiences, and daily journals. If you have any suggestions, ideas, or resources to share, feel free to contact me via email below.",
    contact: "Contact me:",
  },
  footer: {
    copyright: "Copyright",
    allRightsReserved: "All rights reserved.",
  },
  language: {
    zh: "简体中文",
    "zh-TW": "繁體中文",
    en: "English",
    switchLang: "Language",
  },
  pages: {
    tagTitle: "Tag",
    tagDesc: "All the articles with the tag",

    tagsTitle: "Tags",
    tagsDesc: "All the tags used in posts.",

    postsTitle: "Posts",
    postsDesc: "All the articles I've posted.",

    archivesTitle: "Archives",
    archivesDesc: "All the articles I've archived.",

    searchTitle: "Search",
    searchDesc: "Search any article ...",
  },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    searchPlaceholder: "Search posts...",
    noResults: "No results found",
    goToPreviousPage: "Go to previous page",
    goToNextPage: "Go to next page",
  },
  notFound: {
    title: "404 Not Found",
    message: "Page Not Found",
    goHome: "Go back home",
  },
} satisfies UIStrings;
