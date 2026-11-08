// Initialize the map and set its center to Riyadh
const map = L.map('map').setView([24.7136, 46.6950], 12); // Riyadh center coordinates

// Add tile layer (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Metro lines data
const lines = [
    {
        name: "1(Blue)",
        color: "#0099ff",
        stations: [
            { name: "SAB Bank", coords: [24.829440, 46.616779] },
            { name: "DR SULAIMAN AL HABIB", coords: [24.811533, 46.625697] },
            { name: "KAFD", coords: [24.767090, 46.643279] },
            { name: "Al Murooj", coords: [24.754548, 46.654426] },
            { name: "King Fahad District", coords: [24.745264, 46.659094] },
            { name: "King Fahad District 2", coords: [24.736596, 46.663478] },
            { name: "stc", coords: [24.728555, 46.665886] },
            { name: "Al Wurud 2", coords: [24.721107, 46.671293] },
            { name: "Al Urubah", coords: [24.713387, 46.675198] },
            { name: "Alinmaa Bank", coords: [24.703045, 46.680433] },
            { name: "Bank Albilad", coords: [24.696645, 46.683675] },
            { name: "King Fahad Library", coords: [24.690113, 46.687004] },
            { name: "Ministry of Interior", coords: [24.674441, 46.694893] },
            { name: "Al Muorabba", coords: [24.664870, 46.702300] },
            { name: "Passport Department", coords: [24.659823, 46.704230] },
            { name: "National Museum", coords: [24.645279, 46.713168] },
            { name: "Al Bat'ha", coords: [24.637092, 46.714764] },
            { name: "Al Owd", coords: [24.625617, 46.721388] },
            { name: "Skirinah", coords: [24.617866, 46.725277] },
            { name: "Manfouhah", coords: [24.610564, 46.727578] },
            { name: "Al Iman Hospital", coords: [24.600626, 46.735739] },
            { name: "Transportation Center", coords: [24.598269, 46.745133] },
            { name: "Al Aziziah", coords: [24.587297, 46.760843] },
            { name: "Ad Dar Al Baida", coords: [24.560042, 46.776316] }
        ]
    },
    {
        name: "2(Red)",
        color: "red",
        stations: [
            { name: "King Saud University", coords: [24.710286, 46.628371] },
            { name: "King Salman Oasis", coords: [24.716992, 46.638606] },
            { name: "KACST", coords: [24.721049, 46.648113] },
            { name: "At Takhassussi", coords: [24.723812, 46.654616] },
            { name: "stc", coords: [24.728555, 46.665886] },
            { name: "Al Wurud", coords: [24.733289, 46.677080] },
            { name: "King Abdulaziz Road", coords: [24.736798, 46.685465] },
            { name: "Ministry of Education", coords: [24.740224, 46.694800] },
            { name: "An Nuzhah", coords: [24.748123, 46.712286] },
            { name: "Riyadh Exhibition Center", coords: [24.754568, 46.727096] },
            { name: "Khalid Bin Alwaleed Road", coords: [24.767750, 46.759092] },
            { name: "Al Hamra", coords: [24.775974, 46.776687] },
            { name: "Al Khaleej", coords: [24.782204, 46.794416] },
            { name: "Ishbiliyah", coords: [24.792422, 46.811055] },
            { name: "King Fahad Sport City", coords: [24.793150, 46.836565] }  
        ]
    },
    {
        name: "3(Orange)",
        color: "orange",
        stations: [
            { name: "Jeddah Road", coords: [24.591475, 46.543510] },
            { name: "Tuwaiq", coords: [24.585512, 46.559717] },
            { name: "Ad Douh", coords: [24.582634, 46.588326] },
            { name: "Dhahrat Al Badiah", coords: [24.606740, 46.653829] },
            { name: "Al Jarradiyah", coords: [24.618329, 46.697555] },
            { name: "Al Hilla", coords: [24.632294, 46.721881] },
            { name: "First Industrial City", coords: [24.644934, 46.739164] },
            { name: "Harun Ar Rashid Road", coords: [24.686119, 46.795896] },
            { name: "An Naseem", coords: [24.700659, 46.827386] }
        ]
    },
    {
        name: "4(Yellow)",
        color: "yellow",
        stations: [
            { name: "KAFD", coords: [24.767090, 46.643279] },
            { name: "Ar Rabi", coords: [24.786226, 46.660137] },
            { name: "Uthman Bin Affan Road", coords: [24.801411, 46.696167] },
            { name: "SABIC", coords: [24.807135, 46.709602] },
            { name: "PNU1", coords: [24.841544, 46.717402] },
            { name: "PNU2", coords: [24.860143, 46.703082] },
            { name: "Airport T5", coords: [24.941025, 46.710903] },
            { name: "Airport T3-4", coords: [24.956129, 46.702169] },
            { name: "Airport T1-2", coords: [24.961011, 46.699047] }
        ]
    },
    {
        name: "5(Green)",
        color: "green",
        stations: [
            { name: "Ministry of Education", coords: [24.740224, 46.694800] },
            { name: "King Salman Park", coords: [24.728246, 46.701039] },
            { name: "As Sulimaniyah", coords: [24.712847, 46.700403] },
            { name: "Ad Dhabab", coords: [24.709762, 46.707626] },
            { name: "Abu Dhabi square", coords: [24.706097, 46.716527] },
            { name: "Officers Club", coords: [24.697884, 46.717966] },
            { name: "GOSI", coords: [24.686272, 46.718199] },
            { name: "Al Wizarat", coords: [24.676019, 46.718405] },
            { name: "Ministry of Defence", coords: [24.667993, 46.718280] },
            { name: "King Abdulaziz Hospital", coords: [24.659674, 46.717714] },
            { name: "Ministry of Finance", coords: [24.652112, 46.716322] },
            { name: "National Museum", coords: [24.645279, 46.713168] }
        ]
    },
    {
        name: "6(Purple)",
        color: "purple",
        stations: [
            { name: "KAFD", coords: [24.767090, 46.643279] },
            { name: "Ar Rabi", coords: [24.786226, 46.660137] },
            { name: "Uthman Bin Affan Road", coords: [24.801411, 46.696167] },
            { name: "SABIC", coords: [24.807135, 46.709602] },
            { name: "Grandia", coords: [24.786547, 46.729330] },
            { name: "Al Yarmuk", coords: [24.791301, 46.766330] },
            { name: "Al Hamra", coords: [24.775974, 46.776687] },
            { name: "Al Andalus", coords: [24.756792, 46.790330] },
            { name: "Khurais Road", coords: [24.740713, 46.798769] },
            { name: "As Salam", coords: [24.722730, 46.811266] },
            { name: "An Naseem", coords: [24.700659, 46.827386] }  
        ]
    }
    
];
function getLinesForStation(stationName) {
    const matchingLines = lines.filter((line) =>
        line.stations.some((station) => station.name === stationName)
    );
    return matchingLines.map((line) => line.name); // Return an array of line names
}

