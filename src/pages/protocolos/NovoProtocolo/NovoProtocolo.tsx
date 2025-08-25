import React from 'react';
import Header from '../../../components/Header';
import NovoProtocoloFormWrapper from '@/pages/protocolos/NovoProtocolo/components/NovoProtocoloFormWrapper';
import { useAuth } from '../../../contexts/AuthContext';

const NovoProtocolo = () => {
  const { user } = useAuth();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Novo Protocolo"
      />
      <div className="flex-1 p-8 max-w-[1280px] mx-auto">
        <NovoProtocoloFormWrapper />
      </div>
    </div>
  );
};

export default NovoProtocolo;