var selType=null,selCat=null,selPart=null;
var tipTimer=null,tipIdx=0,floatTimer=null,searchTimer=null;
var countdownTimer=null,pollTimer=null;
var orderData={};
var uploadedImageData=null;
var chosenDealerId=null,chosenPrice=null,chosenDealerName=null;

// PROGRESS
function setProg(n){
  var nums=['١','٢','٣','٤','٥'];
  for(var i=1;i<=5;i++){
    var el=document.getElementById('ps'+i);if(!el)continue;
    el.className='ps'+(i<n?' done':i===n?' act':'');
    var nm=el.querySelector('.ps-num');
    if(i<n)nm.innerHTML='<i class="ti ti-check" style="font-size:.7rem"></i>';
    else nm.textContent=nums[i-1];
  }
}

function goStep(n){
  document.querySelectorAll('.step-block').forEach(function(b){b.classList.remove('show');});
  var t=document.getElementById('block'+n);
  if(t){t.classList.add('show');}
  setProg(n);
  if(n===3){
    var cw=document.getElementById('chassisWrap');
    if(cw)cw.style.display=(selType==='used')?'none':'block';
    validateCar();
  }
  window.scrollTo(0,0); document.body.scrollTop=0; document.documentElement.scrollTop=0;
}

// TYPE
function pickType(type,el){
  selType=type;
  document.querySelectorAll('.type-opt').forEach(function(c){c.classList.remove('on');});
  el.classList.add('on');enableBtn('b1');
  addUserBubble({original:'جديد أصلي',commercial:'جديد تجاري',used:'مستعمل'}[type]);
  setTimeout(function(){addAgentBubble('ممتاز! اختر القسم والقطعة 🔧');},700);
}

