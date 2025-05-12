import { TimeOfDay, TimeOfDaySetting } from "@/types/timeOfDay";

function findTimeOfDaySetting(time: string, timeOfDaySettings: TimeOfDaySetting[]) {
  return (
    timeOfDaySettings.find((setting) => setting.label === time) ?? {
      label: "",
      start: 0,
      end: 0,
    }
  );
}

function filterRain(values: number[], label: string) {
  return label === "Rain" || label === "Snow" ? values.filter((val) => val > 0) : values;
}

export function getSortedTimeOfDay(
  timeOfDay: TimeOfDay[],
  timeOfDaySettings: TimeOfDaySetting[],
  day: number,
) {
  let sortedTimeOfDay = [...timeOfDay].sort((a, b) => {
    const aIndex = timeOfDaySettings.findIndex((setting) => setting.label === a);
    const bIndex = timeOfDaySettings.findIndex((setting) => setting.label === b);
    return aIndex - bIndex;
  });
  if (day == 0) {
    sortedTimeOfDay = sortedTimeOfDay.filter(
      (time) => new Date().getHours() < findTimeOfDaySetting(time, timeOfDaySettings).end
    );
  }
  return sortedTimeOfDay;
}

export function getDrasticChangeMessage(
  timeOfDaySettings: TimeOfDaySetting[],
  valuesArray: number[],
  value: number,
  cutoffs: number[],
  day: number,
  hasZeroValue: boolean = false,
  zeroText: string = "",
  getWeightedAverage: (values: number[]) => number,
  label: string,
  convertToScale: (value: number, cutoffs: number[]) => number,
  textArray: string[],
  sortedTimeOfDay: TimeOfDay[]
) {
  let counter = 0;
  let drasticChangeMessage = "";

  let minAverage = 99;
  let maxAverage = -99;

  for (const time of sortedTimeOfDay) {
    const timeOfDaySetting = findTimeOfDaySetting(time, timeOfDaySettings);
    const values = valuesArray.slice(
      counter,
      counter +
        Math.max(
          timeOfDaySetting.end -
            Math.max(timeOfDaySetting.start, day !== 0 ? 0 : new Date().getHours()),
          0
        )
    );
    const filteredValues = filterRain(values, label);
    const average = filteredValues.length > 0 ? getWeightedAverage(filteredValues) : 0;

    const scaledAverage = value == 0 && hasZeroValue ? -1 : convertToScale(average, cutoffs);
    if (scaledAverage < minAverage) minAverage = scaledAverage;
    if (scaledAverage > maxAverage) maxAverage = scaledAverage;
    drasticChangeMessage += `${timeOfDaySetting.label}: ${
      value == 0 && hasZeroValue ? zeroText : textArray[scaledAverage]
    }\n`;

    counter += timeOfDaySetting.end - timeOfDaySetting.start;
  }
  return maxAverage - minAverage < 2 ? "" : drasticChangeMessage;
}
