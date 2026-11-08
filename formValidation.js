let result = document.getElementById("result")
let price = document.getElementById("price")
let distance = document.getElementById("distance")
let discount = document.getElementById("discount")
let priceDisplayed = 0
let distanceDisplayed = 0
let discountDisplayed = 0


result.style.display = "none"
// Function to handle the form submission
function handleFormSubmit(event) {
    event.preventDefault(); // Prevent the form from submitting normally

    // Get the values of the form fields
    const from = document.getElementById('jobFrom').value;
    const to = document.getElementById('jobTo').value;

    const studentDiscount = document.getElementById('development').checked ? true : false;
    const seniorDiscount = document.getElementById('design').checked ? true : false;
    const specialNeedsDiscount = document.getElementById('business').checked ? true : false;

    discountDisplayed = 0
    if (studentDiscount) {
        discountDisplayed += 0.1
    }
    if (seniorDiscount) {
        discountDisplayed += 0.15
    }
    if (specialNeedsDiscount) {
        discountDisplayed += 0.2
    }


    // Alert the user with the gathered data
    // alert(`Form submitted!\nFrom: ${from}\nTo: ${to}\nStudent Discount: ${studentDiscount}\nSenior Discount: ${seniorDiscount}\nSpecial Needs Discount: ${specialNeedsDiscount}`);

    const metroTracks = {
        purple: ["1", "2", "3", "4", "10", "11", "12", "13", "14", "15", "16"],
        yellow: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
        blue: ["38", "39", "1", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "26", "53", "54", "55", "56", "57", "58", "59"],
        orange: ["17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "16", "36", "37"],
    };

    function getNeighbors(station, currentTrack) {
        const neighbors = new Set();

        for (const [track, stations] of Object.entries(metroTracks)) {
            const index = stations.indexOf(station);

            if (index !== -1) {
                if (index > 0) neighbors.add({ station: stations[index - 1], track });
                if (index < stations.length - 1) neighbors.add({ station: stations[index + 1], track });

                if (track !== currentTrack) {
                    stations.forEach((s) => {
                        if (s === station) {
                            neighbors.add({ station: s, track });
                        }
                    });
                }
            }
        }

        return Array.from(neighbors);
    }

    function calculateDistance(station1, station2) {
        if (station1 === station2) return 0;

        const queue = [{ station: station1, distance: 0, track: null }];
        const visited = new Set();

        while (queue.length > 0) {
            const { station: currentStation, distance, track: currentTrack } = queue.shift();

            if (currentStation === station2) {
                return distance;
            }

            const visitedKey = `${currentStation}-${currentTrack}`;
            if (visited.has(visitedKey)) continue;
            visited.add(visitedKey);

            const neighbors = getNeighbors(currentStation, currentTrack);
            neighbors.forEach(({ station, track }) => {
                const neighborKey = `${station}-${track}`;
                if (!visited.has(neighborKey)) {
                    queue.push({ station, distance: distance + 1, track });
                }
            });
        }

        return Infinity;
    }

    function calculateCost(station1, station2) {
        const distance1 = calculateDistance(station1, station2);
        distanceDisplayed = distance1
        if (distance === Infinity) return "No valid route found!";
        const costPerStation = 1;
        return distance1 * costPerStation * (1 - discountDisplayed);
    }

    const station1 = from;
    const station2 = to;

    priceDisplayed = calculateCost(station1, station2)

    result.style.display = "block"
    price.innerHTML = `Price is ${(priceDisplayed.toFixed(2))} SAR`
    distance.innerHTML = `Distance is ${distanceDisplayed}`
    discount.innerHTML = `Discount is ${Math.round(discountDisplayed * 100)}%`
}

