import {
  Bell,
  Search,
  Bot,
  UserCircle
} from "lucide-react";

import "../styles/Header.css";

export default function Header() {
  return (
    <header className="header">

      <div className="header-left">
        <h1>Welcome back 👋</h1>
        <p>Friday, 24 July 2026</p>
      </div>

      <div className="header-right">

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search complaints..."
          />
        </div>

        <button className="icon-btn">
          <Bot size={20} />
        </button>

        <button className="icon-btn">
          <Bell size={20} />
        </button>

        <button className="profile-btn">
          <UserCircle size={34} />
        </button>

      </div>

    </header>
  );
}