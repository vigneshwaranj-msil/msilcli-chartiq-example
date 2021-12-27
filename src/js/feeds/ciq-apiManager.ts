import { Candle } from "@msf/msf-charts-helper/dist/feeds/utils";
import { ChartIQCandle } from "@msf/msf-charts-helper/dist/utils";
import {
	convertCandleToChartIQCandle,
	convertPeriodAndIntervalToResolution,
	updateBroadcastCandleWithRealTimeChartUpdates
} from "@msf/msf-charts-helper/dist/utils/chartiq";
import { chartManager } from "../ciq_App";
import BaseAPIManager from "./baseApiManager";
type ResultCallback = (params: ResultParams) => void;
/**
 * @interface Params
 * @property {boolean} series the flag which will be TRUE or FALSE based on regular charts or comparing symbols
 * @property {any} stx The Chart Engine's instance which intiates the call
 * @property {string} [symbolObject] optional Symbol name for which we are requesting the data
 * @property {number} period The value which specifies the time difference between candles i.e., 5 for 5min, 10 for 10min etc.,
 * @property {string} interval The time unit for the period selected i.e., 'minute' or 'day' etc.,
 * @property {boolean} [fetchMaximumBars] This can be set true to set the maximum bars in a single request.
 * @property {number}  ticks The number of candles that is being requested
 * @property {number} [timeout] optional number which specifed in MILLISECONDS the amount of time to timeout the request
 */
interface Params {
	series: boolean;
	stx: any;
	symbolObject?: string;
	period: number;
	interval: string;
	fetchMaximumBars?: boolean;
	ticks: number;
	timeout?: number;
}
/**
 * @interface ResultParams
 * @property {string} [error] optional property which will specify the error message
 * @property {string} [suppressAlert] optional property which will ignore all alerts
 * @property {Array<ChartIQCandle>} quotes array of candles which has to be plotted on charts
 * @property {boolean} moreAvailable flag which can be either TRUE or FALSE which informs the Chart-IQ framework that no more data is available so stop requesting
 * @property {boolean} [upToDate] optional Flag which specifes to stop forecasting of data and data are upto recent candle
 * @property {any} [attribution] optional object which can we used vy stxx.chart.attribution that can be used for our custom UI or our necessity
 */
interface ResultParams {
	error?: string;
	suppressAlert?: string;
	quotes: Array<ChartIQCandle>;
	moreAvailable: boolean;
	upToDate?: boolean;
	attribution?: any;
}

interface IChartIQFeed {
	announceError(params: Params, dataCallback: ResultCallback): void;
	fetchInitialData(
		symbol: string,
		startDate: Date,
		endDate: Date,
		params: Params,
		cb: ResultCallback
	): void;
	fetchPaginationData(
		symbol: string,
		startDate: Date,
		endDate: Date,
		params: Params,
		cb: ResultCallback
	): void;
	fetchUpdateData(
		symbol: string,
		startDate: Date,
		params: Params,
		cb: ResultCallback
	): void;
	subscribe(params: Params): void;
	unsubscribe(params: Params): void;
}

export default class APIManager extends BaseAPIManager implements IChartIQFeed {
	constructor(refreshInterval?: number) {
		super(refreshInterval);

		this.announceError = this.announceError.bind(this);
		this.fetchInitialData = this.fetchInitialData.bind(this);
		this.fetchPaginationData = this.fetchPaginationData.bind(this);
		this.fetchUpdateData = this.fetchUpdateData.bind(this);
		this.subscribe = this.subscribe.bind(this);
		this.unsubscribe = this.unsubscribe.bind(this);
	}

	protected __onSuccessResponseFromAPI(
		cb: ResultCallback,
		jsonResponse: any
	): void {
		jsonResponse = jsonResponse || [];
		let formattedData: Array<Candle> = this.__formatChartData(jsonResponse);
		//toggling the streaming status
		if (!chartManager.isStreaming) {
			chartManager.updateStreamingStatus(true);
		}
		cb({
			quotes: formattedData.map((candle: Candle) =>
				convertCandleToChartIQCandle(candle)
			),
			moreAvailable: formattedData.length > 0
		});
	}

	protected __onFailureResponse(err: any, cb: ResultCallback) {
		console.error(err);
		cb({
			moreAvailable: false,
			quotes: []
		});
	}

