import React from 'react';
import { Customer } from '@/types';

interface RequerimentoPreviewProps {
  formData: Customer;
  protocoloId: string;
  data: string;
}

const RequerimentoPreview: React.FC<RequerimentoPreviewProps> = ({ formData, protocoloId, data }) => {
  const endereco = `${formData.logradouro}, Nº ${formData.numero}, ${formData.bairro}, ${formData.cidade} - ${formData.uf}`;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-area');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <title>Ficha de Requerimento</title>
          <style>
            @page { size: A4; margin: 1cm; }
            body { font-family: Arial, sans-serif; }
            .divider { border-top: 4px dotted black; margin: 20px 0; }
            .assinatura { display: flex; justify-content: space-between; margin-top: 2em; }
            .timbre img { width: 100%; height: auto; }
            .corpo, .canhoto { border: 2px double black; padding: 1em; margin-top: 1em; }
            .titulo { text-align: center; font-size: 1.5em; font-weight: bold; margin-bottom: 1em; }
            .info p { margin: 0.3em 0; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div>
      <div id="printable-area">
        <div className="timbre">
          <img src="/timbre.png" alt="Timbre da prefeitura" />
        </div>

        <div className="corpo">
          <div className="titulo">FICHA DE REQUERIMENTO</div>
          <div className="info">
            <p><strong>PROTOCOLO Nº:</strong> {protocoloId}</p>
            <p><strong>NOME/RAZÃO SOCIAL:</strong> {formData.fullName}</p>
            <p><strong>CPF:</strong> {formData.cpf}</p>
            <p><strong>ENDEREÇO:</strong> {endereco}</p>
            <p><strong>FINALIDADE:</strong> {formData.tipoProcessoOutro || formData.tipoProcesso}</p>
            <p><strong>DATA:</strong> {data}</p>
          </div>
          <div className="assinatura">
            <div>_________________________________<br />ASSINATURA DO REQUERENTE</div>
            <div>_________________________________<br />ASSINATURA DO PROTOCOLANDO</div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="canhoto">
          <div className="titulo">COMPROVANTE DE REQUERIMENTO</div>
          <div className="info">
            <p><strong>PROTOCOLO Nº:</strong> {protocoloId}</p>
            <p><strong>DATA:</strong> {data}</p>
            <p><strong>NOME/RAZÃO SOCIAL:</strong> {formData.fullName}</p>
            <p><strong>FINALIDADE:</strong> {formData.tipoProcessoOutro || formData.tipoProcesso}</p>
          </div>
          <div style={{ textAlign: 'right', marginTop: '2em' }}>
            __________________________________<br />ASSINATURA DO PROTOCOLANDO
          </div>
        </div>
      </div>

      <button onClick={handlePrint} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Imprimir Requerimento
      </button>
    </div>
  );
};

export default RequerimentoPreview;
