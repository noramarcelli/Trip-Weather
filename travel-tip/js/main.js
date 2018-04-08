console.log('Main!');

import locService from './services/loc.service.js'
import mapService from './services/map.service.js'

var gCoords = {};
var gMarkerExist = false;

// var gCurrLocation = {gCurrLng: 0, gCurrLat: 0};


locService.getLocs()
    .then(locs => console.log('locs', locs))

window.onload = () => {
    mapService.initMap()
        .then(
            () => {
                var lat = getParameterByName('lat');
                var lng = getParameterByName('lng');

                if (lat && lng) {
                    setPosByCoords(+lat, +lng);
                } else {
                    setCurrPos();
                }
            }
        );

}

// document.querySelector('.btn1').onclick =  () => {
//     console.log('Thanks!');
// }


// document.querySelector('.btn1').addEventListener('click', (ev)=>{
//     console.log('Aha!', ev.target);
// })

// var x = document.getElementById("demo");

// function getLocation() {
//     console.log('insideGey')
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition(initMap, getPosition);
//     } else { 
//         x.innerHTML = "Geolocation is not supported by this browser.";
//     }
// }

document.querySelector('.My-Location-BTN')
    .addEventListener('click', (ev) => {
        setCurrPos();
    })

document.querySelector('form')
    .addEventListener('submit', (ev) => {
        ev.preventDefault();
        var address = document.querySelector('input').value;
        convertToCoords(address);
        renderAddress(address);
    })

document.querySelector('.copy')
    .addEventListener('click', (ev) => {
        // copyLocation();
        copyURL();
    })

function renderAddress(address) {
    document.querySelector('.searched-address').innerText = address;
}

function setCurrPos() {
    var address;
    locService.getPosition()
        .then(pos => {
            // console.log('User position is:', pos.coords);
            reverseGeocoding(pos.coords.latitude, pos.coords.longitude)
                .then(function (address) {
                    setMarker(pos.coords.latitude, pos.coords.longitude, address);
                    renderAddress(address);
                    getWeather(pos.coords.latitude, pos.coords.longitude);
                })
        })
        .catch(err => {
            console.log('err!!!', err);
        })
}

function convertToCoords(strURL) {
    // console.log(address);
    let address = document.querySelector('input').value;
    let addressToCopy = document.querySelector('.searched-address').innerText;
    //    renderAddress(address);

    if (address) {
        return geocoding(address).then(function (coords) {
            if (strURL) {
                console.log('coords', coords);
                strURL += '?lat=' + coords.lat + '&lng=' + coords.lng;
                console.log('strURL', strURL);

                return coords;
            }
        })
    } else {
        return geocoding(addressToCopy).then(function (coords) {
            if (strURL) {
                console.log('coords', coords);
                strURL += '?lat=' + coords.lat + '&lng=' + coords.lng;
                console.log('strURL', strURL);
                // return coords;
            }
        });
    }
}

function geocoding(address) {
    let key = 'AIzaSyAPSV7x1y8pmgEZfWGywpaWJ-pdtYwvaww';
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}A&key=${key}`)
        .then(function (res) {
            // console.log(res.data);
            let lat = res.data.results[0].geometry.location.lat;
            let lng = res.data.results[0].geometry.location.lng;
            setMarker(lat, lng, address);
            var coors = { lat, lng };
            getWeather(lat, lng);
            return coors;
        })
}

function reverseGeocoding(lat, lng) { //convert coord to address
    let key = 'AIzaSyD691kT7ZRaeQx1jU9EVr9UdxIYGg2EFkE';
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`)
        .then(function (res) {
            // console.log('data', res.data);
            // console.log('data 0', res.data.results[0]);
            var address = res.data.results[0].formatted_address;
            // console.log('address', address);
            return address;
        })
}

function setMarker(lat, lng, address) {
    if (gMarkerExist) mapService.removeMarker();
    mapService.addMarker({ lat, lng }, address);
    mapService.setCenter({ lat, lng });
    gCoords.lat = lat;
    gCoords.lng = lng;
    gMarkerExist = true;
}

function copyLocation() {
    let strURL = window.location.href;
    // convertToCoords(strURL).then(res => {
    //     var copyText = document.querySelector('#input');
    //     copyText.value = strURL;
    //     copyText.select();
    //     document.execCommand("copy");
    // })
    strURL += '?lat=' + gCoords.lat + '&lng=' + gCoords.lng;
    return strURL;
}

function copyURL () {
    var strURL = copyLocation();
    var elUrlInput = document.querySelector('.copy-input');
    elUrlInput.value = strURL;
    elUrlInput.select();
    document.execCommand("copy");
}



function getWeather(lat, lon) {
    let key = 'd1ef05366e0b7ae69ddcae70eafbed76';
    axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`)
        .then(function (res) {
            // console.log('temp:', res.data.main.temp);
            // console.log('humidity:', res.data.main.humidity);
            // console.log('wind:', res.data.wind.speed);
            // console.log('weather-type:', res.data.weather[0].main);
            // console.log('weather-icon:', res.data.weather[0].icon);
            // console.log('weather:', res.data);
            var elTemp = document.querySelector('.temp');
            var elHumidity = document.querySelector('.humidity');
            var elWind = document.querySelector('.wind');
            var elType = document.querySelector('.weather-type');
            var elIcon = document.querySelector('.weather-icon');

            elTemp.innerText = Math.round(res.data.main.temp) + '°C';
            elHumidity.innerText = res.data.main.humidity + '%';
            elWind.innerText = Math.round(res.data.wind.speed * 3.6) + ' km/h';
            elType.innerText = res.data.weather[0].main;
            elIcon.src = `https://openweathermap.org/img/w/${res.data.weather[0].icon}.png`;

        })
        .catch(err => {
            console.log('err', err);
        })
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setPosByCoords(lat, lng) {
    reverseGeocoding(lat, lng)
        .then(function (address) {
            setMarker(lat, lng, address);
            renderAddress(address);
            getWeather(lat, lng);
        })
}

