// Function to convert temperature to a 1-5 scale using cutoffs array
// Placeholder function to get cutoff arrays
import {UnitType} from './store/settingsStore';

function getCutoffArray(type: string): number[] {
    switch (type) {
        case 'temp':
            return [30, 50, 70, 90, 999];
        case 'wind':
            return [10, 20, 999];
        case 'humidity':
            return [50, 70, 999];
        default:
            throw new Error('Unknown type');
    }
}

function convertToScale(value: number, type: string): number {
    const cutoffs = getCutoffArray(type);
    for (let i = 0; i < cutoffs.length; i++) {
        if (value <= cutoffs[i]) return i;
    }
    return cutoffs.length;
}

export default convertToScale;