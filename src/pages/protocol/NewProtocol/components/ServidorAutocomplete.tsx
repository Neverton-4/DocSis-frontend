const ServidorAutocomplete = ({ servidores, showAutocomplete, handleServidorSelect }) => {
    if (!showAutocomplete || servidores.length === 0) return null;
    return (
      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
  {servidores.map((servidor) => (
    <div
      key={servidor.id}
      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
      onClick={() => handleServidorSelect(servidor)}
    >
      <div className="font-medium">{servidor?.nome_completo || 'Nome não informado'}
      <span className="text-sm text-gray-500"> | CPF: {servidor?.cpf || 'CPF não informado'}</span>
      </div>
    </div>
  ))}
</div>
    );
  };
  
  export default ServidorAutocomplete;