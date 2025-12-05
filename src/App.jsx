import { BrowserRouter as Router } from "react-router-dom";
import "./index.css";
import PublicRoute from "./routes/PublicRoute";

function App() {
  return (
    <Router>
      <PublicRoute />
    </Router>
  );
}

export default App;
