import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@/styles/globals.css";
import SuspenseLoader from "./components/ui/suspense-loader";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<SuspenseLoader />}>
    <App />
  </Suspense>,
);
