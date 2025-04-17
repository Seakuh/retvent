import { createContext, useState } from "react";
import { Feed, FeedResponse } from "../../utils";
interface FeedContextType {
  feedItems: FeedResponse[];
  currentFeedItem: Feed | undefined;
  setCurrentFeedItem: (feedItem: Feed) => void;
  setFeedItems: (feedItems: FeedResponse[]) => void;
  currentFeedItemIndex: number;
  setCurrentFeedItemIndex: (index: number) => void;
}

export const FeedContext = createContext<FeedContextType | undefined>(
  undefined
);

export const FeedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [feedItems, setFeedItems] = useState<Feed[]>([]);
  const [currentFeedItem, setCurrentFeedItem] = useState<Feed | undefined>(
    undefined
  );
  const [currentFeedItemIndex, setCurrentFeedItemIndex] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFeedModalOpen, setIsFeedModalOpen] = useState<boolean>(false);

  const showNextFeed = () => {
    setCurrentFeedItem(feedItems[currentFeedItemIndex + 1]);
    setCurrentFeedItemIndex(currentFeedItemIndex + 1);
  };

  const value = {
    feedItems,
    currentFeedItem,
    setCurrentFeedItem,
    setFeedItems,
    showNextFeed,
    currentFeedItemIndex,
    setCurrentFeedItemIndex,
    currentImageIndex,
    setCurrentImageIndex,
    isFeedModalOpen,
    setIsFeedModalOpen,
  };

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
};
