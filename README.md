# bear MD
A "tiny" 6kb (not minified) Markdown JS ES6+ parser with two custom functions; 1. for external links using the `extl` attribut and 2. `:::` for div tags with the option to use `-` to assign a CSS class.

## Basic technical information

Built in support for prismjs, prismcss and DOMpurify. The parser automatically checks if prism or DOMpurify's loaded and if so, applies them to the output. **Loading the parser:** is simple, just add it to a `script` tag within your document like this; `<script src="bearmd.js"></script>` and you're done. Load and parse markdown documents by using `<div data-md-src="document-name.md"></div>`.

## Questions? Feedback?
Let me know, happy to discuss.