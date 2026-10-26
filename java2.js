// Variables globales
let isPlaying = false;
let player = null;
let playerReady = false;
let currentSlide = 0;
let totalSlides = 0;
let enableMusic = false;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initializeCountdown();
    initializeCarousel();
    syncWelcomeCover();
    initializeModal();
    loadYouTubeAPI(); // Se precarga desde el inicio (no en el click) para que
                       // playVideo() pueda ejecutarse de forma síncrona dentro
                       // del gesto del usuario. Esto es lo que exige iOS Safari.
});

// Sincroniza la imagen de portada entre el hero y el modal de bienvenida
function syncWelcomeCover() {
    try {
        const welcomeImage = document.querySelector('.welcome-hero-bg');
        if (!welcomeImage) return;

        const heroImg = document.querySelector('.hero-bg');
        if (heroImg && heroImg.getAttribute('src')) {
            welcomeImage.src = heroImg.getAttribute('src');
            return;
        }

        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        const bg = getComputedStyle(heroSection).backgroundImage || '';
        // Toma la primera url() de la lista de backgrounds
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1]) {
            welcomeImage.src = match[1];
        }
    } catch (_) {
        // Silencioso: si falla, mantenemos la imagen por defecto
    }
}

// Modal de bienvenida
function initializeModal() {
    const enterWithMusic = document.getElementById('enterWithMusic');
    const enterWithoutMusic = document.getElementById('enterWithoutMusic');
    const modal = document.getElementById('welcomeModal');

    enterWithMusic.addEventListener('click', function() {
        enableMusic = true;
        modal.style.display = 'none';
        document.getElementById('musicPlayer').style.display = 'block';

        // El player ya existe (se precargó en DOMContentLoaded), así que
        // playVideo() se llama de inmediato, dentro del mismo tick del click.
        // Eso es lo que iOS necesita para no bloquear el audio.
        if (playerReady && player) {
            player.playVideo();
            isPlaying = true;
            updateMusicIcon();
        }
        // Si el player todavía no está listo (conexión lenta), onPlayerReady
        // se encarga de reproducir apenas termine de inicializar.
    });

    enterWithoutMusic.addEventListener('click', function() {
        enableMusic = false;
        modal.style.display = 'none';
    });
}

// Cargar la API de YouTube
function loadYouTubeAPI() {
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

// Función llamada por la API de YouTube
function initializeYouTubePlayer() {
    player = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: 'jb0K64SGsfc',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            playlist: 'jb0K64SGsfc'
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    playerReady = true;
    const musicToggle = document.getElementById('musicToggle');
    musicToggle.addEventListener('click', toggleMusic);

    // Caso borde: el usuario ya hizo click en "con música" antes de que el
    // player terminara de inicializar (ej. conexión lenta). Lo reproducimos
    // apenas esté listo.
    if (enableMusic && !isPlaying) {
        document.getElementById('musicPlayer').style.display = 'block';
        event.target.playVideo();
        isPlaying = true;
        updateMusicIcon();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
    } else if (event.data === YT.PlayerState.PAUSED) {
        isPlaying = false;
    }
    updateMusicIcon();
}

function onPlayerError(event) {
    console.log('Error al cargar el video de YouTube');
    const musicPlayer = document.getElementById('musicPlayer');
    musicPlayer.style.display = 'block';
    isPlaying = false;
    updateMusicIcon();
}

function toggleMusic() {
    if (player) {
        if (isPlaying) {
            player.pauseVideo();
            isPlaying = false;
        } else {
            player.playVideo();
            isPlaying = true;
        }
        updateMusicIcon();
    }
}

function updateMusicIcon() {
    const volumeIcon = document.getElementById('volumeIcon');
    
    if (isPlaying) {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"></path>
        `;
    } else {
        volumeIcon.innerHTML = `
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
    }
}

// Countdown
function initializeCountdown() {
    const targetDate = new Date('2026-12-31T10:00:00').getTime();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;
        
        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            
            document.getElementById('days').textContent = days.toString().padStart(2, '0');
            document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
            document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        } else {
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Carrusel
function getItemsPerView() {
    return window.innerWidth >= 1024 ? 3 : 1;
}

function getItemWidth() {
    const container = document.querySelector('.carousel-track-container');
    const itemsPerView = getItemsPerView();
    return container ? container.clientWidth / itemsPerView : 0;
}

function initializeCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentSlideElement = document.getElementById('currentSlide');
    const totalSlidesElement = document.getElementById('totalSlides');
    const items = track ? track.children : [];
    
    totalSlides = items.length;
    totalSlidesElement.textContent = totalSlides;
    updateSlideCounter();
    
    prevBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, totalSlides - getItemsPerView());
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = maxIndex;
        }
        updateCarousel();
    });
    
    nextBtn.addEventListener('click', () => {
        const maxIndex = Math.max(0, totalSlides - getItemsPerView());
        if (currentSlide < maxIndex) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    });
    
    // Auto-play del carrusel
    setInterval(() => {
        const maxIndex = Math.max(0, totalSlides - getItemsPerView());
        if (currentSlide < maxIndex) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        updateCarousel();
    }, 4000);

    // Recalcular en redimensionar
    window.addEventListener('resize', () => {
        const maxIndex = Math.max(0, totalSlides - getItemsPerView());
        if (currentSlide > maxIndex) {
            currentSlide = maxIndex;
        }
        updateCarousel();
    });
}

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const shiftPixels = currentSlide * getItemWidth();
    track.style.transform = `translateX(-${shiftPixels}px)`;
    updateSlideCounter();
}

function updateSlideCounter() {
    const currentSlideElement = document.getElementById('currentSlide');
    currentSlideElement.textContent = currentSlide + 1;
}

// Funciones de los botones
function openLocation(location) {
    // Direcciones de ejemplo: reemplázalas por las reales de tu evento.
    const addresses = {
        ceremony: "Calle Duarte 45, Villa Mella, Santo Domingo Norte, República Dominicana",
        celebration: "Av. Independencia 120, Santo Domingo, República Dominicana"
    };
    
    const address = addresses[location];
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(mapsUrl, '_blank');
}

// Álbum compartido de Google Fotos para que los invitados suban sus fotos
function uploadPhoto() {
    window.open('https://photos.app.goo.gl/b2UVjmavA8Pwxa6X6', '_blank', 'noopener');
}

function showDressCode() {
    showToast("Dress Code", "Elegante sport - Colores tierra y dorados son bienvenidos 👗");
}

function showTips() {
    showToast("Tips y Notas", "La ceremonia será al aire libre. Se recomienda llegar 15 minutos antes ⛪");
}

// Regalos: el modal (datos bancarios / mesa de regalos) vive en regalo-modal.js
function showGifts() {
    if (window.openGiftModal) window.openGiftModal();
}

// Confirmación de asistencia (Google Form)
function confirmAttendance() {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLScxojtt9jqEa84t0NWAciUShVSkWZlxG8qITy1HFrg_ssM1qA/viewform?usp=publish-editor', '_blank', 'noopener');
}

// Sistema de Toast
function showToast(title, message) {
    const toast = document.getElementById('toast');
    const toastContent = document.getElementById('toastContent');
    
    toastContent.innerHTML = `
        <h4 style="font-weight: 600; color: hsl(var(--brown)); margin-bottom: 0.5rem;">${title}</h4>
        <p style="color: hsl(var(--foreground) / 0.7);">${message}</p>
    `;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
