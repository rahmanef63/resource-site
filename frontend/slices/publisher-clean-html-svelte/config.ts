type PublisherCleanHtmlConfig = {
  slug: "publisher-clean-html";
  title: string;
  category: "content";
  routes: unknown[];
  nav: { label: string; group: "content"; order: number };
};

export const publisherCleanHtmlFeature = {
  slug: "publisher-clean-html",
  title: "Publisher — clean HTML",
  category: "content",
  routes: [],
  nav: { label: "Publisher", group: "content", order: 41 },
} satisfies PublisherCleanHtmlConfig;
