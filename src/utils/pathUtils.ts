export const normalizePath = (path: string): string => {
  if (!path) return '';
  
  return path
    .replace(/\\/g, '/') // Converte barras invertidas para barras normais
    .replace(/\/+/g, '/') // Remove barras duplas
    .replace(/^\//g, '') // Remove barra inicial se houver
    .replace(/\/$/, ''); // Remove barra final se houver
};

export const buildFileUrl = (basePath: string, filePath: string): string => {
  const normalizedPath = normalizePath(filePath);
  return `${basePath}/${normalizedPath}`;
};