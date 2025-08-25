import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-component";

const ProcessoInfo = ({ processo }) => (
  <Card>
    <CardHeader>
      <CardTitle>Processo</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><strong>ID:</strong> {processo.id}</div>
      <div><strong>Tipo:</strong> {processo.tipo_processo}</div>
      <div><strong>Nome:</strong> {processo.nome}</div>
      <div><strong>Status:</strong> {processo.status}</div>
      <div className="col-span-2"><strong>Detalhes:</strong> {processo.detalhes}</div>
    </CardContent>
  </Card>
);

export default ProcessoInfo;