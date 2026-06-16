# bear MD
A "tiny" 9kb (non-minified version) Markdown JS ES6+ parser with `Async/Await` and `const / let` with built in support for external links using the `extl` attribute, `::` for span tags and `:::` for div tags with the option to use `-` to assign a CSS class to either and yes, nesting is of course possible.

## Basic technical information

Built in support for prismjs, prismcss and DOMpurify by automatically checking if they're loaded and if so, applying them to the output. It also has built in support for measurement data, allowing you to see and check the complete network chain and load times of each markdown file.

**Loading the parser:** is simple, just add it to a `script` tag within your document like this; `<script src="parser.js"></script>` and you're done.

Loops through the document to find any and all `data-md-src` within a `div` tag to loada and render one or more markdown document. **Example:** `<div data-md-src="document.md"></div>` and yes, you can assign whatever class you want to this without the parser interferring.

* Asynchronous Handling (Async/Await): The code utilizes async function and await fetch() (introduced in ES2017) to handle asynchronous data seamlessly without getting stuck in complex callback chains.
* Modern Data Structures and Variables (const / let): It uses block-scoped variables instead of the legacy var, resulting in safer code execution and better memory optimization.
* Modern Loops (for...of): The mdParse function utilizes `for(let l of s.split("\n"))`. This `for...of` syntax.

## Built in functions
* External and Internal Links: Separates links into two categories. Standard markdown links `[Label](URL)` get a general link class, while links prefixed with "extl" `[Label](extl URL)` automatically receive `target='_blank'`, `rel='noopener noreferrer'`, and a specific external link class.
* Performance Tracking: Implements high-precision browser timing (performance.mark and performance.measure) to calculate and log the exact millisecond duration of the network fetch and the rendering process.
* Asynchronous Lazy Loading: Uses a non-blocking architecture that allows multiple containers on a single page to fetch, parse, and display their individual Markdown sources simultaneously.

## Questions? Feedback?
Let me know, happy to discuss.
