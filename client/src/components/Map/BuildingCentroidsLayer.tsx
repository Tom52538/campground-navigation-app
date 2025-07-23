import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Icon, Point } from 'leaflet';

interface BuildingCentroid {
  type: string;
  properties: {
    [key: string]: any;
  };
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

interface BuildingCentroidsLayerProps {
  show: boolean;
}

const BuildingCentroidsLayer = ({ show }: BuildingCentroidsLayerProps) => {
  const [centroids, setCentroids] = useState<BuildingCentroid[]>([]);

  useEffect(() => {
    if (show) {
      fetch('/data/Beach Resort Zentroide Layer.geojson')
        .then(res => res.json())
        .then(data => {
          setCentroids(data.features);
        });
    } else {
      setCentroids([]);
    }
  }, [show]);

  if (!show) {
    return null;
  }

  const buildingIcon = new Icon({
    iconUrl: '/logo.png',
    iconSize: new Point(10, 10),
  });

  return (
    <>
      {centroids.map((centroid, index) => (
        <Marker
          key={index}
          position={[centroid.geometry.coordinates[1], centroid.geometry.coordinates[0]]}
          icon={buildingIcon}
        >
          <Popup>
            <div>
              <h3>Building Centroid</h3>
              <ul>
                {Object.entries(centroid.properties).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default BuildingCentroidsLayer;
