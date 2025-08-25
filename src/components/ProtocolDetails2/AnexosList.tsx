import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-component";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const AnexosList = ({ anexos }) => (
  <Card>
    <CardHeader>
      <CardTitle>Anexos</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {anexos.length === 0 && <p>Nenhum anexo encontrado.</p>}
      {anexos.map((anexo, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-2">
          <div>
            <div className="font-medium">{anexo.nome}</div>
            <div className="text-sm text-muted-foreground">{anexo.tipo}</div>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <a href={anexo.url} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default AnexosList;