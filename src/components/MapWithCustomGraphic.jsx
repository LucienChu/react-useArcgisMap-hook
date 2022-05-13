import { useState, useEffect, useRef } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";
import useArcgisMap from "../hooks/useArcgisMap";
setDefaultOptions({
  version: "4.21",
  css: true,
});

const POLY_LINE_COORDINATES = [
  [-79.34855995239123, 43.635231548753055], //Longitude, latitude
  [-79.3770557409654, 43.650386858869204], //Longitude, latitude
  [-79.3224674230944, 43.6531193767677], //Longitude, latitude
];

/**
 *
 * @param {Object} props
 * @param {Object} props.center [latitude, longitude]
 *
 * @returns
 */
export default function MapWithCustomGraphic(props) {
  const [latitude, longitude] = props.center;
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [mapView, setMapView] = useState(null);

  const mapClicked = (event) =>
    console.log("event", event.mapPoint.longitude, event.mapPoint.latitude);

  const {
    arcgisProps,
    arcgisUtils: {
      renderMap,
      addGraphicPoint,
      getScreenshot,
      clearAllGraphics,
      addGraphicLine,
      addGraphicPolygon,
      removeGraphic,
    },
  } = useArcgisMap({ onMapViewClick: mapClicked });

  useEffect(() => {
    const mapViewContainer = mapRef.current;
    if (mapViewContainer) {
      renderMap(mapViewContainer, latitude, longitude);
    }
    // missing latitude and longitude as depedencies as
    // did not expect they would change
  }, [renderMap, mapRef]);

  function add() {
    const point = addGraphicPoint(latitude, longitude, [1, 2, 3]);
    console.log("POINT", point);
  }

  const tryScreenshot = () => {
    getScreenshot().then((data) => {
      console.log("Screenshot data", data);
      alert("screenshot is taken, check the console");
    });
  };

  const addLine = () => {
    const line = addGraphicLine(POLY_LINE_COORDINATES, [255, 40, 50]);
  };

  const addPolygon = () => {
    const polygon = addGraphicPolygon(
      POLY_LINE_COORDINATES,
      [255, 40, 50, 0.5]
    );
  };
  const clearGraphic = () => {
    clearAllGraphics();
  };
  return (
    <div>
      <button onClick={clearGraphic}>clear graphic</button>
      <button onClick={add}>add point</button>
      <button onClick={tryScreenshot}>get screenshot</button>
      <button onClick={addLine}>add line</button>
      <button onClick={addPolygon}>add polygon</button>
      <div ref={mapRef} style={{ height: "95vh" }}></div>
    </div>
  );
}
