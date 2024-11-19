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
import WonServicesPage from './components/WonServicesPage';
import ProductCompensationPage from './components/ProductCompensationPage';
import RawExcelUpload from './components/RawExcelUpload';
import MasterResidualList from './components/MasterResidualList';
import IncomingWirelinePayments from './components/IncomingWirelinePayments';
import AppHeader from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { msalInstance, initializeMsal } from './auth/authConfig';
import { Link } from 'react-router-dom';
import QuoteList from './pages/QuoteList';

const { Content } = Layout;

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
          <Routes>
            {/* Independent route for ProductCompensationPage */}
            <Route 
              path="/product-compensation" 
              element={<ProductCompensationPage />} 
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
              path="/won-services" 
              element={<LayoutWrapper element={<WonServicesPage />} />} 
            />
            <Route 
              path="/master-residual-list" 
              element={<LayoutWrapper element={<MasterResidualList />} />} 
            />
            <Route 
              path="/incoming-wireline-payments" 
              element={<LayoutWrapper element={<IncomingWirelinePayments />} />} 
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
        </ProtectedRoute>
      </Router>
    </MsalProvider>
  );
}

export default App;
