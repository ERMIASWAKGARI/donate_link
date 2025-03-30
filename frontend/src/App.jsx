

import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import ScrollToTop from './components/common/ScrollToTop'
import AllRoutes from "./routes/AllRoutes";

function App() {
  return (
    <div >
      <ScrollToTop/>
      <AllRoutes/>
      <Footer/>
    </div>
  );
}

export default App;
