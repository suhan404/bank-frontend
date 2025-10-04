import { createBrowserRouter } from "react-router";
import Main from "../Layout/Main";
import Home from "../pages/Home/Home";
import SignUp from "../pages/SignUp/SignUp";
import Login from "../pages/Login/Login";
import AllProducts from "../pages/Products/AllProducts";
import CreateAccount from "../pages/Accounts/CreateAccount";
import PrivateRoutes from "./PrivateRoutes";
import Dashboard from "../Layout/Dashboard";
import UserHome from "../pages/User/UserHome";
import SendMoney from "../pages/User/SendMoney";
import TransactionHistory from "../pages/User/TransactionHistory";
import WithdrawMoney from "../pages/User/WithdrawMoney";
import AccountBalance from "../pages/User/AccountBalance";
import AdminDashboard from "../Layout/AdminDashboard";
import AdminRoute from "./AdminRoute";
import RequestBalanceList from "../pages/Admin/RequestBalanceList";
import AdminHome from "../pages/Admin/AdminHome";
import ApplyLoan from "../pages/User/ApplyLoan";
import LoanList from "../pages/Admin/LoanList";
import UserLoans from "../pages/User/UserLoans";
import ChequeBook from "../pages/User/ChequeBook";
import ChequeRequestList from "../pages/Admin/ChequeRequestList";
import AllAccount from "../pages/Admin/AllAccount";
import AllTransaction from "../pages/Admin/AllTransaction";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Main></Main>,
        children:[
            {
                path: "/",
                element: <Home></Home>
            },
            {
                path: "/signup",
                element: <SignUp></SignUp>
            },
            {
                path: "/login",
                element: <Login></Login>
            },
            {
                path: "/allproducts",
                element: <AllProducts></AllProducts>
            },
            {
                path: "/create-account",
                element: <CreateAccount></CreateAccount>
            }
        ]
    },

    {
        path: "dashboard",
        element: <Dashboard></Dashboard>,
        children: [
            {
                path: "user",
                element: <UserHome></UserHome>
            },
            {
                path: "send-money",
                element: <SendMoney></SendMoney>

            },
            {
                path: "transaction-history",
                element: <TransactionHistory></TransactionHistory>
            },
            {
                path: "withdraw-money",
                element: <PrivateRoutes><WithdrawMoney></WithdrawMoney></PrivateRoutes>
            },
            {
                path: "account-balance",
                element: <PrivateRoutes><AccountBalance></AccountBalance></PrivateRoutes>
            },
            {
                path: "apply-loan",
                element: <ApplyLoan></ApplyLoan>
            },
            {
                path: "user-loans",
                element: <UserLoans></UserLoans>
            },
            {
                path:"cheque-book-request",
                element: <ChequeBook></ChequeBook>
            }
        ]

    },
    {
        path: "admin-dashboard",
        element: <PrivateRoutes><AdminRoute><AdminDashboard></AdminDashboard></AdminRoute></PrivateRoutes>,
        children: [
            {
                path:"",
                element: <AdminHome></AdminHome>
            },
            {
                path: "requested-balance",
                element: <RequestBalanceList></RequestBalanceList>
            },
            {
                path: "send-money",
                element: <SendMoney></SendMoney>

            },
            {
                path: "transaction-history",
                element: <TransactionHistory></TransactionHistory>
            },
            {
                path: "all-loans",
                element: <LoanList></LoanList>
            },
            {
                path:"cheque-book-request-list",
                element: <ChequeRequestList></ChequeRequestList>
            },
            {
                path: "all-accounts",
                element: <AllAccount></AllAccount>
            },
            {
                path: "all-transactions",
                element: <AllTransaction></AllTransaction>
            }
            
        ]
    }
])