// Documentation-only entry shortcuts: no purchase, sell, withdraw or shipping submission.
(()=>{const params=new URLSearchParams(location.search);if(!['demo','reference','clean'].includes(params.get('preview')))return;
const openers={deposit:'[data-deposit]',withdraw:'[data-withdraw]',history:'[data-history]',username:'[data-edit-user]',address:'[data-address-open]',rules:'#rulesTrigger',live:'[data-pull]',prize:'.prize-card'};
const reveal=()=>{const selector=openers[params.get('show')];if(selector)document.querySelector(selector)?.click();};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal,{once:true});else reveal();})();