// CAT
function pickCat(cat,el){
  selCat=cat;selPart=null;
  document.querySelectorAll('.cat-opt').forEach(function(c){c.classList.remove('on');});
  el.classList.add('on');
  ['partsWrap','customWrap','otherPartWrap'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none';});
  disableBtn('b2');
  var parts=PARTS_DATA[cat];
  if(parts&&parts.length){
    var icons=PART_ICONS[cat]||{},def=CAT_DEFAULT_ICON[cat]||'🔧';
    var grid=document.getElementById('partsGrid');grid.innerHTML='';
    parts.forEach(function(p){
      var div=document.createElement('div');div.className='part-img-opt';
      div.innerHTML='<div class="part-img-thumb">'+(icons[p]||def)+'</div><div class="part-img-name">'+p+'</div>';
      div.addEventListener('click',(function(pp,ee){return function(){pickPart(pp,ee);};})(p,div));
      grid.appendChild(div);
    });
    document.getElementById('partsWrap').style.display='block';
  } else {
    document.getElementById('customWrap').style.display='block';
  }
}

function pickPart(part,el){
  document.querySelectorAll('.part-img-opt').forEach(function(b){b.classList.remove('on');});
  el.classList.add('on');
  if(part==='أخرى'){
    document.getElementById('otherPartWrap').style.display='block';
    document.getElementById('otherPart').value='';
    document.getElementById('otherPart').focus();
    selPart=null;disableBtn('b2');
  } else {
    var ow=document.getElementById('otherPartWrap');if(ow)ow.style.display='none';
    selPart=part;enableBtn('b2');
  }
}
function onCustomPart(){var v=document.getElementById('customPart').value.trim();selPart=v.length>1?v:null;selPart?enableBtn('b2'):disableBtn('b2');}
function onOtherPart(){var v=document.getElementById('otherPart').value.trim();selPart=v.length>1?v:null;selPart?enableBtn('b2'):disableBtn('b2');}

// CAR
function onBrandChange(){
  var brand=document.getElementById('brand').value;
  var ms=document.getElementById('carModel');
  var ow=document.getElementById('otherModelWrap');
  ms.innerHTML='<option value="">اختر الموديل</option>';
  ms.disabled=true;if(ow)ow.style.display='none';disableBtn('b3');
  if(!brand)return;
  var models=(typeof CAR_MODELS!=='undefined'&&CAR_MODELS[brand])?CAR_MODELS[brand]:['أخرى'];
  models.forEach(function(m){var o=document.createElement('option');o.value=m;o.textContent=m;ms.appendChild(o);});
  ms.disabled=false;validateCar();
}
function onModelChange(){
  var v=document.getElementById('carModel').value;
  var ow=document.getElementById('otherModelWrap');
  if(ow)ow.style.display=(v==='أخرى')?'block':'none';
  if(v==='أخرى'){var om=document.getElementById('otherModel');if(om){om.value='';om.focus();}}
  validateCar();
}
function validateCar(){
  var brand=document.getElementById('brand').value;
  var mr=document.getElementById('carModel').value;
  var yr=document.getElementById('carYear').value;
  var ch=document.getElementById('chassis')?document.getElementById('chassis').value.trim():'';
  var ow=document.getElementById('otherModelWrap');
  var om=document.getElementById('otherModel');
  var model=(mr==='أخرى')?(ow&&ow.style.display!=='none'&&om?om.value.trim():''):mr;
  var ok=brand!==''&&model.length>0&&yr!=='';
  if(selType!=='used')ok=ok&&ch.length>2;
  ok?enableBtn('b3'):disableBtn('b3');
}

// IMAGE
function handleImgUpload(e){
  var file=e.target.files[0];if(!file)return;
  if(file.size>5*1024*1024){showToast('الصورة أكبر من 5MB','err');return;}
  var reader=new FileReader();
  reader.onload=function(ev){
    uploadedImageData=ev.target.result;
    document.getElementById('imgUploadBox').classList.add('has-img');
    document.getElementById('imgUploadContent').innerHTML='<img src="'+uploadedImageData+'" class="img-preview"><div style="font-size:.72rem;color:var(--success);margin-top:.35rem"><i class="ti ti-check"></i> تم رفع الصورة</div>';
  };
  reader.readAsDataURL(file);
}

// CONTACT
function validateContact(){
  var n=document.getElementById('clientName').value.trim();
  var p=document.getElementById('clientPhone').value.trim();
  (n.length>1&&p.length>7)?enableBtn('b4'):disableBtn('b4');
}

// SUBMIT
function submitRequest(){
  var brand=document.getElementById('brand').value;
  var mr=document.getElementById('carModel').value;
  var ow=document.getElementById('otherModelWrap');
  var om=document.getElementById('otherModel');
  var model=(mr==='أخرى'&&ow&&om)?om.value.trim():mr;
  var year=document.getElementById('carYear').value;
  var chassis=document.getElementById('chassis')?document.getElementById('chassis').value:'';
  var notes=document.getElementById('carNotes').value;
  var name=document.getElementById('clientName').value;
  var phone=document.getElementById('clientPhone').value;
  var emirate=document.getElementById('clientEmirate').value;

  orderData={
    id:'ORD-'+Date.now(),
    type:selType,cat:selCat,part:selPart,
    brand:brand,model:model,year:year,chassis:chassis,notes:notes,
    clientName:name,clientPhone:phone,clientEmirate:emirate,
    hasImage:!!uploadedImageData,
    createdAt:new Date().toISOString(),
    status:'pending',
    dealerPrices:{},dealerNotes:{},
    bestPrice:null,payMethod:null,chosenDealer:null
  };

  saveOrder(orderData);

  // إرسال واتساب للديلرين
  DEALERS.forEach(function(dealer,idx){
    setTimeout(function(){sendDealerWA(dealer,orderData);},idx*1500);
  });

  addAgentBubble('تم إرسال طلبك للموردين! ✅\nجاري الانتظار... سيظهر لك أفضل سعر فور الرد 🚀');
  goStep(5);
  startWaiting();
}

function buildDealerPriceURL(orderId,dealerId){
  var base=window.location.origin+window.location.pathname.replace(/[^\/]*$/,'');
  return base+'price.html?order='+orderId+'&dealer='+dealerId;
}

// ═══════════════════════════════════════════════════════
//  ULTRAMSG — إرسال واتساب أوتوماتيك 100%
// ═══════════════════════════════════════════════════════
var ULTRA_URL   = 'https://api.ultramsg.com/instance179001/messages/chat';
var ULTRA_TOKEN = 'uudbww6esvtqnwyc';

function sendWA(phone, msg) {
  var formatted = phone.toString().replace(/^0/, '971').replace(/\s/g, '').replace(/\+/g, '');
  var body = 'token=' + encodeURIComponent(ULTRA_TOKEN) +
             '&to='   + encodeURIComponent(formatted) +
             '&body=' + encodeURIComponent(msg);
  fetch(ULTRA_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: body
  })
  .then(function(r){ return r.json(); })
  .then(function(d){ console.log('✅ WA sent to ' + formatted, d); })
  .catch(function(e){ console.error('❌ WA error:', e); });
}

