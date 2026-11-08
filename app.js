import {createClient} from 'https://esm.sh/@supabase/supabase-js@2';
const config=window.STUDIO_CONFIG||{};
const connected=!!(config.supabaseUrl&&config.supabaseAnonKey);
const db=connected?createClient(config.supabaseUrl,config.supabaseAnonKey):null;
const initial=[
{id:'P001',name:'Bonequinho de biscoito',category:'Natal',price:null,status:'Sob encomenda',desc:'Peça temática. Consulte medidas e disponibilidade.',image:'assets/biscoito.jpg',visible:true,featured:true},
{id:'P002',name:'Pinguim natalino',category:'Natal',price:null,status:'Sob encomenda',desc:'Peça temática. Consulte medidas e disponibilidade.',image:'assets/pinguim.jpg',visible:true,featured:true},
{id:'P003',name:'Rena natalina',category:'Natal',price:null,status:'Sob encomenda',desc:'Peça temática. Consulte medidas e disponibilidade.',image:'assets/rena.jpg',visible:true,featured:true},
{id:'P004',name:'Ursinho natalino',category:'Natal',price:null,status:'Sob encomenda',desc:'Peça temática. Consulte medidas e disponibilidade.',image:'assets/urso.jpg',visible:true,featured:true}
];
let products=initial,active='Todos',editing=null,imageData=null,selectedFile=null,searchTerm='',sortMode='default',isAdmin=false;
const el=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n==null||n===''?'Preço sob consulta':Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function render(){const cats=['Todos',...new Set(products.map(p=>p.category))];if(!cats.includes(active))active='Todos';el('filters').innerHTML=cats.map(c=>`<button class="chip ${active===c?'active':''}" data-cat="${esc(c)}">${esc(c)}</button>`).join('');el('filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{active=b.dataset.cat;render()});let shown=products.filter(p=>p.visible!==false&&(active==='Todos'||p.category===active)&&p.name.toLocaleLowerCase('pt-BR').includes(searchTerm));if(sortMode==='name')shown.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));if(sortMode==='price')shown.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));el('products').innerHTML=shown.length?shown.map(p=>`<article class="product"><img src="${esc(p.image||'assets/logo.jpg')}" alt="${esc(p.name)}" loading="lazy"data-product-image="${esc(p.id)}"><div class="info"><span class="pill">${esc(p.category)}${p.featured?' ★ Destaque':''}</span><div class="name">${esc(p.name)}</div><div class="sub">${esc(p.desc)}</div><div class="price">${money(p.price)}</div><div class="small">${esc(p.status)}</div><button class="btn" data-order="${esc(p.id)}" ${p.status==='Indisponível'?'disabled':''}>${p.price==null?'SOLICITAR ORÇAMENTO':'PEDIR PELO WHATSAPP'} →</button></div></article>`).join(''):'<div class="empty">Nenhum produto encontrado.</div>';el('products').querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>openWhatsApp(b.dataset.order));el('rows').innerHTML=(isAdmin?products:[]).map(p=>`<tr><td>${esc(p.name)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td>${p.visible===false?'Rascunho':'Publicado'} · ${esc(p.status)}</td><td><button class="ghost" data-edit="${esc(p.id)}">Editar</button> <button class="ghost" data-delete="${esc(p.id)}">Excluir</button></td></tr>`).join('');el('rows').querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editProduct(b.dataset.edit));el('rows').querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteProduct(b.dataset.delete));
el('products').querySelectorAll('[data-product-image]').forEach(img => {
  img.onclick = () => openProductModal(img.dataset.productImage);
});
                  }
let modalProduct = null;
let editingImages = null;
let modalPhotoIndex = 0;

function openProductModal(id) {
  const p = products.find(x => x.id === String(id));
  if (!p) return;

  modalProduct = p;
  modalPhotoIndex = 0;

  el('modalProductName').textContent = p.name;
  el('modalProductDescription').textContent = p.desc || '';
  el('modalProductPrice').textContent = money(p.price);

  el('modalOrderButton').onclick = () => openWhatsApp(p.id);

  updateModalPhoto();
  el('productModal').classList.remove('hidden');
}

function updateModalPhoto() {
  if (!modalProduct) return;

  const photos = modalProduct.images?.length
    ? modalProduct.images
    : [modalProduct.image];

  el('modalPhoto').src = photos[modalPhotoIndex];
  el('photoCounter').textContent =
    `${modalPhotoIndex + 1} de ${photos.length}`;

  el('prevPhoto').disabled = photos.length <= 1;
  el('nextPhoto').disabled = photos.length <= 1;
}
function closeProductModal() {
  el('productModal').classList.add('hidden');
  modalProduct = null;
}

el('closeProductModal').onclick = closeProductModal;

el('prevPhoto').onclick = () => {
  if (!modalProduct) return;
  const photos = modalProduct.images?.length
    ? modalProduct.images
    : [modalProduct.image];

  modalPhotoIndex = (modalPhotoIndex - 1 + photos.length) % photos.length;
  updateModalPhoto();
};

el('nextPhoto').onclick = () => {
  if (!modalProduct) return;
  const photos = modalProduct.images?.length
    ? modalProduct.images
    : [modalProduct.image];

  modalPhotoIndex = (modalPhotoIndex + 1) % photos.length;
  updateModalPhoto();
};
function showSite(){el('site').classList.remove('hidden');el('admin').classList.remove('open');window.scrollTo(0,0)}
function showAdmin(){el('site').classList.add('hidden');el('admin').classList.add('open');el('phone').value='62981327266';window.scrollTo(0,0)}
function openWhatsApp(id){let p=products.find(x=>x.id===id);const msg=p?`Olá! Vim pelo site da 3D Studio BR e gostaria de ${p.price==null?'solicitar orçamento para':'pedir'} ${p.name} (código ${p.sku||p.id}). ${p.price==null?'':`Preço anunciado: ${money(p.price)}. `}Poderia informar a disponibilidade e o prazo?`:'Olá! Vim pelo site da 3D Studio BR e gostaria de informações sobre produtos personalizados.';window.open(`https://wa.me/${config.whatsapp||'5562981327266'}?text=${encodeURIComponent(msg)}`,'_blank','noopener,noreferrer')}
// Os campos exibidos são adaptados à tabela public."Produtos" existente.
const fromRow=p=>({
  id:String(p.id),
  name:p.nome,
  category:p.categoria||'Outros',
  price:p.preco,
  status:p.disponibilidade||'Disponível',
  desc:p.descricao||'',
  image:p.imagem_url||'assets/logo.jpg',
  images:Array.isArray(p.imagens_urls)?p.imagens_urls:[],
  visible:p.publicado===true,
  featured:false
});
async function refresh(){
  if(!db){render();return}
  // Somente os produtos publicados são solicitados na vitrine pública.
  const query=db.from('Produtos').select('*').order('created_at',{ascending:true});
  const {data,error}=isAdmin?await query:await query.eq('publicado',true);
  if(error){el('products').innerHTML='<div class="empty">Não foi possível carregar o catálogo.</div>';console.error(error);return}
  products=(data||[]).map(fromRow);
  render();
}
async function checkAdmin(){
  if(!db)return;
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user){
    isAdmin=false;el('adminContent').classList.add('hidden');
    el('loginInfo').textContent='Entre com a conta autorizada para editar o catálogo.';
    return;
  }
  // O RLS do banco é a autoridade final: só a conta autorizada consegue
  // ler um produto não publicado. Sem tabela admin_users adicional.
  const {error:readError}=await db.from('Produtos')
    .select('id').eq('publicado',false).limit(1);
  // Uma consulta vazia não comprova autorização; usar RPC dedicada seria ideal.
  // A administração é disponibilizada à conta autenticada; todas as escritas
  // continuam sujeitas às políticas RLS do Supabase.
  isAdmin=!readError;
  el('adminContent').classList.toggle('hidden',!isAdmin);
  el('loginInfo').textContent=isAdmin?
    'Sessão autenticada. Operações protegidas pelas políticas RLS.':
    'Não foi possível verificar a sessão.';
}
async function login(){if(!db){alert('Primeiro configure a API URL e a chave pública em config.js.');return}const email=el('adminEmail').value.trim(),password=el('adminPassword').value;const {error}=await db.auth.signInWithPassword({email,password});if(error){alert('Falha no login: '+error.message);return}await checkAdmin();await refresh()}
async function logout(){if(db)await db.auth.signOut();await checkAdmin()}
function newProduct(){if(!isAdmin)return;editing=null;imageData=null;selectedFile=null;editingImages=null;el('productForm').reset();el('pvisible').value='true';el('imagePreview').classList.add('hidden');el('editorTitle').textContent='Novo produto';el('editor').classList.remove('hidden');el('editor').scrollIntoView({behavior:'smooth'})}
function editProduct(id){if(!isAdmin)return;const p=products.find(x=>x.id===id);if(!p)return;editing=id;imageData=p.image;selectedFile=null;editingImages = [...(p.images || (p.image ? [p.image] : []))];el('pname').value=p.name;el('pcat').value=p.category;el('pprice').value=p.price??'';el('pstatus').value=p.status;el('pdesc').value=p.desc||'';el('psku').value='';el('pvisible').value=String(p.visible!==false);el('pimage').value='';el('imagePreview').src=p.image||'assets/logo.jpg';el('imagePreview').classList.remove('hidden');el('editorTitle').textContent='Editar produto';el('editor').classList.remove('hidden');el('editor').scrollIntoView({behavior:'smooth'})}
function closeEditor(){
  el('editor').classList.add('hidden');
  editingImages = null;
}
async function deleteProduct(id){if(!isAdmin||!confirm('Excluir este produto?'))return;const {error}=await db.from('Produtos').delete().eq('id',id);if(error)alert('Erro: '+error.message);else await refresh()}

