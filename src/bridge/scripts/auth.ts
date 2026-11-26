import { sharedScript } from './shared'

export function authScript(mode: 'signin' | 'signup') {
  const nextMode = mode === 'signin' ? 'signup' : 'signin'
  const switchLabel = mode === 'signin' ? 'Sign Up' : 'Sign In'
  const switchPrefix = mode === 'signin' ? 'Need an account? ' : 'Already have an account? '

  return `
${sharedScript()}
const authMode=${JSON.stringify(mode)};
const form=document.querySelector('form');
const title=document.querySelector('h1');
const subtitle=[...document.querySelectorAll('p')].find((node)=>window.__stitchText(node).includes('Join FinTrack AI'));
const googleButton=[...document.querySelectorAll('button')].find((node)=>window.__stitchText(node).includes('Google'));
const submitButton=form&&form.querySelector('button[type="submit"]');
const inputs=form?[...form.querySelectorAll('input')]:[];
if(title){
  title.textContent=authMode==='signin'?'Sign-In to your account':'Create your account';
}
if(subtitle){
  subtitle.textContent=authMode==='signin'
    ? 'Continue with your Google account to access FinTrack AI.'
    : 'Use Google to create your FinTrack AI account.';
}
if(submitButton){
  submitButton.textContent=authMode==='signin'?'Sign In':'Sign Up';
}
const switchLink=[...document.querySelectorAll('a')].find((node)=>node.getAttribute('href')==='#');
if(switchLink){
  switchLink.textContent=${JSON.stringify(switchLabel)};
  if(switchLink.previousSibling&&switchLink.previousSibling.nodeType===Node.TEXT_NODE){
    switchLink.previousSibling.textContent=${JSON.stringify(switchPrefix)};
  }
  switchLink.addEventListener('click',(event)=>{
    event.preventDefault();
    window.__stitchPost({type:'auth.switch',mode:${JSON.stringify(nextMode)}});
  });
}
function handleEmailSubmit(event) {
  event.preventDefault();
  const email = inputs.find(i => i.type === 'email')?.value || '';
  const password = inputs.find(i => i.type === 'password')?.value || '';
  window.__stitchPost({type:'auth.email', mode:authMode, email, password});
}
if(form){
  form.addEventListener('submit', handleEmailSubmit);
}
if(submitButton){
  submitButton.addEventListener('click', handleEmailSubmit);
}
if(googleButton){
  googleButton.addEventListener('click',(event)=>{
    event.preventDefault();
    window.__stitchPost({type:'auth.google',mode:authMode});
  });
}
`
}
