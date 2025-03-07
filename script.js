let seg = 0;
let min = 0;
let minEstudo = 25;
let minPausa = 5;
let loopCount;
let emEstudo = true;

const $count = document.getElementById("count");
const $btnPlay = document.getElementById("btnPlay");
const $btnPause = document.getElementById("btnPause");
const $btnStop = document.getElementById("btnStop");
const $inputTema = document.getElementById("inputTema");
const $inputEstudo = document.getElementById("inputEstudo");
const $inputPausa = document.getElementById("inputPausa");    
const $historico = document.getElementById("historico");
const $status = document.getElementById("status");

// Carregar o som
const plinSound = new Audio('assets/ding.mp3');

// Função para atualizar o contador
function count() {
  if (seg < 59) {
    seg++;
  } else {
    seg = 0;
    min++;
  }
  
  $count.innerText = `${String(min).padStart(2, "0")}:${String(seg).padStart(2, "0")}`;

  if ((emEstudo && min === minEstudo) || (!emEstudo && min === minPausa)) {
    stop();
    toggleMode();

  }
}

// Função para iniciar o cronômetro
function play() {
  if (!$inputTema.value) {
    return alert("Descreva o tema de estudos");
  }
  
  minEstudo = parseInt($inputEstudo.value) || 25;
  minPausa = parseInt($inputPausa.value) || 5;

  loopCount = setInterval(count, 1000); // Intervalo de 1 segundo

  $btnPlay.style.display = "none";
  $btnPause.style.display = "block";
  $btnStop.style.display = "block";
  $status.innerText = "Estudar"


  localStorage.setItem("currentTema", $inputTema.value);
}

// Função para pausar o cronômetro
function pause() {
  clearInterval(loopCount);
  $btnPlay.style.display = "block";
  $btnPause.style.display = "none";
}

// Função para parar o cronômetro
function stop() {
  clearInterval(loopCount);
  seg = 0;
  min = 0;
  $count.innerText = "00:00";

  $btnPlay.style.display = "block";
  $btnPause.style.display = "none";
  $btnStop.style.display = "none";
  $status.innerText = "Parado"

}

// Função para alternar entre estudo e pausa
function toggleMode() {
  if (emEstudo) {
    finishCicle();
    emEstudo = false;
    playSound();  // Tocar som quando termina o estudo
    alert("Hora da pausa!");
    $status.innerText = "Descansar"
  } else {
    emEstudo = true;
    playSound();  // Tocar som quando começa o estudo
    $status.innerText = "Estudar"
    alert("Hora de voltar aos estudos!");
  }
}

// Função para tocar o som
function playSound() {
  if (document.hidden) {
    // A aba está em segundo plano, mas o som ainda será tocado
    plinSound.play().catch((e) => console.log("Erro ao tentar reproduzir som", e));
  } else {
    // A aba está visível, podemos tocar o som normalmente
    plinSound.play();
  }
}

// Função para finalizar o ciclo
function finishCicle() {
  const currentTema = localStorage.getItem("currentTema");
  let cicles = JSON.parse(localStorage.getItem("cicles")) || [];

  const temaExistente = cicles.find(e => e.title === currentTema);

  if (temaExistente) {
    temaExistente.cicles++;
    temaExistente.studyTime += minEstudo;
    temaExistente.pauseTime += minPausa;
  } else {
    cicles.push({
      date: new Date().toISOString(),
      title: currentTema,
      cicles: 1,
      studyTime: minEstudo,
      pauseTime: minPausa
    });
  }

  localStorage.setItem("cicles", JSON.stringify(cicles));
  renderHistorico();
}

// Função para renderizar o histórico
function renderHistorico() {
  $historico.innerHTML = "";
  const cicles = JSON.parse(localStorage.getItem("cicles")) || [];

  cicles.forEach((cicle, index) => {
    const li = document.createElement("li");
    li.innerHTML = ` 
      <strong onclick="setTema('${cicle.title}')">${cicle.title}</strong> <br>
      <span>${cicle.cicles} ciclos - ${cicle.studyTime} min estudo</span> 
      <div class="liItem">
        <button class="btnRemoveItem" onclick="removerItem(${index})">🗑️</button>
      </div>
    `;
    $historico.appendChild(li);
  });
}

// Função para definir o tema
function setTema(tema) {
  $inputTema.value = tema;
}

// Função para remover um item do histórico
function removerItem(index) {
  let cicles = JSON.parse(localStorage.getItem("cicles")) || [];
  cicles.splice(index, 1);
  localStorage.setItem("cicles", JSON.stringify(cicles));
  renderHistorico();
}

// Carregar o tema e histórico ao carregar a página
function onLoad() {
  $inputTema.value = localStorage.getItem("currentTema") || "";
  renderHistorico();
}

onLoad();

// Monitorar visibilidade da aba
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // A aba foi trazida de volta, o contador e som devem funcionar normalmente
  }
});
