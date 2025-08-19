function showPage(page) {
  ['homePage','class10Page','class11jeePage','class12jeePage','adminPage','loginPage'].forEach(id=>{
    document.getElementById(id).style.display = 'none';
  });
  if(page === 'home') document.getElementById('homePage').style.display = '';
  if(page === 'class10') document.getElementById('class10Page').style.display = '';
  if(page === 'class11jee') document.getElementById('class11jeePage').style.display = '';
  if(page === 'class12jee') document.getElementById('class12jeePage').style.display = '';
  if(page === 'admin') document.getElementById('adminPage').style.display = '';
  if(page === 'login') document.getElementById('loginPage').style.display = '';
}
showPage('home');

// Notices fetch
fetch('/notices').then(res=>res.json()).then(noticeArr=>{
  document.getElementById('notices').innerHTML = 
    noticeArr.map(n=>`<div class="notice"><b>Notice:</b> ${n.message}</div>`).join('');
});

// Admin file upload
document.getElementById('uploadForm')?.addEventListener('submit',async function(e){
  e.preventDefault();
  const fd = new FormData(this);
  const res = await fetch('/upload', {method:'POST',body:fd});
  const data = await res.json();
  document.getElementById('uploadResult').textContent = 'File uploaded: ' + data.filename;
});

// Admin notice send
document.getElementById('noticeForm')?.addEventListener('submit',async function(e){
  e.preventDefault();
  const noticeMsg = this.message.value;
  const res = await fetch('/notice',{method:'POST',headers:{'Content-Type': 'application/json'},body: JSON.stringify({message: noticeMsg})});
  const data = await res.json();
  document.getElementById('noticeResult').textContent = 'Notice sent!';
});

            
