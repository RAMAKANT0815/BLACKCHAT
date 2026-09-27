import React from "react";
import { Home, Search, PlusSquare, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../componentStyles/Footer.css"

function Footer() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <footer className="app-footer">

            {/* Home */}
            <button
                className={location.pathname === "/" ? "active" : ""}
                onClick={() => navigate("/")}
            >
                <Home size={22} />
                <span>Home</span>
            </button>


            {/* Find Shadows */}
            <button
                className={
                    location.pathname === "/shadows"
                        ? "active"
                        : ""
                }
                onClick={() => navigate("/shadows")}
            >
                <Search size={22} />
                <span>Find Shadows</span>
            </button>


            {/* Posts */}
            <button
                className={
                    location.pathname === "/createPost"
                        ? "active"
                        : ""
                }
                onClick={() => navigate("/createPost")}
            >
                <PlusSquare size={22} />
                <span>Posts</span>
            </button>


            {/* Profile */}
            <button
                className={
                    location.pathname === "/profile"
                        ? "active"
                        : ""
                }
                onClick={() => navigate("/profile")}
            >
                <User size={22} />
                <span>Profile</span>
            </button>

        </footer>
    );
}

export default Footer;