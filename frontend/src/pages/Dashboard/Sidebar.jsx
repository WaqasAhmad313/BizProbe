import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Briefcase, Send, Clock, FileText, User, LogOut } from "lucide-react";

const navItems = [
  {
    name: "Businesses",
    path: "/dashboard/businesses",
    icon: <Briefcase size={18} />,
  },
  { name: "Outreach", path: "/dashboard/outreach", icon: <Send size={18} /> },
  { name: "Follow Up", path: "/dashboard/followup", icon: <Clock size={18} /> },
  {
    name: "Templates",
    path: "/dashboard/templates",
    icon: <FileText size={18} />,
  },
  { name: "Accounts", path: "/dashboard/Account", icon: <User size={18} /> },
];

const Sidebar = () => {
  const [user, setUser] = useState({
    name: "Loading...",
    email: "",
    profilePic: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/gmail/gmail", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user data");

        const data = await res.json();

        setUser({
          name: data.userInfo.name,
          email: data.userInfo.email,
          profilePic: data.businessStats.gmail_profile_picture,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser({
          name: "Unknown User",
          email: "Unavailable",
          profilePic: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      }
    };

    fetchUser();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-indigo-900 via-purple-900 to-black text-white flex flex-col p-6">
      <div className="flex flex-col items-center mb-8">
        <img
          src={user.profilePic}
          alt="Profile"
          className="w-14 h-14 rounded-full object-cover mb-3 border-2 border-blue-500"
        />
        <div className="text-center">
          <div className="text-lg font-semibold">{user.name}</div>
          <div className="text-xs text-gray-400">{user.email}</div>
        </div>
      </div>

      <hr className="border-t border-gray-600 mb-6" />

      <nav className="flex flex-col gap-3">
        {navItems.map(({ name, path, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-3xl text-sm font-medium transition ${
                isActive
                  ? "bg-white text-black"
                  : "text-white hover:bg-gray-400 hover:border-white"
              }`
            }
          >
            {icon}
            {name}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2 mt-4 rounded-3xl text-sm font-medium transition text-white hover:bg-red-600"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
