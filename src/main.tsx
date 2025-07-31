import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ViewProvider } from "./context/ViewProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <ViewProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </ViewProvider>
);
