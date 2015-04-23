/**
 * Created by asus on 2015/3/20.
 */
var cityName = new Array(2);
var cityLng;
var cityLat;
var posName = new Array(30);
var posNum;
var pmData = new Array(30);
var pmPoint = new Array(30);
var aqi;
var qualityBglevel;
var Bgcolor;
// 百度地图API功能
var map = new BMap.Map("map_canvas");    // 创建Map实例
map.centerAndZoom(new BMap.Point(104.070798,30.663543), 12);  // 初始化地图,设置中心点坐标和地图级别
map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
map.setCurrentCity("成都");          // 设置地图显示的城市 此项是必须设置的
map.enableScrollWheelZoom(true);     //开启鼠标滚轮缩放

//增加地图控件
var opts = {anchor: BMAP_ANCHOR_TOP_LEFT, offset: new BMap.Size(10, 10)}
map.addControl(new BMap.NavigationControl(opts));

//鼠标点击触发事件
map.addEventListener("click",deal);

//鼠标取点获取城市名字
function getCityName(cityLng, cityLat) {
    var geoc = new BMap.Geocoder();
    var mousePoint = new BMap.Point(cityLng, cityLat);
    geoc.getLocation(mousePoint, function (rs) {
        var addComp = rs.addressComponents;
        //alert(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
        cityName[0] = addComp.city;
        cityName[1] = addComp.district;
        return cityName;
    });
    city = document.getElementById("pointName");
    city.innerHTML = cityName[0]+"&nbsp.&nbsp"+"<small>"+cityName[1]+"&nbsp(实时空气指数AQI)"+"</small>";
    city.style.color = "#FFFFFF"
}

//处理获取到的城市名字符串
function reName(cityName){
    var beforeName = cityName;
    var after = beforeName.substring(0, beforeName.length-1);
    return after;
}

//从api提供点获取天气
function getWeather(cityName){
    if(cityName != null){
        //ajax请求
        req = new XMLHttpRequest();
        req.overrideMimeType("text/xml");
        //将城市名字做url编码
        var encodeName = encodeURIComponent(reName(cityName[0]));
        //req.open("GET", "http://api.openweathermap.org/data/2.5/weather?q=" + cityName[1] + ",cn", true);
        //req.open("GET", "http://wthrcdn.etouch.cn/weather_mini?city=" + encodeName, true);
        req.open("GET", "http://wthrcdn.etouch.cn/WeatherApi?city=" + reName(cityName[0]), true);
        req.onreadystatechange = weatherAjaxResponse;
        req.send(null);
    }
}

//ajax回应
function weatherAjaxResponse(){
    textXml = req.responseXML;
    CityType = document.getElementById("cityType");
    CityType.innerHTML = "<h4>"+textXml.getElementsByTagName("type")[0].childNodes[0].nodeValue+"</h4>";
    highT = document.getElementById("highTemp");
    lowT = document.getElementById("lowTemp");
    uP = document.getElementById("updateTime");
    dt = document.getElementById("detail");
    highT.innerHTML ="<h4>"+ textXml.getElementsByTagName("high")[0].childNodes[0].nodeValue+"</h4>";
    lowT.innerHTML ="<h4>"+ textXml.getElementsByTagName("low")[0].childNodes[0].nodeValue+"</h4>";
    uP.innerHTML ="<h4>"+"更新时间："+textXml.getElementsByTagName("updatetime")[0].childNodes[0].nodeValue+"</h4>";
    dt.innerHTML = "<h4>"+textXml.getElementsByTagName("detail")[9].childNodes[0].nodeValue+"</h4>";
}
/*
//从api处获取PM2.5值
function getPmValue(cityName){
    if(cityName != null){
        var newName = reName(cityName[0]);
        pmReg = new XMLHttpRequest();
        //pmReg.overrideMimeType("text/xml");
        pmReg.open("GET", "http://www.pm25.in/api/querys/pm10.json?city=" + newName + "&token=5j1znBVAsnSf5xQyNQyq&callback=pmAjaxResponse", true);
        //pmReg.open("GET","http://weathermap-json.stor.sinaapp.com/" + newName + ".txt", true);
        //pmReg.open("GET", "http://api.map.baidu.com/telematics/v3/weather?location=" + reName(cityName[0]) + "&output=xml&ak=D78f228016d8c538e0eee2c3d735529d", true);
       // pmReg.onreadystatechange = pmAjaxResponse;
        pmReg.send(null);
    }
}
function pmAjaxResponse(){
    var pmText = pmReg.responseText;
    var pmJson = JSON.parse(pmText)
    pM = document.getElementById("pm");
    pM.innerHTML = pmJson[0].aqi;
}
*/

//JSONP获取pm数据
function getPmValue(cityName){
    if(cityName != null){
        var newName = reName(cityName[0]);
        var url = ( "http://www.pm25.in/api/querys/pm10.json?city=" + newName + "&token=5j1znBVAsnSf5xQyNQyq&callback=pmAjaxResponse");
        var script = document.createElement('script');
        script.setAttribute('src', url);
        // 把script标签加入head，此时调用开始
        document.getElementsByTagName('head')[0].appendChild(script);
    }
}

function pmAjaxResponse(data){
    pM = document.getElementById("pm");
    pM.innerHTML = data[0].aqi;
    pM.style.color = "#FFFFFF"
    aqi = data[0].aqi;
    document.getElementById("pp").innerHTML = data[0].primary_pollutant;
    document.getElementById("pp").style.color = "#FFFFFF"
    document.getElementById("qu").innerHTML = data[0].quality;
    document.getElementById("qu").style.color = "#FFFFFF"
    qualityBglevel = getQualityBg(aqi);
    Bgcolor = getBgColor(qualityBglevel);
    document.getElementById("jb").style.backgroundColor = Bgcolor;
    posNum = data.length;
    for(var i =0; i < posNum; i++){
        posName[i] = data[i].position_name;
        pmData[i] = (data[i].pm10+" : "+data[i].quality);
    }
}

function searchC(){
    var myGeos = new BMap.Geocoder();
    var sw = document.getElementById("Cw");
    var searchCity = sw.value;
}
//确定污染颜色等级
function getQualityBg(pmValue){
    var qualityBglevel;
    if(pmValue < 50){
        qualityBglevel = 1;
    }
    else if( pmValue <100){
        qualityBglevel = 2;
    }
    else if( pmValue <150){
        qualityBglevel = 3;
    }
    else if( pmValue <200){
        qualityBglevel = 4;
    }
    else if(pmValue <300){
        qualityBglevel = 5;
    }
    else{
        qualityBglevel = 6;
    }
    return qualityBglevel;
}

//确定背景颜色值
function getBgColor(qualityBglevel){
    var Bgcolor;
    switch(qualityBglevel){
        case 1:
            Bgcolor = "#6EB720";
            break;
        case 2:
            Bgcolor = "#D6C60F";
            break;
        case 3:
            Bgcolor = "#EC7E22";
            break;
        case 4:
            Bgcolor = "#DF2D00";
            break;
        case 5:
            Bgcolor = "#B414BB";
            break;
        case 6:
            Bgcolor = "#6F0474";
    }
    return Bgcolor;
}
function deal(e){
    cityLng = e.point.lng;
    cityLat = e.point.lat;
    getCityName(cityLng, cityLat);
    getWeather(cityName);
    getPmValue(cityName);
}


