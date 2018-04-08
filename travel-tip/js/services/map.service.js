import { GoogleMapsApi } from './gmap.class.js';

var map;
var gMarker;

function initMap(lat = 32.0749831, lng = 34.9120554) {

    // console.log('InitMap');

    const gmapApi = new GoogleMapsApi();
    return gmapApi.load().then(() => {
        map = new google.maps.Map(
            document.querySelector('#map'), {
                center: {lat, lng},
                zoom: 15
            })
            
        // console.log('Map!', map);
    });
}
function addMarker(loc, address) {
    gMarker = new google.maps.Marker({
        position: loc,
        map: map,
        title: address
    });
}

function setCenter(loc){
    map.setCenter(loc)
}



export default {
    initMap,
    addMarker,
    setCenter,
    removeMarker
}

function removeMarker () {
    gMarker.setMap(null);
}