import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, Eye, QrCode, FileText, Gavel, Car, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const publishedDocuments = [
  {
    id: 1,
    number: '001/2024',
    type: 'portarias',
    server: 'João Silva',
    title: 'Nomeação de Servidor',
    date: '15/01/2024',
    publishDate: '20/01/2024'
  },
  {
    id: 2,
    number: '005/2024',
    type: 'decretos',
    server: 'Maria Santos',
    title: 'Regulamentação de Processos',
    date: '19/01/2024',
    publishDate: '24/01/2024'
  },
  {
    id: 3,
    number: '003/2024',
    type: 'diarias',
    server: 'Pedro Costa',
    title: 'Viagem a Campo Grande',
    date: '17/01/2024',
    publishDate: '22/01/2024'
  }
];

export const Publications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('portarias');
  const [currentYear, setCurrentYear] = useState('2025');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const filteredDocuments = publishedDocuments.filter(doc => {
    const matchesType = doc.type === activeTab;
    const matchesSearch = !searchTerm || 
      doc.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.server.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleYearChange = () => {
    setCurrentYear(selectedYear);
    setIsDialogOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <Header
        userName={user?.nome || "Usuário"}
        userRole={user?.cargo || "Cargo"}
        breadcrumb="Publicações"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex justify-between items-center">
                <TabsList className="grid grid-cols-3 w-auto">
                  <TabsTrigger value="portarias" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Portarias
                  </TabsTrigger>
                  <TabsTrigger value="decretos" className="flex items-center gap-2">
                    <Gavel className="w-4 h-4" />
                    Decretos
                  </TabsTrigger>
                  <TabsTrigger value="diarias" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Diárias
                  </TabsTrigger>
                </TabsList>

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
                  
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        {currentYear}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Selecionar Ano dos Documentos</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <label htmlFor="year" className="text-right">
                            Ano:
                          </label>
                          <div className="col-span-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o ano" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2025">2025</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleYearChange}>
                          Carregar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <TabsContent value="portarias" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Portarias Publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">{doc.number}</span>
                              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                            <div className="text-sm text-gray-600">
                              <span>Servidor: {doc.server}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>Data de Criação: {doc.date}</span> • <span>Data de Publicação: {doc.publishDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm" variant="outline">
                              <QrCode className="w-4 h-4 mr-1" />
                              QR Code
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decretos" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Decretos Publicados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">{doc.number}</span>
                              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                            <div className="text-sm text-gray-600">
                              <span>Servidor: {doc.server}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>Data de Criação: {doc.date}</span> • <span>Data de Publicação: {doc.publishDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm" variant="outline">
                              <QrCode className="w-4 h-4 mr-1" />
                              QR Code
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="diarias" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Diárias Publicadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {filteredDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold text-gray-900">{doc.number}</span>
                              <Badge className="bg-green-100 text-green-800">Publicado</Badge>
                            </div>
                            <h3 className="font-medium text-gray-800 mb-1">{doc.title}</h3>
                            <div className="text-sm text-gray-600">
                              <span>Servidor: {doc.server}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span>Data de Criação: {doc.date}</span> • <span>Data de Publicação: {doc.publishDate}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button size="sm" variant="outline">
                              <QrCode className="w-4 h-4 mr-1" />
                              QR Code
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
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
