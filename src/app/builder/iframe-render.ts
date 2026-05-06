// This file is kept SEPARATE to avoid regex escape issues in template literals.
// The render script uses string concatenation (NOT template literals) for regex patterns.

export function getIframeHtml(base64Code: string): string {
  const renderScript = buildRenderScript();

  // Only the HTML shell uses a template literal — no regex patterns here
  return '<!DOCTYPE html>' +
    '<html lang="en">' +
    '<head>' +
    '<meta charset="UTF-8" />' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
    '<script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin="anonymous"></scr' + 'ipt>' +
    '<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin="anonymous"></scr' + 'ipt>' +
    '<script src="https://unpkg.com/@babel/standalone@7.24.0/babel.min.js" crossorigin="anonymous"></scr' + 'ipt>' +
    '<script src="https://cdn.tailwindcss.com"></scr' + 'ipt>' +
    '<script src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.min.js" crossorigin="anonymous"></scr' + 'ipt>' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">' +
    '<style>' +
    '*, *::before, *::after { box-sizing: border-box; }' +
    'body { font-family: "Inter", sans-serif; margin: 0; padding: 0; background: #fff; color: #000; min-height: 100vh; }' +
    '#error-overlay { display: none; position: fixed; inset: 0; background: #fff; z-index: 9999; padding: 24px; overflow: auto; }' +
    '.error-card { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 12px; padding: 24px; max-width: 860px; margin: 40px auto; color: #b91c1c; font-family: "Inter", monospace; }' +
    '.error-card h3 { margin: 0 0 8px; font-size: 16px; }' +
    '.error-card p { font-weight: 600; margin: 0 0 4px; font-size: 13px; }' +
    'pre { background: #fff; padding: 16px; border-radius: 8px; border: 1px solid #fca5a5; overflow: auto; font-size: 11px; color: #7f1d1d; margin-top: 12px; white-space: pre-wrap; word-break: break-all; }' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<div id="root"></div>' +
    '<div id="error-overlay"><div class="error-card">' +
    '<h3>\u26A0 Preview Render Error</h3>' +
    '<p id="error-message"></p>' +
    '<pre id="error-stack"></pre>' +
    '</div></div>' +
    '<scr' + 'ipt>window.__b64="' + base64Code + '";</scr' + 'ipt>' +
    '<scr' + 'ipt>' + renderScript + '</scr' + 'ipt>' +
    '</body></html>';
}

