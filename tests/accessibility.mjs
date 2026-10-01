import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const b=await chromium.launch();const context=await b.newContext({viewport:{width:1440,height:1000}});const p=await context.newPage();await p.goto('http://127.0.0.1:5173');await p.locator('.hero').waitFor();
const a=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();console.log(JSON.stringify(a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(x=>({target:x.target,summary:x.failureSummary})).slice(0,8)})),null,2));
for(const width of [360,390,768,1024,1440]){await p.setViewportSize({width,height:900});console.log('width',width,'overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))}
await b.close();