function sendDealerWA(dealer, order) {
  var msg =
    '🔔 *طلب جديد — كارلي*\n\n' +
    '📋 رقم الطلب: *' + order.id + '*\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '🔩 *القطعة:* ' + order.part + '\n' +
    '📦 *النوع:* ' + (TYPE_NAMES[order.type] || order.type) + '\n' +
    '🚗 *السيارة:* ' + order.brand + ' ' + order.model + ' ' + order.year + '\n' +
    (order.chassis ? '🔑 *الشاسي:* ' + order.chassis + '\n' : '') +
    (order.notes   ? '📝 *ملاحظات:* ' + order.notes + '\n' : '') +
    '━━━━━━━━━━━━━━━━\n' +
    '⏰ الوقت المتاح: *٩٠ ثانية*\n\n' +
    '💰 *للرد بالسعر اكتب فقط:*\n' +
    '#السعر\n\n' +
    '✏️ مثال: #450';

  sendWA(dealer.phone, msg);

  // إرسال الصورة إذا موجودة
  if(order.hasImage && uploadedImageData) {
    setTimeout(function(){
      var formatted = dealer.phone.replace(/^0/,'971').replace(/\s/g,'');
      var body = 'token=' + encodeURIComponent(ULTRA_TOKEN) +
                 '&to='   + encodeURIComponent(formatted) +
                 '&image='+ encodeURIComponent(uploadedImageData) +
                 '&caption=صورة القطعة المطلوبة';
      fetch(ULTRA_URL.replace('/messages/chat','/messages/image'), {
        method:'POST',
        headers:{'Content-Type':'application/x-www-form-urlencoded'},
        body: body
      }).then(function(r){ return r.json(); })
        .then(function(d){ console.log('📷 image sent:', d); })
        .catch(function(e){ console.log('image error:', e); });
    }, 2000);
  }
}

function notifyWinner(dealer, method) {
  var msg =
    '🎉 *تم اختيار عرضك!*\n\n' +
    '📋 رقم الطلب: *' + orderData.id + '*\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '👤 العميل: ' + orderData.clientName + '\n' +
    '📞 الهاتف: ' + orderData.clientPhone + '\n' +
    '🔩 القطعة: ' + orderData.part + '\n' +
    '🚗 السيارة: ' + orderData.brand + ' ' + orderData.model + ' ' + orderData.year + '\n' +
    '💰 السعر المتفق: *' + chosenPrice + ' درهم*\n' +
    '💳 الدفع: ' + (method === 'online' ? 'أونلاين ✅' : 'كاش عند الاستلام') + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '✅ يرجى التواصل مع العميل لترتيب التسليم';
  sendWA(dealer.phone, msg);
}

function notifyShipping(method) {
  var msg =
    '📦 *طلب شحن جديد — كارلي*\n\n' +
    '📋 رقم الطلب: *' + orderData.id + '*\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '👤 العميل: ' + orderData.clientName + '\n' +
    '📞 الهاتف: ' + orderData.clientPhone + '\n' +
    '📍 الإمارة: ' + (orderData.clientEmirate || '—') + '\n' +
    '🔩 القطعة: ' + orderData.part + '\n' +
    '🚗 السيارة: ' + orderData.brand + ' ' + orderData.model + ' ' + orderData.year + '\n' +
    '🏪 المورد: ' + chosenDealerName + '\n' +
    '💰 المبلغ: *' + chosenPrice + ' درهم*\n' +
    '💳 الدفع: ' + (method === 'online' ? 'أونلاين ✅' : 'كاش عند الاستلام') + '\n' +
    '━━━━━━━━━━━━━━━━\n' +
    '🚚 يرجى تنسيق عملية الشحن والتسليم';
  sendWA(CARLY_PHONE, msg);
}

