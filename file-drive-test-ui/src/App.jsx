import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyFiles from './pages/MyFiles.jsx';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MyFiles />} />
          <Route path="/folder/:folderId" element={<MyFiles />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
