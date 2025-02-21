import { Routes, Route } from "react-router-dom"; // ✅ Correct import
import Home from "./components/Home";
import Businesssearch from "./pages/Businesssearch";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./utils/auth";
import KeywordVolume from "./pages/KeywordVolume";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  let token = "";
  try {
    token = localStorage.getItem("token") || "";
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Businesssearch" element={<Businesssearch />} />
        <Route path="/Keywordvolume" element={<KeywordVolume />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} token={token} />}
        />

        {/* Protected Routes */}
        <Route
          path="/keyword-volume"
          element={<ProtectedRoute element={<KeywordVolume />} token={token} />}
        />
        <Route
          path="/search-businesses"
          element={
            <ProtectedRoute element={<Businesssearch />} token={token} />
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
