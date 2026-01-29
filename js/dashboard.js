/**
 * Hacienda El Copihue - Dashboard Logic
 * Integrates original Leaflet map with modern UI components and Analytics
 */

document.addEventListener('DOMContentLoaded', function () {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');

        if (!role) {
            console.warn("No role specified. Redirecting to portal...");
            window.location.href = 'index.html';
            return;
        }

        document.body.classList.add(role);
        console.log("Dashboard Role:", role);
        initDashboard(role);
    } catch (e) {
        console.error("Critical Dash Error:", e);
        const container = document.getElementById('plot-list-container');
        if (container) container.innerHTML = '<div style="color:red; padding:20px;">Error al cargar la interfaz. Por favor, refresca la página.</div>';
    }
});

function initDashboard(role) {
    // 0. Extreme Safety Checks
    const safeData = (data) => (data && data.features) ? data.features : [];
    const v_features = safeData(window.json_Vendidas_1);
    const d_features = safeData(window.json_Disponibles_2);
    const f_features = safeData(window.json_fotos_copihue_3);

    // 1. Initialize Map
    var map;
    try {
        map = L.map('map', {
            zoomControl: false,
            maxZoom: 28,
            minZoom: 1
        }).fitBounds([[-36.12420517476976, -71.78183012932078], [-36.116821739647335, -71.7709179776406]]);
    } catch (e) {
        console.error("Map init failed", e);
        return;
    }

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer Control (Standard Leaflet)
    var baseMaps = {
        "Satélite (ArcGIS)": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Esri'
        }).addTo(map),
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        })
    };

    // 2. Data Processing Pane creation
    map.createPane('pane_Vendidas_1');
    map.getPane('pane_Vendidas_1').style.zIndex = 401;
    map.createPane('pane_Disponibles_2');
    map.getPane('pane_Disponibles_2').style.zIndex = 402;

    function style_Vendidas_1_0() {
        return {
            pane: 'pane_Vendidas_1',
            opacity: 1, color: 'white', weight: 1.5,
            fill: true, fillOpacity: 0.5, fillColor: 'rgba(227, 26, 28, 1.0)',
            interactive: true,
        }
    }

    function style_Disponibles_2_0() {
        return {
            pane: 'pane_Disponibles_2',
            opacity: 1, color: 'white', weight: 1.5,
            fill: true, fillOpacity: 0.6, fillColor: 'rgba(52, 160, 44, 1.0)',
            interactive: true,
        }
    }

    var layer_Vendidas_1 = new L.geoJson({ type: "FeatureCollection", features: v_features }, {
        pane: 'pane_Vendidas_1',
        style: style_Vendidas_1_0,
        onEachFeature: function (feature, layer) {
            const props = feature.properties || {};
            let content = "<b>Lote " + (props.Lote || '?') + "</b><br>Estado: Vendido";
            if (role === 'client') {
                const attributeIconsHtml = `<div style="display:flex; gap:10px; margin:10px 0; color:#34a02c; border-top:1px solid #eee; padding-top:8px;">
                    <span title="Luz ⚡"><i class="fas fa-bolt"></i> ⚡</span>
                    <span title="Agua 💧"><i class="fas fa-tint"></i> 💧</span>
                    <span title="Señal 📶"><i class="fas fa-signal"></i> 📶</span>
                    <span title="Rol Propio 📜"><i class="fas fa-certificate"></i> 📜</span>
                </div>`;
                const parcelPhotos = [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
                ];
                const randomId = (props.Lote || 0) % parcelPhotos.length;
                content += attributeIconsHtml;
                content += `<img src="${parcelPhotos[randomId]}" style="width:100%; border-radius:8px; margin-top:5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="Vista del Lote">`;
                content += `<br><button class="btn-interested" onclick="alert('¡Gracias por tu interés! Un ejecutivo te contactará pronto para el Lote ${props.Lote}')" style="width:100%; background:#34a02c; color:white; border:none; padding:10px; border-radius:6px; margin-top:10px; cursor:pointer; font-weight:bold;"><i class="fas fa-envelope"></i> Me interesa esta parcela</button>`;
            }
            layer.bindPopup(content);

            // Permanent Lot Label
            layer.bindTooltip(String(props.Lote || ''), {
                permanent: true,
                direction: 'center',
                className: 'plot-label'
            });
        }
    }).addTo(map);

    var layer_Disponibles_2 = new L.geoJson({ type: "FeatureCollection", features: d_features }, {
        pane: 'pane_Disponibles_2',
        style: style_Disponibles_2_0,
        onEachFeature: function (feature, layer) {
            const props = feature.properties || {};
            let content = "<b>Lote " + (props.Lote || '?') + "</b><br>" +
                "Área: " + (props.Area || '-') + "<br>" +
                "Precio: " + (props.Precio || '-');
            if (role === 'client') {
                const attributeIconsHtml = `<div style="display:flex; gap:10px; margin:10px 0; color:#34a02c; border-top:1px solid #eee; padding-top:8px;">
                    <span title="Luz ⚡"><i class="fas fa-bolt"></i> ⚡</span>
                    <span title="Agua 💧"><i class="fas fa-tint"></i> 💧</span>
                    <span title="Señal 📶"><i class="fas fa-signal"></i> 📶</span>
                    <span title="Rol Propio 📜"><i class="fas fa-certificate"></i> 📜</span>
                </div>`;
                const parcelPhotos = [
                    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=400&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
                ];
                const randomId = (props.Lote || 0) % parcelPhotos.length;
                content += attributeIconsHtml;
                content += `<img src="${parcelPhotos[randomId]}" style="width:100%; border-radius:8px; margin-top:5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" alt="Vista del Lote">`;
                content += `<br><button class="btn-interested" onclick="alert('¡Gracias por tu interés! Un ejecutivo te contactará pronto para el Lote ${props.Lote}')" style="width:100%; background:#34a02c; color:white; border:none; padding:10px; border-radius:6px; margin-top:10px; cursor:pointer; font-weight:bold;"><i class="fas fa-envelope"></i> Me interesa esta parcela</button>`;
            }
            layer.bindPopup(content);

            // Permanent Lot Label
            layer.bindTooltip(String(props.Lote || ''), {
                permanent: true,
                direction: 'center',
                className: 'plot-label'
            });
        }
    }).addTo(map);

    var overlayMaps = {
        "Lotes Vendidos": layer_Vendidas_1,
        "Lotes Disponibles": layer_Disponibles_2
    };

    // Move zoom control to topleft
    if (map.zoomControl) map.zoomControl.setPosition('topleft');

    L.control.layers(baseMaps, overlayMaps, {
        position: 'topleft',
        collapsed: true
    }).addTo(map);

    // Geolocation Control
    L.Control.Geolocate = L.Control.extend({
        onAdd: function (map) {
            var btn = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            btn.innerHTML = '<button style="background:white; border:none; width:30px; height:30px; cursor:pointer;" title="Mi ubicación"><i class="fas fa-location-arrow" style="color:#333;"></i></button>';
            btn.onclick = function () {
                map.locate({ setView: true, maxZoom: 16 });
            }
            return btn;
        }
    });
    new L.Control.Geolocate({ position: 'topleft' }).addTo(map);

    // 3. Role-Based Labeling & Switching
    const roleLabel = document.getElementById('current-role-label');
    const roleSwitcher = document.getElementById('role-switcher');

    if (roleSwitcher) roleSwitcher.value = role;

    if (roleLabel) {
        if (role === 'client') {
            roleLabel.innerText = 'Visitante / Cliente';
        } else if (role === 'vendor') {
            roleLabel.innerText = 'Fuerza de Ventas';
            const panelTitle = document.getElementById('panel-title');
            if (panelTitle) panelTitle.innerText = 'Galería Comercial de Lotes';
        } else {
            roleLabel.innerText = 'Gerente General';
        }
    }

    const collapseBtn = document.getElementById('collapse-panel-btn');
    const mainPanel = document.getElementById('main-panel');
    if (collapseBtn && mainPanel) {
        collapseBtn.onclick = (e) => {
            e.stopPropagation();
            mainPanel.classList.toggle('collapsed');
        };
    }

    if (roleSwitcher) {
        roleSwitcher.onchange = (e) => {
            const newRole = e.target.value;
            const url = new URL(window.location.href);
            url.searchParams.set('role', newRole);
            window.location.href = url.href;
        };
    }

    // 4. Update Stats & Render Inventory
    const stats = updateStats();
    renderInventoryList();

    if (role === 'admin') {
        renderCharts(stats);
        const btnSales = document.getElementById('btn-sales');
        if (btnSales) btnSales.click();
    } else {
        const btnInventory = document.getElementById('btn-inventory');
        if (btnInventory) btnInventory.click();
    }

    // New Financial Button
    const btnFinancial = document.getElementById('btn-financial');
    const financialWrapper = document.getElementById('financial-wrapper');

    if (btnFinancial) {
        btnFinancial.onclick = (e) => {
            e.preventDefault();
            setActiveBtn(btnFinancial);
            showSection(financialWrapper);
            renderFinancialReports();
        };
    }

    // New Protocol Button
    const btnProtocol = document.getElementById('btn-protocol');
    const protocolWrapper = document.getElementById('protocol-wrapper');

    if (btnProtocol) {
        btnProtocol.onclick = (e) => {
            e.preventDefault();
            setActiveBtn(btnProtocol);
            showSection(protocolWrapper);
        };
    }

    function updateStats() {
        const totalSold = v_features.length;
        const totalAvailable = d_features.length;
        let soldVal = 650000000;
        let availableVal = 0;
        d_features.forEach(f => {
            const props = f.properties || {};
            if (props.Precio) {
                const val = parseInt(String(props.Precio).replace(/[^0-9]/g, ''));
                if (!isNaN(val)) availableVal += val;
            }
        });

        const elTotal = document.getElementById('stat-total');
        if (elTotal) elTotal.innerText = totalSold + totalAvailable;

        const elAvail = document.getElementById('stat-available');
        if (elAvail) elAvail.innerText = totalAvailable;

        const elSold = document.getElementById('stat-sold');
        if (elSold) elSold.innerText = totalSold;

        const elVal = document.getElementById('stat-value');
        if (elVal) elVal.innerText = '$ ' + availableVal.toLocaleString('es-CL');

        return { totalSold, totalAvailable, soldVal, availableVal };
    }

    function renderInventoryList() {
        const listContainer = document.getElementById('plot-list-container');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        const allFeatures = [
            ...d_features.map(f => ({ ...f, isAvailable: true })),
            ...v_features.map(f => ({ ...f, isAvailable: false }))
        ]; // Showing all plots now

        allFeatures.forEach(f => {
            const card = document.createElement('div');
            card.className = `plot-card ${!f.isAvailable ? 'sold' : ''}`;

            const props = f.properties || {};
            const descripcion = props.Descripcion || "Parcela de agrado con entorno natural privilegiado, ideal para primera o segunda vivienda en Hacienda El Copihue.";
            let imgHtml = '';
            let photoPath = props.Foto;

            // Link photo by lot number if available
            if (!photoPath && props.Lote) {
                photoPath = props.Lote + ".jpg";
            }

            const parcelPhotos = [
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=400&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop'
            ];
            const randomId = (props.Lote || 1) % parcelPhotos.length;

            if (photoPath) {
                const imgName = String(photoPath).replace(/[\\/:]/g, '_').trim();
                imgHtml = `<img src="images/${imgName}" class="plot-thumbnail" alt="Lote ${props.Lote}" onerror="this.src='${parcelPhotos[randomId]}'">`;
            } else {
                imgHtml = `<img src="${parcelPhotos[randomId]}" class="plot-thumbnail" alt="Vista Rural Demo">`;
            }

            const reportBtn = `
                <div class="admin-actions" style="display:flex; gap:5px; margin-bottom:8px; padding-bottom:8px; border-bottom: 1px solid #eee;">
                    <button class="btn-report" style="flex:1; background: #2c3e50;" onclick="event.stopPropagation(); window.openReport('${props.Lote || ''}', '${props.Area || ''}', '${props.Precio || ''}', '${f.isAvailable ? 'Disponible' : 'Vendido'}', '${props.Foto || ''}')">
                        <i class="fas fa-file-pdf"></i> Ficha
                    </button>
                    <a href="https://drive.google.com/file/d/15Z-7pySYwOZweKhfmDIiKY3cIPd7_a1X/view?usp=sharing" target="_blank" class="btn-report" style="flex:1; background:#4285f4; text-decoration:none;" onclick="event.stopPropagation();">
                        <i class="fas fa-gavel"></i> Ver Legal
                    </a>
                </div>
            `;

            const featuresHtml = `
                <div class="plot-features">
                    <span title="Luz"><i class="fas fa-bolt"></i> ⚡</span>
                    <span title="Agua"><i class="fas fa-tint"></i> 💧</span>
                    <span title="Señal"><i class="fas fa-signal"></i> 📶</span>
                    <span title="Rol Propio"><i class="fas fa-certificate"></i> 📜</span>
                </div>
            `;

            card.innerHTML = `
                <div class="plot-thumbnail-container">
                    ${imgHtml}
                </div>
                <div class="plot-card-content">
                    ${reportBtn}
                    <div class="plot-title">
                        Lote ${props.Lote || 'S/N'}
                        <span class="status-badge ${f.isAvailable ? 'status-available' : 'status-sold'}">${f.isAvailable ? 'Disponible' : 'Vendido'}</span>
                    </div>
                    <div class="plot-details">
                        <div class="plot-main-info">
                            <span>📐 ${props.Area || '5.000 m2'}</span>
                            <span>💰 ${props.Precio || 'Consultar'}</span>
                        </div>
                        <p class="plot-description">${descripcion}</p>
                    </div>
                </div>
                ${featuresHtml}
            `;
            card.onclick = (e) => {
                // Toggle expansion
                const isExpanded = card.classList.contains('expanded');

                // Collapse all other cards first
                document.querySelectorAll('.plot-card').forEach(c => c.classList.remove('expanded'));

                // If it wasn't expanded, expand it
                if (!isExpanded) {
                    card.classList.add('expanded');
                }

                // Map interaction
                const layers = f.isAvailable ? layer_Disponibles_2 : layer_Vendidas_1;
                if (!layers || typeof layers.eachLayer !== 'function') return;
                layers.eachLayer(l => {
                    if (l.feature && l.feature.properties && l.feature.properties.Lote === props.Lote) {
                        map.fitBounds(l.getBounds(), { maxZoom: 18 });
                        l.openPopup();
                    }
                });
            };
            listContainer.appendChild(card);
        });
    }

    // 5. Modal Logic
    const modal = document.getElementById('report-modal');
    window.openReport = function (lote, area, precio, estado, foto) {
        document.getElementById('rep-lote').innerText = "Lote " + lote;
        document.getElementById('rep-area').innerText = area;
        document.getElementById('rep-precio').innerText = precio || 'Consultar';
        document.getElementById('rep-estado').innerText = estado;

        const photoCont = document.getElementById('rep-photo-container');
        photoCont.innerHTML = '';
        if (foto) {
            const imgName = String(foto).replace(/[\\/:]/g, '_').trim();
            photoCont.innerHTML = `<img src="images/${imgName}" style="width:100%; border-radius:12px; margin-top:15px;">`;
        } else {
            photoCont.innerHTML = '<p style="color:#999; padding:20px;">Sin fotografía adjunta</p>';
        }

        modal.style.display = 'flex';
    };

    document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

    // 6. View Switching & Charts
    const btnInventory = document.getElementById('btn-inventory');
    const btnSales = document.getElementById('btn-sales');
    const btnGallery = document.getElementById('btn-gallery');
    const mapWrapper = document.getElementById('map-wrapper');
    const reportsWrapper = document.getElementById('reports-wrapper');
    const galleryWrapper = document.getElementById('gallery-wrapper');

    btnInventory.onclick = (e) => {
        e.preventDefault();
        setActiveBtn(btnInventory);
        showSection(mapWrapper);
        map.invalidateSize();
    };

    btnSales.onclick = (e) => {
        e.preventDefault();
        setActiveBtn(btnSales);
        showSection(reportsWrapper);
    };

    btnGallery.onclick = (e) => {
        e.preventDefault();
        setActiveBtn(btnGallery);
        showSection(galleryWrapper);
        renderGallery();
    };

    function setActiveBtn(btn) {
        [btnInventory, btnSales, btnGallery, btnFinancial, btnProtocol].forEach(b => b?.classList.remove('active'));
        btn.classList.add('active');
    }

    function showSection(section) {
        [mapWrapper, reportsWrapper, galleryWrapper, financialWrapper, protocolWrapper].forEach(s => s.style.display = 'none');
        section.style.display = 'block';
        if (section === reportsWrapper) section.style.display = 'grid';
        if (section === financialWrapper) section.style.display = 'block';
    }

    function renderGallery() {
        const galleryGrid = document.getElementById('project-gallery-grid');
        galleryGrid.innerHTML = '';

        const projectPhotos = json_fotos_copihue_3.features.map(f => {
            const fileName = f.properties.Foto.split('/').pop();
            const numMatch = fileName.match(/\d+/);
            let lotName = numMatch ? "Lote " + numMatch[0] : "Proyecto General";

            if (lotName === "Proyecto General") {
                const point = L.latLng(f.geometry.coordinates[1], f.geometry.coordinates[0]);
                layer_Disponibles_2.eachLayer(l => { if (isPointInPolygon(point, l)) lotName = "Lote " + l.feature.properties.Lote; });
                layer_Vendidas_1.eachLayer(l => { if (isPointInPolygon(point, l)) lotName = "Lote " + l.feature.properties.Lote; });
            }

            return { src: f.properties.Foto, lote: lotName };
        });

        // Add lot photos
        [...json_Disponibles_2.features, ...json_Vendidas_1.features].forEach(l => {
            const photo = l.properties.Foto || (l.properties.Lote + ".jpg");
            if (!projectPhotos.some(p => p.src.includes(photo))) {
                projectPhotos.push({ src: photo, lote: "Lote " + l.properties.Lote });
            }
        });

        const parcelPhotos = [
            'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1500076656116-558758c991c1?q=80&w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop'
        ];

        projectPhotos.forEach((p, index) => {
            const imgName = String(p.src).replace(/[\\/:]/g, '_').trim();
            const fallback = parcelPhotos[index % parcelPhotos.length];
            const card = document.createElement('div');
            card.className = 'gallery-card';
            card.innerHTML = `
                <img src="images/${imgName}" class="gallery-img" onerror="this.src='${fallback}'">
                <div class="gallery-info">
                    <h4>${p.lote}</h4>
                    <div class="plot-features" style="display: flex; gap: 8px; margin: 5px 0; color: #34a02c;">
                        <span title="Luz ⚡"><i class="fas fa-bolt"></i></span>
                        <span title="Agua 💧"><i class="fas fa-tint"></i></span>
                        <span title="Señal 📶"><i class="fas fa-signal"></i></span>
                        <span title="Rol Propio 📜"><i class="fas fa-certificate"></i></span>
                    </div>
                    <p>Referencia: ${p.src.split('/').pop()}</p>
                </div>
            `;
            galleryGrid.appendChild(card);
        });
    }

    function isPointInPolygon(point, layer) {
        if (typeof layer.getBounds !== 'function') return false;
        const bounds = layer.getBounds();
        if (!bounds.contains(point)) return false;

        // Accurate check for complex polygons
        const lat = point.lat, lng = point.lng;
        const coords = layer.feature.geometry.coordinates[0]; // Assuming simple polygon
        let inside = false;
        for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
            const xi = coords[i][0], yi = coords[i][1];
            const xj = coords[j][0], yj = coords[j][1];
            const intersect = ((yi > lat) != (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    function renderCharts(data) {
        new Chart(document.getElementById('pieChart'), {
            type: 'doughnut',
            data: {
                labels: ['Vendidos', 'Disponibles'],
                datasets: [{ data: [data.totalSold, data.totalAvailable], backgroundColor: ['#e31a1c', '#34a02c'] }]
            },
            options: { maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom' } } }
        });

        new Chart(document.getElementById('barChart'), {
            type: 'bar',
            data: {
                labels: ['Ventas Reales', 'Inventario Remanente'],
                datasets: [{ label: 'M CLP', data: [data.soldVal / 1000000, data.availableVal / 1000000], backgroundColor: ['#2c3e50', '#34a02c'] }]
            },
            options: { maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });

        new Chart(document.getElementById('lineChart'), {
            type: 'line',
            data: {
                labels: ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'],
                datasets: [{ label: 'Lotes Vendidos', data: [3, 5, 2, 8, 12, 4], borderColor: '#34a02c', backgroundColor: 'rgba(52, 160, 44, 0.1)', fill: true }]
            },
            options: { maintainAspectRatio: false }
        });
    }

    // 7. Financial Reports Logic - Connected to Google Sheets
    let financialData = [
        // Demo data as fallback
        { lote: 1, monto: 45000000, fecha: '2025-01-15', vendedor: 'Juan', formaPago: 'Contado', comision: 1350000 },
        { lote: 2, monto: 48000000, fecha: '2025-01-20', vendedor: 'Maria', formaPago: 'Crédito', comision: 1440000 },
        { lote: 4, monto: 52000000, fecha: '2025-01-10', vendedor: 'Juan', formaPago: 'Contado', comision: 1560000 },
        { lote: 6, monto: 46000000, fecha: '2024-12-05', vendedor: 'Maria', formaPago: 'Crédito', comision: 1380000 },
        { lote: 7, monto: 45000000, fecha: '2024-11-15', vendedor: 'Juan', formaPago: 'Contado', comision: 1350000 },
        { lote: 8, monto: 45000000, fecha: '2024-10-20', vendedor: 'Roberto', formaPago: 'Contado', comision: 1350000 },
        { lote: 9, monto: 48000000, fecha: '2024-09-10', vendedor: 'Maria', formaPago: 'Financiamiento', comision: 1440000 }
    ];

    const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vROP5L5W7TSq8MD4icrICDwmQit8eFknmDDmct10u1_IEzp42dwyrUIm8-zzAGKcQ/pub?output=csv';

    // Load data from Google Sheets
    async function loadGoogleSheetsData() {
        try {
            console.log('📊 Cargando datos desde Google Sheets...');
            const response = await fetch(CSV_URL);
            if (!response.ok) throw new Error('HTTP ' + response.status);

            const csvText = await response.text();
            const lines = csvText.split(/\r?\n/).filter(l => l.trim());
            if (lines.length < 2) return false;

            const headers = lines[0].split(',').map(h => h.trim());

            const parseDate = (str) => {
                if (!str) return '';
                str = str.trim();
                if (str.includes('/')) {
                    const parts = str.split('/');
                    if (parts.length === 3) {
                        let day = parts[0].padStart(2, '0');
                        let month = parts[1].padStart(2, '0');
                        let year = parts[2];
                        if (year.length === 2) year = '20' + year;
                        return `${year}-${month}-${day}`;
                    }
                }
                return str;
            };

            const cleanPrice = (val) => {
                if (!val) return 0;
                return parseInt(String(val).replace(/[^0-9]/g, '')) || 0;
            };

            const newData = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                if (values.length < headers.length) continue;

                const lote = values[headers.indexOf('Id')] || '?';
                const monto = cleanPrice(values[headers.indexOf('valor_total')]);
                const fecha = parseDate(values[headers.indexOf('fecha_venta')]);
                const vendedor = values[headers.indexOf('vendedor')] || 'Sin asignar';
                const formaPago = values[headers.indexOf('forma_pago')] || 'No especificada';
                const comision = cleanPrice(values[headers.indexOf('comision')]);

                if (monto > 0 && fecha) {
                    newData.push({ lote, monto, fecha, vendedor, formaPago, comision });
                }
            }

            if (newData.length > 0) {
                financialData = newData.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                console.log('✅ Datos cargados:', financialData.length, 'registros');
                return true;
            }
            return false;
        } catch (e) {
            console.warn('⚠️ No se pudieron cargar datos de Google Sheets:', e.message);
            console.log('📋 Usando datos de demostración');
            return false;
        }
    }

    async function renderFinancialReports() {
        const tbody = document.getElementById('fin-table-body');

        // Try to load fresh data from Google Sheets
        await loadGoogleSheetsData();

        const yearFilter = document.getElementById('fin-year').value;
        const monthFilter = document.getElementById('fin-month').value;

        const filtered = financialData.filter(d => {
            const dDate = new Date(d.fecha);
            const matchesYear = dDate.getFullYear().toString() === yearFilter;
            const matchesMonth = monthFilter === 'all' || dDate.getMonth().toString() === monthFilter;
            return matchesYear && matchesMonth;
        });

        // Update Stats
        const totalIncome = filtered.reduce((acc, curr) => acc + curr.monto, 0);
        const totalCommissions = filtered.reduce((acc, curr) => acc + curr.comision, 0);
        const netMargin = totalIncome - totalCommissions;

        document.getElementById('fin-total-income').innerText = '$ ' + totalIncome.toLocaleString('es-CL');
        document.getElementById('fin-total-sold').innerText = filtered.length;
        document.getElementById('fin-total-commissions').innerText = '$ ' + totalCommissions.toLocaleString('es-CL');
        document.getElementById('fin-net-margin').innerText = '$ ' + netMargin.toLocaleString('es-CL');

        // Render Table
        tbody.innerHTML = filtered.map(d => `
            <tr>
                <td style="padding: 6px; font-size: 0.85em;">${d.fecha}</td>
                <td style="padding: 6px; font-size: 0.85em;">Lote ${d.lote}</td>
                <td style="padding: 6px; font-size: 0.85em;">${d.vendedor || 'Sin asignar'}</td>
                <td style="padding: 6px; font-size: 0.85em;">${d.formaPago}</td>
                <td style="padding: 6px; text-align: right; font-size: 0.85em;">$ ${d.monto.toLocaleString('es-CL')}</td>
            </tr>
        `).join('');

        // Render Chart
        const ctx = document.getElementById('finLineChart').getContext('2d');
        if (window.finChart) window.finChart.destroy();

        // Group by month for chart
        const monthlyData = {};
        filtered.forEach(d => {
            const m = d.fecha.substring(0, 7);
            monthlyData[m] = (monthlyData[m] || 0) + d.monto;
        });

        const labels = Object.keys(monthlyData).sort();
        const values = labels.map(l => monthlyData[l] / 1000000);

        window.finChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Ventas Mensuales (M CLP)',
                    data: values,
                    borderColor: '#2c3e50',
                    backgroundColor: 'rgba(44, 62, 80, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Filters Listeners
    document.getElementById('fin-year').onchange = renderFinancialReports;
    document.getElementById('fin-month').onchange = renderFinancialReports;

    // Export Logic
    document.getElementById('btn-export-excel').onclick = () => {
        const ws = XLSX.utils.json_to_sheet(financialData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Ventas");
        XLSX.writeFile(wb, "Informe_Financiero_Copihue.xlsx");
    };

    document.getElementById('btn-export-pdf').onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Resumen Financiero - Hacienda El Copihue", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Generado el: " + new Date().toLocaleDateString(), 14, 30);

        const data = financialData.map(d => [d.fecha, "Lote " + d.lote, d.vendedor || 'N/A', "$ " + d.monto.toLocaleString('es-CL')]);

        doc.autoTable({
            head: [['Fecha', 'Inmueble', 'Asesor', 'Monto']],
            body: data,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80] }
        });

        doc.save("Informe_Financiero.pdf");
    };
}
