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
import RawExcelUpload from './components/RawExcelUpload';
import MasterResidualList from './components/MasterResidualList';
import IncomingWirelinePayments from './components/IncomingWirelinePayments';
import AppHeader from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute';
import { msalInstance, initializeMsal } from './auth/authConfig';
import { Link } from 'react-router-dom';

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
          <AppLayout>
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
                element={<ResidualCheck />} 
              />
              <Route 
                path="/residual-details/:id" 
                element={<ResidualDetails />} 
              />
              <Route 
                path="/residual-upload" 
                element={<ResidualUpload />} 
              />
              <Route 
                path="/wireline-upload" 
                element={<WirelineUpload />} 
              />
              <Route 
                path="/raw-excel-upload" 
                element={<RawExcelUpload />} 
              />
              <Route 
                path="/won-services" 
                element={<WonServicesPage />} 
              />
              <Route 
                path="/master-residual-list" 
                element={<MasterResidualList />} 
              />
              <Route 
                path="/incoming-wireline-payments" 
                element={<IncomingWirelinePayments />} 
              />
              {/* Redirect root to residual-check */}
              <Route 
                path="/" 
                element={<ResidualCheck />} 
              />
              {/* Add catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      </Router>
    </MsalProvider>
  );
}

export default App;