	protected __formatChartData(jsonResponse: any): Candle[] {
		return (jsonResponse || [])
			.filter(
				(candle: Candle) =>
					!!candle.date &&
					!!candle.close &&
					!!candle.open &&
					!!candle.low &&
					!!candle.high
			)
			.sort(
				(candleA: Candle, candleB: Candle) =>
					(candleA.date?.getTime() || 0) -
					(candleB.date?.getTime() || 0)
			);
	}

	protected checkForRealTimeCandlesUpdate(cb: Function): Function {
		return () => {
			let broadcastCandle: Candle =
				chartManager.broadcastHandler.broadcastCandle;
			cb(convertCandleToChartIQCandle(broadcastCandle));
		};
	}

	/**
	 * @method announceError
	 * @description THis function will be called every time there is any error with respect to API response which we send to CALLBACK
	 * @param {Params} params The params has all relevant values
	 * @param {ResultCallback} dataCallback Callback which was sent to fetch request that had some error
	 */
	announceError(params: Params, dataCallback: ResultCallback): void {
		console.error("Something wrong happened");
	}
	/**
	 * @method fetchInitialData
	 * @description Send a request to Data server to get data for the symbol selected for the visible x-axis[Date] range
	 * @param {string} symbol - Symbol to request data for
	 * @param {Date} startDate - Start date i.e., the left end value fo the x-axis
	 * @param {Date} endDate - End date i.e., the right end value of the x-axis
	 * @param {Params} params additional params
	 * @param {ResultCallback} cb - Callback which needs to be provided with data or other details
	 */
	fetchInitialData(
		symbol: string,
		startDate: Date,
		endDate: Date,
		params: Params,
		cb: ResultCallback
	): void {
		chartManager.updateStreamingStatus(false);
		const resolution: string = convertPeriodAndIntervalToResolution(
				params.stx
			),
			{ from, to } = chartManager.apiHandler.generateRequestRange(
				resolution,
				true
			);
		if (from && to) {
			chartManager
				.getInitialData(
					resolution,
					JSON.stringify(
						this.__generateRequestBody(
							from,
							to,
							chartManager.symbol.toString(),
							resolution
						)
					),
					{
						"Content-Type": "application/json"
					},
					"POST"
				)
				.then((res) => res.json())
				.then((jsonResponse) =>
					this.__onSuccessResponseFromAPI(cb, jsonResponse)
				)
				.catch((err) => this.__onFailureResponse(err, cb));
		}
	}
	/**
	 * @method fetchPaginationData
	 * @description Send a request to Data server to get data for the symbol selected for the visible x-axis[Date] range
	 * @param {string} symbol - Symbol to request data for
	 * @param {Date} startDate - Start date i.e., the left end value fo the x-axis
	 * @param {Date} endDate - End date i.e., the right end value of the x-axis
	 * @param {Params} params additional params
	 * @param {ResultCallback} cb - Callback which needs to be provided with data or other details
	 */
	fetchPaginationData(
		symbol: string,
		startDate: Date,
		endDate: Date,
		params: Params,
		cb: ResultCallback
	): void {
		const resolution = convertPeriodAndIntervalToResolution(params.stx),
			{ from, to } = chartManager.apiHandler.generateRequestRange(
				resolution,
				false
			);
		if (from && to) {
			chartManager
				.getHistoricData(
					JSON.stringify(
						this.__generateRequestBody(
							from,
							to,
							chartManager.symbol.toString(),
							resolution
						)
					),
					{
						"Content-Type": "application/json"
					},
					"POST"
				)
				.then((res) => res.json())
				.then((jsonRes) => this.__onSuccessResponseFromAPI(cb, jsonRes))
				.catch((err) => this.__onFailureResponse(err, cb));
		}
	}
	/**
	 * @method fetchUpdateData
	 * @description Called by the Framework to get the recent data to update REAL time updates i.e., broadcast/streaming
	 * @param {string} symbol - symbol for the data request
	 * @param {Date} startDate - The start date mostly the current time
	 * @param {Params} params - Additional params
	 * @param {ResultCallback} cb - Callback to pass the data
	 */
	fetchUpdateData(
		symbol: string,
		startDate: Date,
		params: Params,
		cb: ResultCallback
	): void {
		console.warn(
			`Requesting for recent data\nFor Symbol = ${symbol}\nDate=${startDate.toString()}`
		);
	}
	subscribe(params: Params): void {
		this.__addSubscription(
			chartManager.symbol.toString(),
			(candle: ChartIQCandle) =>
				updateBroadcastCandleWithRealTimeChartUpdates(
					params.stx,
					candle
				)
		);
	}
	unsubscribe(params: Params): void {
		throw new Error("Method not implemented.");
	}
}
