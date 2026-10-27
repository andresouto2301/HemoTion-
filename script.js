  const stats = [
  ['38 mil', 'doações/dia necessárias no Brasil'], ['4 vidas', 'salvas por cada doação'],
  ['1,5%', 'da população é doadora regular'], ['60 dias', 'intervalo mínimo entre doações']
];
const benefits = [
  ['01','Salva até 4 vidas','Cada doação pode ser fracionada em diferentes componentes, beneficiando múltiplos pacientes.'],
  ['02','Estimula a renovação celular','O organismo repõe os glóbulos vermelhos e mantém a medula óssea ativa.'],
  ['03','Check-up gratuito de saúde','Antes da doação é realizada uma triagem clínica com verificações básicas de saúde.'],
  ['04','Acompanhamento da saúde','A triagem periódica ajuda o doador a acompanhar indicadores básicos antes de cada coleta.'],
  ['05','Bem-estar emocional','O ato solidário de ajudar outras pessoas pode gerar sensação de propósito e pertencimento.'],
  ['06','Comunidade que cuida','Ao doar regularmente, você participa de uma rede de cuidado que beneficia toda a comunidade.']
];
const blood = [['O+',97],['A+',87],['O-',74],['B+',58],['A-',43],['AB+',30],['B-',23],['AB-',12]];

