export function cvFileView(file) {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mineType,
    createdAt: file.createdAt,
  };
}
