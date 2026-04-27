import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import SignUp from "./components/signup";
import SignIn from "./components/signin";
import AdminLayout from "./components/admin/admin-layout";
import AdminDashboard from "./components/admin/dashboard";
import AdminBooks from "./components/admin/books";
import AdminOrders from "./components/admin/orders";
import AdminCustomers from "./components/admin/customers";
import AdminGenres from "./components/admin/genres";
import AdminReviews from "./components/admin/reviews";
import AdminAnalytics from "./components/admin/analytics";
import AdminSettings from "./components/admin/settings";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex items-center justify-center h-screen">
                <div>
                  <h1 className="text-4xl font-bold text-red-900">
                    Welcome to the Online Book Store
                  </h1>
                  <div className="flex items-center justify-center mt-4">
                    <button
                    className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => (window.location.href = "/signup")}
                  >
                    Sign Up
                  </button>
                  <button
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    onClick={() => (window.location.href = "/signin")}
                  >
                    Sign In
                  </button>
                  </div>
                </div>
              </div>
            }
          />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="genres" element={<AdminGenres />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
