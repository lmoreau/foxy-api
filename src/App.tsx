import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import QuotePage from './components/QuotePage';
import ProductsPage from './components/ProductsPage';
import AppHeader from './components/Header';

const { Content } = Layout;

function App() {
  const [quoteRequestId, setQuoteRequestId] = useState<string | undefined>(undefined);

  return (
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
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
}

export default App;
