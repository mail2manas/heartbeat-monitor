import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UserList from "@/pages/UserList";
import NotFound from "@/pages/NotFound";
import SchemeList from "@/pages/SchemeList";
import CouponTypeList from "@/pages/CouponTypeList";
import FOCProductList from "@/pages/FOCProductList";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><AdminLayout><UserList /></AdminLayout></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><AdminLayout><SchemeList /></AdminLayout></ProtectedRoute>} />
          <Route path="/coupon-types" element={<ProtectedRoute><AdminLayout><CouponTypeList /></AdminLayout></ProtectedRoute>} />
          <Route path="/foc-products" element={<ProtectedRoute><AdminLayout><FOCProductList /></AdminLayout></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
