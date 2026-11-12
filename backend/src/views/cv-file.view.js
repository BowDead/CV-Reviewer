export function cvFileView(file) {
  return {
    id: file.id,
    fileName: file.fileName,
    mimeType: file.mimeType,
    createdAt: file.createdAt,
  };
}
