(()=>{var r={};r.id=492,r.ids=[492],r.modules={440:(r,e,o)=>{"use strict";o.r(e),o.d(e,{default:()=>t});var a=o(1658);let t=async r=>[{type:"image/x-icon",sizes:"16x16",url:(0,a.fillMetadataSegment)(".",await r.params,"favicon.ico")+""}]},689:(r,e,o)=>{Promise.resolve().then(o.t.bind(o,4536,23))},846:r=>{"use strict";r.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},961:(r,e,o)=>{Promise.resolve().then(o.t.bind(o,5814,23))},1655:(r,e,o)=>{Promise.resolve().then(o.bind(o,6871))},3033:r=>{"use strict";r.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:r=>{"use strict";r.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},3407:(r,e,o)=>{Promise.resolve().then(o.bind(o,3701))},3701:(r,e,o)=>{"use strict";o.d(e,{ThemeProvider:()=>a});let a=(0,o(2907).registerClientReference)(function(){throw Error("Attempted to call ThemeProvider() from the server but ThemeProvider is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"/Users/hasura/work/pari-project/my-app/src/components/theme-provider.tsx","ThemeProvider")},3873:r=>{"use strict";r.exports=require("path")},4413:(r,e,o)=>{"use strict";o.r(e),o.d(e,{default:()=>i,metadata:()=>n});var a=o(7413),t=o(4536),s=o.n(t);let n={title:"404: Not Found - PARI",description:"The requested page could not be found"};function i(){return(0,a.jsxs)("div",{className:"flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold text-foreground",children:"Not Found"}),(0,a.jsx)("p",{className:"mt-4 text-muted-foreground",children:"Could not find the requested resource"}),(0,a.jsx)(s(),{href:"/",className:"mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",children:"Return Home"})]})}},6438:(r,e,o)=>{"use strict";o.d(e,{A:()=>u});var a=o(6224),t=o.n(a),s=o(2377),n=o.n(s),i=o(5309),d=o(9426),c=n()(t());c.i(i.A),c.i(d.A),c.push([r.id,`@plugin "tailwindcss-animate";

@custom-variant dark (&:is(.dark *));

:root {
  --background: #F4F4F4; /* lightsurface0 */
  --foreground: #181818; /* darksurface0 */
  --card: #EDEDED; /* lightsurface1 */
  --card-foreground: #181818; /* darksurface0 */
  --popover: #FFFFFF; /* lightsurface2 */
  --popover-foreground: #181818; /* darksurface0 */
  --primary: #181818; /* darksurface0 */
  --primary-foreground: #FFFFFF; /* lightsurface2 */
  --secondary: #EDEDED; /* lightsurface1 */
  --secondary-foreground: #181818; /* darksurface0 */
  --muted: #EDEDED; /* lightsurface1 */
  --muted-foreground: #202020; /* darksurface1 */
  --accent: #EDEDED; /* lightsurface1 */
  --accent-foreground: #181818; /* darksurface0 */
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: #EDEDED; /* lightsurface1 */
  --input: #EDEDED; /* lightsurface1 */
  --ring: #202020; /* darksurface1 */
  --radius: 0.625rem;
}

.dark {
  --background: #181818; /* darksurface0 */
  --foreground: #F4F4F4; /* lightsurface0 */
  --card: #202020; /* darksurface1 */
  --card-foreground: #F4F4F4; /* lightsurface0 */
  --popover: #121212; /* darksurface2 */
  --popover-foreground: #F4F4F4; /* lightsurface0 */
  --primary: #F4F4F4; /* lightsurface0 */
  --primary-foreground: #181818; /* darksurface0 */
  --secondary: #202020; /* darksurface1 */
  --secondary-foreground: #F4F4F4; /* lightsurface0 */
  --muted: #202020; /* darksurface1 */
  --muted-foreground: #EDEDED; /* lightsurface1 */
  --accent: #202020; /* darksurface1 */
  --accent-foreground: #F4F4F4; /* lightsurface0 */
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: #202020; /* darksurface1 */
  --input: #202020; /* darksurface1 */
  --ring: #282828; /* darksurface2 */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}

.fixed {
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.95);
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

`,""]);let u=c},6871:(r,e,o)=>{"use strict";o.d(e,{ThemeProvider:()=>s});var a=o(687);o(3210);var t=o(218);function s({children:r,...e}){return(0,a.jsx)(t.N,{...e,children:r})}},7376:(r,e,o)=>{Promise.resolve().then(o.t.bind(o,6346,23)),Promise.resolve().then(o.t.bind(o,7924,23)),Promise.resolve().then(o.t.bind(o,5656,23)),Promise.resolve().then(o.t.bind(o,99,23)),Promise.resolve().then(o.t.bind(o,8243,23)),Promise.resolve().then(o.t.bind(o,8827,23)),Promise.resolve().then(o.t.bind(o,2763,23)),Promise.resolve().then(o.t.bind(o,7173,23))},7741:(r,e,o)=>{"use strict";o.r(e),o.d(e,{GlobalError:()=>n.a,__next_app__:()=>l,pages:()=>u,routeModule:()=>p,tree:()=>c});var a=o(5239),t=o(8088),s=o(8170),n=o.n(s),i=o(893),d={};for(let r in i)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(r)&&(d[r]=()=>i[r]);o.d(e,d);let c={children:["",{children:["/_not-found",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(o.bind(o,4413)),"/Users/hasura/work/pari-project/my-app/src/app/not-found.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(o.bind(o,7982)),"/Users/hasura/work/pari-project/my-app/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(o.bind(o,4413)),"/Users/hasura/work/pari-project/my-app/src/app/not-found.tsx"],forbidden:[()=>Promise.resolve().then(o.t.bind(o,9999,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(o.t.bind(o,5284,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async r=>(await Promise.resolve().then(o.bind(o,440))).default(r)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]}.children,u=[],l={require:o,loadChunk:()=>Promise.resolve()},p=new a.AppPageRouteModule({definition:{kind:t.RouteKind.APP_PAGE,page:"/_not-found/page",pathname:"/_not-found",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},7982:(r,e,o)=>{"use strict";o.r(e),o.d(e,{default:()=>x,metadata:()=>y});var a=o(7413),t=o(3701),s=o(5915),n=o.n(s),i=o(4652),d=o.n(i),c=o(2760),u=o.n(c),l=o(4195),p=o.n(l),f=o(5055),m=o.n(f),v=o(1952),h=o.n(v),g=o(6438),b={};b.styleTagTransform=h(),b.setAttributes=p(),b.insert=u().bind(null,"head"),b.domAPI=d(),b.insertStyleElement=m(),n()(g.A,b),g.A&&g.A.locals&&g.A.locals;let y={title:{template:"%s - PARI",default:"PARI - People's Archive of Rural India"},description:"Stories from rural India",icons:{icon:"/favicon.ico"}};function x({children:r}){return(0,a.jsx)("html",{lang:"en",suppressHydrationWarning:!0,children:(0,a.jsx)("body",{className:"font-sans antialiased",suppressHydrationWarning:!0,children:(0,a.jsx)(t.ThemeProvider,{attribute:"class",defaultTheme:"system",enableSystem:!0,disableTransitionOnChange:!0,storageKey:"theme",children:r})})})}},8335:()=>{},8868:()=>{},9121:r=>{"use strict";r.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9232:(r,e,o)=>{Promise.resolve().then(o.t.bind(o,6444,23)),Promise.resolve().then(o.t.bind(o,6042,23)),Promise.resolve().then(o.t.bind(o,8170,23)),Promise.resolve().then(o.t.bind(o,9477,23)),Promise.resolve().then(o.t.bind(o,9345,23)),Promise.resolve().then(o.t.bind(o,2089,23)),Promise.resolve().then(o.t.bind(o,6577,23)),Promise.resolve().then(o.t.bind(o,1307,23))},9294:r=>{"use strict";r.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9551:r=>{"use strict";r.exports=require("url")}};var e=require("../../webpack-runtime.js");e.C(r);var o=r=>e(e.s=r),a=e.X(0,[447,88],()=>o(7741));module.exports=a})();