// WAITING
function startWaiting(){
  document.getElementById('waitingState').style.display='block';
  document.getElementById('pricesState').style.display='none';
  document.getElementById('timeoutState').style.display='none';
  startTips();startFloating();startSearchAnim();

  var remaining=90;
  var arc=document.getElementById('timerArc');
  var numEl=document.getElementById('timerNum');
  var circ=283;
  if(arc)arc.style.strokeDashoffset='0';

  countdownTimer=setInterval(function(){
    remaining--;
    if(numEl)numEl.textContent=remaining;
    if(arc){
      arc.style.strokeDashoffset=circ*(1-remaining/90);
      arc.style.stroke=remaining>30?'#ffb3c6':remaining>10?'#ffd700':'#ff6b6b';
    }
    if(remaining<=0){clearAll();checkAndShow(true);}
  },1000);

  var orderCreatedAt = Date.now();
  pollTimer = setInterval(function(){

    // أولاً تحقق من localStorage
    var latest = getOrderById(orderData.id);
    if(latest && latest.dealerPrices){
      var prices = latest.dealerPrices;
      var responded = Object.keys(prices).filter(function(k){ return prices[k]>0; });
      if(responded.length>0){ orderData=latest; clearAll(); showPrices(prices); return; }
    }

    // ثانياً اقرأ الرسائل الواردة من UltraMsg
    fetch('https://api.ultramsg.com/instance179001/messages/inbox?token=uudbww6esvtqnwyc&page=1&limit=20')
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(!data || !data.messages) return;
        // DEBUG — اطبع أول رسالتين لنرى الشكل
        console.log('📬 INBOX:', JSON.stringify(data.messages.slice(0,3)));
        var msgs = data.messages;
        var updated = false;
        var orders = getOrders();
        var idx = orders.findIndex(function(o){ return o.id===orderData.id; });
        if(idx<0) return;

        msgs.forEach(function(m){
          var msgBody = (m.body||'').trim();
          var msgTime = (m.time||0)*1000;
          var msgFrom = (m.from||'').replace(/\D/g,'');

          // تحقق من الصيغة #رقم وبعد إرسال الطلب
          if(!/^#\d+/.test(msgBody)) return;
          if(msgTime < orderCreatedAt) return;

          var price = parseFloat(msgBody.replace('#',''));
          if(!price || price<=0) return;

          // طابق مع الديلرين — UltraMsg يرسل الرقم بصيغة 971XXXXXXXX@c.us
          DEALERS.forEach(function(dealer){
            var dNum = dealer.phone.replace(/^0/,'').replace(/\s/g,''); // 509788772
            if(msgFrom.includes(dNum)){
              if(!orders[idx].dealerPrices[dealer.id]){
                orders[idx].dealerPrices[dealer.id] = price;
                updated = true;
                console.log('✅ سعر من '+dealer.name+': '+price);
              }
            }
          });
        });

        if(updated){
          var allP = Object.values(orders[idx].dealerPrices).filter(function(v){return v>0;});
          orders[idx].bestPrice = Math.min.apply(null,allP);
          orders[idx].status = 'priced';
          orders[idx].pricedAt = new Date().toISOString();
          localStorage.setItem('carly_orders', JSON.stringify(orders));
          orderData = orders[idx];
          clearAll();
          showPrices(orderData.dealerPrices);
        }
      })
      .catch(function(e){ console.log('inbox error:',e); });

  }, 4000);
}

function checkAndShow(timeout){
  var latest=getOrderById(orderData.id);
  var prices=(latest&&latest.dealerPrices)||{};
  var responded=Object.keys(prices).filter(function(k){return prices[k]>0;});
  if(responded.length>0){
    orderData=latest;showPrices(prices);
  } else if(timeout){showTimeout();}
}

