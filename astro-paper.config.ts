import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://blog.xiaozha.org/",
    title: "小吒の博客",
    description: "一个现代化的 Neumorphic 风格个人博客。",
    author: "小吒",
    profile: "https://xiaozha.org",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
  },
  posts: {
    perPage: 6,
    perIndex: 6,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/xiaozhaorg" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
  ],
});