import { defineAstroPaperConfig } from "./src/types/config";

export default defineAstroPaperConfig({
  site: {
    url: "https://your-custom-domain.com/",
    title: "My Blog",
    description: "A modern, responsive blog.",
    author: "Your Name",
    profile: "https://yourprofile.com",
    ogImage: "default-og.jpg",
    lang: "en",
    timezone: "UTC",
    dir: "ltr",
  },
  posts: {
    perPage: 4,
    perIndex: 4,
    scheduledPostMargin: 15 * 60 * 1000,
  },
  features: {
    lightAndDarkMode: true,
    dynamicOgImage: false,
    showArchives: true,
    showBackButton: true,
    editPost: {
      enabled: false,
      url: "https://github.com/your-username/your-repo/edit/main/",
    },
    search: "pagefind",
  },
  socials: [
    { name: "github", url: "https://github.com/your-username" },
  ],
  shareLinks: [
    { name: "x", url: "https://x.com/intent/post?url=" },
  ],
});