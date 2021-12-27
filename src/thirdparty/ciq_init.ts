declare const __TREE_SHAKE__: boolean;
/* eslint-disable */
/* global __TREE_SHAKE__ */
/* Place styles up here so they can be overridden by plugin and page styles if need be */
import "chartLibrary/css/normalize.css";
import "chartLibrary/css/page-defaults.css";
import "chartLibrary/css/stx-chart.css";
import "chartLibrary/css/chartiq.scss";
/* Support for webcomponents on Legacy Edge */
import "chartLibrary/js/thirdparty/custom-elements.min.js";
/* This section enables various features within the library. Anything not specified will be tree-shaken.
 * Note that imports always happen before code execution; hence, this example is organized for ease of
 * comprehension rather than by expected execution order.
 */
import { CIQ } from "chartLibrary/js/chartiq";
import * as Standard from "chartLibrary/js/standard";
import * as Advanced from "chartLibrary/js/advanced";
import * as AddOns from "chartLibrary/js/addOns";
import * as Components from "chartLibrary/js/components";
/* Uncomment to see all available feature names in console */
//console.log(Object.keys(Standard));
//console.log(Object.keys(Advanced));
//console.log(Object.keys(AddOns));
//console.log(Object.keys(Components));
// __TREE_SHAKE_ is a global defined by the DefinePlugin in webpack.config.js.
// It must be defined to accomplish tree-shaking.  If it is not defined, all
// features will automatically be activated and there will be no tree-shaking.
// If tree-shaking is not desired, the DefinePlugin should be removed and then this
//  block can be removed as well.
if (typeof __TREE_SHAKE__ !== "undefined" && __TREE_SHAKE__) {
    /* comment out any feature you do not want in your bundle */
    CIQ.activateImports(
        Standard.createEngine,
        Standard.customCharts,
        Standard.drawing,
        Standard.easeMachine,
        Standard.equations,
        Standard.i18n,
        Standard.interaction,
        Standard.markers,
        Standard.market,
        Standard.movement,
        Standard.nameValueStore,
        Standard.quoteFeed,
        Standard.series,
        Standard.share,
        Standard.span,
        Standard.storage,
        Standard.studies,
        Standard.symbolLookupBase,
        Standard.theme,
        Standard.timezone,
        Standard.touch,
        Standard.visualization,
        Standard.medianPrice,
        Standard.momentum,
        Standard.priceRelative,
        Standard.vwap,
        Standard.zigzag,
        Advanced.aggregations,
        Advanced.drawingAdvanced,
        Advanced.equationsAdvanced,
        Advanced.highPerformanceMarkers,
        Advanced.renderersAdvanced,
        Advanced.accumulationDistribution,
        Advanced.adx,
        Advanced.alligator,
        Advanced.aroon,
        Advanced.atr,
        Advanced.awesomeOscillator,
        Advanced.balanceOfPower,
        Advanced.bollinger,
        Advanced.cci,
        Advanced.centerOfGravity,
        Advanced.chaikin,
        Advanced.chande,
        Advanced.choppiness,
        Advanced.comparisonStudies,
        Advanced.coppock,
        Advanced.darvasBox,
        Advanced.detrended,
        Advanced.disparity,
        Advanced.easeOfMovement,
        Advanced.ehlerFisher,
        Advanced.elder,
        Advanced.fractalChaos,
        Advanced.highLowStudies,
        Advanced.ichimoku,
        Advanced.intradayMomentum,
        Advanced.keltner,
        Advanced.klinger,
        Advanced.linearRegression,
        Advanced.macd,
        Advanced.massIndex,
        Advanced.moneyFlow,
        Advanced.movingAverages,
        Advanced.parabolicSAR,
        Advanced.pivotPoints,
        Advanced.prettyGoodOscillator,
        Advanced.priceMomentumOscillator,
        Advanced.priceVolumeOscillator,
        Advanced.primeNumber,
        Advanced.pring,
        Advanced.projectedVolume,
        Advanced.psychologicalLine,
        Advanced.qstick,
        Advanced.rainbow,
        Advanced.randomWalk,
        Advanced.relativeVigor,
        Advanced.rsi,
        Advanced.schaffTrendCycle,
        Advanced.shinohara,
        Advanced.stochastics,
        Advanced.supertrend,
        Advanced.swingIndex,
        Advanced.trendIntensity,
        Advanced.trix,
        Advanced.typicalPrice,
        Advanced.twiggsMoneyFlow,
        Advanced.ulcerIndex,
        Advanced.ultimateOscillator,
        Advanced.valuationLines,
        Advanced.volatilityIndex,
        Advanced.volumeProfile,
        Advanced.volumeStudies,
        Advanced.vortex,
        Advanced.williamsMFI,
        AddOns.animation,
        AddOns.continuousZoom,
        AddOns.extendedHours,
        AddOns.fullScreen,
        AddOns.inactivityTimer,
        AddOns.outliers,
        AddOns.plotComplementer,
        AddOns.rangeSlider,
        AddOns.tableView,
        AddOns.tooltip,
        Components.abstractMarker,
        Components.advertisement,
        Components.aggregationDialog,
        Components.attribution,
        Components.chartLegend,
        Components.chartTitle,
        Components.chartcontrolGroup,
        Components.clickable,
        Components.close,
        Components.comparison,
        Components.comparisonLookup,
        Components.cvpController,
        Components.dialog,
        Components.drawingContext,
        Components.fibSettingsDialog,
        Components.gridSizePicker,
        Components.heading,
        Components.headsupDynamic,
        Components.headsupStatic,
        Components.infoToggle,
        Components.instantChart,
        Components.languageDialog,
        Components.loader,
        Components.lookup,
        Components.menu,
        Components.menuContainer,
        Components.palette,
        Components.paletteDock,
        Components.redo,
        Components.scroll,
        Components.shareButton,
        Components.shareDialog,
        Components.showRange,
        Components.sideNav,
        Components.sidePanel,
        Components.studies,
        Components.studyContext,
        Components.studyDialog,
        Components.studyInput,
        Components.studyLegend,
        Components.studyOutput,
        Components.studyParameter,
        Components.swatch,
        Components.themeDialog,
        Components.themePiece,
        Components.themes,
        Components.timezoneDialog,
        Components.toggle,
        Components.toolbar,
        Components.undo,
        Components.viewDialog,
        Components.views,
        Components.waveParameters,
        Components.colorPicker,
        Components.drawingPalette,
        Components.drawingSettings,
        Components.menuDropdown,
        null
    );
}

/* Uncomment to enable the deprecated functions.  Update your calls to functions in here to employ current usage. */

// eslint-disable-next-line capitalized-comments
// import "chartLibrary/js/deprecated";

/* Uncomment to enable these plugins */
// import "chartLibrary/examples/feeds/L2_simulator"; /* for use with activetrader sample */
// import "chartLibrary/plugins/activetrader/cryptoiq";
// import "chartLibrary/plugins/analystviews/components";
// import "chartLibrary/plugins/scriptiq/scriptiq";
// import "chartLibrary/plugins/technicalinsights/components";
// import "chartLibrary/plugins/tfc/tfc-loader";
// import "chartLibrary/plugins/tfc/tfc-demo";   /* if using demo account class */
// import "chartLibrary/plugins/timespanevent/timespanevent";
// import "chartLibrary/plugins/timespanevent/examples/timeSpanEventSample";  /* if using sample */
// import "chartLibrary/plugins/visualearnings/visualearnings";
/* End plugins */

/* eslint-enable */
