import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings } from 'lucide-react';

interface DocumentActionsProps {
  onAttachDocument: () => void;
}

export const DocumentActions: React.FC<DocumentActionsProps> = ({
  onAttachDocument
}) => {
  return (
    <Card className="bg-white shadow-lg border-0 mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Settings className="h-5 w-5 text-blue-600" />
          Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onAttachDocument}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Anexar Documento
        </Button>
      </CardContent>
    </Card>
  );
};