import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ViewMode } from "./types/event";

type SearchState = {
  location: string;
  startDate: string;
  endDate: string;
  category: string;
  prompt: string;
  view: ViewMode;
  setSearchState: (state: Partial<SearchState>) => void;
};

const defaultState: Omit<SearchState, "setSearchState"> = {
  location: "Worldwide",
  startDate: "",
  endDate: "",
  category: "",
  prompt: "",
  view: "All",
};

const LandingSearchContext = createContext<SearchState | undefined>(undefined);

const STORAGE_KEY = "landingSearch";

const loadFromStorage = (): Omit<SearchState, "setSearchState"> => {
  if (typeof window === "undefined") return defaultState;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
  } catch (error) {
    console.error("Error loading search state from localStorage:", error);
    return defaultState;
  }
};

const saveToStorage = (state: Omit<SearchState, "setSearchState">) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving search state to localStorage:", error);
  }
};

export const LandingPageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchState, setSearchStateInternal] = useState<
    Omit<SearchState, "setSearchState">
  >(loadFromStorage);

  const setSearchState = useCallback(
    (newValues: Partial<SearchState>) => {
      setSearchStateInternal((prevState) => {
        const updatedState = { ...prevState, ...newValues };
        saveToStorage(updatedState);
        return updatedState;
      });
    },
    []
  );

  const contextValue = useMemo(
    () => ({ ...searchState, setSearchState }),
    [searchState, setSearchState]
  );

  return (
    <LandingSearchContext.Provider value={contextValue}>
      {children}
    </LandingSearchContext.Provider>
  );
};

export const useLandingSearch = () => {
  const context = useContext(LandingSearchContext);
  if (!context) {
    throw new Error(
      "useLandingSearch must be used within a LandingPageProvider"
    );
  }
  return context;
};
