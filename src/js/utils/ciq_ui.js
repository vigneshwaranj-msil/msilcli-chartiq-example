import { saveLayout } from "@msf/msf-charts-helper/dist/utils/chartiq";
import { localStore } from "./store";
export function restoreLayout(stx, store) {
    let layout = Object.freeze(store.layout);
    stx.importLayout(layout, {
        cb: () => afterRestoringLayout(stx, store)
    });
}
function afterRestoringLayout(stx, store) {
    restoreDrawings(stx, store);
}
export function restoreDrawings(stx, store) {
    let drawings = Object.freeze(store.drawings || {});
    stx.importDrawings(drawings);
}
export function saveChartLayout({ stx }) {
    let layout = stx.exportLayout();
    layout = saveLayout(stx, layout);
    localStore.set("layout", Object.freeze(layout));
}
export function savePreferences({ stx }) {
    let preferences = stx.exportPreferences();
    localStore.set("preferences", preferences);
}
export function saveDrawings({ stx }) {
    let drawings = stx.exportDrawings();
    localStore.set("drawings", drawings);
}
