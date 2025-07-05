
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Occupations from "../components/Occupations";



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
