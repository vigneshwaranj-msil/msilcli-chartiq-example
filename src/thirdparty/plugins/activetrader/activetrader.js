/**
 *	8.1.0
 *	Generation date: 2021-08-18T10:23:20.489Z
 *	Client name: angel broking
 *	Package Type: Technical Analysis
 *	License type: annual
 *	Expiration date: "2022/08/01"
 *	Domain lock: ["127.0.0.1","localhost","angelbroking.com","localfolder://"]
 *	Filesystem lock: "file://*", "file://c/*", "file://d/*", "file://e/*"
 */

/***********************************************************
 * Copyright by ChartIQ, Inc.
 * Licensed under the ChartIQ, Inc. Developer License Agreement https://www.chartiq.com/developer-license-agreement
*************************************************************/
/*************************************** DO NOT MAKE CHANGES TO THIS LIBRARY FILE!! **************************************/
/* If you wish to overwrite default functionality, create a separate file with a copy of the methods you are overwriting */
/* and load that file right after the library has been loaded, but before the chart engine is instantiated.              */
/* Directly modifying library files will prevent upgrades and the ability for ChartIQ to support your solution.          */
/*************************************************************************************************************************/
/* eslint-disable no-extra-parens */


import { CIQ } from "../../js/chartiq.js";
import "../../js/extras/svgcharts/piechart.js";
import "../../plugins/activetrader/cryptoiq.js";
import "../../plugins/tfc/tfc-loader.js";

var startActiveTrader = function (stxx) {
	// take into account -15 margin on the flex container
	Array.from(
		document.querySelectorAll("cq-tradehistory-table cq-scroll")
	).forEach(function (table) {
		var top = document.querySelector("#flexContainer");
		table.reduceMenuHeight =
			45 - (top ? parseFloat(getComputedStyle(top).top) : 0);
	});

	if (CIQ.MarketDepth)
		new CIQ.MarketDepth({
			stx: stxx,
			volume: true,
			mountain: true,
			step: true,
			record: true,
			height: "40%",
			precedingContainer: "#marketDepthBookmark"
		});

	// Set defaults for initial load
	function overrideLayoutSettings(obj) {
		var stx = obj.stx;
		if (stx.currentlyImporting) return;
		stx.setChartType("line");
		CIQ.extend(stx.layout, {
			crosshair: true,
			headsUp: "static",
			l2heatmap: true,
			rangeSlider: true,
			marketDepth: true,
			extended: false
		});
		stx.changeOccurred("layout");
		var tradeToggle = document.querySelector(".stx-trade");
		if (tradeToggle) tradeToggle.set(true); // open the TFC sidepanel
	}

	var fn = function () {
		overrideLayoutSettings({ stx: stxx });
		stxx.removeEventListener("newChart", fn);
	};
	stxx.addEventListener("newChart", fn);

	function moneyFlowChart(stx) {
		var initialPieData = {
			Up: { index: 1 },
			Down: { index: 2 },
			Even: { index: 3 }
		};

		var pieChart = new CIQ.Visualization({
			container: "cq-tradehistory-table div[pie-chart] div",
			renderFunction: CIQ.SVGChart.renderPieChart,
			colorRange: ["#8cc176", "#b82c0c", "#7c7c7c"],
			className: "pie",
			valueFormatter: CIQ.condenseInt
		}).updateData(CIQ.clone(initialPieData));
		var last = 0;
		stx.append("updateCurrentMarketData", function (
			data,
			chart,
			symbol,
			params
		) {
			if (symbol) return;
			var items = document.querySelectorAll("cq-tradehistory-body cq-item");
			var d = {};
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item == last) break;
				var dir = item.getAttribute("dir");
				if (!dir) dir = "even";
				dir = CIQ.capitalize(dir);
				if (!d[dir]) d[dir] = 0;
				d[dir] += parseFloat(
					item.querySelector("[col=amount]").getAttribute("rawval")
				);
			}
			if (i) pieChart.updateData(d, "add");
			last = items[0];
		});
		stx.addEventListener("symbolChange", function (obj) {
			pieChart.updateData(CIQ.clone(initialPieData));
		});
		return pieChart;
	}
	stxx.moneyFlowChart = moneyFlowChart(stxx);

	return stxx;
};

export default startActiveTrader;
