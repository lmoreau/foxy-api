import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { MsalProvider } from '@azure/msal-react';
import QuotePage from './components/QuotePage';
import ProductsPage from './components/ProductsPage';
import ResidualCheck from './components/ResidualCheck';
import { ResidualDetails } from './components/ResidualDetails';
import AppHeader from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { msalInstance } from './auth/authConfig';

const { Content } = Layout;

function App() {
  const [quoteRequestId, setQuoteRequestId] = useState<string | undefined>(undefined);

  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <Layout>
          <AppHeader quoteRequestId={quoteRequestId} />
          <Content style={{ padding: '0 50px', marginTop: '20px' }}>
            <Routes>
              <Route 
                path="/quote/:id" 
                element={<QuotePage setQuoteRequestId={setQuoteRequestId} />} 
              />
              <Route 
                path="/products" 
                element={<ProductsPage />} 
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
            </Routes>
          </Content>
        </Layout>
      </Router>
    </MsalProvider>
  );
}

export default App;
