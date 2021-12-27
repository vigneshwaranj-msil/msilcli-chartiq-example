import { saveLayout } from "@msf/msf-charts-helper/dist/utils/chartiq";
import { localStore, Store } from "./store";

export function restoreLayout(stx: any, store: Store) {
	let layout: any = Object.freeze(store.layout);
	stx.importLayout(layout, {
		cb: () => afterRestoringLayout(stx, store)
	});
}

function afterRestoringLayout(stx: any, store: Store) {
	restoreDrawings(stx, store);
}

export function restoreDrawings(stx: any, store: Store) {
	let drawings: any = Object.freeze(store.drawings || {});
	stx.importDrawings(drawings);
}

export function saveChartLayout({ stx }: any): void {
	let layout: any = stx.exportLayout();
	layout = saveLayout(stx, layout);
	localStore.set("layout", Object.freeze(layout));
}

export function savePreferences({ stx }: any): void {
	let preferences: any = stx.exportPreferences();
	localStore.set("preferences", preferences);
}

export function saveDrawings({ stx }: any): void {
	let drawings: any = stx.exportDrawings();
	localStore.set("drawings", drawings);
}
