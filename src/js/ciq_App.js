import ChartDataManager from "@msf/msf-charts-helper";
import { convertPeriodAndIntervalToResolution } from "@msf/msf-charts-helper/dist/utils/chartiq";
import "./App.css";
import APIManager from "./feeds/ciq-apiManager";
import { fetchMarketRules } from "./market/marketFactory";
import { extractDetailsFromURL } from "./utils/url";
import { ANDROID_JS_INTERFACE_KEY, CONTAINER_ID } from "./constants";
import { previousStore } from "./utils/store";
import { restoreLayout } from "./utils/ciq_ui";
import CIQSymblSearch from "./feeds/ciq-symbolSearcher";
import { initChartEvents } from "./utils/ciq_events";
import "chartLibrary/ciq_init";
import getDefaultConfig from "chartLibrary/js/defaultConfiguration";
import { CIQ } from "chartLibrary/js/chartiq";
import responseFromExternalInterfaces from "./utils/deviceInterface";
let chartManager, urlData = extractDetailsFromURL(), hasChartLoaded = false, stxxChartEngine, apiManager = new APIManager(), UIContext, marketRules = [], symbolSearcher = new CIQSymblSearch({
    url: process.env.url.symbolSearch
});
/**
 * @method urlFactory
 * @description Returns a URL which will be used by the API requestor to fetch data from data for getting candles
 * @returns {string}
 */
function urlFactory() {
    return process.env.url.feed;
}
/**
 * @method resolutionFactory
 * @description Should return the active resolution i.e., the time difference between each candle displayed on chart
 * @example 1, 2, 3 ... 240 min which means 1min, 2min, 3min ... 4hr (or) 1D, 1W, or 1M day week or month
 * @returns {string}
 */
function resolutionFactory() {
    return stxxChartEngine ? convertPeriodAndIntervalToResolution(stxxChartEngine) : "1";
}
function rulesFactory() {
    return marketRules;
}
function loadChart(stxx, symbol, cb) {
    let layout = { ...(previousStore().layout || {}) };
    stxx.loadChart(symbol, {
        span: { ...layout.setSpan },
        periodicity: {
            period: layout.periodicity,
            interval: layout.interval,
            timeUnit: layout.timeUnit
        }
    }, function (err) {
        cb && cb();
        if (!err) {
        }
        else {
            console.error(err);
        }
    });
}
function updateChangeSymbolLogic(stxx) {
    UIContext =
        stxx.uiContext ||
            new CIQ.UI.Context(stxx, document.querySelector("cq-context,[cq-context]"));
    UIContext.changeSymbol = function (data) {
        data = data || {};
        data.symbol = chartManager.symbol.toString();
        data.symbolObject = chartManager.symbol.props;
        if (this.loader) {
            this.loader.show();
        }
        loadChart(stxx, data, () => this.loader && this.loader.hide);
    };
    restoreLayout(stxx, previousStore());
}
function initializeChart() {
    fetchMarketRules(urlData.symbol.exchange)
        .then((rules) => {
        if (rules) {
            marketRules = rules;
            chartManager = new ChartDataManager({
                symbol: {
                    symbolId: urlData.symbol.symbolId,
                    symbolName: urlData.symbol.symbolName,
                    exchange: urlData.symbol.exchange
                },
                api: {
                    url: urlFactory,
                    rules: rulesFactory
                },
                resolutionFactory,
                deviceInterface: {
                    androidTag: ANDROID_JS_INTERFACE_KEY,
                    onMessage: responseFromExternalInterfaces
                },
                iframeInterface: {
                    onMessage: responseFromExternalInterfaces
                }
            });
        }
        /**
         * Create your chart engine here based on the function from default configuration
         */
        if (!hasChartLoaded && stxxChartEngine === undefined) {
            let configuration = {
                symbol: urlData.symbol.symbolId,
                theme: urlData.theme || previousStore().theme,
                datafeed: apiManager,
                containerId: CONTAINER_ID,
                onChartReady: function () {
                    hasChartLoaded = true;
                    initChartEvents(stxxChartEngine);
                },
                lastStoredLayout: previousStore().layout
            }, config = getDefaultConfig({
                chartEngineParams: {
                    layout: { ...configuration.lastStoredLayout }
                },
                symbol: configuration.symbol,
                theme: configuration.theme === "day"
                    ? "ciq-day"
                    : "ciq-night",
                onWebComponentsReady: configuration.onChartReady,
                quoteFeed: configuration.datafeed,
                lookupDriver: symbolSearcher
            });
            stxxChartEngine = config.createChart(document.querySelector(configuration.containerId));
            updateChangeSymbolLogic(stxxChartEngine);
            UIContext.changeSymbol();
            Object.defineProperties(window, {
                chartManager: {
                    get: () => chartManager
                },
                stxx: {
                    get: () => stxxChartEngine
                }
            });
        }
    })
        .catch((err) => console.error(err));
}
export function createChart() {
    document.addEventListener("DOMContentLoaded", function () {
        hasChartLoaded = false;
        initializeChart();
    }, false);
}
export { chartManager };
