import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  mockEvents,
  mockReleases,
  mockTicketSales,
  mockTrends,
  mockUserInsights,
  mockUserProfile,
} from "../../mockData";
import Tabs from "../ui/Tabs";
import ContentGenerator from "./ContentGenerator";
import Customizer from "./Customizer";
import EventCalendar from "./EventCalendar";
import styles from "./MonitoringDashboard.module.css";
import ReleasesManager from "./ReleasesManager";
import TicketSalesBarChart from "./TicketSalesBarChart";
import ToolsBox from "./ToolsBox";
import TrendAnalysis from "./TrendAnalysis";
import UserInsightsPie from "./UserInsightsPie";

const MonitoringDashboard: React.FC = () => {
  const [userProfile] = useState(mockUserProfile);
  const navigate = useNavigate();
  const tabs = [
    {
      id: "monitoring",
      label: "Monitoring",
      content: (
        <div className={styles.section}>
          <div className={styles.grid}>
            <TicketSalesBarChart data={mockTicketSales} />
            <UserInsightsPie data={mockUserInsights} />
            <TrendAnalysis trends={mockTrends} />
          </div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming Events</h2>
            <EventCalendar events={mockEvents} />
          </div>
        </div>
      ),
    },
    {
      id: "releases",
      label: "Releases",
      content: <ReleasesManager releases={mockReleases} />,
    },
    {
      id: "content",
      label: "Content Tools",
      content: (
        <div className={styles.section}>
          <ContentGenerator userProfile={userProfile} />
          <Customizer userProfile={userProfile} />
        </div>
      ),
    },
    {
      id: "tools",
      label: "Organizer Tools",
      content: <ToolsBox />,
    },
  ];

  const handleBack = () => {
    navigate("  /");
  };

  return (
    <>
      <div className={styles.container}>
        <button onClick={handleBack} className="back-button">
          <ChevronLeft className="h-5 w-5" />{" "}
        </button>
        <header className={styles.header}>
          <h1 className={styles.title}>Creator Dashboard</h1>
        </header>
      </div>
      <Tabs tabs={tabs} className={styles.tabs} />
    </>
  );
};

export default MonitoringDashboard;
