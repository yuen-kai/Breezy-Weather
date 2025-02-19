export interface Cutoffs {
    "Temp": number[];
    "Wind": number[];
    "Precip Prob": number[];
    "Precip Inches": number[];
    "Humidity": number[];
    "Uv": number[];
    "Visibility": number[];
    "Cloud Cover": number[];
}


export const defaultCutoffs: Cutoffs = {
    "Temp": [15, 30, 45, 60, 999],
    "Wind": [8, 16, 999],
    "Precip Prob": [20, 50, 999],
    "Precip Inches": [0.1, 0.3, 999],
    "Humidity": [50, 70, 999],
    "Uv": [2, 5, 999],
    "Visibility": [1, 3, 999],
    "Cloud Cover": [20, 50, 999]
}