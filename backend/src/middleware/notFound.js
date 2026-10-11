export function notFound(req,res) {
    res.status(404).json({error: `Nie znaleziono: ${req.method} ${req.originalUrl}` });
}