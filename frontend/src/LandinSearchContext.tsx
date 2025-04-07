// context/LandingSearchContext.tsx
import React, { createContext, useContext, useState } from "react";

type ViewMode = "Home" | "All" | "Filter";

type SearchState = {
  location: string;
  date: string;
  category: string;
  prompt: string;
  view: ViewMode;

  setSearchState: (state: Partial<SearchState>) => void;
};

const defaultState: SearchState = {
  location: "",
  date: "",
  category: "",
  prompt: "",
  view: "All",
  setSearchState: () => {},
};

const LandingSearchContext = createContext<SearchState>(defaultState);

export const LandingPageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchState, setSearchStateInternal] = useState<
    Omit<SearchState, "setSearchState">
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("landingSearch");
      return saved ? JSON.parse(saved) : defaultState;
    }
    return defaultState;
  });

  const setSearchState = (newValues: Partial<SearchState>) => {
    const updatedState = { ...searchState, ...newValues };
    setSearchStateInternal(updatedState);
    console.log("updatedState", updatedState);
    localStorage.setItem("landingSearch", JSON.stringify(updatedState));
  };

  return (
    <LandingSearchContext.Provider value={{ ...searchState, setSearchState }}>
      {children}
    </LandingSearchContext.Provider>
  );
};

export const useLandingSearch = () => useContext(LandingSearchContext);
