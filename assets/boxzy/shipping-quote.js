/* All quote values are integer cents. The local example is not a tax-rate engine. */
(function(root){
  function normalize(q) {
    const fields=['shippingCents','handlingCents','taxCents'];
    if(!q || fields.some(k=>!Number.isSafeInteger(q[k]) || q[k]<0)) throw new Error('Incomplete quote');
    const totalCents=fields.reduce((sum,k)=>sum+q[k],0);
    if(!Number.isSafeInteger(totalCents)) throw new Error('Invalid quote');
    return {...q,totalCents};
  }
  root.BoxzyShippingQuote={normalize,example:()=>normalize({shippingCents:900,handlingCents:200,taxCents:100,example:true})};
})(typeof window==='object'?window:globalThis);
