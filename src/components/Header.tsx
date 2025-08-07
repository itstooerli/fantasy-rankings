/**
 * @file Header.tsx
 * @description Displays the application's main header bar.
 */

import React from "react";

/**
 * Header component that renders the application's title
 */
const Header: React.FC = () => {
  return (
    <header
      style={{ padding: "1rem", backgroundColor: "#282c34", color: "white" }}
    >
      <h1>Fantasy Football Rankings Editor 🏈</h1>
    </header>
  );
};

export default Header;