const customIcon = L.icon({
    iconUrl: 'photo/metro-icon.jpg', // Replace with your icon file's path
    iconSize: [18, 18], // Size of the icon [width, height]
    iconAnchor: [10, 10], // Point of the icon that corresponds to the marker's location
    popupAnchor: [0, -32] // Offset of the popup relative to the icon
});
// Add lines and stations to the map
lines.forEach((line) => {
    // Add polyline for the metro line
    const lineCoords = line.stations.map((station) => station.coords);
    L.polyline(lineCoords, { color: line.color, weight: 4 }).addTo(map);

    // Add markers for each station
    line.stations.forEach((station) => {
         // Get all lines for the station
        const stationLines = getLinesForStation(station.name);
        const marker = L.marker(station.coords, {icon: customIcon}).addTo(map);
        marker.bindPopup(`<b>${station.name}</b><button onclick="goToStationInfo('${station.name}')" style="margin-top: 5px; background: none; border: none; cursor: pointer;">
        <img src="photo/!-icon.png" alt="Info" style="width: 15px; height: 15px;"/></button><br><strong>Lines:</strong> ${stationLines.join(", ")}`);
    });
});
function goToStationInfo(stationName) {
    // Get the lines for the station
    const stationLines = getLinesForStation(stationName);

    // Assuming you want to redirect based on the first line (or you can choose another strategy for multiple lines)
    const lineName = stationLines[0]; // Convert line name to lowercase to match page filenames

    // Redirect to the corresponding page based on the line
    switch (lineName) {
        case '1(Blue)':
            window.location.href = `Stations.html`;
            break;
        case '3(Orange)':
            window.location.href = `Stations.html`;
            break;
        case '5(Green)':
            window.location.href = `Stations.html`;
            break;
        case '6(Purple)':
            window.location.href = `Stations.html`;
            break;
        case '4(Yellow)':
            window.location.href = `Stations.html`;
            break;
        case '2(Red)':
            window.location.href = `Stations.html`;
            break;
        default:
            console.log('Line not found for station.');
            break;
    }
}

