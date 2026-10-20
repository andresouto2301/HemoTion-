const tipos = ["O+", "A+", "O-", "B+", "A-", "AB+", "B-", "AB-"];
const valores = [97, 88, 74, 58, 43, 30, 23, 12];
const niveis = ["Crítico", "Crítico", "Alto", "Alto", "Moderado", "Baixo", "Baixo", "Baixo"];

// Uma cor por barra, na mesma ordem dos dados
const cores = ["#c41230", "#c41230", "#e05a1f", "#e05a1f", "#c07232", "#666", "#666", "#666"];

// Cor padrão dos textos (eixos)
Chart.defaults.color = "#888";

new Chart(document.getElementById("tiposSanguineos"), {
  type: "bar",
  data: {
    labels: tipos,
    datasets: [{
      data: valores,
      backgroundColor: cores,   // array = uma cor para cada barra
      borderRadius: 4,          // cantos arredondados
      barPercentage: 0.3,       // deixa as barras mais finas
      categoryPercentage: 1
    }]
  },
  options: {
    plugins: {
      legend: { display: false },  // a legenda é a do HTML
      tooltip: {
        displayColors: false,
        backgroundColor: "#161312",
        borderColor: "#333",
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
        ticks: { stepSize: 25, callback: (v) => v + "%" },
        grid: { color: "rgba(255,255,255,0.06)" },
        border: { display: false }
      },
      x: {
        grid: { display: false }
      }
    }
  }
});

const mapa = L.map("mapaHemocentros").setView([-22.9056, -47.0608], 12);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(mapa);

const hemocentros = [
  { nome: "Hemocentro UNICAMP", lat: -22.828638360254065, lng: -47.062424304145786 },       // trocar pelas coordenadas reais
  { nome: "Hemocentro Amoreiras", lat: -22.9177083319309, lng: -47.07261235996504 },
  { nome: "Pulsa São Paulo", lat: -22.900689196899467, lng: -47.0549850176369 },
  { nome: "Banco de Sangue Albert Einstein", lat: -22.916020340563936, lng: -47.06856353297888 },
  { nome: "Hospital PUCCAMP", lat: -22.920757498490666, lng: -47.11983786181407 }
];

hemocentros.forEach((h) => {
  L.marker([h.lat, h.lng]).addTo(mapa).bindPopup(h.nome);
});

