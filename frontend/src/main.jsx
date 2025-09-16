import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Signin from './pages/worker/Signin.jsx';
import Signup_customer from './pages/customer/Signup_customer.jsx';
import Signup_worker from './pages/worker/Signup_worker.jsx';
import Landing_page from './Routes/Landing_page.jsx';

import Service_req_form from './Routes/customer/Service_req_form.jsx';
import Customer from './Routes/customer/Customer.jsx'
import Worker from './Routes/worker/Worker.jsx';
import All_requests from './Routes/worker/All_requests.jsx';
import Location_workerside from './Routes/worker/Location_workerside.jsx';
import Location_userside from './Routes/customer/Location_userside.jsx';
import Edit_worker from './components/worker/Edit_worker.jsx';
import Signin_customer from './pages/customer/Signin_customer.jsx';

import Edit_customer from './components/customer/Edit_customer.jsx';
import History_customer from './components/customer/History_customer.jsx';
import History_worker from './components/worker/History_worker.jsx';

import { CustomerProvider, useCustomer } from './Context/Customer_context.jsx';
import { ServiceReqProvider } from './Context/Service_req_context.jsx';
import { OtpProvider } from './Context/Otp_context.jsx';
import { WorkerProvider, useWorker } from './Context/Worker_context.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';
import ProtectedRoute_customer from './components/ProtectedRoute_customer.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";


function AppRouter() {
  const { token: customerToken } = useCustomer();
  const { token: workerToken } = useWorker();

  const isCustomerAuthenticated = Boolean(customerToken);
  const isWorkerAuthenticated = Boolean(workerToken);

  const router = createBrowserRouter([
    { path: "/", element: <Landing_page /> },
    { path: "/signup_customer", element: <Signup_customer /> },
    { path: "/signup_worker", element: <Signup_worker /> },
    { path: "/signin", element: <Signin /> },
    { path: "/signin_customer", element: <Signin_customer /> },

    // ---- Customer Parent Routes ----
    {
      path: "/customer",
      element: (
        <ProtectedRoute_customer isAuthenticated={isCustomerAuthenticated}>
          <Customer />
        </ProtectedRoute_customer>
      ),
      children: [
        { path: "edit", element: <Edit_customer /> },
        { path: "history", element: <History_customer /> },
        { path: "service_req_form", element: <Service_req_form /> },
        { path: "location", element: <Location_userside /> },
      ],
    },

    // ---- Worker Parent Routes ----
    {
      path: "/worker",
      element: (
        <ProtectedRoute isAuthenticated={isWorkerAuthenticated}>
          <Worker />
        </ProtectedRoute>
      ),
      children: [
        { path: "all_requests", element: <All_requests /> },
        { path: "location", element: <Location_workerside /> },
        { path: "edit", element: <Edit_worker /> },
        { path: "history", element: <History_worker /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="398958292681-q6q51mbrskl0sujqvt37to7afqpveph3.apps.googleusercontent.com">
    <OtpProvider>
      <ServiceReqProvider>
        <CustomerProvider>
          <WorkerProvider>
            <AppRouter />
          </WorkerProvider>
        </CustomerProvider>
      </ServiceReqProvider>
    </OtpProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
