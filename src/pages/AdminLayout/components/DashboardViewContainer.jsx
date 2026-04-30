import React from "react";
import DashboardView from "./DashboardView";

export default function DashboardViewContainer() {
  // We can get darkMode from a context or a global state here if needed
  // For now, we'll assume it's passed or handled inside AdminLayout
  // But since this is a route, we might need to handle it here.
  const darkMode = document.documentElement.classList.contains("dark");
  return <DashboardView darkMode={darkMode} />;
}
