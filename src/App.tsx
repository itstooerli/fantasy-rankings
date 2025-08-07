/**
 * @file App.tsx
 * @description Root component for the Fantasy Rankings application.
 *
 * This file is responsible solely for structuring the page UI and does not contain
 * any state management or business logic.
 */

import Header from "./components/Header";
import RankerBoard from "./components/RankerBoard";

/**
 * Root application component for the primary layout of the Fantasy Rankings application.
 */
function App() {
  return (
    <>
      <Header />
      <main style={{ padding: "1rem" }}>
        <p>Welcome! Start editing your fantasy rankings.</p>
        <RankerBoard />
      </main>
    </>
  );
}

export default App;
