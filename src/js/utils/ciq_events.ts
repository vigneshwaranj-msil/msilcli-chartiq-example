import { saveChartLayout, saveDrawings, savePreferences } from "./ciq_ui";
import { localStore, previousStore } from "./store";

interface EventHandler {
	longHold: Function;
	scroll: Function;
	layout: Function;
	drawing: Function;
	preferences: Function;
	newChart: Function;
	theme: Function;
	symbolChange: Function;
}
let chartEvents: EventHandler = {} as EventHandler;

export function initChartEvents(stx: any) {
	chartEvents.longHold = stx.addEventListener(
		"longhold",
		longHoldEventHandler
	);
	chartEvents.scroll = stx.addEventListener("scroll", handleChartScrollEvent);
	chartEvents.layout = stx.addEventListener("layout", saveChartLayout);
	chartEvents.drawing = stx.addEventListener("drawing", saveDrawings);
	chartEvents.preferences = stx.addEventListener(
		"preferences",
		savePreferences
	);
	chartEvents.newChart = stx.addEventListener("newChart", newChartHandler);
	chartEvents.theme = stx.addEventListener("theme", changeTheme);
	chartEvents.symbolChange = stx.addEventListener(
		"symbolChange",
		handleChartSymbolChange
	);
}

export function removeChartEvents(stx: any) {
	Object.keys(chartEvents).forEach((event: string) => {
		stx.removeEventListener(event, (<any>chartEvents)[event]);
	});
}

function longHoldEventHandler({ stx }: any) {
	//long pressed on charts
}

function handleChartScrollEvent({ stx }: any) {
	if (stx && stx.chart && stx.chart.scroll <= 0) {
		stx.chart.scroll = 1;
		stx.draw();
	}
}

function newChartHandler({ stx }: any) {}

function changeTheme({ stx }: any) {
	localStore.set("theme", previousStore().theme === "day" ? "night" : "day");
}

function handleChartSymbolChange({ stx, symbol }: any) {
	console.log(`${symbol} Changed`);
}
