import { ImageSource } from "expo-image";

export interface ClothingItem {
    name: string;
    temperatureRange: [number, number];
    image: string | number
    tint?: boolean
}


export const defaultClothingItems: ClothingItem[] = [
    { name: 'Double Coat + Gloves', temperatureRange: [-999, 15], image: require("../assets/clothing/doublecoat-gloves.png"), tint: true },
    { name: 'Double Coat', temperatureRange: [15, 35], image: require("../assets/clothing/doublecoat.png"), tint: true },
    { name: 'Coat + Sweater', temperatureRange: [35, 45], image: require("../assets/clothing/coat-sweater.png"), tint: true },
    { name: 'Coat', temperatureRange: [45, 55], image: require("../assets/clothing/coat.png"), tint: true },
    { name: 'Sweater', temperatureRange: [55, 65], image: require("../assets/clothing/light-jacket.png"), tint: true },
    { name: 'T-Shirt', temperatureRange: [65, 999], image: require("../assets/clothing/tshirt.png"), tint: true },
]