import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import AllRoutes from "./routes/AllRoutes";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <div className='pb-16'>
      <ScrollToTop/>
      <AllRoutes/>
    </div>
  );
}

export default App;
