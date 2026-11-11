export function cvFileView(file) {
  return {
    id: file.id,
    fileName: file.fileName,
    mineType: file.mineType,
    createdAt: file.createdAt,
  };
}
