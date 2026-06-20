const ACCESS_KEY = "w81cwwVUPzAPpieFiqvnPPc9ZVa2ll_BCNA1WbrD5Io";

const gallery = document.getElementById("gallery");
const loader = document.getElementById("loader");
const searchInput = document.getElementById("searchInput");
const sentinel = document.getElementById("sentinel");
const errorMessage = document.getElementById("errorMessage");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");

const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let page = 1;
let query = "";
let photos = [];
let currentIndex = 0;
let isLoading = false;

// Fetch Photos
async function fetchPhotos() {
    if (isLoading) return;

    isLoading = true;
    loader.style.display = "block";
    errorMessage.textContent = "";

    try {
        let url;

        if (query.trim() === "") {
            url = `https://api.unsplash.com/photos?page=${page}&per_page=20&client_id=${ACCESS_KEY}`;
        } else {
            url = `https://api.unsplash.com/search/photos?page=${page}&per_page=20&query=${query}&client_id=${ACCESS_KEY}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to load photos");
        }

        const data = await response.json();

        let imageData;

        if (query.trim() === "") {
            imageData = data;
        } else {
            imageData = data.results;
        }

        photos.push(...imageData);

        displayPhotos(imageData);

        page++;

    } catch (error) {
      errorMessage.textContent =
`Error: ${error.message}`;
        console.error(error);
    }

    loader.style.display = "none";
    isLoading = false;
}

// Display Photos
function displayPhotos(images) {
    images.forEach(photo => {

        const card = document.createElement("div");
        card.classList.add("gallery-item");

        card.innerHTML = `
            <img
                src="${photo.urls.small}"
                alt="${photo.alt_description || 'Photo'}"
                loading="lazy"
            >

            <div class="image-info">
                <p><strong>${photo.user.name}</strong></p>
            </div>
        `;

        card.addEventListener("click", () => {
            currentIndex = photos.indexOf(photo);
            openLightbox();
        });

        gallery.appendChild(card);
    });
}

// Open Lightbox
function openLightbox() {
    lightbox.classList.add("active");
    lightboxImg.src = photos[currentIndex].urls.regular;
}

// Close Lightbox
function closeLightbox() {
    lightbox.classList.remove("active");
}

// Previous Image
function previousImage() {
    if (currentIndex > 0) {
        currentIndex--;
        openLightbox();
    }
}

// Next Image
function nextImage() {
    if (currentIndex < photos.length - 1) {
        currentIndex++;
        openLightbox();
    }
}

// Buttons
closeBtn.addEventListener("click", closeLightbox);
prevBtn.addEventListener("click", previousImage);
nextBtn.addEventListener("click", nextImage);

// Keyboard Controls
document.addEventListener("keydown", (e) => {

    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") {
        closeLightbox();
    }

    if (e.key === "ArrowLeft") {
        previousImage();
    }

    if (e.key === "ArrowRight") {
        nextImage();
    }
});

// Debounce Search
let debounceTimer;

searchInput.addEventListener("input", () => {

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {

        query = searchInput.value.trim();

        page = 1;
        photos = [];
        gallery.innerHTML = "";

        updateURL();

        fetchPhotos();

    }, 500);
});

// URL Query State
function updateURL() {
    const url = new URL(window.location);

    if (query) {
        url.searchParams.set("q", query);
    } else {
        url.searchParams.delete("q");
    }

    history.pushState({}, "", url);
}

// Load Search From URL
function loadQueryFromURL() {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");

    if (q) {
        query = q;
        searchInput.value = q;
    }
}

// Infinite Scroll
const observer = new IntersectionObserver(entries => {

    if (entries[0].isIntersecting) {
        fetchPhotos();
    }

}, {
    threshold: 1
});

observer.observe(sentinel);

// Initial Load
loadQueryFromURL();
fetchPhotos();