function clearAll(){
  if(countdownTimer){clearInterval(countdownTimer);countdownTimer=null;}
  if(pollTimer){clearInterval(pollTimer);pollTimer=null;}
  if(searchTimer){clearInterval(searchTimer);searchTimer=null;}
  stopTips();stopFloating();
}

// SEARCH ANIMATION
var searchPhrases=['قطع غيار أصلية الإمارات...','موردي قطع السيارات...','أسعار السوق الإماراتي...','أفضل عروض قطع الغيار...'];
var fakeResults=[
  ['عبادان','جاري الاستعلام...'],
  ['دبي للقطعات','جاري الاستعلام...']
];
function startSearchAnim(){
  var si=0,ri=0;
  var stEl=document.getElementById('searchText');
  var srEl=document.getElementById('searchResults');
  if(stEl)stEl.textContent=selPart+' — '+searchPhrases[0];

  searchTimer=setInterval(function(){
    si=(si+1)%searchPhrases.length;
    if(stEl)stEl.textContent=selPart+' — '+searchPhrases[si];

    if(srEl&&ri<fakeResults.length){
      var row=document.createElement('div');
      row.className='srf';
      row.style.animationDelay='0s';
      row.innerHTML='<span class="srf-name">'+fakeResults[ri][0]+'</span><span class="srf-price">جاري الاستعلام...</span>';
      srEl.appendChild(row);
      ri++;
    }
  },2500);
}

// FLOATING
var FE=['⚙️','🔧','🔩','🛞','🔋','💡','🪛','🔑','🛠️','⛽','🚗','💨','🔄','🌀'];
function startFloating(){
  var c=document.getElementById('partsFloat');if(!c)return;
  var i=0;
  floatTimer=setInterval(function(){
    var el=document.createElement('div');
    el.className='fp';
    el.textContent=FE[i%FE.length];
    el.style.left=Math.random()*85+'%';
    el.style.animationDuration=(2+Math.random()*2.5)+'s';
    el.style.fontSize=(0.9+Math.random()*.8)+'rem';
    c.appendChild(el);
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},5000);
    i++;
  },450);
}
function stopFloating(){if(floatTimer){clearInterval(floatTimer);floatTimer=null;}}

// TIPS
function startTips(){
  var tips=TIPS_DATA[selCat]||['حافظ على الصيانة الدورية لسيارتك.'];
  tipIdx=0;
  var de=document.getElementById('tipDots');
  if(de){var h='';tips.forEach(function(_,i){h+='<div class="tdot'+(i===0?' a':'')+'"></div>';});de.innerHTML=h;}
  var tt=document.getElementById('tipText');if(tt)tt.textContent=tips[0];
  tipTimer=setInterval(function(){
    tipIdx=(tipIdx+1)%tips.length;
    document.querySelectorAll('.tdot').forEach(function(d,i){i===tipIdx?d.classList.add('a'):d.classList.remove('a');});
    var tt2=document.getElementById('tipText');if(tt2)tt2.textContent=tips[tipIdx];
  },3500);
}
function stopTips(){if(tipTimer){clearInterval(tipTimer);tipTimer=null;}}

// SHOW PRICES
function showPrices(dealerPrices){
  document.getElementById('waitingState').style.display='none';
  document.getElementById('pricesState').style.display='block';

  var list=[];
  DEALERS.forEach(function(d){
    if(dealerPrices[d.id]&&dealerPrices[d.id]>0){
      list.push({id:d.id,name:d.name,price:dealerPrices[d.id]});
    }
  });
  list.sort(function(a,b){return a.price-b.price;});

  var html='';
  list.forEach(function(item,idx){
    var isBest=idx===0;
    html+='<div class="price-offer'+(isBest?' best':'')+'" onclick="selectDealerOffer('+item.id+','+item.price+',\''+item.name+'\',this)">'+
      '<div class="offer-medal">'+(isBest?'🥇':idx===1?'🥈':'🥉')+'</div>'+
      '<div class="offer-info">'+
        (isBest?'<div class="best-tag">أفضل سعر</div>':'')+
        '<div class="offer-dealer">'+item.name+'</div>'+
        '<div class="offer-price">'+Number(item.price).toLocaleString('ar')+' <span>درهم</span></div>'+
      '</div>'+
      '<div class="offer-check"><i class="ti ti-circle" id="chk-'+item.id+'"></i></div>'+
    '</div>';
  });
  document.getElementById('pricesList').innerHTML=html;

  var os=document.getElementById('orderSummary');
  if(os)os.innerHTML='<div class="os-icon">'+(CAT_DEFAULT_ICON[selCat]||'🔧')+'</div><div><div class="os-part">'+selPart+'</div><div class="os-car">'+orderData.brand+' '+orderData.model+' '+orderData.year+'</div></div>';

  document.getElementById('buySection').style.display='none';
  document.getElementById('confirmedSection').style.display='none';
  addAgentBubble('🎉 وصلت الأسعار!\n\nاختر العرض المناسب لك 👇');
  window.scrollTo({top:0,behavior:'smooth'});
}

