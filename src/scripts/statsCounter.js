(function () {

    // ---- Konfigurasi durasi animasi ----
    const DURATION_DEFAULT = 2000;      // durasi dasar 2000ms
    const DURATION_VARIATION = 20;      // variasi ±20% dari default

    // Ambil semua elemen counter
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Format angka sesuai locale Indonesia
    function formatNumber(value, precision = 0) {
        return new Intl.NumberFormat("id-ID", {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision
        }).format(value);
    }

    // Singkatkan angka besar dengan unit K+
    function shortenNumber(value, unit) {
        if (unit === "K+") return Math.round(value / 1000) + "K+";
        return value.toString();
    }

    // Easing animasi: cepat di awal, melambat di akhir
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Buat durasi random ±DURATION_VARIATION dari default
    function randomDuration() {
        const variation = DURATION_DEFAULT * (DURATION_VARIATION / 100);
        return DURATION_DEFAULT + (Math.random() * 2 - 1) * variation;
    }

    // Jalankan animasi satu counter
    function animateCounter(counter) {
        const finalValue = parseFloat(counter.dataset.final || "0");
        const unit = counter.dataset.unit || "";
        const precision = parseInt(counter.dataset.precision || "0", 10);
        const duration = randomDuration();

        if (prefersReducedMotion || finalValue === 0 || duration <= 0) {
            counter.textContent = unit ? shortenNumber(finalValue, unit) : formatNumber(finalValue, precision);
            return;
        }

        let startTime = null;

        function step(time) {
            if (!startTime) startTime = time;
            let progress = (time - startTime) / duration;
            progress = Math.max(0, Math.min(progress, 1));
            progress = easeOutCubic(progress);

            const currentValue = finalValue * progress;

            // Selama animasi tampilkan nilai asli (tidak disingkat)
            counter.textContent = formatNumber(currentValue, precision);

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                // Animasi selesai, tampilkan final dengan unit jika ada
                counter.textContent = unit ? shortenNumber(finalValue, unit) : formatNumber(finalValue, precision);
            }
        }

        requestAnimationFrame(step);
    }

    // Reset counter ke 0
    function resetCounter(counter) {
        const precision = parseInt(counter.dataset.precision || "0", 10);
        counter.textContent = formatNumber(0, precision);
    }

    // Jalankan animasi saat counter terlihat, reset saat keluar viewport
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                } else {
                    resetCounter(entry.target);
                }
            });
        },
        { threshold: 0.5 } // >50% terlihat
    );

    counters.forEach(counter => {
        resetCounter(counter);
        observer.observe(counter);
    });

})();
