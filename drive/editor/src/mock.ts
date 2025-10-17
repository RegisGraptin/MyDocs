// HTML String Format
export const htmlMock = {
  title: "Tiptap: The Headless Rich Text Editor for Modern Web Applications",
  content:
    '<h2>What is Tiptap?</h2><p>Tiptap is a headless, framework-agnostic rich text editor built on top of ProseMirror. Unlike traditional WYSIWYG editors, Tiptap gives you complete control over the user interface while providing a powerful and extensible editing experience. It\'s the perfect choice for developers who want to build custom editing experiences without sacrificing functionality.</p><h3>Why Choose Tiptap?</h3><p>Tiptap stands out from other rich text editors by offering unparalleled flexibility and developer experience. It\'s designed to be extended, customized, and integrated seamlessly into any modern web application.</p><ul><li><p><strong>Headless Architecture:</strong> Build your own UI with complete design freedom</p></li><li><p><strong>Framework Agnostic:</strong> Works with React, Vue, Svelte, and vanilla JavaScript</p></li><li><p><strong>Extensible:</strong> Create custom extensions or use community-built ones</p></li><li><p><strong>TypeScript First:</strong> Full type safety and excellent IDE support</p></li><li><p><strong>Collaborative Editing:</strong> Built-in support for real-time collaboration</p></li></ul><figure><img src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&amp;h=700&amp;fit=crop" alt="Developer working with Tiptap" caption="Building custom rich text experiences with Tiptap\'s flexible architecture" data-width="1200" data-height="700" style="width: 85%;"><figcaption>Building custom rich text experiences with Tiptap\'s flexible architecture</figcaption></figure><h2>Core Features</h2><p>Tiptap comes packed with features that make it the go-to choice for modern web applications requiring rich text editing capabilities.</p><h3>Rich Text Formatting</h3><p>Tiptap supports all standard text formatting options you\'d expect from a modern editor, with the ability to customize and extend each one.</p><pre><code class="language-typescript">import { useEditor, EditorContent } from \'@tiptap/react\'\nimport StarterKit from \'@tiptap/starter-kit\'\n\nfunction MyEditor() {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: \'&lt;p&gt;Hello Tiptap!&lt;/p&gt;\',\n  })\n\n  return &lt;EditorContent editor={editor} /&gt;\n}</code></pre><h3>Built-in Extensions</h3><p>Tiptap provides a comprehensive set of extensions out of the box, covering everything from basic text formatting to advanced features like tables and code blocks.</p><table style="min-width: 105px;"><colgroup><col style="min-width: 35px;"><col style="min-width: 35px;"><col style="min-width: 35px;"></colgroup><tbody><tr><th colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Extension</p></th><th colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Description</p></th><th colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Use Case</p></th></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>StarterKit</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Bundle of essential extensions</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Quick setup for most projects</p></td></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Table</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Full-featured table support</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Data presentation, layouts</p></td></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>CodeBlock</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Syntax-highlighted code blocks</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Technical documentation</p></td></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Image</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Image insertion and manipulation</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Visual content</p></td></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Link</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Hyperlink management</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Navigation, references</p></td></tr><tr><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Collaboration</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Real-time collaborative editing</p></td><td colspan="1" rowspan="1" style="vertical-align: top; text-align: center;"><p>Team workflows</p></td></tr></tbody></table><blockquote><p>"Tiptap\'s extensibility is unmatched. We were able to build a custom editor for our documentation platform in days, not weeks." - Engineering Team at Vercel</p></blockquote><h2>Creating Custom Extensions</h2><p>One of Tiptap\'s most powerful features is the ability to create custom extensions tailored to your specific needs. Extensions can add new nodes, marks, or even completely new functionality.</p><h3>Example: Custom Mention Extension</h3><pre><code class="language-typescript">import { Node, mergeAttributes } from \'@tiptap/core\'\nimport { ReactNodeViewRenderer } from \'@tiptap/react\'\nimport MentionComponent from \'./MentionComponent\'\n\nexport const Mention = Node.create({\n  name: \'mention\',\n  \n  group: \'inline\',\n  inline: true,\n  selectable: false,\n  atom: true,\n\n  addAttributes() {\n    return {\n      id: {\n        default: null,\n        parseHTML: element =&gt; element.getAttribute(\'data-id\'),\n        renderHTML: attributes =&gt; ({\n          \'data-id\': attributes.id,\n        }),\n      },\n      label: {\n        default: null,\n        parseHTML: element =&gt; element.getAttribute(\'data-label\'),\n        renderHTML: attributes =&gt; ({\n          \'data-label\': attributes.label,\n        }),\n      },\n    }\n  },\n\n  parseHTML() {\n    return [{ tag: \'span[data-mention]\' }]\n  },\n\n  renderHTML({ HTMLAttributes }) {\n    return [\'span\', mergeAttributes({ \'data-mention\': \'\' }, HTMLAttributes)]\n  },\n\n  addNodeView() {\n    return ReactNodeViewRenderer(MentionComponent)\n  },\n})</code></pre><figure><img src="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&amp;h=700&amp;fit=crop" alt="Custom Tiptap extensions" caption="Custom extensions enable unique editing experiences tailored to your application" data-width="1200" data-height="700" style="width: 75%;"><figcaption>Custom extensions enable unique editing experiences tailored to your application</figcaption></figure><h2>Collaborative Editing</h2><p>Tiptap includes first-class support for collaborative editing through its Collaboration extension, powered by Yjs. Multiple users can edit the same document simultaneously with automatic conflict resolution.</p><h3>Setting Up Collaboration</h3><pre><code class="language-typescript">import { useEditor } from \'@tiptap/react\'\nimport StarterKit from \'@tiptap/starter-kit\'\nimport Collaboration from \'@tiptap/extension-collaboration\'\nimport CollaborationCursor from \'@tiptap/extension-collaboration-cursor\'\nimport * as Y from \'yjs\'\nimport { WebrtcProvider } from \'y-webrtc\'\n\nconst ydoc = new Y.Doc()\nconst provider = new WebrtcProvider(\'document-name\', ydoc)\n\nfunction CollaborativeEditor() {\n  const editor = useEditor({\n    extensions: [\n      StarterKit.configure({\n        history: false, // Disable history for collaboration\n      }),\n      Collaboration.configure({\n        document: ydoc,\n      }),\n      CollaborationCursor.configure({\n        provider: provider,\n        user: {\n          name: \'John Doe\',\n          color: \'#f783ac\',\n        },\n      }),\n    ],\n  })\n\n  return &lt;EditorContent editor={editor} /&gt;  \n}</code></pre><h2>Styling and Customization</h2><p>Since Tiptap is headless, you have complete control over the styling. You can use any CSS framework or custom styles to create the perfect look for your application.</p><h3>Popular Styling Approaches</h3><ol><li><p><strong>Tailwind CSS:</strong> Utility-first approach for rapid development</p></li><li><p><strong>CSS Modules:</strong> Scoped styles for component isolation</p></li><li><p><strong>Styled Components:</strong> CSS-in-JS for dynamic styling</p></li><li><p><strong>shadcn/ui:</strong> Pre-built components with Tiptap integration</p></li></ol><h2>Performance Optimization</h2><p>Tiptap is built with performance in mind, but there are several strategies you can employ to ensure optimal performance even with large documents.</p><ul><li><p><strong>Lazy Loading:</strong> Load extensions only when needed</p></li><li><p><strong>Debouncing:</strong> Reduce update frequency for auto-save features</p></li><li><p><strong>Virtual Scrolling:</strong> Handle extremely long documents efficiently</p></li><li><p><strong>Code Splitting:</strong> Separate editor code from main bundle</p></li></ul><h2>Integration Examples</h2><p>Tiptap integrates seamlessly with popular frameworks and tools. Here are some common integration patterns.</p><h3>Next.js Integration</h3><pre><code class="language-typescript">\'use client\'\n\nimport { useEditor, EditorContent } from \'@tiptap/react\'\nimport StarterKit from \'@tiptap/starter-kit\'\nimport { useEffect } from \'react\'\n\nexport default function TiptapEditor({ \n  initialContent, \n  onChange \n}: { \n  initialContent: string\n  onChange: (html: string) =&gt; void \n}) {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: initialContent,\n    onUpdate: ({ editor }) =&gt; {\n      onChange(editor.getHTML())\n    },\n  })\n\n  useEffect(() =&gt; {\n    return () =&gt; {\n      editor?.destroy()\n    }\n  }, [editor])\n\n  return (\n    &lt;div className="prose max-w-none"&gt;\n      &lt;EditorContent editor={editor} /&gt;\n    &lt;/div&gt;\n  )\n}</code></pre><h2>Use Cases</h2><p>Tiptap is versatile enough to power a wide range of applications, from simple note-taking apps to complex content management systems.</p><h3>Common Applications</h3><ul><li><p><strong>Content Management Systems:</strong> Blog platforms, documentation sites</p></li><li><p><strong>Note-Taking Apps:</strong> Personal wikis, knowledge bases</p></li><li><p><strong>Collaborative Tools:</strong> Team workspaces, project management</p></li><li><p><strong>Email Clients:</strong> Rich email composition</p></li><li><p><strong>Social Platforms:</strong> Post creation, comments</p></li><li><p><strong>Educational Platforms:</strong> Course content, assignments</p></li></ul><h2>Community and Ecosystem</h2><p>Tiptap has a thriving community that contributes extensions, templates, and integrations. The ecosystem continues to grow with new extensions and tools being released regularly.</p><h3>Popular Community Extensions</h3><ul><li><p><strong>tiptap-extension-global-drag-handle:</strong> Drag and drop blocks</p></li><li><p><strong>tiptap-markdown:</strong> Markdown input/output support</p></li><li><p><strong>tiptap-extension-emoji:</strong> Emoji picker integration</p></li><li><p><strong>tiptap-extension-slash-command:</strong> Notion-style slash commands</p></li></ul><h2>Getting Started</h2><p>Ready to start building with Tiptap? The setup process is straightforward and you can have a working editor in minutes.</p><h3>Installation</h3><pre><code class="language-bash"># Install core packages\nnpm install @tiptap/react @tiptap/pm @tiptap/starter-kit\n\n# Install additional extensions as needed\nnpm install @tiptap/extension-table @tiptap/extension-image</code></pre><h3>Basic Setup</h3><pre><code class="language-typescript">import { useEditor, EditorContent } from \'@tiptap/react\'\nimport StarterKit from \'@tiptap/starter-kit\'\nimport Table from \'@tiptap/extension-table\'\nimport TableRow from \'@tiptap/extension-table-row\'\nimport TableCell from \'@tiptap/extension-table-cell\'\nimport TableHeader from \'@tiptap/extension-table-header\'\nimport Image from \'@tiptap/extension-image\'\n\nfunction App() {\n  const editor = useEditor({\n    extensions: [\n      StarterKit,\n      Table.configure({\n        resizable: true,\n      }),\n      TableRow,\n      TableHeader,\n      TableCell,\n      Image,\n    ],\n    content: \'Start editing...\',\n  })\n\n  return (\n    &lt;div&gt;\n      &lt;EditorContent editor={editor} /&gt;\n    &lt;/div&gt;\n  )\n}</code></pre><h2>Conclusion</h2><p>Tiptap represents the future of rich text editing on the web. Its headless architecture, extensive customization options, and powerful extension system make it the ideal choice for developers who need complete control over their editing experience. Whether you\'re building a simple blog or a complex collaborative platform, Tiptap provides the foundation you need to create exceptional user experiences.</p><h3>Next Steps</h3><p>Explore the official documentation, try out the interactive examples, and join the community to see what others are building with Tiptap. The possibilities are endless!</p>',
  wordCount: 1245,
  cover:
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&fit=crop",
  author: "Tiptap Team",
  createdAt: "Jan, 30 2025",
  readingTime: 8,
};

