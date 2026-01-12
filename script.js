document.addEventListener('DOMContentLoaded', function() {
    // ========== CONFIGURACIÓN ==========
    const startDate = new Date(2025, 7, 0, 0, 0, 0); // 9 Septiembre 2025
    
    // ========== ELEMENTOS ==========
    const elements = {
        cover: document.getElementById('cover'),
        albumContainer: document.getElementById('album-container'),
        openAlbumBtn: document.getElementById('open-album'),
        backToCoverBtn: document.getElementById('back-to-cover'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        currentPageSpan: document.getElementById('current-page'),
        totalPagesSpan: document.getElementById('total-pages'),
        pages: document.querySelectorAll('.memory-page'),
        counterMonths: document.getElementById('counter-months'),
        counterDays: document.getElementById('counter-days'),
        counterHours: document.getElementById('counter-hours'),
        startDateElement: document.getElementById('start-date'),
        navDays: document.getElementById('nav-days')
    };
    
    // ========== VARIABLES ==========
    let currentPage = 1;
    const totalPages = elements.pages.length;
    
    // ========== INICIALIZACIÓN ==========
    function init() {
        // Configurar total de páginas
        elements.totalPagesSpan.textContent = totalPages;
        
        // Actualizar contador
        updateTimeCounter();
        updateStartDate();
        
        // Actualizar cada minuto
        setInterval(updateTimeCounter, 60000);
        
        // Inicializar galerías
        initGalleries();
        
        // Precargar imágenes del primer mes
        preloadMonthImages(1);
    }
    
    // ========== CONTADOR ==========
    function updateTimeCounter() {
        const now = new Date();
        const diffMs = now - startDate;
        
        const months = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30.44));
        const days = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        elements.counterMonths.textContent = months;
        elements.counterDays.textContent = days;
        elements.counterHours.textContent = hours;
        elements.navDays.textContent = totalDays;
    }
    
    function updateStartDate() {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        };
        elements.startDateElement.textContent = `Desde el ${startDate.toLocaleDateString('es-ES', options)}`;
    }
    
    // ========== NAVEGACIÓN ==========
    elements.openAlbumBtn.addEventListener('click', function() {
        elements.cover.style.display = 'none';
        elements.albumContainer.style.display = 'block';
        showPage(1);
    });
    
    elements.backToCoverBtn.addEventListener('click', function() {
        elements.albumContainer.style.display = 'none';
        elements.cover.style.display = 'flex';
    });
    
    elements.prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    
    elements.nextPageBtn.addEventListener('click', function() {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });
    
    function showPage(pageNumber) {
        // Ocultar página actual
        document.querySelector('.memory-page.active').classList.remove('active');
        
        // Mostrar nueva página
        const targetPage = document.querySelector(`.memory-page[data-page="${pageNumber}"]`);
        
        targetPage.classList.add('active');
        
        // Actualizar estado
        currentPage = pageNumber;
        elements.currentPageSpan.textContent = pageNumber;
        
        // Actualizar botones
        elements.prevPageBtn.disabled = pageNumber === 1;
        elements.nextPageBtn.disabled = pageNumber === totalPages;
        
        // Precargar imágenes del mes
        preloadMonthImages(pageNumber);
        
        // Scroll suave al inicio
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // ========== GALERÍAS ==========
    function initGalleries() {
        const galleryModal = document.getElementById('gallery-modal');
        
        // Variables para controlar galería actual
        let currentGalleryImages = [];
        let currentImageIndex = 0;
        
        // Abrir imagen en modal
        document.addEventListener('click', function(e) {
            const galleryImage = e.target.closest('.gallery-image');
            if (galleryImage) {
                e.preventDefault();
                
                // Obtener todas las imágenes de esta galería
                const gallery = galleryImage.closest('.photo-gallery');
                currentGalleryImages = Array.from(gallery.querySelectorAll('.gallery-image'));
                currentImageIndex = currentGalleryImages.indexOf(galleryImage);
                
                // Mostrar modal
                openGalleryModal(currentImageIndex);
            }
        });
        
        // Funciones del modal
        function openGalleryModal(index) {
            const modalImage = galleryModal.querySelector('.modal-image');
            const modalCaption = galleryModal.querySelector('.modal-caption');
            
            modalImage.src = currentGalleryImages[index].src;
            modalImage.alt = currentGalleryImages[index].alt;
            
            // Obtener caption
            const photoWrapper = currentGalleryImages[index].closest('.photo-wrapper');
            const overlay = photoWrapper.querySelector('.photo-overlay');
            const label = overlay ? overlay.querySelector('.photo-label') : null;
            modalCaption.textContent = label ? label.textContent : '';
            
            galleryModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
        
        function closeGalleryModal() {
            galleryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        function showNextImage() {
            currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
            openGalleryModal(currentImageIndex);
        }
        
        function showPrevImage() {
            currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
            openGalleryModal(currentImageIndex);
        }
        
        // Event listeners del modal
        galleryModal.querySelector('.modal-close').addEventListener('click', closeGalleryModal);
        galleryModal.querySelector('.modal-next').addEventListener('click', showNextImage);
        galleryModal.querySelector('.modal-prev').addEventListener('click', showPrevImage);
        
        // Cerrar con ESC o clic fuera
        galleryModal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeGalleryModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (galleryModal.style.display === 'flex') {
                if (e.key === 'Escape') closeGalleryModal();
                if (e.key === 'ArrowRight') showNextImage();
                if (e.key === 'ArrowLeft') showPrevImage();
            }
        });
    }
    
    // ========== OPTIMIZACIÓN ==========
    function preloadMonthImages(month) {
        // Precargar imágenes del mes actual y adyacentes
        const monthsToPreload = [month];
        if (month > 1) monthsToPreload.push(month - 1);
        if (month < totalPages) monthsToPreload.push(month + 1);
        
        monthsToPreload.forEach(m => {
            for (let i = 1; i <= 6; i++) {
                const img = new Image();
                img.src = `assets/meses/mes${m}/${i.toString().padStart(2, '0')}.jpg`;
                img.onerror = () => console.log(`Imagen mes${m}/${i}.jpg no encontrada`);
            }
        });
    }
    
    // ========== EVENTOS DE TECLADO ==========
    document.addEventListener('keydown', function(e) {
        if (elements.albumContainer.style.display === 'block') {
            switch(e.key) {
                case 'ArrowLeft':
                    if (currentPage > 1) showPage(currentPage - 1);
                    break;
                case 'ArrowRight':
                    if (currentPage < totalPages) showPage(currentPage + 1);
                    break;
                case '1': case '2': case '3': case '4': case '5':
                    const num = parseInt(e.key);
                    if (num <= totalPages) showPage(num);
                    break;
                case 'Escape':
                    elements.albumContainer.style.display = 'none';
                    elements.cover.style.display = 'flex';
                    break;
            }
        }
    });
    
    // ========== INICIAR ==========
    init();
});