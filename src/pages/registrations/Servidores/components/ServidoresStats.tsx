import React from 'react';
import { Users, UserCheck, UserX, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Servidor, StatusServidorEnum, TipoServidorEnum } from '@/services/servidorService';

interface ServidoresStatsProps {
  servidores: Servidor[];
  showStats: boolean;
  setShowStats: (show: boolean) => void;
}

const ServidoresStats: React.FC<ServidoresStatsProps> = ({
  servidores,
  showStats,
  setShowStats
}) => {
  const totalServidores = servidores.length;
  const servidoresAtivos = servidores.filter(s => s.status === StatusServidorEnum.ATIVO).length;
  const servidoresInativos = servidores.filter(s => s.status === StatusServidorEnum.INATIVO).length;
  const servidoresLicenca = servidores.filter(s => s.status === StatusServidorEnum.LICENCA).length;
  const servidoresEfetivos = servidores.filter(s => s.tipo_servidor === TipoServidorEnum.EFETIVO).length;

  if (!showStats) {
    return (
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setShowStats(true)}
          className="text-sm"
        >
          Mostrar Estatísticas
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Estatísticas dos Servidores</h2>
        <Button
          variant="outline"
          onClick={() => setShowStats(false)}
          className="text-sm"
        >
          Ocultar Estatísticas
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServidores}</div>
            <p className="text-xs text-muted-foreground">
              Total de servidores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{servidoresAtivos}</div>
            <p className="text-xs text-muted-foreground">
              {totalServidores > 0 ? Math.round((servidoresAtivos / totalServidores) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{servidoresInativos}</div>
            <p className="text-xs text-muted-foreground">
              {totalServidores > 0 ? Math.round((servidoresInativos / totalServidores) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Licença</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{servidoresLicenca}</div>
            <p className="text-xs text-muted-foreground">
              {totalServidores > 0 ? Math.round((servidoresLicenca / totalServidores) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efetivos</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{servidoresEfetivos}</div>
            <p className="text-xs text-muted-foreground">
              {totalServidores > 0 ? Math.round((servidoresEfetivos / totalServidores) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServidoresStats;