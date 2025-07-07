import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from   "react-router-dom"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Signin from './pages/Signin.jsx';
import Signup_customer from './pages/Signup_customer.jsx';
import Signup_worker from './pages/Signup_worker.jsx';
import Landing_page from './Routes/Landing_page.jsx';
import Service_req_form from './Routes/Service_req_form.jsx';
import Customer from './Routes/Customer.jsx'
import Worker from './Routes/Worker.jsx';
import All_requests from './Routes/All_requests.jsx';
import Location_workerside from './Routes/Location_workerside.jsx';
import Location_userside from './Routes/Location_userside.jsx';



const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing_page />,
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
    path: "/customer",
    element:<Customer/> ,
  },
  {
    path: "/service_req_form",
    element: <Service_req_form/>,
  },
  {
    path: "/worker",
    element: <Worker/>,
  },
  {
   path: "/all_requests",
   element: <All_requests/>,
  },
  {
    path:"/location_worker",
    element:<Location_workerside/>,
  },
  {
    path:"/location_user",
    element:<Location_userside/>,
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={router}   />
  </StrictMode>,
)
