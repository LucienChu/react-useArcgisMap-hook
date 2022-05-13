import { useState, useEffect, useRef } from "react";
import { loadModules, setDefaultOptions } from "esri-loader";
import useArcgisMap from "../hooks/useArcgisMap";
setDefaultOptions({
  version: "4.21",
  css: true,
});

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

  const mapClicked = (event) => console.log("event", event);

  const {
    arcgisProps,
    arcgisUtils: {
      renderMap,
      addGraphicPoint,
      getScreenshot,
      clearAllGraphics,
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
    addGraphicPoint(latitude, longitude, [1, 2, 3]);
  }

  const tryScreenshot = () => {
    // getScreenshot().then((data) => {
    //   console.log("Screenshot data", data);
    // });

    clearAllGraphics();
  };
  return (
    <div>
      <button onClick={add}>add point</button>
      <button onClick={tryScreenshot}>get screenshot</button>
      <div ref={mapRef} style={{ height: "95vh" }}></div>
    </div>
  );
}
