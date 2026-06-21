import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://xiaozha.org/",
    title: "小吒の博客 - 技术分享、AI工具、云计算",
    description: "小吒的个人技术博客，分享AI工具使用、云计算、编程开发等技术干货，记录学习与成长。",
    keywords: ["技术博客", "AI工具", "云计算", "编程开发", "Gemini", "Cloudflare", "NextChat", "个人博客"],
    author: "小吒",
    profile: "https://xiaozha.org",
    ogImage: "default-og.jpg",
    lang: "zh",
    timezone: "Asia/Shanghai",
    dir: "ltr",
    googleAdsense: "ca-pub-8462449606343172",
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
    { name: "mail", url: "mailto:mail@xiaozha.org" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
    { name: "weibo", url: "https://service.weibo.com/share/share.php?url=", linkTitle: "分享到微博" },
    { name: "qq", url: "https://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=", linkTitle: "分享到QQ空间" },
    { name: "zhihu", url: "https://www.zhihu.com/", linkTitle: "分享到知乎" },
    { name: "wechat", url: "https://xiaozha.org", linkTitle: "微信分享（截图发送）" },
  ],
});