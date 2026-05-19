(function () {
  const countdown = document.querySelector("[data-countdown]");

  if (countdown) {
    const target = new Date(countdown.getAttribute("data-countdown")).getTime();

    const daysEl = countdown.querySelector("[data-days]");
    const hoursEl = countdown.querySelector("[data-hours]");
    const minutesEl = countdown.querySelector("[data-minutes]");
    const secondsEl = countdown.querySelector("[data-seconds]");

    function updateCountdown() {
      const now = Date.now();
      const distance = Math.max(0, target - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((distance / (1000 * 60)) % 60);
      const seconds = Math.floor((distance / 1000) % 60);

      if (daysEl) daysEl.textContent = String(days);
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  const walletEl = document.querySelector("[data-wallet]");
  const savedWallet = Number(localStorage.getItem("wcWallet") || 0);

  if (walletEl) {
    walletEl.textContent = savedWallet + " PF";
  }

  const predictionWidget = document.querySelector(".wc-prediction-widget");
  const toast = document.getElementById("wcToast");

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.remove("is-visible");

    void toast.offsetWidth;

    toast.classList.add("is-visible");

    setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2600);
  }

  if (predictionWidget) {
    const storedChoice = localStorage.getItem("wcDailyPredictionChoice");
    const voteButtons = predictionWidget.querySelectorAll(".wc-vote-btn");
    const userChoiceEl = predictionWidget.querySelector("[data-user-choice]");

    function applyVote(choice, shouldReward) {
      predictionWidget.classList.add("wc-voted");

      voteButtons.forEach((btn) => {
        const pct = btn.getAttribute("data-pct") || "0";
        const btnChoice = btn.getAttribute("data-choice");
        const label = btn.querySelector("span");

        btn.style.setProperty("--pct", pct + "%");

        if (label) {
          label.textContent = pct + "%";
        }

        btn.classList.toggle("is-selected", btnChoice === choice);
      });

      if (userChoiceEl) {
        userChoiceEl.textContent = choice;
      }

      localStorage.setItem("wcDailyPredictionChoice", choice);

      if (shouldReward && !localStorage.getItem("wcDailyPredictionRewarded")) {
        const currentWallet = Number(localStorage.getItem("wcWallet") || 0) + 100;

        localStorage.setItem("wcWallet", String(currentWallet));
        localStorage.setItem("wcDailyPredictionRewarded", "true");

        if (walletEl) {
          walletEl.textContent = currentWallet + " PF";
        }

        showToast("Scelta registrata. +100 Token potenziali aggiunti al wallet demo.");
      } else if (shouldReward) {
        showToast("Hai già votato oggi. Scelta aggiornata nella demo.");
      }
    }

    if (storedChoice) {
      applyVote(storedChoice, false);
    }

    voteButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const choice = btn.getAttribute("data-choice");
        applyVote(choice, true);
      });
    });
  }

  const modal = document.getElementById("playerModal");
  const closeBtn = modal ? modal.querySelector(".wc-close") : null;

  const modalName = document.getElementById("modalPlayerName");
  const modalInfo = document.getElementById("modalPlayerInfo");
  const modalDesc = document.getElementById("modalPlayerDesc");
  const modalStats = document.getElementById("modalStats");
  const radarShape = document.getElementById("modalRadarShape");

  const statLabels = [
    "Goal Threat",
    "Assist Potential",
    "Set Pieces",
    "Minutes Security",
    "Differential Value"
  ];

  const radarPoints = [
    [130, 24],
    [231, 98],
    [192, 218],
    [68, 218],
    [29, 98]
  ];

  const center = [130, 130];

  function pointsFromStats(stats) {
    return stats
      .map((value, index) => {
        const ratio = Math.max(0, Math.min(100, value)) / 100;
        const target = radarPoints[index];

        const x = center[0] + (target[0] - center[0]) * ratio;
        const y = center[1] + (target[1] - center[1]) * ratio;

        return x.toFixed(1) + "," + y.toFixed(1);
      })
      .join(" ");
  }

  function openPlayerModal(card) {
    if (!modal) return;

    const name = card.dataset.player || "Player";
    const team = card.dataset.team || "Nazionale";
    const role = card.dataset.role || "Ruolo";
    const rating = card.dataset.rating || "--";
    const desc = card.dataset.desc || "";
    const stats = (card.dataset.stats || "70,70,70,70,70")
      .split(",")
      .map((value) => Number(value.trim()));

    if (modalName) {
      modalName.textContent = name;
    }

    if (modalInfo) {
      modalInfo.textContent = team + " · " + role + " · ProFantasy Rating " + rating;
    }

    if (modalDesc) {
      modalDesc.textContent = desc;
    }

    if (radarShape) {
      radarShape.setAttribute("points", pointsFromStats(stats));
    }

    if (modalStats) {
      modalStats.innerHTML = statLabels
        .map((label, index) => {
          const value = stats[index] || 0;

          return `
            <div class="wc-stat-line">
              <span>${label}</span>
              <div class="wc-stat-track">
                <div class="wc-stat-fill" style="--value: ${value}%"></div>
              </div>
              <strong>${value}</strong>
            </div>
          `;
        })
        .join("");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".wc-player-card").forEach((card) => {
    card.addEventListener("click", () => {
      openPlayerModal(card);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);

      if (!targetEl) return;

      event.preventDefault();

      targetEl.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });
})();
