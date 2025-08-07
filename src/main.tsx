/**
 * @file main.tsx
 * @description Entry point for the Fantasy Rankings React application.
 *
 * This file bootstraps the React app:
 *  - Locates the root HTML container element in index.html
 *  - Wraps the <App /> component in React.StrictMode to detect
 *    potential problems and highlight unsafe lifecycle usage
 *  - Uses React 18's createRoot API for concurrent rendering
 *
 * Note:
 *  - The non-null assertion operator (!) is used to assure TypeScript
 *    that the root element exists in the DOM.
 *  - React.StrictMode does not affect production behavior.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
