import { MarkdownEditor } from "@/components/editor/markdown-editor";

export default function Page() {
  const testMarkdown = `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

This is a paragraph with **bold text**, *italic text*, and ***bold italic text***. You can also use __underscores__ for emphasis.

Here's some ~~strikethrough~~ text and \`inline code\` for good measure.

---

## Links and Images

[This is a link](https://example.com)

![Sample Image](https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

---

## Lists

### Unordered List
- Item one
- Item two
  - Nested item
  - Another nested item
- Item three

### Ordered List
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item

### Task List
- [ ] Unchecked task
- [x] Completed task
- [ ] Another task

---

## Blockquote

> This is a blockquote.
> It can span multiple lines.
>
> > And can be nested too.

---

## Code Block

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");
\`\`\`

---

## Table

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
| Cell 7   | Cell 8   | Cell 9   |

---

## Horizontal Rule

Above the line

---

Below the line
`;

  return <MarkdownEditor markdown={testMarkdown} />;
}