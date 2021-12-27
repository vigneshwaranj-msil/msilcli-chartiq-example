import { saveChartLayout, saveDrawings, savePreferences } from "./ciq_ui";
import { localStore, previousStore } from "./store";
let chartEvents = {};
export function initChartEvents(stx) {
    chartEvents.longHold = stx.addEventListener("longhold", longHoldEventHandler);
    chartEvents.scroll = stx.addEventListener("scroll", handleChartScrollEvent);
    chartEvents.layout = stx.addEventListener("layout", saveChartLayout);
    chartEvents.drawing = stx.addEventListener("drawing", saveDrawings);
    chartEvents.preferences = stx.addEventListener("preferences", savePreferences);
    chartEvents.newChart = stx.addEventListener("newChart", newChartHandler);
    chartEvents.theme = stx.addEventListener("theme", changeTheme);
    chartEvents.symbolChange = stx.addEventListener("symbolChange", handleChartSymbolChange);
}
export function removeChartEvents(stx) {
    Object.keys(chartEvents).forEach((event) => {
        stx.removeEventListener(event, chartEvents[event]);
    });
}
function longHoldEventHandler({ stx }) {
    //long pressed on charts
}
function handleChartScrollEvent({ stx }) {
    if (stx && stx.chart && stx.chart.scroll <= 0) {
        stx.chart.scroll = 1;
        stx.draw();
    }
}
function newChartHandler({ stx }) { }
function changeTheme({ stx }) {
    localStore.set("theme", previousStore().theme === "day" ? "night" : "day");
}
function handleChartSymbolChange({ stx, symbol }) {
    console.log(`${symbol} Changed`);
}
