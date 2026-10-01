import {defineConfig} from 'vite';
import {buildContent} from './scripts/build-content.mjs';
export default defineConfig({
 build:{target:'esnext'},server:{host:'0.0.0.0',allowedHosts:true},preview:{host:'0.0.0.0',allowedHosts:true},
 plugins:[{name:'local-content-and-newsletter',configureServer(server){
  server.middlewares.use((req,res,next)=>{if(['/admin','/admin/'].includes(req.url?.split('?')[0])){res.statusCode=302;res.setHeader('Location','/admin/index.html');res.end();return;}next();});
  server.watcher.add('content/posts');
  server.watcher.on('all',(event,path)=>{if(path.replaceAll('\\','/').includes('content/posts/')&&path.endsWith('.md')){try{buildContent();server.ws.send({type:'full-reload'})}catch(e){console.error('Content validation:',e.message)}}});
  server.middlewares.use('/.netlify/functions/subscribe',(req,res)=>{res.statusCode=503;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({code:'not_configured'}))});
 }}]
});
