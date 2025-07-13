
import { Outlet } from "react-router-dom";
import Header from '../../components/general/Header.jsx'
import Footer from "../../components/general/Footer.jsx";
import Occupations from "../../components/customer/Occupations.jsx";



 const App=()=>{
   return (
    <>
    <div className="border-1 border-black">
    <Header/>
    </div>
    <Occupations/>
    <Footer/>
    </>
   );
 }

 export default App;