// Station data for each line
const lineStations = {
    line1: ["SAB Bank", "DR SULAIMAN AL HABIB", "KAFD", "Al Murooj", "King Fahad District", "King Fahad District 2", "stc", "Al Wurud 2", "Al Urubah", "Alinmaa Bank", "Bank Albilad", "King Fahad Library", "Ministry of Interior", "Al Muorabba", "Passport Department", "National Museum", "Al Bat'ha", "Al Owd", "Skirinah", "Manfouhah", "Al Iman Hospital", "Transportation Center", "Al Aziziah", "Ad Dar Al Baida"],
    line2: ["King Saud University", "King Salman Oasis", "KACST", "At Takhassussi", "stc", "Al Wurud", "King Abdulaziz Road", "Ministry of Education", "An Nuzhah", "Riyadh Exhibition Center", "Khalid Bin Alwaleed Road", "Al Hamra", "Al Khaleej", "Ishbiliyah", "King Fahad Sport City"],
    line3: ["Jeddah Road", "Tuwaiq", "Ad Douh", "Dhahrat Al Badiah", "Al Jarradiyah", "Al Hilla", "First Industrial City", "Harun Ar Rashid Road", "An Naseem"],
    line4: ["KAFD", "Ar Rabi", "Uthman Bin Affan Road", "SABIC", "PNU1", "PNU2", "Airport T5", "Airport T3-4", "Airport T1-2"],
    line5: ["Ministry of Education", "King Salman Park", "As Sulimaniyah", "Ad Dhabab", "Abu Dhabi square", "Officers Club", "GOSI", "Al Wizarat", "Ministry of Defence", "King Abdulaziz Hospital", "Ministry of Finance", "National Museum"],
    line6: ["KAFD", "Ar Rabi", "Uthman Bin Affan Road", "SABIC", "Grandia", "Al Yarmuk", "Al Hamra", "Al Andalus", "Khurais Road", "As Salam", "An Naseem"]
};

// Function to populate station options based on selected line
function populateStations(lineSelectId, stationSelectId) {
    const lineSelect = document.getElementById(lineSelectId);
    const stationSelect = document.getElementById(stationSelectId);

    lineSelect.addEventListener("change", () => {
        const selectedLine = lineSelect.value;

        // Clear existing station options
        stationSelect.innerHTML = '<option value="" disabled selected>Select a station</option>';

        // Enable the station select dropdown
        stationSelect.disabled = false;

        // Add new station options
        lineStations[selectedLine].forEach((station) => {
            const option = document.createElement("option");
            option.value = station;
            option.textContent = station;
            stationSelect.appendChild(option);
        });
    });
}

// Call the function for both departure and destination
populateStations("departure-line", "departure");
populateStations("destination-line", "destination");


document.getElementById('reset-trip').addEventListener('click', () => {
    location.reload();
});


