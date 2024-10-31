import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { MsalProvider } from '@azure/msal-react';
import QuotePage from './components/QuotePage';
import ProductsPage from './components/ProductsPage';
import ResidualCheck from './components/ResidualCheck';
import { ResidualDetails } from './components/ResidualDetails';
import ResidualUpload from './components/ResidualUpload';
import WirelineUpload from './components/WirelineUpload';
import AppHeader from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { msalInstance, initializeMsal } from './auth/authConfig';

const { Content } = Layout;

function App() {
  const [quoteRequestId, setQuoteRequestId] = useState<string | undefined>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeMsal().then(() => {
      setIsInitialized(true);
    });
  }, []);

  if (!isInitialized) {
    return <div>Initializing authentication...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Layout>
          <AppHeader quoteRequestId={quoteRequestId} />
          <Content style={{ padding: '0 50px', marginTop: '20px' }}>
            <Routes>
              <Route 
                path="/quote/:id" 
                element={
                  <ProtectedRoute>
                    <QuotePage setQuoteRequestId={setQuoteRequestId} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/products" 
                element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/residual-check" 
                element={
                  <ProtectedRoute>
                    <ResidualCheck />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/residual-details/:id" 
                element={
                  <ProtectedRoute>
                    <ResidualDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/residual-upload" 
                element={
                  <ProtectedRoute>
                    <ResidualUpload />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wireline-upload" 
                element={
                  <ProtectedRoute>
                    <WirelineUpload />
                  </ProtectedRoute>
                } 
              />
              {/* Redirect root to residual-check */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <ResidualCheck />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </MsalProvider>
  );
}

export default App;