// Tiptap JSON Format - Same content in Tiptap's native JSON structure
export const jsonMock = {
  title: "Tiptap: The Headless Rich Text Editor for Modern Web Applications",
  content: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "What is Tiptap?" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap is a headless, framework-agnostic rich text editor built on top of ProseMirror. Unlike traditional WYSIWYG editors, Tiptap gives you complete control over the user interface while providing a powerful and extensible editing experience. It's the perfect choice for developers who want to build custom editing experiences without sacrificing functionality.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Why Choose Tiptap?" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap stands out from other rich text editors by offering unparalleled flexibility and developer experience. It's designed to be extended, customized, and integrated seamlessly into any modern web application.",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Headless Architecture:",
                  },
                  {
                    type: "text",
                    text: " Build your own UI with complete design freedom",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Framework Agnostic:",
                  },
                  {
                    type: "text",
                    text: " Works with React, Vue, Svelte, and vanilla JavaScript",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Extensible:",
                  },
                  {
                    type: "text",
                    text: " Create custom extensions or use community-built ones",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "TypeScript First:",
                  },
                  {
                    type: "text",
                    text: " Full type safety and excellent IDE support",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Collaborative Editing:",
                  },
                  {
                    type: "text",
                    text: " Built-in support for real-time collaboration",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "figure",
        content: [
          {
            type: "image",
            attrs: {
              src: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=700&fit=crop",
              alt: "Developer working with Tiptap",
              width: "85%",
              "data-width": "1200",
              "data-height": "700",
            },
          },
          {
            type: "figcaption",
            content: [
              {
                type: "text",
                text: "Building custom rich text experiences with Tiptap's flexible architecture",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Core Features" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap comes packed with features that make it the go-to choice for modern web applications requiring rich text editing capabilities.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Rich Text Formatting" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap supports all standard text formatting options you'd expect from a modern editor, with the ability to customize and extend each one.",
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "import { useEditor, EditorContent } from '@tiptap/react'\nimport StarterKit from '@tiptap/starter-kit'\n\nfunction MyEditor() {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: '<p>Hello Tiptap!</p>',\n  })\n\n  return <EditorContent editor={editor} />\n}",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Built-in Extensions" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap provides a comprehensive set of extensions out of the box, covering everything from basic text formatting to advanced features like tables and code blocks.",
          },
        ],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Extension" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Description" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Use Case" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "StarterKit" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Bundle of essential extensions" },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Quick setup for most projects" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Table" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Full-featured table support" },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Data presentation, layouts" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "CodeBlock" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Syntax-highlighted code blocks" },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Technical documentation" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Image" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Image insertion and manipulation",
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Visual content" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Link" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Hyperlink management" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Navigation, references" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Collaboration" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Real-time collaborative editing" },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Team workflows" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: '"Tiptap\'s extensibility is unmatched. We were able to build a custom editor for our documentation platform in days, not weeks." - Engineering Team at Vercel',
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Creating Custom Extensions" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "One of Tiptap's most powerful features is the ability to create custom extensions tailored to your specific needs. Extensions can add new nodes, marks, or even completely new functionality.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Example: Custom Mention Extension" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "import { Node, mergeAttributes } from '@tiptap/core'\nimport { ReactNodeViewRenderer } from '@tiptap/react'\nimport MentionComponent from './MentionComponent'\n\nexport const Mention = Node.create({\n  name: 'mention',\n  \n  group: 'inline',\n  inline: true,\n  selectable: false,\n  atom: true,\n\n  addAttributes() {\n    return {\n      id: {\n        default: null,\n        parseHTML: element => element.getAttribute('data-id'),\n        renderHTML: attributes => ({\n          'data-id': attributes.id,\n        }),\n      },\n      label: {\n        default: null,\n        parseHTML: element => element.getAttribute('data-label'),\n        renderHTML: attributes => ({\n          'data-label': attributes.label,\n        }),\n      },\n    }\n  },\n\n  parseHTML() {\n    return [{ tag: 'span[data-mention]' }]\n  },\n\n  renderHTML({ HTMLAttributes }) {\n    return ['span', mergeAttributes({ 'data-mention': '' }, HTMLAttributes)]\n  },\n\n  addNodeView() {\n    return ReactNodeViewRenderer(MentionComponent)\n  },\n})",
          },
        ],
      },
      {
        type: "figure",
        content: [
          {
            type: "image",
            attrs: {
              src: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=700&fit=crop",
              alt: "Custom Tiptap extensions",
              width: "75%",
              "data-width": "1200",
              "data-height": "700",
            },
          },
          {
            type: "figcaption",
            content: [
              {
                type: "text",
                text: "Custom extensions enable unique editing experiences tailored to your application",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Collaborative Editing" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap includes first-class support for collaborative editing through its Collaboration extension, powered by Yjs. Multiple users can edit the same document simultaneously with automatic conflict resolution.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Setting Up Collaboration" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "import { useEditor } from '@tiptap/react'\nimport StarterKit from '@tiptap/starter-kit'\nimport Collaboration from '@tiptap/extension-collaboration'\nimport CollaborationCursor from '@tiptap/extension-collaboration-cursor'\nimport * as Y from 'yjs'\nimport { WebrtcProvider } from 'y-webrtc'\n\nconst ydoc = new Y.Doc()\nconst provider = new WebrtcProvider('document-name', ydoc)\n\nfunction CollaborativeEditor() {\n  const editor = useEditor({\n    extensions: [\n      StarterKit.configure({\n        history: false, // Disable history for collaboration\n      }),\n      Collaboration.configure({\n        document: ydoc,\n      }),\n      CollaborationCursor.configure({\n        provider: provider,\n        user: {\n          name: 'John Doe',\n          color: '#f783ac',\n        },\n      }),\n    ],\n  })\n\n  return <EditorContent editor={editor} />\n}",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Styling and Customization" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Since Tiptap is headless, you have complete control over the styling. You can use any CSS framework or custom styles to create the perfect look for your application.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Popular Styling Approaches" }],
      },
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Tailwind CSS:",
                  },
                  {
                    type: "text",
                    text: " Utility-first approach for rapid development",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "CSS Modules:",
                  },
                  {
                    type: "text",
                    text: " Scoped styles for component isolation",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Styled Components:",
                  },
                  { type: "text", text: " CSS-in-JS for dynamic styling" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "shadcn/ui:",
                  },
                  {
                    type: "text",
                    text: " Pre-built components with Tiptap integration",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Performance Optimization" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap is built with performance in mind, but there are several strategies you can employ to ensure optimal performance even with large documents.",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Lazy Loading:",
                  },
                  { type: "text", text: " Load extensions only when needed" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Debouncing:",
                  },
                  {
                    type: "text",
                    text: " Reduce update frequency for auto-save features",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Virtual Scrolling:",
                  },
                  {
                    type: "text",
                    text: " Handle extremely long documents efficiently",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Code Splitting:",
                  },
                  {
                    type: "text",
                    text: " Separate editor code from main bundle",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Integration Examples" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap integrates seamlessly with popular frameworks and tools. Here are some common integration patterns.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Next.js Integration" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "'use client'\n\nimport { useEditor, EditorContent } from '@tiptap/react'\nimport StarterKit from '@tiptap/starter-kit'\nimport { useEffect } from 'react'\n\nexport default function TiptapEditor({ \n  initialContent, \n  onChange \n}: { \n  initialContent: string\n  onChange: (html: string) => void \n}) {\n  const editor = useEditor({\n    extensions: [StarterKit],\n    content: initialContent,\n    onUpdate: ({ editor }) => {\n      onChange(editor.getHTML())\n    },\n  })\n\n  useEffect(() => {\n    return () => {\n      editor?.destroy()\n    }\n  }, [editor])\n\n  return (\n    <div className=\"prose max-w-none\">\n      <EditorContent editor={editor} />\n    </div>\n  )\n}",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Use Cases" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap is versatile enough to power a wide range of applications, from simple note-taking apps to complex content management systems.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Common Applications" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Content Management Systems:",
                  },
                  {
                    type: "text",
                    text: " Blog platforms, documentation sites",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Note-Taking Apps:",
                  },
                  { type: "text", text: " Personal wikis, knowledge bases" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Collaborative Tools:",
                  },
                  {
                    type: "text",
                    text: " Team workspaces, project management",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Email Clients:",
                  },
                  { type: "text", text: " Rich email composition" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Social Platforms:",
                  },
                  { type: "text", text: " Post creation, comments" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "Educational Platforms:",
                  },
                  { type: "text", text: " Course content, assignments" },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Community and Ecosystem" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap has a thriving community that contributes extensions, templates, and integrations. The ecosystem continues to grow with new extensions and tools being released regularly.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Popular Community Extensions" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "tiptap-extension-global-drag-handle:",
                  },
                  { type: "text", text: " Drag and drop blocks" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "tiptap-markdown:",
                  },
                  { type: "text", text: " Markdown input/output support" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "tiptap-extension-emoji:",
                  },
                  { type: "text", text: " Emoji picker integration" },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    marks: [{ type: "bold" }],
                    text: "tiptap-extension-slash-command:",
                  },
                  { type: "text", text: " Notion-style slash commands" },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Getting Started" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Ready to start building with Tiptap? The setup process is straightforward and you can have a working editor in minutes.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Installation" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "bash" },
        content: [
          {
            type: "text",
            text: "# Install core packages\nnpm install @tiptap/react @tiptap/pm @tiptap/starter-kit\n\n# Install additional extensions as needed\nnpm install @tiptap/extension-table @tiptap/extension-image",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Basic Setup" }],
      },
      {
        type: "codeBlock",
        attrs: { language: "typescript" },
        content: [
          {
            type: "text",
            text: "import { useEditor, EditorContent } from '@tiptap/react'\nimport StarterKit from '@tiptap/starter-kit'\nimport Table from '@tiptap/extension-table'\nimport TableRow from '@tiptap/extension-table-row'\nimport TableCell from '@tiptap/extension-table-cell'\nimport TableHeader from '@tiptap/extension-table-header'\nimport Image from '@tiptap/extension-image'\n\nfunction App() {\n  const editor = useEditor({\n    extensions: [\n      StarterKit,\n      Table.configure({\n        resizable: true,\n      }),\n      TableRow,\n      TableHeader,\n      TableCell,\n      Image,\n    ],\n    content: '<p>Start editing...</p>',\n  })\n\n  return (\n    <div>\n      <EditorContent editor={editor} />\n    </div>\n  )\n}",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Conclusion" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Tiptap represents the future of rich text editing on the web. Its headless architecture, extensive customization options, and powerful extension system make it the ideal choice for developers who need complete control over their editing experience. Whether you're building a simple blog or a complex collaborative platform, Tiptap provides the foundation you need to create exceptional user experiences.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 3 },
        content: [{ type: "text", text: "Next Steps" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Explore the official documentation, try out the interactive examples, and join the community to see what others are building with Tiptap. The possibilities are endless!",
          },
        ],
      },
    ],
  },
  wordCount: 1245,
  cover:
    "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=1200&h=800&fit=crop",
  author: "Tiptap Team",
  createdAt: "Jan, 30 2025",
  readingTime: 8,
};

// Export both formats for easy use
export const mockData = {
  html: htmlMock,
  json: jsonMock,
};