function buildRenderScript(): string {
  // Using regular string concatenation with \n line breaks.
  // Inside regular strings (not template literals), \s \w etc. are NOT escape sequences
  // but \b IS (backspace) and \n IS (newline). So for regex patterns in new RegExp(),
  // we use \\b and \\n to produce literal \b and \n in the output.
  //
  // Escape chain for new RegExp("\\b"):
  //   Source: "\\b"  →  JS string: \b  →  RegExp: \b (word boundary) ✓
  //   Source: "\\s"  →  JS string: \s  →  RegExp: \s (whitespace) ✓
  //   Source: "\\w"  →  JS string: \w  →  RegExp: \w (word) ✓
  //   Source: "\\n"  →  JS string: \n  →  RegExp: \n (newline) ✓
  //
  // BUT these strings are going into HTML as text content of a <script>.
  // When the browser parses the HTML, the <script> content is NOT HTML-decoded —
  // it's taken verbatim. So we need the OUTPUT of our JS strings to contain
  // the literal characters: new RegExp("\\b")
  //
  // Output needs: \\b  (two chars: backslash + b)
  // In a JS regular string, to get \\ in output, source needs: \\\\
  // And then b, so source is: \\\\b
  // But wait — \\\\b in a JS regular string:
  //   \\\\ → \\ (two backslashes → one backslash in output)
  //   b → b
  //   So output is: \b (one backslash + b)
  // Then browser parses <script> content and sees: new RegExp("\b")
  // But \b in a JS string is a backspace! We need \\b.
  //
  // So actually:
  // We need output in HTML: new RegExp("\\b", ...)
  // The browser's JS parser sees the string "\\b" → string value is \b → regex word boundary ✓
  // To get \\b in the HTML output, our JS string must produce \\b.
  // In a JS regular string: "\\\\b" → output: \\b ✓✓✓

  return 'function showError(t,d,s){\n' +
    '  document.getElementById("error-overlay").style.display="block";\n' +
    '  document.getElementById("error-message").textContent=t+": "+d;\n' +
    '  document.getElementById("error-stack").textContent=s||"(no stack)";\n' +
    '}\n' +
    'window.onerror=function(m,s,l,c,e){\n' +
    '  if(m==="Script error."&&l===0)return;\n' +
    '  showError("Error",String(m),e?e.stack:"line "+l);\n' +
    '};\n' +
    'function setupGlobals(){\n' +
    '  var R=window.React;\n' +
    '  if(R){\n' +
    '    ["useState","useEffect","useMemo","useRef","useCallback",\n' +
    '     "useLayoutEffect","useContext","useReducer","useId","useTransition",\n' +
    '     "createElement","Fragment","Children","cloneElement","createContext",\n' +
    '     "forwardRef","memo","lazy","Suspense","StrictMode"\n' +
    '    ].forEach(function(h){if(R[h])window[h]=R[h];});\n' +
    '  }\n' +
    '  if(window.lucide){Object.keys(window.lucide).forEach(function(k){window[k]=window.lucide[k];});}\n' +
    '  window.motion=new Proxy({},{get:function(_,tag){\n' +
    '    return React.forwardRef(function(props,ref){\n' +
    '      var p=Object.assign({},props,{ref:ref});\n' +
    '      ["initial","animate","exit","transition","variants","whileHover",\n' +
    '       "whileTap","whileInView","layout","layoutId","drag","dragConstraints",\n' +
    '       "onDrag","onDragEnd","onDragStart","viewport"\n' +
    '      ].forEach(function(k){delete p[k];});\n' +
    '      return React.createElement(tag,p);\n' +
    '    });\n' +
    '  }});\n' +
    '  window.AnimatePresence=function(p){return p.children||null;};\n' +
    '  window.useAnimation=function(){return{};};\n' +
    '  window.useScroll=function(){return{scrollY:{get:function(){return 0;}}};};\n' +
    '  window.useTransform=function(v,i,o){return o?o[0]:v;};\n' +
    '  window.useInView=function(){return[null,true];};\n' +
    '  window.useMotionValue=function(v){return{get:function(){return v;},set:function(){}};};\n' +
    '}\n' +
    'function renderPreview(){\n' +
    '  setupGlobals();\n' +
    '  var raw=decodeURIComponent(escape(atob(window.__b64)));\n' +
    '  raw=raw.replace(new RegExp("^import\\\\b.*$","gm"),"");\n' +
    '  raw=raw.replace(new RegExp("^\\\\s*$","gm"),"");\n' +
    '  var cn="GeneratedWebsite";\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+default\\\\s+function\\\\s+(\\\\w+)"),function(_,n){cn=n;return"function "+n;});\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+default\\\\s+class\\\\s+(\\\\w+)"),function(_,n){cn=n;return"class "+n;});\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+default\\\\s+","g"),"window.__exp=");\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+const\\\\s+","g"),"const ");\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+function\\\\s+","g"),"function ");\n' +
    '  raw=raw.replace(new RegExp("export\\\\s+","g"),"");\n' +
    '  var compiled;\n' +
    '  try{compiled=Babel.transform(raw,{presets:["react"],filename:"preview.jsx"}).code;}\n' +
    '  catch(e){showError("Babel Compile Error",e.message,raw.substring(0,600));return;}\n' +
    '  try{eval(compiled);}\n' +
    '  catch(e){showError("Runtime Error",e.message,e.stack);return;}\n' +
    '  var C=window.GeneratedWebsite||window.__exp||window[cn];\n' +
    '  if(!C){var m=raw.match(new RegExp("function\\\\s+(\\\\w+)"));if(m)C=window[m[1]];}\n' +
    '  if(!C){showError("Component Error","No component found","AI must return: function GeneratedWebsite(){return(...);}");return;}\n' +
    '  try{ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(C));}\n' +
    '  catch(e){showError("React Render Error",e.message,e.stack);}\n' +
    '}\n' +
    'window.addEventListener("load",function(){\n' +
    '  try{renderPreview();}catch(e){showError("Fatal",e.message,e.stack);}\n' +
    '});\n';
}
