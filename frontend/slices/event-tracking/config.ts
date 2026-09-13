export type EventTrackingFeature = {
  slug: "event-tracking";
  title: "Analytics";
  category: "data";
  routes: readonly [];
  nav: {
    label: "Analytics";
    group: "settings";
    icon: "Activity";
    order: 2;
  };
};

export const eventTrackingFeature: EventTrackingFeature = {
  slug: "event-tracking",
  title: "Analytics",
  category: "data",
  routes: [],
  nav: { label: "Analytics", group: "settings", icon: "Activity", order: 2 },
};
