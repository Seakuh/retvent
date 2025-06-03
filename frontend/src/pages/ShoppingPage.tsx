import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Event } from "../utils";
import { getFits } from "./service";
import "./ShoppingPage.css";

export const ShoppingPage = () => {
  const [fits, setFits] = useState<Event[]>([]);

  useEffect(() => {
    getFits().then((fits) => setFits(fits));
  }, []);

  return (
    <div className="shopping-page-container">
      <div className="shopping-page-header">
        <h1>
          <ShoppingBag size={20} />
          Shopping
        </h1>
      </div>
      <div className="shopping-page-content">
        {fits.map((fit) => (
          <div className="shopping-page-content-header">
            <h2>{fit.title}</h2>
            <div className="shopping-page-content-header-right"></div>
          </div>
        ))}
      </div>
    </div>
  );
};
