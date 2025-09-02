import * as NodeGeocoder from 'node-geocoder';

const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

export default geocoder;
