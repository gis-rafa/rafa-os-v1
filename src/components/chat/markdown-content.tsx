"use client";

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={part}>{part.slice(2, -2)}</strong>;
    }

    return part;
  });
}

export function MarkdownContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="space-y-3">
      {blocks.map((block) => {
        const lines = block.split(/\n/).filter(Boolean);
        const listItems = lines
          .map((line) => line.match(/^(?:-|\d+\.)\s+(.+)$/)?.[1])
          .filter((item): item is string => Boolean(item));

        if (listItems.length === lines.length) {
          return (
            <ul className="list-disc space-y-1 pl-5" key={block}>
              {listItems.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }

        return <p key={block}>{renderInlineMarkdown(block)}</p>;
      })}
    </div>
  );
}
