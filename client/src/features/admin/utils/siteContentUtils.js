export function contentToEditor(content = []) {
  return (content || [])
    .map((block) => (block.type === 'heading' ? `## ${block.text}` : block.text))
    .join('\n\n');
}

export function editorToContent(raw = '') {
  return String(raw)
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      if (chunk.startsWith('## ')) {
        return { type: 'heading', text: chunk.replace(/^##\s+/, '') };
      }
      return { type: 'paragraph', text: chunk };
    });
}
