 import Header from "./components/Header";
 import Footer from "./components/Footer";
 import Occupations from "./components/Occupations";
 import Signup from "./pages/Signup_customer";
import Signin from "./pages/Signin";
import { Outlet } from "react-router-dom";


 const App=()=>{
   return (
    <>
    <div className="border-1 border-black">
    <Header/>
    </div>
    <Occupations/>
    {/* <Signup/>
    <Signin/> */}
    {/* <Outlet/> */}
    <Footer/>
    </>
   );
 }

 export default App;
