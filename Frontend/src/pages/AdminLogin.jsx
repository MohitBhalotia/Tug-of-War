import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CONFIG } from "../config";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if the access token matches
    if (accessToken === CONFIG.ADMIN_ACCESS_TOKEN) {
      // Generate a secure admin token
      const adminToken = generateAdminToken();
      
      // Store admin authentication token in localStorage instead of a boolean
      localStorage.setItem("adminToken", adminToken);
      
      toast.success("Admin access granted", {
        description: "You can now create teams and manage games",
      });
      
      // Navigate to the team registration page
      navigate("/register-teams");
    } else {
      toast.error("Invalid access token", {
        description: "Please check your access token and try again",
      });
      setIsSubmitting(false);
    }
  };

  // Generate a secure admin token
  const generateAdminToken = () => {
    // Create a token that includes the admin access token and a timestamp
    // This makes it harder to fake and allows for token expiration if needed
    const timestamp = new Date().getTime();
    const tokenData = `${CONFIG.ADMIN_ACCESS_TOKEN}:${timestamp}`;
    
    // In a real app, you might want to use a more secure method like JWT
    // For this example, we'll use a simple encoding
    return btoa(tokenData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Tug of War</h1>
          <p className="text-blue-200">Admin Access Portal</p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Authentication</h2>
                <p className="text-blue-100 text-sm">Enter your access token to continue</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-5">
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <input
                  id="accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your admin access token"
                  required
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                This token is required to access the admin features
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !accessToken}
                className={`px-5 py-2.5 rounded-lg text-white font-medium flex items-center ${
                  isSubmitting || !accessToken
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Access Admin
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Need help? Contact your system administrator
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Version {CONFIG.VERSION} | 2025 Tug of War
          </p>
        </div>
      </div>
    </div>
  );
}
