export function llmKeyView(key) {
  return {
    id: key.id,
    provider: key.provider,
    model: key.model,
    label: key.label,
    priority: key.priority,
    createdAt: key.createdAt,
  };
}
