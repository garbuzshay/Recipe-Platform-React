import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";
import { FiSun, FiMoon } from "react-icons/fi"; 

/**
 * Navbar component for navigating through different pages and toggling dark mode.
 */
function Navbar() {
  const { theme, getTheme, toggleDarkMode } = useTheme();
  const {isDarkMode} = theme;
  const currentTheme = getTheme();

  const { user } = useAuth();

  // Define navigation links
  const navItems = [
    { text: "HOME", href: "/", id: "home-page" },
    { text: "ADD NEW RECIPE", href: "/new-recipe", id: "newRecipe-page" },
    { text: "MEAL PLANNER", href: "/meal-planner", id: "mealPlanner-page" },
  ];

  // Define links for the mobile popup menu
  const popUpLinks = [
    { text: "Home", href: "/" },
    { text: "New Recipe", href: "/new-recipe" },
    { text: "Meal Planner", href: "/meal-planner" },
  ];

  const [showMenu, setShowMenu] = useState(false);
  

  // Function to toggle mobile popup menu
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div
      className={`w-full flex flex-row justify-between items-center p-4 h-12  ${
        currentTheme.primary
      }`}
    >
      <div className="flex items-center w-full flex-1">
        {user && (
          <>
            <p className="text-white text-xl px-2 AssistantFont">
              Hello, <strong>{user.displayName || user.email}</strong>
            </p>

            <button
              onClick={toggleMenu}
              className={`text-white text-2xl sm:hidden sm:self-end mx-2 right-0 absolute`}
            >
              &#9776;
            </button>
          </>
        )}
      </div>

      {user && (
        <ul className={`sm:flex space-x-8 sm:relative hidden items-center`}>
          {navItems.map((item) => (
            <li key={item.id} className="flex items-center">
              {" "}
              {/* Ensure each nav item is also a flex container */}
              <Link
                to={item.href}
                id={item.id}
                className={`text-white text-xl AssistantFont link-with-underline duration-200`}
              >
                {item.text}
              </Link>
            </li>
          ))}
          <div className="flex items-center space-x-2">
            <LogoutButton className="flex items-center justify-center text-white text-2xl" />
          </div>
        </ul>
      )}
      <button
        onClick={toggleDarkMode}
        className={`text-white text-2xl duration-200 mx-2 px-1 focus:outline-none desktop-only ${
          isDarkMode ? "hover:text-blue-300" : "hover:text-blue-950"
        }`}
      >
        {isDarkMode ? <FiSun /> : <FiMoon />}
      </button>

      {user && showMenu && (
        <div
          className={`sm:hidden absolute top-10 right-0 px-2 shadow-lg ${
            currentTheme.primary
          } `}
        >
          {popUpLinks.map((link) => (
            <div key={link.text} className="mb-2">
              <Link
                to={link.href}
                className={`text-white text-xl duration-200 ${
                  isDarkMode
                    ? "hover:text-blue-300"
                    : "hover:text-blue-950"
                } `}
              >
                {link.text}
              </Link>
            </div>
          ))}

          {user && (
            <>
              <div className="mb-2">
                <button
                  onClick={toggleDarkMode}
                  className={`text-white text-xl duration-200  focus:outline-none ${
                    isDarkMode
                      ? "hover:text-blue-300"
                      : "hover:text-blue-950"
                  }
                  }`}
                >
                  {isDarkMode ? "LightMode" : "DarkMode"}
                </button>
              </div>
              <div className="mb-2">
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Navbar;
