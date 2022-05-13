// arcgis api reference https://developers.arcgis.com/javascript/latest/api-reference/
import React, { useEffect, useState, useCallback, useRef } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";
import {
  DEFAULT_ZOOM_LEVEL,
  DEFAULT_GRAPHIC_COLOR,
  DEFAULT_POPUP_TEMPLATE,
} from "./arcgisMapDefaults";

setDefaultOptions({
  version: "4.21",
  css: true,
});

/**
 *
 * @param {Object} options
 * @param {(event) => {}} options.onMapViewClick onClick callback function for the map view
 * @returns
 */
function useArcgisMap(options = {}) {
  const { onMapViewClick } = options;
  /*================================================== props START ================================================== */

  const [mapView, setMapView] = useState(null);
  /*==================================================  props END  ================================================== */

  const [MapViewClass, setMapViewClass] = useState(null);
  //   const [GraphicClass, setGraphicClass] = useState(null);

  const graphicRef = useRef();

  const [error, setError] = useState(null);

  const popupTemplate = {
    // autocasts as new PopupTemplate()
    title: "{FULL_NAME}",

    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "FID",
            label: "Field Id",
            places: 2,
          },
          {
            fieldName: "GIS_ID",
            label: "GIS Id",
            places: 2,
          },
          {
            fieldName: "FULL_NAME",
            label: "Street Name",
          },
          {
            fieldName: "RD_CLAS_CO",
            label: "Class",
          },
        ],
      },
    ],
    // actions: [exportReportAction],
  };

  const popupTemplateGraphic = {
    title: "some info could be display here",
    content: `Patroller: on <b>{userName}</b>`,
  };

  useEffect(() => {
    loadModules([
      "esri/Map",
      "esri/views/MapView",
      "esri/Graphic",
      "esri/widgets/BasemapGallery",
      "esri/widgets/Expand",
      "esri/widgets/Search",
    ])
      .then(async ([Map, MapView, Graphic, BasemapGallery, Expand, Search]) => {
        graphicRef.current = Graphic;

        // initialize map
        const map = new Map({
          basemap: "topo",
        });

        // initialize map view
        const mapView = new MapView({
          map: map,
          zoom: DEFAULT_ZOOM_LEVEL, // Zoom level
        });

        // UI config: search
        const searchComponent = new Search({ view: mapView });
        mapView.ui.add(searchComponent, "top-right");

        // UI config: map gallery and expand
        const basemapGallery = new BasemapGallery({
          view: mapView,
          container: document.createElement("div"),
        });

        const bgExpand = new Expand({
          view: mapView,
          content: basemapGallery,
        });

        // add UIs to to map view
        mapView.ui.add(bgExpand, "top-right");

        // assign onClick event
        mapView.on("click", onMapViewClick);

        // expose mapView instatnce
        setMapView(mapView);
      })
      .catch((error) => {
        console.error("Error in loading arcgis modules", error);
        setError(error);
      });
  }, []);

  /**
   *
   * @param {HTMLElement} ele html element that hosts the map view
   * @param {number} lat latitude of the center of the map view
   * @param {number} lng longitude of the center of the map view
   */
  const renderMap = (ele, lat, lng) => {
    if (mapView) {
      try {
        mapView.center = [lng, lat];
        mapView.container = ele;
      } catch (error) {
        console.error("Error in initializing map view", error);
        setError(error);
      }
    }
  };
  //   takeScreenshot

  /*================================================== create methods START ================================================== */

  function createPopupTemplate() {}

  /*==================================================  create methods END  ================================================== */

  /**
   *
   * @param {number} lat latitude
   * @param {number} lng longitude
   * @param {[number]} color rgb color in array format, ie: [rr, gg, bb, opacity]
   *
   * @returns {null | object} return generate point graphic object, otherwise, null
   * https://developers.arcgis.com/javascript/latest/api-reference/esri-Graphic.html
   */
  function addGraphicPoint(lat, lng, color = DEFAULT_GRAPHIC_COLOR) {
    // First create a point geometry

    const GraphicClass = graphicRef.current;

    if (!GraphicClass || !mapView) return null;

    const point = {
      type: "point", // autocasts as new Point()
      latitude: lat,
      longitude: lng,
    };

    // Create a symbol for drawing the point
    const markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: color,
      outline: {
        color: [255, 255, 255], // White
        width: 2,
      },
    };

    // Create a graphic and add the geometry and symbol to it
    const pointGraphic = new GraphicClass({
      geometry: point,
      symbol: markerSymbol,
      attributes: {
        userName: "lucien",
      },
      popupTemplate: DEFAULT_POPUP_TEMPLATE,
    });

    mapView.graphics.add(pointGraphic);

    return pointGraphic;
  }

  /**
   *
   * generate a line graphic on the map view and return the instance of the line object, for removal purpose
   *
   * @param {[number]} coordinates array of coordinate, each coordindate shuold be in form of [latitude, longitude]
   * @param {[number]} color rgb color in array format, ie: [rr, gg, bb, opacity]
   *
   * @returns {null | object} return generate polyline graphic object, otherwise, null
   */
  function addGraphicLine(coordinates, color = DEFAULT_GRAPHIC_COLOR) {
    const Graphic = graphicRef.current;

    if (!Graphic || !mapView) return null;
    // Create a line geometry
    const polyline = {
      type: "polyline",
      paths: coordinates,
    };

    const simpleLineSymbol = {
      type: "simple-line",
      color: color,
      width: 2,
    };

    const polylineGraphic = new Graphic({
      geometry: polyline,
      symbol: simpleLineSymbol,
      popupTemplate: popupTemplateGraphic,
    });

    mapView.graphics.add(polylineGraphic);

    return polylineGraphic;
  }

  function addGraphicPolygon(coordinates, color = DEFAULT_GRAPHIC_COLOR) {
    const Graphic = graphicRef.current;

    if (!Graphic | !mapView) return null;
    // Create a polygon geometry
    const polygon = {
      type: "polygon",
      rings: coordinates,
    };

    const simpleFillSymbol = {
      type: "simple-fill",
      color: color, // Orange, opacity 80%
      outline: {
        color: [255, 255, 255],
        width: 2,
      },
    };

    const polygonGraphic = new Graphic({
      geometry: polygon,
      symbol: simpleFillSymbol,
      popupTemplate: DEFAULT_POPUP_TEMPLATE,
    });

    mapView.graphics.add(polygonGraphic);

    return polygonGraphic;
  }

  /**
   * asyn function to take map view screenshot
   * @returns {Promise}
   */
  async function getScreenshot() {
    let screenshotData, error;
    try {
      screenshotData = await mapView.takeScreenshot().catch((e) => {
        error = new Error("Error in [takeScreenshot] method: ", e.message);
      });
    } catch (err) {
      error = new Error("Error in [getScreenshot] method", err.message);
    }

    if (screenshotData) {
      return Promise.resolve(screenshotData);
    } else if (error) {
      return Promise.reject(error);
    }
  }

  /**
   * remove all added graphics on the map view
   * https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#graphics
   */
  function clearAllGraphics() {
    mapView.graphics.removeAll();
  }

  /**
   * remove a particular graphic from the map view
   * @param {object} target arcgis graphic instance
   * https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#graphics
   *
   */
  function removeGraphic(target) {
    mapView.graphics.remove(target);
  }

  const arcgisProps = { mapView, error };
  const arcgisUtils = {
    renderMap,
    addGraphicPoint,
    getScreenshot,
    removeGraphic,
    clearAllGraphics,
    addGraphicLine,
    addGraphicPolygon,
  };
  return { arcgisProps, arcgisUtils };
}

export default useArcgisMap;
