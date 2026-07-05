export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type MemorySuggestionState = {
  existingMemoryId?: string;
  mergeReason?: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  importance: number;
};
