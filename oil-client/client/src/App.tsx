import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/layout";
import AdminLayout from "@/components/admin-layout";
import Home from "@/pages/home";
import Category from "@/pages/category";
import ProductDetail from "@/pages/product-detail";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout"; // Uncomment this line if you have a Checkout page
// import Checkout from "@/pages/checkout"
import Wishlist from "@/pages/wishlist";
import OrdersHistory from "@/pages/account/orders";
import ChangePassword from "@/pages/account/change-password";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AdminSubCategories from "@/pages/admin/subcategories";
import AdminSliders from "@/pages/admin/sliders";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import AdminSettings from "@/pages/admin/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout>
          <AdminProducts />
        </AdminLayout>
      </Route>
      <Route path="/admin/categories">
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      </Route>
      <Route path="/admin/subcategories">
        <AdminLayout>
          <AdminSubCategories />
        </AdminLayout>
      </Route>
      <Route path="/admin/sliders">
        <AdminLayout>
          <AdminSliders />
        </AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </Route>
      <Route path="/admin/customers">
        <AdminLayout>
          <AdminCustomers />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      </Route>

      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/category/:slug" component={Category} />
            <Route path="/product/:slug" component={ProductDetail} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/auth/login" component={Login} />
            <Route path="/auth/signup" component={Signup} />
            <Route path="/account/orders" component={OrdersHistory} />
            <Route path="/account/change-password" component={ChangePassword} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/wishlist" component={Wishlist} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
