export type CommentsConfig = {
  slug: string;
  title: string;
  category: "content";
};

export const commentsConfig: CommentsConfig = {
  slug: "comments",
  title: "Comments — Threaded",
  category: "content",
};

export default commentsConfig;
