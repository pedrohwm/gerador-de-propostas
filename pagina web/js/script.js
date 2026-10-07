// ==========================================
// ESTADOS GLOBAIS E GESTÃO DE SLIDES
// ==========================================
let isEditing = false;
let selectedElement = null;
let slidesNodes = Array.from(document.querySelectorAll('.slide'));
let currentSlide = 0;

let slideTitles = [
  "Capa", "Quem Somos", "O Cenário", "Nossa Solução", 
  "Escopo Técnico", "Portfólio", "A Jornada", "Investimento", "Próximos Passos"
];

const track = document.getElementById('track');
const dotsContainer = document.getElementById('dots');

function refreshPagination() {
  slidesNodes = Array.from(document.querySelectorAll('.slide'));
  dotsContainer.innerHTML = '';
  
  slidesNodes.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = `dot ${index === currentSlide ? 'active' : ''}`;
    dot.onclick = () => goToSlide(index);
    dotsContainer.appendChild(dot);
  });
  
  while(slideTitles.length < slidesNodes.length) {
    slideTitles.push("Novo Slide");
  }
}

function navSlide(dir) {
  const target = currentSlide + dir;
  if (target >= 0 && target < slidesNodes.length) goToSlide(target);
}

function goToSlide(index) {
  currentSlide = index;
  track.style.transform = `translateX(-${index * 100}vw)`;
  
  let displayTitle = slideTitles[currentSlide] || `Slide ${currentSlide + 1}`;
  document.getElementById('counter').innerText = `0${currentSlide + 1} / 0${slidesNodes.length} · ${displayTitle}`;
  
  document.getElementById('btnPrev').disabled = currentSlide === 0;
  document.getElementById('btnNext').style.display = currentSlide === slidesNodes.length - 1 ? 'none' : 'flex';

  document.querySelectorAll('.dot').forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentSlide);
  });
}

// ==========================================
// EDITOR UI
// ==========================================
function toggleEditMode() {
  isEditing = !isEditing;
  const body = document.body;
  const btn = document.getElementById('toggle-edit-btn');
  const editTools = document.getElementById('edit-tools');
  
  if (isEditing) {
    body.classList.add('is-editing');
    btn.classList.add('active');
    btn.innerHTML = '<i class="ph ph-check"></i> Edição Habilitada';
    editTools.style.display = 'flex';
    
    document.querySelectorAll('.editable-field').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('keypress', disableEnter);
    });
  } else {
    body.classList.remove('is-editing');
    btn.classList.remove('active');
    btn.innerHTML = '<i class="ph ph-pencil-simple"></i> Habilitar Edição';
    editTools.style.display = 'none';
    
    if(selectedElement) selectedElement.classList.remove('element-selected-for-color');
    selectedElement = null;

    document.querySelectorAll('.editable-field').forEach(el => {
      el.removeAttribute('contenteditable');
      el.removeEventListener('keypress', disableEnter);
    });
  }
}

function disableEnter(e) {
  if(e.key === 'Enter' && !this.tagName.match(/P|LI|DIV|H1|H2|H3/i)) {
    e.preventDefault();
  }
}

// ==========================================
// CRIAÇÃO E REMOÇÃO DE SLIDES
// ==========================================
function addSlide() {
  const newSlide = document.createElement('div');
  newSlide.className = 'slide bg-dark'; 
  newSlide.innerHTML = '<div class="content"></div>';
  
  if (currentSlide === slidesNodes.length - 1) {
    track.appendChild(newSlide);
  } else {
    track.insertBefore(newSlide, slidesNodes[currentSlide + 1]);
  }
  
  slideTitles.splice(currentSlide + 1, 0, "Slide Novo");
  refreshPagination();
  goToSlide(currentSlide + 1);
}

function removeSlide() {
  if (slidesNodes.length <= 1) return alert("A proposta precisa de pelo menos 1 slide.");
  
  const confirmDelete = confirm("Tem certeza que deseja apagar o slide atual completamente?");
  if(!confirmDelete) return;

  const toRemove = slidesNodes[currentSlide];
  toRemove.remove();
  slideTitles.splice(currentSlide, 1);
  
  let nextTarget = currentSlide - 1;
  if (nextTarget < 0) nextTarget = 0;
  
  refreshPagination();
  goToSlide(nextTarget);
}

function cycleTheme() {
  const slide = slidesNodes[currentSlide];
  if (slide.classList.contains('bg-dark')) {
    slide.classList.remove('bg-dark');
    slide.classList.add('bg-blue');
  } else if (slide.classList.contains('bg-blue')) {
    slide.classList.remove('bg-blue');
    slide.classList.add('bg-light');
  } else {
    slide.classList.remove('bg-light');
    slide.classList.add('bg-dark');
  }
}

