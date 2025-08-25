import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-component";

const EtapasList = ({ etapas }) => (
  <Card>
    <CardHeader>
      <CardTitle>Etapas</CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {etapas.map((etapa, index) => (
        <div key={index} className="border-b pb-2">
          <div><strong>Departamento:</strong> {etapa.departamento?.nome}</div>
          <div><strong>Responsável:</strong> {etapa.responsavel?.nome}</div>
          <div><strong>Status:</strong> {etapa.status}</div>
          <div><strong>Data:</strong> {etapa.data || '-'}</div>
          <div><strong>Observação:</strong> {etapa.observacao || '-'}</div>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default EtapasList;