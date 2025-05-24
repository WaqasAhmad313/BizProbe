import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import SearchBusinesses from "./pages/SearchBusinesses";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { ProtectedRoute } from "./utils/auth";
import BusinessResultsPage from "./pages/BusinessResults";
import BusinessDetailsPage from "./pages/BusinessDetails";

import DashboardLayout from "./pages/Dashboard/DashboardLayout";
import Templates from "./pages/Dashboard/Templates";
import Businesses from "./pages/Dashboard/Businesses";
import Outreach from "./pages/Dashboard/Outreach";
import FollowUp from "./pages/Dashboard/FollowUp";
import Accounts from "./pages/Dashboard/Account";
import TemplateEditor from "./pages/Dashboard/TemplateEditorPage";
import AddBusinessPage from "./pages/Dashboard/addBusiness";
import EmailTemplatePreviewPage from "./pages/Dashboard/sendMail";

function App() {
  let token = "";
  try {
    token = localStorage.getItem("token") || "";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  return (
    <AuthProvider>
      <SearchProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search-businesses" element={<SearchBusinesses />} />
          <Route path="/business-results" element={<BusinessResultsPage />} />
          <Route
            path="/business/:businessid"
            element={<BusinessDetailsPage />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute element={<DashboardLayout />} token={token} />
            }
          >
            <Route index element={<Businesses />} /> {/* <- default */}
            <Route path="businesses" element={<Businesses />} />
            <Route path="outreach" element={<Outreach />} />
            <Route path="followup" element={<FollowUp />} />
            <Route path="templates" element={<Templates />} />
            <Route path="Account" element={<Accounts />} />
            <Route path="TemplateEdit" element={<TemplateEditor />} />
            <Route path="Add-business" element={<AddBusinessPage />} />
            <Route path="send-mail" element={<EmailTemplatePreviewPage />} />
          </Route>
        </Routes>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;
