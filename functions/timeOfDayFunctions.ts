import { TimeOfDay, TimeOfDaySetting } from "@/types/timeOfDay";

export function checkIfInTimeOfDay(time: Date, day: number, timeOfDaySettings: TimeOfDaySetting[], timeOfDay: TimeOfDay[]): boolean {
    
    const h = time.getHours();
	const curr = new Date().getHours();

	return (
		(day === 0 ? h >= curr : true) &&
		timeOfDaySettings.some(
			(setting) => timeOfDay.includes(setting.label) && h >= setting.start && h < setting.end
		)
	);
}
