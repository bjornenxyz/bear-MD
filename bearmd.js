(function(){
const cache = {};
const consoleLogShown = {purify: false, prism: false};
const M={
p(t){return t.replace(/\n/g,"<br>")},
h(t,s=false){
let e=t.split("\n");
let r=[];
let listMode=null;
let tableMode=false;

const closeList=()=>{
if(listMode) r.push(`</${listMode}>`);
listMode=null;
};

const openList=(mode)=>{
if(listMode===mode) return;
closeList();
r.push(`<${mode}>`);
listMode=mode;
};

const parseTableLine=(line)=>{
let s=line.trim();
if(s.startsWith("|")) s=s.slice(1);
if(s.endsWith("|")) s=s.slice(0,-1);
return s.split("|").map(c=>c.trim());
};

const looksLikeTableSep=(cells)=>{
if(!cells.length) return false;
for(let i=0;i<cells.length;i++){
let c=cells[i].replace(/\s/g,'');
if(!c) return false;
if(!/^:?-{3,}:?$/.test(c)) return false;
}
return true;
};

for(let i=0;i<e.length;i++){
let l=e[i].trim();

if(l.startsWith("###### ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h6>"+this.i(l.slice(7))+"</h6>"); continue}
if(l.startsWith("##### ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h5>"+this.i(l.slice(6))+"</h5>"); continue}
if(l.startsWith("#### ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h4>"+this.i(l.slice(5))+"</h4>"); continue}
if(l.startsWith("### ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h3>"+this.i(l.slice(4))+"</h3>"); continue}
if(l.startsWith("## ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h2>"+this.i(l.slice(3))+"</h2>"); continue}
if(l.startsWith("# ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<h1>"+this.i(l.slice(2))+"</h1>"); continue}

if(l.startsWith("> ")){closeList(); if(tableMode){r.push("</table>"); tableMode=false} r.push("<blockquote>"+this.p(l.slice(2))+"</blockquote>"); continue}

if(l.startsWith("- ")||l.startsWith("* ")){
openList("ul");
if(tableMode){r.push("</table>"); tableMode=false}
r.push("<li>"+this.i(l.slice(2))+"</li>");
continue;
}

const mo=l.match(/^(\d+)\.\s+(.*)$/);
if(mo){
openList("ol");
if(tableMode){r.push("</table>"); tableMode=false}
r.push("<li>"+this.i(mo[2])+"</li>");
continue;
}

if(!l.trim()){
if(tableMode){r.push("</table>"); tableMode=false}
closeList();
continue;
}

let possibleHeader=null;
let possibleSep=null;

if(l.includes("|") && i+1<e.length){
possibleHeader=parseTableLine(l);
let nextLine=e[i+1].trim();
if(nextLine.includes("|")){
possibleSep=parseTableLine(nextLine);
if(looksLikeTableSep(possibleSep)){
closeList();
r.push("<table><thead><tr>");
for(let c=0;c<possibleHeader.length;c++){
r.push("<th>"+this.i(possibleHeader[c])+"</th>");
}
r.push("</tr></thead><tbody>");
tableMode=true;
i++;
for(i=i+1;i<e.length;i++){
let rowLine=e[i].trim();
if(!rowLine.includes("|") || !rowLine.trim()){
break;
}
let rowCells=parseTableLine(rowLine);
r.push("<tr>");
for(let c=0;c<possibleHeader.length;c++){
let cell=rowCells[c]!==undefined?rowCells[c]:"";
r.push("<td>"+this.i(cell)+"</td>");
}
r.push("</tr>");
}
r.push("</tbody></table>");
tableMode=false;
continue;
}}}

closeList();
r.push("<p>"+this.i(l)+"</p>");
}

if(tableMode) r.push("</table>");
closeList();
return r.join("");
},
i(t){
t=t.replace(/:::(?:\s+(-?[\w-]+))?\s+(.+?)\s+:::/g,(match,classPart,content)=>{
const className=classPart?classPart.trim().replace(/^-/,''):'';
return className?'<div class="'+className+'">'+content.trim()+'</div>':'<div>'+content.trim()+'</div>';
});
t=t.replace(/::(?:\s+(-?[\w-]+))?\s+(.+?)\s+::/g,(match,classPart,content)=>{
const className=classPart?classPart.trim().replace(/^-/,''):'';
return className?'<span class="'+className+'">'+content.trim()+'</span>':'<span>'+content.trim()+'</span>';
});
t=t.replace(/___(.*?)___/g,"<strong><em>$1</em></strong>");
t=t.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>");
t=t.replace(/\*(.*?)\*/g,"<em>$1</em>");
t=t.replace(/~~(.*?)~~/g,"<del>$1</del>");
t=t.replace(/`([^`]+)`/g,"<code>$1</code>");
t=t.replace(/\[([^\]]*)\]\(extl\s+([^\)]*)\)/g,(a,b,c)=>"<a href='"+c+"' target='_blank' rel='noopener noreferrer'>"+b+"</a>");
t=t.replace(/\[([^\]]*)\]\(([^\)]*)\)/g,(a,b,c)=>"<a href='"+c+"'>"+b+"</a>");
t=t.replace(/^---$/gm,"<hr />");
return t;
},
escapeCode(t){
return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}};
function mdParse(s){
s=s.trim();
let o="",code=false,block="";
let codeLang = "";
for(let l of s.split("\n")){
if(l.startsWith("```")){
if(code){
o+='<pre><code class="language-'+codeLang+'">' +M.escapeCode(block.trim())+'</code></pre>';
block="";
code=false;
codeLang = "";
} else {
codeLang = l.slice(3).trim();
if(block.trim()){o+=M.h(block,false)}
code=true;
block="";
}} else if (code){
block+=l+"\n";
} else {
block+=l+"\n";
}}
if (block.trim())o+=M.h(block,!o.includes("<ul>"));
return M.i(o);
}
async function loadAndRender(div){
const src = div.getAttribute("data-md-src");
if(src === null) return null;
console.log(`%c[DEBUG] Laddning påbörjad: ${src}`, "color: #6c757d;");
try {
if (cache[src]){
console.log(`%c✓ CACHE HIT: ${src} - hämtas från minne`, "color: #28a745; font-weight: bold;");
div.innerHTML = cache[src];
div.classList.remove("md-loading");
div.classList.add("md-loaded");
setTimeout(() => {
if (typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function") {
if (!consoleLogShown.prism) {
console.log(`%c✓ Prism.js aktiverad`, "font-weight: bold; color: #17a2b8;");
consoleLogShown.prism = true;
}
Prism.highlightAllUnder(div);
}}, 0);
console.log(`%c[CACHE STATUS] Antal filer i cache: ${Object.keys(cache).length}`, "color: #6c757d;");
return cache[src];
} else {
console.log(`%c✗ CACHE MISS: ${src} - hämtas från nätverk`, "color: #ffc107; font-weight: bold;");
}
const totalMarkStart = `total-start-${src}`;
const fetchMarkStart = `fetch-start-${src}`;
const fetchMarkEnd = `fetch-end-${src}`;
const renderMarkStart = `render-start-${src}`;
const renderMarkEnd = `render-end-${src}`;
const totalMarkEnd = `total-end-${src}`;
performance.mark(totalMarkStart);
performance.mark(fetchMarkStart);
div.classList.add("md-loading");
const response = await fetch(src);
performance.mark(fetchMarkEnd);
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const rawMd = await response.text();
performance.mark(renderMarkStart);
const html = mdParse(rawMd);
let finalHtml = html;
if (typeof DOMPurify !== "undefined") {
if (!consoleLogShown.purify) {
console.log(`%c✓ DOMPurify ${DOMPurify.version || "loaded"} aktiverad`, "font-weight: bold; color: #28a745;");
consoleLogShown.purify = true;
}
finalHtml = DOMPurify.sanitize(html, {
ADD_ATTR: ['target', 'rel'],
ADD_TAGS: []
});
} else {
if (!consoleLogShown.warn) {
console.warn("%c⚠ DOMPurify saknas", "font-weight: bold; color: #ffc107; background: #000; padding: 2px 6px;");
consoleLogShown.warn = true;
}
finalHtml = html;
}
cache[src] = finalHtml;
div.innerHTML = finalHtml;
setTimeout(() => {
if (typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function") {
if (!consoleLogShown.prism) {
console.log(`%c✓ Prism.js aktiverad — kodblock får syntax-highlighting (${Prism.version || "latest"})`, "font-weight: bold; color: #17a2b8;");
consoleLogShown.prism = true;
}
Prism.highlightAllUnder(div);
}}, 0);
performance.mark(renderMarkEnd);
performance.mark(totalMarkEnd);
const netDur = performance.measure(`Nätverk (Hämta): ${src}`, fetchMarkStart, fetchMarkEnd).duration;
const rendDur = performance.measure(`Rendering (Parse+DOM): ${src}`, renderMarkStart, renderMarkEnd).duration;
const totDur = performance.measure(`TOTALTID: ${src}`, totalMarkStart, totalMarkEnd).duration;
console.log(
`%c[${new Date().toLocaleTimeString()}] ${src}`+
`%c\n%cNätverk:   ${netDur.toFixed(2)} ms`+
`%c\n%cRendering: ${rendDur.toFixed(2)} ms`+
`%c\n%cTotal tid: ${totDur.toFixed(2)} ms`+
`%c\n%cCACHE STATUS: ${Object.keys(cache).length} filer i cache`,
"font-weight: bold; color: #007bff;",
"",
"color: #28a745;",
"",
"color: #ffc107;",
"",
"font-weight: bold; color: #dc3545;",
"",
"color: #6c757d;"
);
div.classList.remove("md-loading");
div.classList.add("md-loaded");
return rawMd;
} catch (err) {
console.error(`%cMD Load Error för ${src}:`, "color: #dc3545; font-weight: bold;", err);
div.textContent = "Error loading: " + src;
div.classList.remove("md-loading");
div.classList.add("md-error");
return null;
}}
async function mdInit(){
const divs = document.querySelectorAll("[data-md-src]");
const lazyObserver = new IntersectionObserver((entries, observer) => {
entries.forEach(entry => {
if(entry.isIntersecting){
console.log(`%c[Lazy Load Triggered] ${entry.target.getAttribute("data-md-src")}`, "color: #17a2b8; font-weight: bold;");
loadAndRender(entry.target);
observer.unobserve(entry.target);
}});
}, {threshold: 0.3});
divs.forEach(d => lazyObserver.observe(d));
document.dispatchEvent(new CustomEvent("md-loaded", {detail: {elements: [...divs]}}));
}
window.md = {parse: mdParse, load: loadAndRender, init: mdInit};
if(document.readyState === "loading"){
document.addEventListener("DOMContentLoaded", mdInit);
} else {
mdInit();
}})();