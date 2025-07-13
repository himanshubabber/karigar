
import { Outlet } from "react-router-dom";
import Header from "../components/general/Header.jsx";
import Footer from "../components/general/Footer.jsx";
import Landing_middle from "../components/general/Landing_middle.jsx";



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
