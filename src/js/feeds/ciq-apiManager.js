import { convertCandleToChartIQCandle, convertChartIQCandleToCandle, convertPeriodAndIntervalToResolution, updateBroadcastCandleWithRealTimeChartUpdates } from "@msf/msf-charts-helper/dist/utils/chartiq";
import { chartManager } from "../ciq_App";
import BaseAPIManager from "./ciq-baseApiManager";
export default class APIManager extends BaseAPIManager {
    constructor(refreshInterval) {
        super(refreshInterval);
        this.__customCallback = this.__customCallback.bind(this);
        this.announceError = this.announceError.bind(this);
        this.fetchInitialData = this.fetchInitialData.bind(this);
        this.fetchPaginationData = this.fetchPaginationData.bind(this);
        this.fetchUpdateData = this.fetchUpdateData.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.unsubscribe = this.unsubscribe.bind(this);
    }
    onSuccessResponseFromAPI(cb, jsonResponse) {
        jsonResponse = jsonResponse.data || [];
        let formattedData = this.__formatChartData(jsonResponse);
        //toggling the streaming status
        if (!chartManager.isStreaming) {
            chartManager.updateStreamingStatus(true);
        }
        cb({
            quotes: formattedData.map((candle) => convertCandleToChartIQCandle(candle)),
            moreAvailable: formattedData.length > 0
        });
    }
    onFailureResponse(err, cb) {
        console.error(err);
        cb({
            moreAvailable: false,
            quotes: []
        });
    }
    __customCallback(cb) {
        return (params) => {
            cb(params);
            if (params.quotes.length) {
                chartManager.broadcastHandler.init(convertChartIQCandleToCandle(params.quotes[params.quotes.length - 1]));
                chartManager.updateStreamingStatus(true);
            }
        };
    }
    __formatChartData(jsonResponse) {
        return (jsonResponse || [])
            .map((respCandle) => ({
            date: new Date(respCandle.date),
            open: parseFloat(respCandle.open),
            close: parseFloat(respCandle.close),
            high: parseFloat(respCandle.high),
            low: parseFloat(respCandle.low),
            volume: parseFloat(respCandle.volune)
        }))
            .filter((candle) => !!candle.date &&
            !!candle.close &&
            !!candle.open &&
            !!candle.low &&
            !!candle.high)
            .sort((candleA, candleB) => (candleA.date?.getTime() || 0) -
            (candleB.date?.getTime() || 0));
    }
    checkForRealTimeCandlesUpdate(cb) {
        return () => {
            let broadcastCandle = chartManager.broadcastHandler.broadcastCandle;
            cb(convertCandleToChartIQCandle(broadcastCandle));
        };
    }
    /**
     * @method announceError
     * @description THis function will be called every time there is any error with respect to API response which we send to CALLBACK
     * @param {Params} _params The params has all relevant values
     * @param {ResultCallback} _dataCallback Callback which was sent to fetch request that had some error
     */
    announceError(_params, _dataCallback) {
        console.error("Something wrong happened");
    }
    /**
     * @method fetchInitialData
     * @description Send a request to Data server to get data for the symbol selected for the visible x-axis[Date] range
     * @param {string} _symbol - Symbol to request data for
     * @param {Date} _startDate - Start date i.e., the left end value fo the x-axis
     * @param {Date} _endDate - End date i.e., the right end value of the x-axis
     * @param {Params} params additional params
     * @param {ResultCallback} cb - Callback which needs to be provided with data or other details
     */
    fetchInitialData(_symbol, _startDate, _endDate, params, cb) {
        chartManager.updateStreamingStatus(false);
        const resolution = convertPeriodAndIntervalToResolution(params.stx), { from, to } = chartManager.apiHandler.generateRequestRange(resolution, true);
        if (from && to) {
            chartManager
                .getInitialData(resolution, JSON.stringify(this.__generateRequestBody(from, to, chartManager.symbol.toString(), resolution)), {
                "Content-Type": "application/json"
            }, "POST")
                .then((res) => res.json())
                .then((jsonResponse) => this.onSuccessResponseFromAPI(this.__customCallback(cb), jsonResponse))
                .catch((err) => this.onFailureResponse(err, this.__customCallback(cb)));
        }
    }
    /**
     * @method fetchPaginationData
     * @description Send a request to Data server to get data for the symbol selected for the visible x-axis[Date] range
     * @param {string} _symbol - Symbol to request data for
     * @param {Date} _startDate - Start date i.e., the left end value fo the x-axis
     * @param {Date} _endDate - End date i.e., the right end value of the x-axis
     * @param {Params} params additional params
     * @param {ResultCallback} cb - Callback which needs to be provided with data or other details
     */
    fetchPaginationData(_symbol, _startDate, _endDate, params, cb) {
        const resolution = convertPeriodAndIntervalToResolution(params.stx), { from, to } = chartManager.apiHandler.generateRequestRange(resolution, false);
        if (from && to) {
            chartManager
                .getHistoricData(JSON.stringify(this.__generateRequestBody(from, to, chartManager.symbol.toString(), resolution)), {
                "Content-Type": "application/json"
            }, "POST")
                .then((res) => res.json())
                .then((jsonRes) => this.onSuccessResponseFromAPI(this.__customCallback(cb), jsonRes))
                .catch((err) => this.onFailureResponse(err, this.__customCallback(cb)));
        }
    }
    /**
     * @method fetchUpdateData
     * @description Called by the Framework to get the recent data to update REAL time updates i.e., broadcast/streaming
     * @param {string} symbol - symbol for the data request
     * @param {Date} startDate - The start date mostly the current time
     * @param {Params} _params - Additional params
     * @param {ResultCallback} _cb - Callback to pass the data
     */
    fetchUpdateData(symbol, startDate, _params, _cb) {
        console.warn(`Requesting for recent data\nFor Symbol = ${symbol}\nDate=${startDate.toString()}`);
    }
    subscribe(params) {
        this.addSubscription(chartManager.symbol.toString(), (candle) => {
            if (params.stx) {
                updateBroadcastCandleWithRealTimeChartUpdates(params.stx, candle);
            }
        });
    }
    unsubscribe(_params) {
    }
}
