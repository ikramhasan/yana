"use client";

import { MilkdownEditor } from "@/components/editor/milkdown-editor";
import { useFileTree } from "@/contexts/file-tree-context";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Image file extensions
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico'];

function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTENSIONS.includes(ext);
}

let index = 0

const EXAMPLE_MARKDOWN = `
# H1: The Largest Heading
## H2: Secondary Heading
### H3: Tertiary Heading
#### H4: Fourth Level
##### H5: Fifth Level
###### H6: Sixth Level

---

## 1. Emphasis and Text Styles

Standard text can be **bolded** using double asterisks or __underscores__.
You can make it *italic* with single asterisks or _underscores_.
You can even combine them for ***bold and italic***.
Strikethrough is achieved with ~~double tildes~~.

> **Note:** This is a blockquote. It's often used for citations or to highlight specific information.
> 
> > Multiple levels of blockquotes are also possible.

---

## 2. Lists

### Unordered List
* Item 1
* Item 2
  * Sub-item 2.1
  * Sub-item 2.2
* Item 3

### Ordered List
1. First step
2. Second step
3. Third step
   1. Sub-step A
   2. Sub-step B

### Task List
- [x] Complete the Markdown guide
- [ ] Add more examples
- [ ] Review performance
- [x] Submit the request

---

## 3. Code and Syntax Highlighting

You can include \`inline code\` by wrapping text in backticks.

For larger blocks of code, use "fenced" code blocks with triple backticks and an optional language identifier for syntax highlighting:

\`\`\`typescript
// Example TypeScript Code
interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

const greet = (user: User): string => {
  return \`Hello, \${user.name}!\`;
};
\`\`\`

---

## 4. Links and Images

[This is a link to Google](https://www.google.com)

An image can be embedded like this:

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)

---

## 5. Tables

You can create tables using pipes \`|\` and hyphens \`-\`.

| Feature | Support | Rating |
| :--- | :---: | ---: |
| Headers | Yes | 10/10 |
| Tables | Yes | 8/10 |
| Alignment | Left/Center/Right | High |
| Complex UI | Limited | 4/10 |

## 6. Mathematical Expressions (LaTeX)

If your renderer supports MathJax or KaTeX, you can use dollar signs:

Inline: $E = mc^2$

Block:
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

---

## 7. Footnotes

Here is a simple footnote[^1]. With footnotes, you can point to explanations at the bottom of the page.

[^1]: This is the text of the footnote.

---

## 8. Horizontal Rules

You can use three or more hyphens, asterisks, or underscores to create a horizontal rule:

---
***
`;

export default function Page() {
  const { fileContent, selectedFile } = useFileTree();

  console.log("Page rendered", index++);

  // Check if selected file is an image
  const isImage = selectedFile && isImageFile(selectedFile.name);

  // Render image viewer for image files
  if (isImage && selectedFile) {
    const imageSrc = convertFileSrc(selectedFile.path);
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute top-2 left-2 z-50">
          <SidebarTrigger className="pt-1" />
        </div>
        <div className="flex h-full w-full items-center justify-center overflow-auto p-8">
          <img
            src={imageSrc}
            alt={selectedFile.name}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>
    );
  }

  const markdown = fileContent ?? EXAMPLE_MARKDOWN;

  return (
    <div className="relative h-full w-full">
      <MilkdownEditor markdown={markdown} fileId={selectedFile?.id} filePath={selectedFile?.path} />
    </div>
  );
}