import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Search, Calendar, Loader2, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { PublicationsTabs, YearSelectorDialog, DocumentList } from './components';
import { usePublicationsState } from './hooks';

export const Publications = () => {
  const { user } = useAuth();
  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentYear,
    selectedYear,
    setSelectedYear,
    isDialogOpen,
    setIsDialogOpen,
    filteredDocuments,
    loading,
    error,
    page,
    perPage,
    total,
    totalPages,
    setPage,
    setPerPage,
    handleYearChange
  } = usePublicationsState();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || 'Usuário'}
        userRole={user?.cargo || 'Cargo'}
        breadcrumb="Publicações"
      />
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-between items-center">
                <PublicationsTabs />
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Pesquisar por número, servidor, tipo ou data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                  <YearSelectorDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    currentYear={currentYear}
                    selectedYear={selectedYear}
                    onSelectedYearChange={setSelectedYear}
                    trigger={
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        {currentYear}
                      </Button>
                    }
                    onConfirm={handleYearChange}
                  />
                </div>
              </div>
              <TabsContent value="portarias" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Portarias Publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    ) : (
                      <>
                        <DocumentList documents={filteredDocuments} />
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">Total: {total} • Página {page} de {totalPages}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
                            <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
                              {[10, 20, 50].map(n => (<option key={n} value={n}>{n}/página</option>))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="decretos" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Decretos Publicados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    ) : (
                      <>
                        <DocumentList documents={filteredDocuments} />
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">Total: {total} • Página {page} de {totalPages}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
                            <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
                              {[10, 20, 50].map(n => (<option key={n} value={n}>{n}/página</option>))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="diarias" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Diárias Publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Carregando...
                      </div>
                    ) : error ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                      </div>
                    ) : (
                      <>
                        <DocumentList documents={filteredDocuments} />
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">Total: {total} • Página {page} de {totalPages}</div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</Button>
                            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Próxima</Button>
                            <select value={perPage} onChange={(e) => setPerPage(parseInt(e.target.value))} className="border rounded px-2 py-1 text-sm">
                              {[10, 20, 50].map(n => (<option key={n} value={n}>{n}/página</option>))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Publications;
