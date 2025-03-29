

import Footer from "./components/common/Footer";
import Header from "./components/common/Header";
import ScrollToTop from './components/common/ScrollToTop'
import AllRoutes from "./routes/AllRoutes";
import Header_for_indDonor from '../src/pages/Donor/IndividualDonor/Header_for_indDonor'
import Header_for_Organizationdonor from "./pages/Donor/OrganizationalDonor/Header_for_Organizationdonor"

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
