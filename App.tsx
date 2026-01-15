import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from '@/components/Home';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="w-full flex flex-col min-h-[calc(100vh-80px)]">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;