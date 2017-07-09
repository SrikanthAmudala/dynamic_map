var map = L.map('bandy_map', {
	'center' : [ 0, 0 ],
	'zoom' : 0,
	'layers' : [ L.tileLayer(
			'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
				'attribution' : 'Map data &copy; OpenStreetMap contributors'
			}) ]
});

var geojsonMarkerOptions = {
	radius : 8
};

/*
 * var firstpolylineoptions = { color : 'red', weight : 3, opacity : 0.5,
 * smoothFactor : 1 };
 */

var realtime = L.realtime(
		{
			url : 'http://127.0.0.1:8000/mongo/getgpsdata/',
			crossOrigin : true,
			type : 'json',
			cache : false,
			success : function(feature) {
				var trHTML = '';
				trHTML += '<tr><td>' + feature.geometry['Timestamp']
						+ '</td><td>' + feature.geometry['coordinates'][0]
						+ '</td><td>' + feature.geometry['coordinates'][1]
						+ '</td><td>' + feature.geometry['Speed'] + '</td><td>'
						+ feature.geometry['Heading'] + '</td><td>'
						+ feature.geometry['GatewayID'] + '</td></tr>';
				$('#location').append(trHTML);
			},
		},
		{
			interval : 3 * 1000,
			pointToLayer : function(feature, latlng) {
				var coordinates = feature.geometry.coordinates;
				var speed = feature.geometry.Speed;
				var heading = feature.geometry.Heading;
				var gatewayId = feature.geometry.GatewayID;
				var timestamp = feature.geometry.Timestamp;
				return L.circleMarker(latlng, geojsonMarkerOptions).bindPopup(
						'<b>Time: </b>' + timestamp + "<br/>"
								+ '<b>Position: </b>' + coordinates + "<br/>"
								+ '<b> Speed : </b>' + speed + "<br/>"
								+ '<b> Heading: </b>' + heading + "<br/>"
								+ '<b> GatewayID: </b>' + gatewayId);
			},
		/*
		 * firstpolyline : function(feature,latlng) { return
		 * L.marker(feature.geometry.coordinates,firstpolylineoptions); }
		 */
		/*
		 * pointToLayer: function (feature, latlng) { return L.marker(latlng, {
		 * 'icon': L.icon({ iconUrl:
		 * '//leafletjs.com/docs/images/leaf-green.png', shadowUrl:
		 * '//leafletjs.com/docs/images/leaf-shadow.png', iconSize: [38, 95], //
		 * size of the icon shadowSize: [50, 64], // size of the shadow
		 * iconAnchor: [22, 94], // point of the icon which will correspond to
		 * marker's location shadowAnchor: [4, 62], // the same for the shadow
		 * popupAnchor: [-3, -76] // point from which the popup should open
		 * relative to the iconAnchor }) }); }
		 */
		}).addTo(map);

realtime.on('layeradd', function(e) {
	var coordPart = function(v, dirs) {
		return dirs.charAt(v >= 0 ? 0 : 1)
				+ (Math.round(Math.abs(v) * 100) / 100).toString();
	}, popupContent = function(fId) {
		var feature = e.features[fId], c = feature.geometry.coordinates;
		return 'Wander drone at ' + coordPart(c[1], 'NS') + ', '
				+ coordPart(c[0], 'EW');
	}, bindFeaturePopup = function(fId) {
		realtime.getLayer(fId).bindPopup(popupContent(fId));
	}, updateFeaturePopup = function(fId) {
		realtime.getLayer(fId).getPopup().setContent(popupContent(fId));
	};

	map.fitBounds(realtime.getBounds(), {
		maxZoom : 30
	});

	Object.keys(e.enter).forEach(bindFeaturePopup);
	Object.keys(e.update).forEach(updateFeaturePopup);

});