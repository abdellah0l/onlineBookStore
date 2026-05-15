import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { AdminDataProvider } from "./contexts/AdminDataContext";
import SignUp from "./components/signup";
import SignIn from "./components/signin";
import Profile from "./components/profile";
import Home from "./components/home";
import Books from "./components/books";
import BooksById from "./components/books-by-id";
import About from "./components/About";
import Features from "./components/features";
import Contact from "./components/contact";
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
    <Router>
      <AuthProvider>
        <DataProvider>
          <AdminDataProvider>
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />
              <Route path="/books/:id" element={<BooksById />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/about" element={<About />} />
              <Route path="/features" element={<Features />} />
              <Route path="/contact" element={<Contact />} />
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AdminDataProvider>
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
