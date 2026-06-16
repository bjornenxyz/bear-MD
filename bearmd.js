(function(){
    const cache = {};
    const consoleLogShown = {purify: false, prism: false};
    const M={
        p(t){return t.replace(/\n/g,"<br>")},
        h(t,s=false){
            let e=t.split("\n");
            let r=[];
            for (let i=0;i<e.length;i++){
                let l=e[i].trim();
                if(l.startsWith("###### ")){r.push("<h6>"+this.i(l.slice(7))+"</h6>");continue}
                if(l.startsWith("##### ")){r.push("<h5>"+this.i(l.slice(6))+"</h5>");continue}
                if(l.startsWith("#### ")){r.push("<h4>"+this.i(l.slice(5))+"</h4>");continue}
                if(l.startsWith("### ")){r.push("<h3>"+this.i(l.slice(4))+"</h3>");continue}
                if(l.startsWith("## ")){r.push("<h2>"+this.i(l.slice(3))+"</h2>");continue}
                if(l.startsWith("# ")){r.push("<h1>"+this.i(l.slice(2))+"</h1>");continue}
                if(l.startsWith("> ")){r.push("<blockquote class='md-quote'>"+this.p(l.slice(2))+"</blockquote>");continue}
                if(l.startsWith("- ")||l.startsWith("* ")){
                    if(!s)r.push("<ul>");
                    r.push("<li class='md-list-item'>"+this.i(l.slice(2))+"</li>");s=true;continue;
                }
                if(s&&!l.startsWith("-")&&!l.startsWith("* ")){r.push("</ul>");s=false}
                if(!l.trim())continue;
                r.push("<p class='md-paragraph'>"+this.i(l)+"</p>");
            }
            if(s)r.push("</ul>");
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
            t=t.replace(/___(.*?)___/g,"<strong><em>\$1</em></strong>");
            t=t.replace(/\*\*(.*?)\*\*/g,"<strong>\$1</strong>");
            t=t.replace(/\*(.*?)\*/g,"<em>\$1</em>");
            t=t.replace(/~~(.*?)~~/g,"<del>\$1</del>");
            t=t.replace(/`([^`]+)`/g,"<code class='md-inline-code'>\$1</code>");
            t=t.replace(/\[([^\]]*)\]\(extl\s+([^\)]*)\)/g,(a,b,c)=>"<a href='"+c+"' target='_blank' rel='noopener noreferrer' class='md-external-link'>"+b+"</a>");
            t=t.replace(/\[([^\]]*)\]\(([^\)]*)\)/g,(a,b,c)=>"<a href='"+c+"' class='md-link'>"+b+"</a>");
            t=t.replace(/^---\$/gm,"<hr class='md-hr'/>");
            return t;
        },
        escapeCode(t){
            return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        }
    };
    function mdParse(s){
        s=s.trim();
        let o="",code=false,block="";
        let codeLang = "";
        const lines = s.split("\n");
        for(let i=0; i<lines.length; i++){
            let l = lines[i];
            if(l.startsWith("```")){
                if(code){
                    o+='<pre class="md-code-block"><code class="language-'+codeLang+'">' +M.escapeCode(block.trim())+'</code></pre>';
                    block="";
                    code=false;
                    codeLang = "";
                }else{
                    codeLang = l.slice(3).trim();
                    if(block.trim()){o+=M.h(block,false)}
                    code=true;
                    block="";
                }
            }else{
                block+=l+"\n";
            }
        }
        if(block.trim())o+=M.h(block,!o.includes("<ul>"));
        return M.i(o);
    }
    async function loadAndRender(div){
        const src = div.getAttribute("data-md-src");
        if(src === null) return null;
        try {
            if(cache[src]){
                div.innerHTML = cache[src];
                div.classList.remove("md-loading");
                div.classList.add("md-loaded");
                if(typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function") {
                    Prism.highlightAllUnder(div);
                }
                return cache[src];
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
                finalHtml = DOMPurify.sanitize(html, {
                    ADD_ATTR: ['target', 'rel'],
                    ADD_TAGS: []
                });
            } else {
                const tmpl = document.createElement('template');
                tmpl.innerHTML = html;
                const bad = tmpl.content.querySelectorAll('script, iframe, object, embed, [onerror], [onload]');
                for (let i = 0; i < bad.length; i++) bad[i].remove();
                finalHtml = tmpl.innerHTML;
            }
            cache[src] = finalHtml;
            div.innerHTML = finalHtml;
            div.classList.remove("md-loading");
            div.classList.add("md-loaded");
            if(typeof Prism !== "undefined" && typeof Prism.highlightAllUnder === "function") {
                Prism.highlightAllUnder(div);
            }
            performance.mark(renderMarkEnd);
            performance.mark(totalMarkEnd);
            performance.measure(`Nätverk (Hämta): ${src}`, fetchMarkStart, fetchMarkEnd);
            performance.measure(`Rendering (Parse+DOM): ${src}`, renderMarkStart, renderMarkEnd);
            performance.measure(`TOTALTID: ${src}`, totalMarkStart, totalMarkEnd);
            return finalHtml;
        } catch (err) {
            div.classList.remove("md-loading");
            return null;
        }
    }
    const containers = document.querySelectorAll("[data-md-src]");
    if (containers.length > 0) {
        Promise.all(Array.prototype.map.call(containers, loadAndRender));
    }
})();
