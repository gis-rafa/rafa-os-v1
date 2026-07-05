export function createMemoryTitle(content: string) {
  const firstLine = content
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^#+\s+/, ""))
    .find(Boolean);

  return (firstLine ?? "Assistant response").slice(0, 80);
}
