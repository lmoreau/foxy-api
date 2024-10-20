import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import QuotePage from './components/QuotePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/quote/:id" element={<QuotePage />} />
      </Routes>
    </Router>
  );
}

export default App;
