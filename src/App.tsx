import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { MsalProvider } from '@azure/msal-react';
import QuotePage from './components/QuotePage';
import ProductsPage from './components/ProductsPage';
import ResidualCheck from './components/ResidualCheck';
import { ResidualDetails } from './components/ResidualDetails';
import ResidualUpload from './components/ResidualUpload';
import WirelineUpload from './components/WirelineUpload';
import ProductCompensationPage from './components/ProductCompensationPage';
import RawExcelUpload from './components/RawExcelUpload';
import MasterResidualList from './components/MasterResidualList';
import AppHeader from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { msalInstance, initializeMsal } from './auth/authConfig';
import { Link } from 'react-router-dom';
import QuoteList from './pages/QuoteList';
import { checkUserAccess } from './auth/authService';

const { Content } = Layout;

// Domain configuration
const DOMAINS = {
  CPQ: 'cpq.infusion-it.com',
  MAIN: 'foxyledger.infusion-it.com',
};

// Create a wrapper component to handle the conditional header rendering
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isQuotePage = location.pathname.startsWith('/quote/');

  return (
    <Layout>
      {!isQuotePage && <AppHeader />}
      <Content style={{ padding: isQuotePage ? 0 : '0 50px', marginTop: isQuotePage ? 0 : '20px' }}>
        {children}
      </Content>
    </Layout>
  );
};

// Domain redirect handler component
const DomainHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hostname = window.location.hostname;
  const isCPQDomain = hostname === DOMAINS.CPQ;
  const isMainDomain = hostname === DOMAINS.MAIN;
  const isCPQRoute = location.pathname.match(/^\/(quote|quotes)/);

  useEffect(() => {
    // If on CPQ domain but not on a CPQ route, redirect to main domain
    if (isCPQDomain && !isCPQRoute) {
      window.location.href = `https://${DOMAINS.MAIN}${location.pathname}${location.search}`;
    }
    // If on main domain and accessing a CPQ route, redirect to CPQ domain
    else if (isMainDomain && isCPQRoute) {
      window.location.href = `https://${DOMAINS.CPQ}${location.pathname}${location.search}`;
    }
  }, [location.pathname, location.search, isCPQDomain, isMainDomain, isCPQRoute]);

  return <>{children}</>;
};

// Admin route wrapper component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [userAccess, setUserAccess] = useState<string>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAccess = async () => {
      const access = await checkUserAccess();
      setUserAccess(access);
      setLoading(false);
    };
    fetchUserAccess();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (userAccess !== 'admin') {
    return (
      <div style={{ 
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5'
      }}>
        <img 
          src="/foxylogo.png" 
          alt="Foxy Logo" 
          style={{ 
            height: '60px', 
            marginBottom: '24px' 
          }} 
        />
        <div style={{
          padding: '24px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0',
            color: '#434343'
          }}>Access Restricted</h2>
          <p style={{ 
            margin: '0 0 8px 0',
            color: '#595959'
          }}>This page is only accessible to administrators.</p>
          <p style={{ 
            margin: '0',
            color: '#8c8c8c',
            fontSize: '14px'
          }}>Please contact your administrator if you believe this is an error.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Add this new component
const NotFound = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: 'calc(100vh - 64px)',
      padding: '20px',
      textAlign: 'center'
    }}>
      <img src="/foxylogo.png" alt="Foxy Logo" style={{ height: '60px', marginBottom: '24px' }} />
      <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>404 - Page Not Found</h1>
      <p style={{ marginBottom: '24px', color: '#595959' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" style={{ 
        padding: '8px 16px',
        background: '#1890ff',
        color: 'white',
        borderRadius: '4px',
        textDecoration: 'none'
      }}>
        Return Home
      </Link>
    </div>
  );
};

// Wrapper component for routes that need the AppLayout
const LayoutWrapper = ({ element }: { element: React.ReactNode }) => {
  return <AppLayout>{element}</AppLayout>;
};

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [_quoteRequestId, setQuoteRequestId] = useState<string | undefined>(undefined);

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
        <ProtectedRoute>
          <DomainHandler>
            <Routes>
              {/* Admin-only routes */}
              <Route 
                path="/product-compensation" 
                element={
                  <AdminRoute>
                    <ProductCompensationPage />
                  </AdminRoute>
                } 
              />
              
              {/* Routes with AppLayout */}
              <Route 
                path="/quote/:id" 
                element={<LayoutWrapper element={<QuotePage setQuoteRequestId={setQuoteRequestId} />} />} 
              />
              <Route 
                path="/products" 
                element={<LayoutWrapper element={<ProductsPage />} />} 
              />
              <Route 
                path="/residual-check" 
                element={<LayoutWrapper element={<ResidualCheck />} />} 
              />
              <Route 
                path="/residual-details/:id" 
                element={<LayoutWrapper element={<ResidualDetails />} />} 
              />
              <Route 
                path="/residual-upload" 
                element={<LayoutWrapper element={<ResidualUpload />} />} 
              />
              <Route 
                path="/wireline-upload" 
                element={<LayoutWrapper element={<WirelineUpload />} />} 
              />
              <Route 
                path="/raw-excel-upload" 
                element={<LayoutWrapper element={<RawExcelUpload />} />} 
              />
              <Route 
                path="/master-residual-list" 
                element={<LayoutWrapper element={<MasterResidualList />} />} 
              />
              <Route
                path="/quotes"
                element={<LayoutWrapper element={<QuoteList />} />}
              />
              {/* Redirect root to residual-check */}
              <Route 
                path="/" 
                element={<LayoutWrapper element={<ResidualCheck />} />} 
              />
              {/* Add catch-all route for 404 */}
              <Route path="*" element={<LayoutWrapper element={<NotFound />} />} />
            </Routes>
          </DomainHandler>
        </ProtectedRoute>
      </Router>
    </MsalProvider>
  );
}

export default App;