// ==========================================
// INSERÇÃO DE ELEMENTOS LIVRES
// ==========================================
function insertElement(type) {
  const slide = slidesNodes[currentSlide];
  let content = '';
  let defaultWidth = 300;
  
  if (type === 'title') {
    content = '<h2 class="title editable-field" style="margin:0; text-align:center;">Novo Título</h2>';
    defaultWidth = 400;
  } else if (type === 'text') {
    content = '<p class="subtitle editable-field" style="margin:0;">Seu novo texto explicativo aqui. Você pode pintar, arrastar e redimensionar esta caixa para onde quiser.</p>';
    defaultWidth = 450;
  } else if (type === 'box') {
    content = '<div class="solution-card editable-field" style="width:100%; height:100%; background:rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 4px;"><h3 class="editable-field" style="margin-bottom:0.5rem; font-size:1.1rem; color:inherit;">Título da Caixa</h3><p class="editable-field" style="font-size:0.85rem; line-height:1.5;">Conteúdo descritivo da caixa. Redimensione a caixa para ajustá-la lado a lado com outras.</p></div>';
    defaultWidth = 350;
  }

  const rect = slide.getBoundingClientRect();
  const dropX = (rect.width / 2) - (defaultWidth / 2);
  const dropY = (rect.height / 2) - 50;
  
  createDraggableNode(content, slide, dropX, dropY, defaultWidth);
}

function deleteSelected() {
  if (!selectedElement) return alert("Clique em um texto, título ou caixa na tela primeiro para selecioná-lo.");
  if (selectedElement.classList.contains('slide') || selectedElement.classList.contains('content')) {
    return alert("Para apagar o slide inteiro, use o botão 'Apagar' nos controles de Slide no topo do painel.");
  }
  if (selectedElement.closest('.draggable-wrapper')) {
    selectedElement.closest('.draggable-wrapper').remove();
  } else {
    selectedElement.remove();
  }
  selectedElement = null;
}

// ==========================================
// CORES DINÂMICAS
// ==========================================
document.addEventListener('click', (e) => {
  if(!isEditing) return;
  if(e.target.closest('#editor-panel') || e.target.closest('#navbar') || e.target.closest('.timeline-controls')) return;
  if(e.target.classList.contains('delete-handle') || e.target.classList.contains('resize-handle') || e.target.closest('.drag-handle')) return;
  
  if(selectedElement) selectedElement.classList.remove('element-selected-for-color');
  selectedElement = e.target;
  selectedElement.classList.add('element-selected-for-color');
});

function applyColor(type) {
  if(!selectedElement) return alert('Por favor, clique em algum texto ou caixa na tela primeiro.');
  const color = document.getElementById('colorPicker').value;
  if(type === 'bg') selectedElement.style.setProperty('background-color', color, 'important');
  if(type === 'text') selectedElement.style.setProperty('color', color, 'important');
  if(type === 'border') selectedElement.style.setProperty('border-color', color, 'important');
}

function clearColor() {
  if(!selectedElement) return;
  selectedElement.style.removeProperty('background-color');
  selectedElement.style.removeProperty('color');
  selectedElement.style.removeProperty('border-color');
}

// ==========================================
// EXPORTAÇÃO
// ==========================================
function downloadFinalHTML() {
  const clone = document.documentElement.cloneNode(true);
  const elementsToRemove = clone.querySelectorAll('.editor-ui-element, .timeline-controls, .drag-handle, .resize-handle, .delete-handle');
  elementsToRemove.forEach(el => el.remove());
  
  clone.querySelector('body').classList.remove('is-editing');
  clone.querySelectorAll('.element-selected-for-color').forEach(el => el.classList.remove('element-selected-for-color'));
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  
  const htmlContent = "<!doctype html>\n" + clone.outerHTML;
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Proposta_CompActJr.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==========================================
// TIMELINE E TABS
// ==========================================
function openTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');
}

function updateJourney(index, element) {
  document.querySelectorAll('.time-node').forEach(node => node.classList.remove('active'));
  element.classList.add('active');
  document.querySelectorAll('.journey-desc-item').forEach(desc => desc.style.display = 'none');
  const targetDesc = document.getElementById('desc-' + index);
  if(targetDesc) targetDesc.style.display = 'block';
}

