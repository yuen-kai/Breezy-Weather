// Function to convert temperature to a 1-5 scale using cutoffs array
// Placeholder function to get cutoff arrays
function getCutoffArray(type: string): number[] {
    switch (type) {
        case 'temperature':
            return [0, 10, 20, 30, 40];
        case 'wind':
            return [5, 10, 20];
        case 'humidity':
            return [30, 60, 90];
        default:
            throw new Error('Unknown type');
    }
}

function convertToScale(value: number, type: string): number {
    const cutoffs = getCutoffArray(type);
    for (let i = 0; i < cutoffs.length; i++) {
        if (value <= cutoffs[i]) return i + 1;
    }
    return cutoffs.length + 1;
}

export default convertToScale;