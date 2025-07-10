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
import Edit_worker from './components/Edit_worker.jsx';
import { WorkerProvider } from './Context/Worker_context.jsx';
import { CustomerProvider } from './Context/Customer_context.jsx';
import { ServiceReqProvider } from './Context/Service_req_context.jsx';
import Signin_customer from './pages/signin_customer.jsx';


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
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ServiceReqProvider>
    <CustomerProvider>
    <WorkerProvider>
   <RouterProvider router={router}   />
   </WorkerProvider>
   </CustomerProvider>
   </ServiceReqProvider>
  </StrictMode>,
)
