export const formatDate = (value?: Date | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(value);
};

export const formatShortDate = (value?: Date | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
};
