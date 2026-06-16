# bear MD

A "tiny" 9kb (non-minified version) Markdown JS ES6+ parser with `Async/Await` and `const / let` with built in support for external links using the `extl` attribute, `::` for span tags and `:::` for div tags with the option to use `-` to assign a CSS class to either and yes, nesting is of course possible.

## Basic technical information

Built in support for prismjs, prismcss and DOMpurify by automatically checking if they're loaded and if so, applying them to the output.

* Asynchronous Handling (Async/Await): The code utilizes async function and await fetch() (introduced in ES2017) to handle asynchronous data seamlessly without getting stuck in complex callback chains.

* Modern Data Structures and Variables (const / let): It uses block-scoped variables instead of the legacy var, resulting in safer code execution and better memory optimization.

* Modern Loops (for...of): The mdParse function utilizes `for(let l of s.split("\n"))`. This `for...of` syntax.

## Questions? Feedback?

Let me know, happy to discuss. A "how to use" guide will come shortly.
