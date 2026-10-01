const json=(status,code,extra={})=>new Response(JSON.stringify({code,...extra}),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...(status===405?{Allow:'POST'}:{})}});
export const config={rateLimit:{action:'rate_limit',windowLimit:5,windowSize:60,aggregateBy:['ip','domain']}};
export default async function subscribe(request){
 if(request.method!=='POST')return json(405,'method_not_allowed');
 let origin;try{origin=new URL(process.env.SITE_URL||process.env.URL).origin}catch{return json(503,'not_configured')}
 if(request.headers.get('origin')!==origin)return json(403,'invalid_origin');
 if(!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return json(415,'invalid_content_type');
 if(Number(request.headers.get('content-length'))>4096)return json(413,'payload_too_large');
 let body;try{const text=await request.text();if(new TextEncoder().encode(text).byteLength>4096)return json(413,'payload_too_large');body=JSON.parse(text)}catch{return json(400,'invalid_request')}
 if(!body||typeof body!=='object'||Array.isArray(body))return json(400,'invalid_request');
 if(body.website)return json(400,'invalid_request'); // honeypot: never send a message for bot submissions
 if(body.consent!==true)return json(400,'consent_required');
 const email=typeof body.email==='string'?body.email.trim():'';
 if(email.length>254||! /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||/[\r\n]/.test(email))return json(400,'invalid_email');
 const listId=Number(process.env.BREVO_LIST_ID),templateId=Number(process.env.BREVO_DOI_TEMPLATE_ID);
 if(!process.env.BREVO_API_KEY||!Number.isSafeInteger(listId)||listId<1||!Number.isSafeInteger(templateId)||templateId<1)return json(503,'not_configured');
 // Contact is added to the configured list only AFTER they click Brevo's confirmation link.
 // No contact lookup: responses do not reveal whether an address is already subscribed.
 try{
  const response=await fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation',{
   method:'POST',headers:{'api-key':process.env.BREVO_API_KEY,'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({email,includeListIds:[listId],templateId,redirectionUrl:origin+'/newsletter/confirmed.html'}),signal:AbortSignal.timeout(12000)
  });
  if(response.status===429)return json(429,'try_later');
  if(!response.ok){
   // Log only status, never addresses, payloads, credentials, or provider response text.
   console.warn('Brevo DOI request rejected; HTTP status:',response.status);
   return json(502,'provider_error');
  }
  return json(202,'confirmation_requested');
 }catch{return json(502,'provider_unavailable')}
}
