
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Dashboard from '@/pages/protocol/ProtocolDashboard/ProtocolDashboard';

const Index = () => {
  const location = useLocation();
  
  return (
    <div className="h-screen bg-gray-50">
      <Dashboard />
    </div>
  );
};

export default Index;