function addJourneyStep() {
  const timeline = document.getElementById('timeline-container');
  const descBox = document.getElementById('journey-desc-box');
  const currentSteps = timeline.querySelectorAll('.time-node').length;
  
  if(currentSteps >= 8) return alert('Máximo de 8 fases atingido para manter o layout legível.');

  const node = document.createElement('div');
  node.className = 'time-node';
  node.setAttribute('onclick', `updateJourney(${currentSteps}, this)`);
  node.innerHTML = `
    <div class="time-circle">${currentSteps + 1}</div>
    <div class="time-label editable-field" contenteditable="true">Nova Fase</div>
  `;
  timeline.appendChild(node);

  const desc = document.createElement('div');
  desc.id = `desc-${currentSteps}`;
  desc.className = 'journey-desc-item';
  desc.style.display = 'none';
  desc.innerHTML = `
    <h3 class="editable-field" contenteditable="true" style="color: var(--primary-light); margin-bottom: 0.5rem; font-size: 1.1rem;">Fase ${currentSteps + 1}: Novo Passo</h3>
    <p class="editable-field" contenteditable="true" style="color: var(--text-dark); line-height: 1.5; font-size: 0.9rem;">Descreva os detalhes e entregas desta nova etapa do projeto aqui.</p>
  `;
  descBox.appendChild(desc);
  
  node.querySelectorAll('.editable-field').forEach(el => el.addEventListener('keypress', disableEnter));
  desc.querySelectorAll('.editable-field').forEach(el => el.addEventListener('keypress', disableEnter));
}

function removeJourneyStep() {
  const timeline = document.getElementById('timeline-container');
  const descBox = document.getElementById('journey-desc-box');
  const nodes = timeline.querySelectorAll('.time-node');
  const descs = descBox.querySelectorAll('.journey-desc-item');
  
  if(nodes.length <= 2) return alert('O projeto precisa ter no mínimo 2 fases.');
  
  nodes[nodes.length - 1].remove();
  descs[descs.length - 1].remove();
  
  if(!document.querySelector('.time-node.active')) {
      updateJourney(0, document.querySelectorAll('.time-node')[0]);
  }
}

// ==========================================
// DRAG & DROP E MANIPULAÇÃO LIVRE
// ==========================================
let activeDragElement = null;
let activeResizeElement = null;
let startX, startY, startLeft, startTop, startWidth, startHeight;

document.addEventListener('dragover', (e) => {
  if (!isEditing) return;
  e.preventDefault();
});

document.addEventListener('drop', (e) => {
  if (!isEditing) return;
  e.preventDefault();
  
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const slide = slidesNodes[currentSlide];
    const rect = slide.getBoundingClientRect();
    
    const defaultImageWidth = 250;
    let x = e.clientX - rect.left - (defaultImageWidth/2);
    let y = e.clientY - rect.top - (defaultImageWidth/2);

    const imgContent = `<img src="${event.target.result}"/>`;
    createDraggableNode(imgContent, slide, x, y, defaultImageWidth);
  };
  reader.readAsDataURL(file);
});

function createDraggableNode(contentHTML, parentSlide, x, y, width) {
  const wrapper = document.createElement('div');
  wrapper.className = 'draggable-wrapper';
  wrapper.style.left = x + 'px'; 
  wrapper.style.top = y + 'px';
  wrapper.style.width = width + 'px';
  wrapper.style.height = 'auto';
  
  wrapper.innerHTML = `
    <div class="drag-handle editor-ui-element"><i class="ph ph-arrows-out-cardinal"></i></div>
    <div class="resize-handle editor-ui-element"></div>
    <div class="delete-handle editor-ui-element">✕</div>
    <div class="draggable-content">${contentHTML}</div>
  `;
  
  parentSlide.appendChild(wrapper);

  const dragHandle = wrapper.querySelector('.drag-handle');
  const resizeHandle = wrapper.querySelector('.resize-handle');
  const deleteHandle = wrapper.querySelector('.delete-handle');

  deleteHandle.onclick = () => { if(isEditing) wrapper.remove(); };

  dragHandle.addEventListener('mousedown', (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    activeDragElement = wrapper;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = parseInt(wrapper.style.left || 0, 10);
    startTop = parseInt(wrapper.style.top || 0, 10);
  });

  resizeHandle.addEventListener('mousedown', (e) => {
    if (!isEditing) return;
    e.stopPropagation();
    activeResizeElement = wrapper;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = wrapper.offsetWidth;
    startHeight = wrapper.offsetHeight;
  });

  if(isEditing) {
    wrapper.querySelectorAll('.editable-field').forEach(el => {
      el.setAttribute('contenteditable', 'true');
      el.addEventListener('keypress', disableEnter);
    });
  }
}

window.addEventListener('mousemove', (e) => {
  if (activeDragElement) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    activeDragElement.style.left = (startLeft + dx) + 'px';
    activeDragElement.style.top = (startTop + dy) + 'px';
  } else if (activeResizeElement) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    activeResizeElement.style.width = Math.max(50, startWidth + dx) + 'px';
    activeResizeElement.style.height = Math.max(50, startHeight + dy) + 'px';
  }
});

window.addEventListener('mouseup', () => {
  activeDragElement = null;
  activeResizeElement = null;
});

window.addEventListener("keydown", (e) => {
  if(document.activeElement.hasAttribute('contenteditable') || document.activeElement.tagName === "INPUT") return;
  if (e.key === "ArrowRight") navSlide(1);
  if (e.key === "ArrowLeft") navSlide(-1);
});

// Boot Inicial ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  refreshPagination();
  goToSlide(0);
});