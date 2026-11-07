export function notFound(req, res) {
  res.status(404).json({
    error: "NOT_FOUND",
    params: { method: req.method, path: req.originalUrl },
  });
}