const stationCoordinates = {
    "SAB Bank": [24.829440, 46.616779],
    "DR SULAIMAN AL HABIB": [24.811533, 46.625697],
    "KAFD": [24.767090, 46.643279],
    "Al Murooj": [24.754548, 46.654426],
    "King Fahad District": [24.745264, 46.659094],
    "King Fahad District 2": [24.736596, 46.663478],
    "stc": [24.728555, 46.665886],
    "Al Wurud 2": [24.721107, 46.671293],
    "Al Urubah": [24.713387, 46.675198],
    "Alinmaa Bank": [24.703045, 46.680433],
    "Bank Albilad": [24.696645, 46.683675],
    "King Fahad Library": [24.690113, 46.687004],
    "Ministry of Interior": [24.674441, 46.694893],
    "Al Muorabba": [24.664870, 46.702300],
    "Passport Department": [24.659823, 46.704230],
    "National Museum": [24.645279, 46.713168],
    "Al Bat'ha": [24.637092, 46.714764],
    "Al Owd": [24.625617, 46.721388],
    "Skirinah": [24.617866, 46.725277],
    "Manfouhah": [24.610564, 46.727578],
    "Al Iman Hospital": [24.600626, 46.735739],
    "Transportation Center": [24.598269, 46.745133],
    "Al Aziziah": [24.587297, 46.760843],
    "Ad Dar Al Baida": [24.560042, 46.776316],
    "King Saud University": [24.710286, 46.628371],
    "King Salman Oasis": [24.716992, 46.638606],
    "KACST": [24.721049, 46.648113],
    "At Takhassussi": [24.723812, 46.654616],
    "Al Wurud": [24.733289, 46.677080],
    "King Abdulaziz Road": [24.736798, 46.685465],
    "Ministry of Education": [24.740224, 46.694800],
    "An Nuzhah": [24.748123, 46.712286],
    "Riyadh Exhibition Center": [24.754568, 46.727096],
    "Khalid Bin Alwaleed Road": [24.767750, 46.759092],
    "Al Hamra": [24.775974, 46.776687],
    "Al Khaleej": [24.782204, 46.794416],
    "Ishbiliyah": [24.792422, 46.811055],
    "King Fahad Sport City": [24.793150, 46.836565],  
    "Jeddah Road": [24.591475, 46.543510],
    "Tuwaiq": [24.585512, 46.559717],
    "Ad Douh": [24.582634, 46.588326],
    "Dhahrat Al Badiah": [24.606740, 46.653829],
    "Al Jarradiyah": [24.618329, 46.697555],
    "Al Hilla": [24.632294, 46.721881],
    "First Industrial City": [24.644934, 46.739164],
    "Harun Ar Rashid Road": [24.686119, 46.795896],
    "An Naseem": [24.700659, 46.827386],  
    "Ar Rabi": [24.786226, 46.660137],
    "Uthman Bin Affan Road": [24.801411, 46.696167],
    "SABIC": [24.807135, 46.709602],
    "PNU1": [24.841544, 46.717402],
    "PNU2": [24.860143, 46.703082],
    "Airport T5": [24.941025, 46.710903],
    "Airport T3-4": [24.956129, 46.702169],
    "Airport T1-2": [24.961011, 46.699047],
    "King Salman Park": [24.728246, 46.701039],
    "As Sulimaniyah": [24.712847, 46.700403],
    "Ad Dhabab": [24.709762, 46.707626],
    "Abu Dhabi square": [24.706097, 46.716527],
    "Officers Club": [24.697884, 46.717966],
    "GOSI": [24.686272, 46.718199],
    "Al Wizarat": [24.676019, 46.718405],
    "Ministry of Defence": [24.667993, 46.718280],
    "King Abdulaziz Hospital": [24.659674, 46.717714],
    "Ministry of Finance": [24.652112, 46.716322],
    "Grandia": [24.786547, 46.729330],
    "Al Yarmuk": [24.791301, 46.766330],
    "Al Andalus": [24.756792, 46.790330],
    "Khurais Road": [24.740713, 46.798769],
    "As Salam": [24.722730, 46.811266] 
};

function getStationsBetween(line, departure, destination) {
    const stations = lineStations[line];
    const startIndex = stations.indexOf(departure);
    const endIndex = stations.indexOf(destination);

    if (startIndex === -1 || endIndex === -1) {
        return [];
    }

    // Return stations in order (either forward or reverse)
    if (startIndex < endIndex) {
        return stations.slice(startIndex, endIndex + 1);
    } else {
        return stations.slice(endIndex, startIndex + 1).reverse();
    }
}

