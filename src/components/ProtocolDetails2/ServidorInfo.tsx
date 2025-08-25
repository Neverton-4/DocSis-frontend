
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card-component";

const ServidorInfo = ({ servidor }) => (
  <Card>
    <CardHeader>
      <CardTitle>Servidor</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div><strong>Nome:</strong> {servidor.nome_completo}</div>
      <div><strong>CPF:</strong> {servidor.cpf}</div>
      <div><strong>Data de Nascimento:</strong> {servidor.data_nascimento}</div>
      <div><strong>Sexo:</strong> {servidor.sexo}</div>
      <div><strong>Contato:</strong> {servidor.contato}</div>
      <div><strong>Email:</strong> {servidor.email}</div>
      <div><strong>Tipo:</strong> {servidor.tipo_servidor}</div>
      <div><strong>Cargo:</strong> {servidor.cargo}</div>
      <div><strong>Lotação:</strong> {servidor.lotacao}</div>
    </CardContent>
  </Card>
);

export default ServidorInfo;