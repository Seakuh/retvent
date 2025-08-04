import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { About } from "./Footer/About";
import { Imprint } from "./Footer/Imprint";
import { Privacy } from "./Footer/Privacy";
import { Terms } from "./Footer/Terms";
import { LandingPageProvider } from "./LandinSearchContext";
import LandingPage from "./LandingPage";
import AdminEvents from "./components/Admin/AdminEvents";
import CreateEvent from "./components/Admin/CreateEvent";
import EditEvent from "./components/Admin/EditEvent";
import Login from "./components/Auth/Login";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Register from "./components/Auth/Register";
import CommentGuidelines from "./components/CommentGuidelines/CommentGuidelines";
import { GroupInvite } from "./components/CommunityDetailBar/GroupInvite/GroupInvite";
import { EventDetail } from "./components/EventDetail/EventDetail";
import { AdvertisingOptions } from "./components/EventDetail/components/OwnerComponent/Advertising/AdvertisingOptions";
import { FeedProvider } from "./components/Feed/FeedProvider";
import { GroupChat } from "./components/GroupChat/GroupChat";
import { GroupChatPage } from "./components/GroupChat/GroupChatPage";
import { ChatProvider } from "./components/GroupChat/chatProvider";
import { PwaInstall } from "./components/PwaInstall/PwaInstall";
import { Me } from "./components/User/Me/Me";
import { Profile } from "./components/User/Profile/Profile";
import { UserContextProvider } from "./contexts/UserContextProvider";
import { MyTickets } from "./pages/MyTickets.";
import ReelPage from "./pages/ReelPage";
import { SearchPage } from "./pages/SearchPage";
import { ShoppingPage } from "./pages/ShoppingPage";
import { TicketPage } from "./pages/TicketPage";
import { syncFavorites } from "./service";
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       // Global Defaults
//       staleTime: 2 * 60 * 1000,
//       cacheTime: 15 * 60 * 1000,
//       retry: 2,
//       refetchOnWindowFocus: false,
//     },
//   },
// });
// Sentry.init({
//   dsn: "https://a002b10533132bf43d28a5339d1e4116@o4509235823116288.ingest.de.sentry.io/4509235824623696",
//   // Setting this option to true will send default PII data to Sentry.
//   // For example, automatic IP address collection on events
//   sendDefaultPii: true,
// });

// Prefetching wichtiger Daten beim App-Start
// queryClient.prefetchQuery(["events", null], () => eventService.getEvents());

const App: React.FC = () => {
  console.log(
    `..............................................
----------------------........................
--------------++-----------...-+-.............
---------++++++++++++++++++++++++++++.........
-------+++----++------........-+-...++-.......
-------++-------------.........-.....++.......
-------++------------................++.......
-------++++++++++++++++++++++++++++++++.......
-------++----------...--.-...........++.......
-------++---.......----------........++.......
-------++--........---+++-------.....++.......
-------++--.......--+++++++------....++.......
-------++--......++++++++++++----....++.......
-------++--........++++++++------....++.......
-------++---....-..++++++++-----.....++.......
-------++-----.----+++--+++---.......++.......
-------++-----------.....-...........++.......
-------+++------------..............++-.......
---------++++++++++++++++++++++++++++-........
----------------------------.-................
----------------------.-......................`
  );

  useEffect(() => {
    void syncFavorites();
  }, []);

  return (
    <LandingPageProvider>
      <FeedProvider>
        <ChatProvider>
          {/* <QueryClientProvider client={queryClient}> */}
          <UserContextProvider>
            <div className="app">
              <main>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile/:userId" element={<Profile />} />
                  <Route path="/event/:eventId" element={<EventDetail />} />
                  <Route path="/category/:category" element={<LandingPage />} />
                  <Route
                    path="/advertising/:eventId"
                    element={<AdvertisingOptions />}
                  />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/imprint" element={<Imprint />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/profile/:artistName" element={<Profile />} />
                  <Route path="/install-app" element={<PwaInstall />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/ticket/:ticketId" element={<TicketPage />} />
                  <Route path="/search/:query?" element={<SearchPage />} />
                  <Route path="/reel/:eventId" element={<ReelPage />} />
                  <Route path="/imprint" element={<Imprint />} />
                  <Route
                    path="/group/invite/:userId/:tokenId"
                    element={<GroupInvite />}
                  />
                  <Route
                    path="/my-groups"
                    element={
                      <ProtectedRoute>
                        <GroupChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/comment-guidelines"
                    element={<CommentGuidelines />}
                  />
                  <Route path="/group/:groupId" element={<GroupChat />} />
                  <Route
                    path="/me"
                    element={
                      <ProtectedRoute>
                        <Me />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-tickets"
                    element={
                      <ProtectedRoute>
                        <MyTickets />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/shopping" element={<ShoppingPage />} />
                  {/* <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                /> */}
                  <Route
                    path="/admin/events"
                    element={
                      <ProtectedRoute>
                        <AdminEvents />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/events/create"
                    element={
                      <ProtectedRoute>
                        <CreateEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/events/edit/:eventId"
                    element={
                      <ProtectedRoute>
                        <EditEvent />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<LandingPage />} />
                </Routes>
              </main>
            </div>
          </UserContextProvider>
          {/* </QueryClientProvider> */}
        </ChatProvider>
      </FeedProvider>
    </LandingPageProvider>
  );
};

export default App;