function drawMultiLinePath(path) {
    if (!path || !path.segments) {
        alert("No valid path found.");
        return;
    }

    path.segments.forEach((segment) => {
        const pathCoordinates = segment.stations.map((station) => stationCoordinates[station]);

        // Add markers for each station
        segment.stations.forEach((station) => {
            const coords = stationCoordinates[station];
            if (coords) {
                L.marker(coords).addTo(map).bindPopup(`${station} (${segment.line.toUpperCase()})`);
            }
        });

        // Draw a polyline for this segment
        L.polyline(pathCoordinates, {
            color: getLineColor(segment.line),
            weight: 4
        }).addTo(map);
    });

    // Zoom the map to fit the entire trip
    const allCoords = path.segments.flatMap((segment) =>
        segment.stations.map((station) => stationCoordinates[station])
    );
    map.fitBounds(L.latLngBounds(allCoords));
}


// Helper function to get line colors
function getLineColor(line) {
    const colors = {
        line1: "#0099ff", //blue
        line2: "red",
        line3: "orange",
        line4: "yellow",
        line5: "green",
        line6: "purple"
    };
    return colors[line] || "black";
}

const transferStations = {
    "KAFD": ["line1", "line4", "line6"],
    "stc": ["line1", "line2"],
    "National Museum": ["line1", "line5"],
    "Ministry of Education": ["line2", "line5"],
    "An Naseem": ["line3", "line6"],
    "Al Hamra": ["line2", "line6"],
    "Ar Rabi": ["line4", "line6"],
    "Uthman Bin Affan Road": ["line4", "line6"],
    "SABIC": ["line4", "line6"]
};

function findPath(departureLine, departureStation, destinationLine, destinationStation) {
    const visited = new Set();
    const queue = [
        { currentStation: departureStation, currentLine: departureLine, path: [] }
    ];

    while (queue.length > 0) {
        const { currentStation, currentLine, path } = queue.shift();

        // Add station to visited set
        const key = `${currentStation}-${currentLine}`;
        if (visited.has(key)) continue;
        visited.add(key);

        // Add current station to path
        const newPath = [...path, { line: currentLine, station: currentStation }];

        // Check if we reached the destination
        if (currentStation === destinationStation && currentLine === destinationLine) {
            const segments = [];
            let lastLine = null;
            let segment = [];
            newPath.forEach(({ line, station }) => {
                if (line !== lastLine) {
                    if (segment.length > 0) {
                        segments.push({ line: lastLine, stations: segment });
                    }
                    segment = [];
                }
                segment.push(station);
                lastLine = line;
            });
            if (segment.length > 0) {
                segments.push({ line: lastLine, stations: segment });
            }
            return { segments };
        }

        // Explore neighboring stations on the same line
        const currentLineStations = lineStations[currentLine];
        const index = currentLineStations.indexOf(currentStation);
        if (index > 0) {
            queue.push({
                currentStation: currentLineStations[index - 1],
                currentLine,
                path: newPath
            });
        }
        if (index < currentLineStations.length - 1) {
            queue.push({
                currentStation: currentLineStations[index + 1],
                currentLine,
                path: newPath
            });
        }

        // Explore transfer stations
        if (transferStations[currentStation]) {
            transferStations[currentStation].forEach((line) => {
                if (line !== currentLine) {
                    queue.push({
                        currentStation,
                        currentLine: line,
                        path: newPath
                    });
                }
            });
        }
    }

    alert("No valid path found between these stations.");
    return null;
}


document.getElementById("plan-trip").addEventListener("click", () => {
    const departureLine = document.getElementById("departure-line").value;
    const departureStation = document.getElementById("departure").value;
    const destinationLine = document.getElementById("destination-line").value;
    const destinationStation = document.getElementById("destination").value;

    // Validate selections
    if (!departureLine || !departureStation || !destinationLine || !destinationStation) {
        alert("Please select all fields before planning your trip.");
        return;
    }

    // Find the path
    const path = findPath(departureLine, departureStation, destinationLine, destinationStation);

    // Draw the path
    drawMultiLinePath(path);
});


// Get the Info Button and Box Elements
const infoButton = document.getElementById('info-button');
const infoBox = document.getElementById('info-box');

// Toggle Info Box on Button Click
infoButton.addEventListener('click', () => {
    if (infoBox.style.display === 'none' || infoBox.style.display === '') {
        infoBox.style.display = 'block'; // Show the info box
    } else {
        infoBox.style.display = 'none'; // Hide the info box
    }
});