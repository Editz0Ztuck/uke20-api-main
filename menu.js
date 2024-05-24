document.addEventListener("DOMContentLoaded", function() {
    // DOM-elementer
    const searchButton = document.querySelector('button[type="submit"]');
    const searchBar = document.getElementById('searchbar');
    const mapContainer = document.getElementById('map1');

    // Sjekk om mapContainer finnes
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }

    // Initialiser kartet
    const map = initializeMap();
    const markersLayer = L.layerGroup().addTo(map);

    // Event Listeners
    if (searchButton) {
        searchButton.addEventListener('click', showBreweries);
    }

    // Funksjoner

    // Initialiserer kartet
    function initializeMap() {
        console.log('Initialiserer kartet');
        const map = L.map('map1').setView([39.8283, -98.5795], 4); // Sentrer kartet til USA
        const attribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution }).addTo(map);
        return map;
    }

    // Viser bryggerier
    async function showBreweries(event) {
        event.preventDefault(); // Forhindrer form innsending
        const state = searchBar.value;
        const apiUrl = `https://api.openbrewerydb.org/v1/breweries?by_state=${state}`;

        try {
            const response = await fetch(apiUrl);
            const breweries = await response.json();
            console.log('API-svar:', breweries);

            updateMarkers(breweries);

        } catch (error) {
            console.error('Feil ved henting av data:', error);
        }
    }

    // Oppdaterer markører på kartet
    function updateMarkers(breweries) {
        markersLayer.clearLayers(); // Slett gamle markører

        if (Array.isArray(breweries) && breweries.length > 0) {
            const validBreweries = breweries.filter(b => b.latitude && b.longitude);

            validBreweries.forEach(brewery => {
                const marker = L.marker([parseFloat(brewery.latitude), parseFloat(brewery.longitude)]).addTo(markersLayer);
                marker.bindPopup(`
                    <b>${brewery.name}</b><br>
                    ${brewery.street}<br>
                    ${brewery.city}, ${brewery.state}<br>
                    <a href="${brewery.website_url}" target="_blank">${brewery.website_url}</a>
                `);
                console.log(`Lagt til markør for: ${brewery.name} på [${brewery.latitude}, ${brewery.longitude}]`);
            });

            adjustMapView(validBreweries);
        } else {
            console.log('Ingen gyldige bryggeridata funnet');
        }
    }

    // Justerer kartvisningen
    function adjustMapView(breweries) {
        const latlngs = breweries.map(b => [parseFloat(b.latitude), parseFloat(b.longitude)]);
        if (latlngs.length > 0) {
            const bounds = L.latLngBounds(latlngs);
            map.fitBounds(bounds);
        } else {
            console.log('Ingen gyldige koordinater for å justere kartgrenser');
        }
    }
});