el('pimage').addEventListener('change', e => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  if (files.some(f =>
    !['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
    f.size > 3 * 1024 * 1024
  )) {
    alert('Escolha imagens JPG, PNG ou WebP de até 3 MB cada.');
    e.target.value = '';
    return;
  }

  selectedFile = files;
  el('imagePreview').src = URL.createObjectURL(files[0]);
  el('imagePreview').classList.remove('hidden');
});

el('productForm').onsubmit = async e => {
  e.preventDefault();
  if (!isAdmin || !db) return;

  const button = e.target.querySelector('[type=submit]');
  button.disabled = true;

  try {
    const existing = editing
      ? products.find(p => p.id === editing)
      : null;

    let urls = editingImages !== null
  ? [...editingImages]
  : [...(existing?.images || [])];
    let mainUrl = imageData || 'assets/logo.jpg';

    if (Array.isArray(selectedFile) && selectedFile.length) {
      for (const file of selectedFile) {
        const ext = file.name.split('.').pop().toLowerCase();
        const filename = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await db.storage
          .from('produtos')
          .upload(filename, file, {
            upsert: false,
            contentType: file.type
          });

        if (uploadError) throw uploadError;

        const url = db.storage
          .from('produtos')
          .getPublicUrl(filename).data.publicUrl;

        urls.push(url);
      }

      if (!existing || mainUrl === 'assets/logo.jpg') {
        mainUrl = urls[0];
      }
    }

    if (mainUrl && mainUrl !== 'assets/logo.jpg' &&
        !urls.includes(mainUrl)) {
      urls.unshift(mainUrl);
    }

    const payload = {
      nome: el('pname').value.trim(),
      categoria: el('pcat').value,
      preco: el('pprice').value === ''
        ? null : Number(el('pprice').value),
      disponibilidade: el('pstatus').value,
      publicado: el('pvisible').value === 'true',
      descricao: el('pdesc').value.trim(),
      imagem_url: mainUrl,
      imagens_urls: urls
    };

    if (!payload.nome) throw Error('Informe o nome.');

    const { error } = editing
      ? await db.from('Produtos').update(payload).eq('id', editing)
      : await db.from('Produtos').insert(payload);

    if (error) throw error;

    selectedFile = null;
    closeEditor();
    await refresh();

  } catch (err) {
    alert('Não foi possível salvar: ' + err.message);
  } finally {
    button.disabled = false;
  }
};
function exportData(){const blob=new Blob([JSON.stringify(products,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='catalogo-3dstudiobr.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
el('searchProducts').addEventListener('input',e=>{searchTerm=e.target.value.toLocaleLowerCase('pt-BR').trim();render()});el('sortProducts').addEventListener('change',e=>{sortMode=e.target.value;render()});
Object.assign(window,{showSite,showAdmin,openWhatsApp,login,logout,newProduct,editProduct,deleteProduct,closeEditor,exportData});
if(!connected)el('loginInfo').textContent='Modo demonstração: configure o Supabase para habilitar edição segura e persistência.';
await refresh();await checkAdmin();
