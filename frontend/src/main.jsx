import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from   "react-router-dom"; 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Signin from './pages/worker/Signin.jsx';
import Signup_customer from './pages/customer/Signup_customer.jsx';
import Signup_worker from './pages/worker/Signup_worker.jsx';

// landing page route have separate file in routes folder
import Landing_page from './Routes/Landing_page.jsx';

import Service_req_form from './Routes/customer/Service_req_form.jsx';
import Customer from './Routes/customer/Customer.jsx'
import Worker from './Routes/worker/Worker.jsx';
import All_requests from './Routes/worker/All_requests.jsx';
import Location_workerside from './Routes/worker/Location_workerside.jsx';
import Location_userside from './Routes/customer/Location_userside.jsx';
import Edit_worker from './components/worker/Edit_worker.jsx';
import Signin_customer from './pages/customer/Signin_customer.jsx';

import { CustomerProvider } from './Context/Customer_context.jsx';
import { ServiceReqProvider } from './Context/Service_req_context.jsx';
import { OtpProvider } from './Context/Otp_context.jsx';
import { WorkerProvider } from './Context/Worker_context.jsx';
import Edit_customer from './components/customer/Edit_customer.jsx';



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
   path: "/signin_customer",
   element:<Signin_customer/>,
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
  },
  {
    path:"/edit_worker",
    element:<Edit_worker/>
  },
  {
    path:"/edit_customer",
    element:<Edit_customer/>
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <OtpProvider>
    <ServiceReqProvider>
    <CustomerProvider>
   <WorkerProvider>
   <RouterProvider router={router}   />
   </WorkerProvider>
   </CustomerProvider>
   </ServiceReqProvider>
   </OtpProvider>
  </StrictMode>,
)
