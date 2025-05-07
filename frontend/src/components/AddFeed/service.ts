import { Feed } from "../../utils";

export const addFeed = async (feed: Feed) => {
  const response = await fetch("/api/feed", {
    method: "POST",
    body: JSON.stringify(feed),
  });
};
