import {
  getCvFileContent,
  getCvFiles,
  removeCvFile,
  saveCvFile,
} from "../services/cv-file.service.js";
import { cvFileView } from "../views/cv-file.view.js";

export async function getFiles(req, res) {
  const files = await getCvFiles(req.user.id);
  res.json({ files: files.map(cvFileView) });
}

export async function postFile(req, res) {
  const file = await saveCvFile(req.user.id, req.file);
  res.status(201).json({ file: cvFileView(file) });
}

export async function getFileContent(req, res) {
  const file = await getCvFileContent(req.user.id, req.params.id);
  res.set("Cache-Control", "private, no-store");
  res.attachment(file.fileName);
  res.type(file.mimeType);
  res.send(file.content);
}

export async function deleteFile(req, res) {
  await removeCvFile(req.user.id, req.params.id);
  res.status(204).end();
}
