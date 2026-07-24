import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus2,
  History,
  BarChart3,
  Bot,
  Settings,
  LogOut
} from "lucide-react";

import "../styles/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="logo">
        <div className="logo-circle">
          AI
        </div>

        <div>
          <h2>AIVOA</h2>
          <span>Pharma AI Assistant</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="menu">

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/complaint"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <FilePlus2 size={20} />
          Register Complaint
        </NavLink>

        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <History size={20} />
          Complaint History
        </NavLink>

        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <BarChart3 size={20} />
          Analytics
        </NavLink>

        <NavLink
          to="/assistant"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <Bot size={20} />
          AI Copilot
        </NavLink>

      </nav>

      <div className="bottom-menu">

        <button className="bottom-btn">
          <Settings size={18}/>
          Settings
        </button>

        <button className="bottom-btn logout">
          <LogOut size={18}/>
          Logout
        </button>

      </div>

      {/* User */}
      <div className="sidebar-footer">

        <div className="user-avatar">
          D
        </div>

        <div>
          <h4>Divyasree</h4>
          <p>Quality Manager</p>
        </div>

      </div>

    </aside>
  );
}