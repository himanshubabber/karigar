import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from   "react-router-dom"; 
import App from './Routes/App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Signin from './pages/Signin.jsx';
import Signup_customer from './pages/Signup_customer.jsx';
import Signup_worker from './pages/Signup_worker.jsx';
import Landing_page from './Routes/Landing_page.jsx';
import Service_req_form from './Routes/Service_req_form.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  { path: "/signup_customer",
   element: <Signup_customer/> 
  },
  { path: "/signup_worker",
    element: <Signup_worker/> 
   },
  {
    path: "/signin",
    element: <Signin />,
  },
  {
    path: "/landing_page",
    element: <Landing_page />,
  },
  {
    path: "/service_req_form",
    element: <Service_req_form/>,
  },
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router}   />
  </StrictMode>,
)
