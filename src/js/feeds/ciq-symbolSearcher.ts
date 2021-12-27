import BaseSymbolSearcher, { ISymbolSearcherProps } from "./symbolSearcher";

interface CIQSymbolSearchProps extends ISymbolSearcherProps {
	exchanges?: Array<string>;
}

export default class CIQSymblSearch extends BaseSymbolSearcher {
	exchanges: Array<string>;
	constructor(props: CIQSymbolSearchProps) {
		super(props);
		this.exchanges = props.exchanges || ["NSE", "BSE"];

		this.__updateResponse = this.__updateResponse.bind(this);
		this.acceptText = this.acceptText.bind(this);
	}

	private __updateResponse(response: any, cb: Function): void {
		let data = response || {};
		if (data.symbol) {
			cb({
				data: [data.symbol, data.symbolName, data.exchange],
				symbol: data.symbol
			});
		} else {
			cb({
				data: [],
				symbol: ""
			});
		}
	}

	acceptText(text: string, filter: string, maxResults: number, cb: Function) {
		maxResults = maxResults || 10;
		this.searchServerForSymbol(text)
			.then((res) => res.json())
			.then((jsonResponse) => {
				cb(jsonResponse, cb);
			})
			.catch((Err) => {
				console.error(Err);
				cb({}, cb);
			});
	}

	protected searchServerForSymbol(
		text: string,
		headers?: HeadersInit
	): Promise<Response> {
		let requestNumber: number = this.newRequest(),
			abortController: AbortController =
				this.initRequestController(requestNumber);
		return fetch(`${this.url}/${text}`, {
			signal: abortController.signal,
			headers
		});
	}
}