function selectDealerOffer(id,price,name,el){
  chosenDealerId=id;chosenPrice=price;chosenDealerName=name;
  document.querySelectorAll('.price-offer').forEach(function(o){o.classList.remove('selected');});
  el.classList.add('selected');
  document.querySelectorAll('[id^="chk-"]').forEach(function(i){i.className='ti ti-circle';});
  var ci=document.getElementById('chk-'+id);if(ci)ci.className='ti ti-circle-check';
  document.getElementById('buySection').style.display='block';
  document.getElementById('confirmPayBtn').style.display='none';
  document.querySelectorAll('.pay-opt').forEach(function(b){b.classList.remove('on');});
  setTimeout(function(){document.getElementById('buySection').scrollIntoView({behavior:'smooth',block:'nearest'});},100);
}

function selectPayMethod(method){
  document.querySelectorAll('.pay-opt').forEach(function(b){b.classList.remove('on');});
  var btn=document.getElementById('pay-'+method);if(btn)btn.classList.add('on');
  orderData.payMethod=method;
  document.getElementById('confirmPayBtn').style.display='flex';
}

function confirmPayment(){
  var method=orderData.payMethod;if(!method)return;
  if(!chosenDealerId){showToast('اختر عرضاً أولاً','err');return;}

  // تحديث الطلب
  var orders=getOrders();
  for(var i=0;i<orders.length;i++){
    if(orders[i].id===orderData.id){
      orders[i].payMethod=method;
      orders[i].chosenDealer=chosenDealerId;
      orders[i].chosenDealerName=chosenDealerName;
      orders[i].bestPrice=chosenPrice;
      orders[i].status='confirmed';
      orders[i].confirmedAt=new Date().toISOString();
      orderData=orders[i];break;
    }
  }
  localStorage.setItem('carly_orders',JSON.stringify(orders));

  // إشعار الديلر الفائز
  var winner=DEALERS.find(function(d){return d.id===chosenDealerId;});
  if(winner)notifyWinner(winner,method);

  // إرسال لقسم الشحن (نفس رقم كارلي)
  notifyShipping(method);

  if(method==='online'){
    window.open(PAY_LINK_BASE+'?order='+orderData.id+'&amount='+chosenPrice+'&name='+encodeURIComponent(orderData.clientName),'_blank');
    addAgentBubble('✅ تم تثبيت طلبك!\nتم فتح صفحة الدفع\nرقم طلبك: '+orderData.id+' 📦');
  } else {
    addAgentBubble('✅ تم تثبيت طلبك!\nكاش عند الاستلام 💵\nرقم طلبك: '+orderData.id+'\nسيتواصل معك فريق الشحن قريباً 📦');
  }

  document.getElementById('buySection').style.display='none';
  document.getElementById('confirmedSection').style.display='block';
  var cid=document.getElementById('confirmedOrderId');if(cid)cid.textContent=orderData.id;
  var cdl=document.getElementById('confirmedDealer');if(cdl)cdl.textContent=chosenDealerName;
  var cpr=document.getElementById('confirmedPrice');if(cpr)cpr.textContent=Number(chosenPrice).toLocaleString('ar')+' درهم';

  var wf='مرحباً كارلي 👋\nطلبي رقم: '+orderData.id+'\nالقطعة: '+orderData.part+'\nالمبلغ: '+chosenPrice+' درهم';
  var wb=document.getElementById('waBtn');if(wb)wb.href='https://wa.me/971'+CARLY_PHONE.replace(/^0/,'')+'?text='+encodeURIComponent(wf);
}

