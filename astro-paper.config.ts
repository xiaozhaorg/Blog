import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://xiaozha.org/",
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