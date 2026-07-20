(function () {
const cache = {};
const MAX_MD_CHARS = 250000;
const M = {
escapeHtml(t) {
return String(t)
.replace(/&/g, "&amp;")
.replace(/</g, "&lt;")
.replace(/>/g, "&gt;")
.replace(/"/g, "&quot;")
.replace(/'/g, "&#39;");
},
safeHref(raw) {
const s = String(raw ?? "").trim();
if (!s) return "#";
if (s[0] === "#") return s;
const lower = s.toLowerCase();
if (lower.startsWith("https://") || lower.startsWith("mailto:"))
return s;
return "#";
},
inline(t) {
const x = String(t ?? "").replace(/\r/g, "");
let y = this.escapeHtml(x);
y = y
.replace(/^\s*---\s*$/gm, "<hr />")
.replace(/___([\s\S]+?)___/g, "<strong><em>$1</em></strong>")
.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
.replace(/::\s*(-?[\w-]+)\s+([\s\S]+?)\s*::/g, "<span class=\"$1\">$2</span>")
.replace(/::\s*([\s\S]+?)\s*::/g, "<span>$1</span>")
.replace(/(^|[^*])\*([^\s*][\s\S]*?[^\s*])\*(?!\*)/g,"$1<em>$2</em>")
.replace(/~~([\s\S]+?)~~/g, "<del>$1</del>")
.replace(/`([^`]+)`/g, "<code>$1</code>")
.replace(/\[([^\]]*?)\]\(extl\s+([^\)]*?)\)/g,(m, text, href) => {
const safe = this.safeHref(href);
return ("<a href='" + safe + "' target='_blank' rel='noopener noreferrer'>" + text + "</a>");
})
.replace(/\[([^\]]*?)\]\(([^\)]*?)\)/g,(m, text, href) => {
const safe = this.safeHref(href);
return "<a href='" + safe + "' rel='noopener noreferrer'>" + text + "</a>";
})
.replace(/\/\//g, "//");
return y;
},
parseBlockAttrs(line) {
if (line.startsWith(":::")) {
const m = line.match(/^:::\s*(-?[\w-]+)?\s+([\s\S]+?)\s+:::$/);
if (m)
return {
tag: "div",className: m[1] ? m[1].replace(/^-/, "") : "",content: m[2],
};
}
const m2 = line.match(/^\|\|(?:\s+(-?[\w-]+))?\s+([\s\S]+?)\s+\|\|$/);
if (m2)
return {tag: "section",className: m2[1] ? m2[1].replace(/^-/, "") : "",content: m2[2],
};
return null;
},
parseTableLine(line) {
let s = line.trim();
if (s.startsWith("|")) s = s.slice(1);
if (s.endsWith("|")) s = s.slice(0, -1);
return s.split("|").map((c) => c.trim());
},
looksLikeTableSep(cells) {
if (!cells.length) return false;
for (let i = 0; i < cells.length; i++) {
const c = cells[i].replace(/\s/g, "");
if (!c) return false;
if (!/^:?-{3,}:?$/.test(c)) return false;
}
return true;
},
renderBlocks(t) {
const lines = String(t ?? "").replace(/\r/g, "").split("\n");
const out = [];
let i = 0;
let listMode = null;
const closeList = () => {
if (listMode) {
out.push(`</${listMode}>`);
listMode = null;
}};
const flushParagraph = (buf) => {
const text = buf.join(" ").replace(/\s+/g, " ").trim();
if (text) out.push(`<p>${this.inline(text)}</p>`);
};
while (i < lines.length) {
let line = lines[i].trim();
if (!line) {
i++;
continue;
}
if (line.startsWith("```")) {
closeList();
const lang = line.slice(3).trim();
const code = [];
i++;
while (i < lines.length && !lines[i].trim().startsWith("```")) {
code.push(lines[i]);
i++;
}
if (i < lines.length) i++;
out.push(`<pre><code class="language-${lang}">${this.escapeHtml(code.join("\n"))}</code></pre>`);
continue;
}
if (/^#{1,6}\s+/.test(line)) {
closeList();
const level = line.match(/^#{1,6}/)[0].length;
out.push(
`<h${level}>${this.inline(line.slice(level).trim())}</h${level}>`
);
i++;
continue;
}
if (line.startsWith("> ")) {
closeList();
out.push(`<blockquote>${this.inline(line.slice(2).trim())}</blockquote>`);
i++;
continue;
}
const block = this.parseBlockAttrs(line);
if (block) {
closeList();
out.push(`<${block.tag}${block.className ? `class="${block.className}"` : ""}>${this.inline(block.content.trim())}</${block.tag}>`);
i++;
continue;
}
if (line.startsWith("- ") || line.startsWith("* ")) {
if (listMode !== "ul") {
closeList();
out.push("<ul>");
listMode = "ul";
}
out.push(`<li>${this.inline(line.slice(2).trim())}</li>`);
i++;
continue;
}
const ol = line.match(/^(\d+)\.\s+(.*)$/);
if (ol) {
if (listMode !== "ol") {
closeList();
out.push("<ol>");
listMode = "ol";
}
out.push(`<li>${this.inline(ol[2].trim())}</li>`);
i++;
continue;
}
if (line.includes("|") && i + 1 < lines.length) {
const header = this.parseTableLine(line);
const sep = this.parseTableLine(lines[i + 1].trim());
if (this.looksLikeTableSep(sep)) {
closeList();
out.push("<table><thead><tr>");
for (let c = 0; c < header.length; c++) {
out.push(`<th>${this.inline(header[c])}</th>`);
}
out.push("</tr></thead><tbody>");
i += 2;
while (i < lines.length) {
const rowLine = lines[i].trim();
if (!rowLine || !rowLine.includes("|")) break;
const rowCells = this.parseTableLine(rowLine);
out.push("<tr>");
for (let c = 0; c < header.length; c++) {
const cell = rowCells[c] !== undefined ? rowCells[c] : "";
out.push(`<td>${this.inline(cell)}</td>`);
}
out.push("</tr>");
i++;
}
out.push("</tbody></table>");
continue;
}}
closeList();
const para = [line];
i++;
while (i < lines.length) {
const next = lines[i].trim();
if (!next) break;
if (/^#{1,6}\s+/.test(next) || next.startsWith("> ") || next.startsWith("- ") || next.startsWith("* ") || /^(\d+)\.\s+/.test(next) || next.startsWith("```") || this.parseBlockAttrs(next) || (next.includes("|") && i + 1 < lines.length &&
this.looksLikeTableSep(
this.parseTableLine(lines[i + 1].trim())
))) {
break;
}
para.push(next);
i++;
}
flushParagraph(para);
}
closeList();
return out.join("");
},
parse(s) {
const str = String(s ?? "").trim();
if (!str) return "";
if (str.length > MAX_MD_CHARS) return this.escapeHtml(str);
return this.renderBlocks(str);
},
};
function mdParse(s) {
return M.parse(s);
}
async function loadAndRender(div) {
const src = div.getAttribute("data-md-src");
if (src === null) return null;
try {
if (cache[src]) {
div.innerHTML = cache[src];
div.classList.remove("md-loading");
div.classList.add("md-loaded");
setTimeout(() => {
if (typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function")
Prism.highlightAllUnder(div);
}, 0);
return cache[src];
}
div.classList.add("md-loading");
const response = await fetch(src);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const rawMd = await response.text();
const html = mdParse(rawMd);
let finalHtml = html;
if (typeof DOMPurify !== "undefined") {
finalHtml = DOMPurify.sanitize(html, {
ALLOWED_TAGS: ["p","strong","em","del","code","pre","h1","h2","h3","h4","h5","h6","blockquote","div","section","ul","ol","li","table","thead","tbody","tr","th","td","hr","a",],
ALLOWED_ATTR: ["class","href","target","rel","data-md-src","colspan","rowspan"],
ADD_ATTR: ["target", "rel"],
RETURN_TRUSTED_TYPE: false,
});
}
cache[src] = finalHtml;
div.innerHTML = finalHtml;
setTimeout(() => {
if (typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function")
Prism.highlightAllUnder(div);
}, 0);
div.classList.remove("md-loading");
div.classList.add("md-loaded");
return finalHtml;
} catch (err) {
div.textContent = "Error loading: " + src;
div.classList.remove("md-loading");
div.classList.add("md-error");
return null;
}}
async function mdInit() {
const divs = document.querySelectorAll("[data-md-src]");
const lazyObserver = new IntersectionObserver(
(entries, observer) => {
entries.forEach((entry) => {
if (entry.isIntersecting) {
loadAndRender(entry.target);
observer.unobserve(entry.target);
}});
},
{ threshold: 0.3 }
);
divs.forEach((d) => lazyObserver.observe(d));
document.dispatchEvent(new CustomEvent("md-loaded", { detail: { elements: [...divs] } }));
}
window.md = { parse: mdParse, load: loadAndRender, init: mdInit };
if (document.readyState === "loading") {document.addEventListener("DOMContentLoaded", mdInit);
} else {
mdInit();
}})();