function showTimeout(){
  document.getElementById('waitingState').style.display='none';
  document.getElementById('timeoutState').style.display='block';
  var t=encodeURIComponent('مرحباً كارلي\nطلب: '+selPart+'\nالسيارة: '+orderData.brand+' '+orderData.model+' '+orderData.year+'\nالعميل: '+orderData.clientName+'\nالهاتف: '+orderData.clientPhone);
  var b=document.getElementById('waTimeoutBtn');if(b)b.href='https://wa.me/971'+CARLY_PHONE.replace(/^0/,'')+'?text='+t;
  addAgentBubble('انتهى وقت الانتظار ⏰\nسيتواصل معك فريق كارلي على '+CARLY_PHONE);
}

// CHAT
function addAgentBubble(text){
  var box=document.getElementById('chatBox');
  var row=document.createElement('div');
  row.className='bubble-row agent';
  row.innerHTML='<div class="bav ag"><i class="ti ti-robot"></i></div><div class="bubble ag">'+text.replace(/\n/g,'<br>')+'<div class="btime">'+formatTime()+'</div></div>';
  box.appendChild(row);
  row.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function addUserBubble(text){
  var box=document.getElementById('chatBox');
  var row=document.createElement('div');
  row.className='bubble-row user';
  row.innerHTML='<div class="bav us"><i class="ti ti-user"></i></div><div class="bubble us">'+text+'<div class="btime">'+formatTime()+'</div></div>';
  box.appendChild(row);
}

function enableBtn(id){var b=document.getElementById(id);if(b){b.disabled=false;b.style.opacity='1';}}
function disableBtn(id){var b=document.getElementById(id);if(b){b.disabled=true;b.style.opacity='.4';}}
function showToast(msg,type){var t=document.getElementById('toast');t.textContent=msg;t.className='toast show '+(type||'');setTimeout(function(){t.className='toast';},3000);}

function startNew(){
  clearAll();
  selType=null;selCat=null;selPart=null;uploadedImageData=null;
  chosenDealerId=null;chosenPrice=null;chosenDealerName=null;
  document.querySelectorAll('.type-opt,.cat-opt,.part-img-opt').forEach(function(e){e.classList.remove('on');});
  ['brand','carYear','chassis','carNotes','clientName','clientPhone','customPart','otherPart','otherModel'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  var ms=document.getElementById('carModel');if(ms){ms.innerHTML='<option value="">اختر الماركة أولاً</option>';ms.disabled=true;}
  var em=document.getElementById('clientEmirate');if(em)em.value='';
  ['partsWrap','customWrap','otherPartWrap','otherModelWrap'].forEach(function(id){var e=document.getElementById(id);if(e)e.style.display='none';});
  var ib=document.getElementById('imgUploadBox');if(ib)ib.classList.remove('has-img');
  var ic=document.getElementById('imgUploadContent');
  if(ic)ic.innerHTML='<i class="ti ti-photo-up" style="font-size:1.75rem;color:var(--muted2);display:block;margin-bottom:.4rem"></i><div style="font-size:.82rem;color:var(--muted)">انقر لرفع صورة القطعة</div>';
  document.getElementById('chatBox').innerHTML='';
  ['b1','b2','b3','b4'].forEach(function(b){disableBtn(b);});
  addAgentBubble('أهلاً بك مجدداً! 👋\nاختر نوع القطعة للبدء 👇');
  goStep(1);
}

document.addEventListener('DOMContentLoaded',function(){
  var yrSel=document.getElementById('carYear');
  if(yrSel){for(var y=2026;y>=1990;y--){var o=document.createElement('option');o.value=y;o.textContent=y;yrSel.appendChild(o);}}
  addAgentBubble('أهلاً بك في كارلي! 👋\n\nأجنتك الذكي لقطع الغيار. سأحصل لك على أفضل سعر من الموردين في الإمارات.\n\nاختر نوع القطعة للبدء 👇');
  setProg(1);
});
