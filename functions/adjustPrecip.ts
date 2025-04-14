export function adjustHourPrecipProb(hour: any): number {
  if (!hour) return 0;

  if (hour.chance_of_rain == 0 && hour.condition.code > 1062) {
    // Possible/patchy conditions - increase by 10%
    if (
      hour.condition.text.toLowerCase().includes("patchy") ||
      hour.condition.text.toLowerCase().includes("possible") ||
      hour.condition.text.toLowerCase().includes("at times")
    ) {
      return 10;
    }
    // Definite conditions - increase by 20%
    return 20;
  }
  return hour.chance_of_rain;
}

export function adjustHourPrecip(hour: any): number {
  if (!hour) return 0;
  if (hour.condition.code > 1062 && hour.precip_in === 0) {
    // Set minimum precipitation amount based on condition severity
    if (
      [
        1030, 1063, 1066, 1069, 1072, 1150, 1153, 1180, 1183, 1198, 1204, 1210, 1213, 1240, 1249,
        1255, 1261, 1273, 1279,
      ].includes(hour.condition.code)
    ) {
      return 0.05; // Very light precipitation
    } else if (
      [1186, 1189, 1201, 1207, 1216, 1219, 1243, 1252, 1258, 1264, 1276, 1282, 1114].includes(
        hour.condition.code
      )
    ) {
      return 0.1; // Light precipitation
    } else if ([1171, 1192, 1195, 1246, 1222, 1225, 1117].includes(hour.condition.code)) {
      return 0.2; // Moderate to heavy precipitation
    } else {
      console.log(hour.condition.code + " not sorted");
      return 0;
    }
  }
  return hour.precip_in;
}