document.querySelector('#stats').innerHTML = stats.map(([v,l]) => `<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
document.querySelector('#benefits').innerHTML = benefits.map(([n,t,d]) => `<article class="card"><span class="number">${n}</span><h3>${t}</h3><p>${d}</p></article>`).join('');


// ===================== GRÁFICO — Chart.js =====================
// Os tipos e valores vêm do array "blood" lá de cima.
// Nível e cor continuam na mesma ordem do array "blood".
const niveis = ['Crítico', 'Crítico', 'Alto', 'Alto', 'Moderado', 'Baixo', 'Baixo', 'Baixo'];
const cores  = ['#c41230', '#c41230', '#e05a1f', '#e05a1f', '#c07232', '#666', '#666', '#666'];

Chart.defaults.color = '#888';

new Chart(document.getElementById('tiposSanguineos'), {
  type: 'bar',
  data: {
    labels: blood.map(([tipo]) => tipo),
    datasets: [{
      data: blood.map(([, valor]) => valor),
      backgroundColor: cores,
      borderRadius: 4,
      barPercentage: 0.3,
      categoryPercentage: 1
    }]
  },
  options: {
    plugins: {
      legend: { display: false },  // a legenda é a do HTML
      tooltip: {
        displayColors: false,
        backgroundColor: '#161312',
        borderColor: '#333',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          title: (itens) => `${itens[0].label} — ${itens[0].parsed.y}%`,
          label: (item) => niveis[item.dataIndex]
        }
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: { stepSize: 25, callback: (v) => v + '%' },
        grid: { color: 'rgba(255,255,255,0.06)' },
        border: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  }
});

// ===================== MAPA — Leaflet =====================
const mapa = L.map('mapaHemocentros').setView([-22.9056, -47.0608], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapa);

const hemocentros = [
  { nome: 'Hemocentro UNICAMP', lat: -22.828638360254065, lng: -47.062424304145786 },
  { nome: 'Hemocentro Amoreiras', lat: -22.9177083319309, lng: -47.07261235996504 },
  { nome: 'Pulsa São Paulo', lat: -22.900689196899467, lng: -47.0549850176369 },
  { nome: 'Hospital Municipal Dr. Mário Gatti', lat: -22.916020340563936, lng: -47.06856353297888 },
  { nome: 'Hospital da PUC-Campinas', lat: -22.920757498490666, lng: -47.11983786181407 }
];

// Marcadores vermelhos (combinam com o tema e não dependem de imagem externa)
hemocentros.forEach((h) => {
  L.circleMarker([h.lat, h.lng], {
    radius: 9,
    color: '#fff',
    weight: 2,
    fillColor: '#c41230',
    fillOpacity: 1
  }).addTo(mapa)
    .bindPopup(h.nome)
    .bindTooltip(h.nome, { permanent: true, direction: 'top', offset: [0, -8], className: 'rotulo-mapa' });
});

// Com o mapa afastado os rótulos se sobrepõem; só aparecem a partir do zoom 14
const atualizarRotulos = () => mapa.getContainer().classList.toggle('mapa-longe', mapa.getZoom() < 14);
mapa.on('zoomend', atualizarRotulos);
atualizarRotulos();

const header = document.querySelector('#header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40));
const menuButton = document.querySelector('#menuButton');
const nav = document.querySelector('#nav');
menuButton.addEventListener('click', () => { const open = nav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Botão "Usar minha localização": centraliza o mapa no usuário.
// Primeiro tenta alta precisão (GPS); se demorar, tenta de novo com precisão menor (Wi-Fi/IP).
let marcadorUsuario;
document.querySelector('#locationButton').addEventListener('click', () => {
  const status = document.querySelector('#locationStatus');
  if (!navigator.geolocation) return status.textContent = 'Geolocalização não suportada neste navegador.';
  status.textContent = 'Solicitando localização…';

  const mostrarPosicao = ({coords}) => {
    const posicao = [coords.latitude, coords.longitude];
    mapa.setView(posicao, 14);
    if (marcadorUsuario) marcadorUsuario.remove();
    marcadorUsuario = L.circleMarker(posicao, {
      radius: 8,
      color: '#fff',
      weight: 2,
      fillColor: '#2f80ed',
      fillOpacity: 1
    }).addTo(mapa).bindTooltip('Você', { permanent: true, direction: 'top', offset: [0, -8], className: 'rotulo-voce' });
    status.textContent = `Localização obtida (precisão de cerca de ${Math.round(coords.accuracy)} m).`;
  };

  const mostrarErro = (erro) => {
    // erro.code: 1 = permissão negada, 2 = posição indisponível, 3 = tempo esgotado
    const motivos = {
      1: 'permissão negada (libere a localização para este site no navegador).',
      2: 'posição indisponível (confira se a localização do sistema está ligada).',
      3: 'tempo esgotado (tente de novo).'
    };
    status.textContent = 'Não foi possível obter a localização: ' + (motivos[erro.code] || erro.message);
  };

  navigator.geolocation.getCurrentPosition(
    mostrarPosicao,
    (erro) => {
      if (erro.code === 1) return mostrarErro(erro); // permissão negada: tentar de novo não adianta
      status.textContent = 'Tentando com precisão menor…';
      navigator.geolocation.getCurrentPosition(
        mostrarPosicao,
        mostrarErro,
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );
});

// ===================== FORMULÁRIO — Google Apps Script =====================
const URL_PLANILHA = 'https://script.google.com/macros/s/AKfycbxpA4vWUru_BRbK7gMlkYk6rtup7yI4YMtkrpL1LfrUQg4uV22NfSC8HtpHtMIZC8vNYA/exec';

document.querySelector('#contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const status = document.querySelector('#formStatus');
  const botao = form.querySelector('button[type="submit"]');

  const dados = {
    nome: form.elements.nome.value,
    email: form.elements.email.value,
    mensagem: form.elements.mensagem.value
  };

  botao.disabled = true;
  status.textContent = 'Enviando…';

  try {
    // Sem cabeçalho "Content-Type: application/json" de propósito
    const resposta = await fetch(URL_PLANILHA, { method: 'POST', body: JSON.stringify(dados) });
    const resultado = await resposta.json();
    if (resultado.status !== 'ok') throw new Error('Resposta inesperada do servidor');

    status.textContent = 'Mensagem enviada! Obrigado pelo contato.';
    form.reset();
  } catch (erro) {
    console.error(erro);
    status.textContent = 'Não foi possível enviar a mensagem. Tente novamente.';
  } finally {
    botao.disabled = false;
  }
});
