
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Occupations from "../components/Occupations";
import Landing_middle from "../components/Landing_middle";



 const Landing_page=()=>{
   return (
    <>
    <div className="border-1 border-black">
    <Header/>
    </div>
   <Landing_middle></Landing_middle>
    <Footer/>
    </>
   );
 }

 export default Landing_page;
