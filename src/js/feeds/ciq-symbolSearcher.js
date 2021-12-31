import BaseSymbolSearcher from "./symbolSearcher";
export default class CIQSymblSearch extends BaseSymbolSearcher {
    constructor(props) {
        super(props);
        this.exchanges = props.exchanges || ["NSE", "BSE"];
        this.__updateResponse = this.__updateResponse.bind(this);
        this.acceptText = this.acceptText.bind(this);
    }
    __updateResponse(response, cb) {
        let data = response || {};
        if (data.symbol) {
            cb({
                data: [data.symbol, data.symbolName, data.exchange],
                symbol: data.symbol
            });
        }
        else {
            cb({
                data: [],
                symbol: ""
            });
        }
    }
    acceptText(text, _filter, maxResults, cb) {
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
    searchServerForSymbol(text, headers) {
        let abortController = this.initRequestController();
        return fetch(`${this.url}/${text}`, {
            signal: abortController.signal,
            headers
        });
    }
}
