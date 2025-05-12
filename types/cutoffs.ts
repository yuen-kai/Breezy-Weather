export interface Cutoffs {
    "Temp": [number, number, number, number, number];
    "Wind": [number, number, number];
    "Precip Prob": [number, number, number];
    "Precip Inches": [number, number, number];
    "Humidity": [number, number, number];
    "Uv": [number, number, number];
    "Visibility": [number, number, number];
    "Cloud Cover": [number, number, number];
}


export const defaultCutoffs: Cutoffs = {
    "Temp": [40, 50, 60, 70, 999],
    "Wind": [8, 16, 999],
    "Precip Prob": [20, 50, 999],
    "Precip Inches": [0.1, 0.3, 999],
    "Humidity": [50, 70, 999],
    "Uv": [2, 5, 999],
    "Visibility": [1, 3, 999],
    "Cloud Cover": [20, 50, 999]
}