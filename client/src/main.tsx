import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { mobileLogger } from "./utils/mobileLogger";

// Initialize mobile logging for smartphone debugging
mobileLogger.logDeviceInfo();
mobileLogger.log('SYSTEM', 'App starting up');

createRoot(document.getElementById("root")!).render(<App />);
