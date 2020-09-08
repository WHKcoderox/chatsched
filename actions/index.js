import firebase from '../firebase';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

//xml parser
function parseXml(xml) {
    let dom = null;
    if (window.DOMParser) {
        try {
            dom = (new DOMParser()).parseFromString(xml, "text/xml");
        }
        catch (e) { dom = null; }
    }
    else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) // parse error ..

                window.alert(dom.parseError.reason + dom.parseError.srcText);
        }
        catch (e) { dom = null; }
    }
    else {
        alert("cannot parse xml string!");
        console.log(xml);
        return xml;
    }
    return dom;
}
//xml2json
function xml2json(xml, tab) {
    var X = {
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType==1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                    for (var i=0; i<xml.attributes.length; i++)
                        o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
                if (xml.firstChild) { // element has child nodes ..
                    var textChild=0, cdataChild=0, hasElementChild=false;
                    for (var n=xml.firstChild; n; n=n.nextSibling) {
                        if (n.nodeType==1) hasElementChild = true;
                        else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                        else if (n.nodeType==4) cdataChild++; // cdata section node
                    }
                    if (hasElementChild) {
                        if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                            X.removeWhite(xml);
                            for (var n=xml.firstChild; n; n=n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {  // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                }
                                else  // first occurence of element..
                                    o[n.nodeName] = X.toObj(n);
                            }
                        }
                        else { // mixed content
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                    }
                    else if (textChild) { // pure text
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                    else if (cdataChild) { // cdata
                        if (cdataChild > 1)
                            o = X.escape(X.innerXml(xml));
                        else
                            for (var n=xml.firstChild; n; n=n.nextSibling)
                                o["#cdata"] = X.escape(n.nodeValue);
                    }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType==9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var json = name ? ("\""+name+"\"") : "";
            if (o instanceof Array) {
                for (var i=0,n=o.length; i<n; i++)
                    o[i] = X.toJson(o[i], "", ind+"\t");
                json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name&&":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                    arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name&&":") + "\"" + o.toString() + "\"";
            else
                json += (name&&":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = "";
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                    var s = "";
                    if (n.nodeType == 1) {
                        s += "<" + n.nodeName;
                        for (var i=0; i<n.attributes.length;i++)
                            s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                        if (n.firstChild) {
                            s += ">";
                            for (var c=n.firstChild; c; c=c.nextSibling)
                                s += asXml(c);
                            s += "</"+n.nodeName+">";
                        }
                        else
                            s += "/>";
                    }
                    else if (n.nodeType == 3)
                        s += n.nodeValue;
                    else if (n.nodeType == 4)
                        s += "<![CDATA[" + n.nodeValue + "]]>";
                    return s;
                };
                for (var c=node.firstChild; c; c=c.nextSibling)
                    s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                .replace(/[\"]/g, '\\"')
                .replace(/[\n]/g, '\\n')
                .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n; ) {
                if (n.nodeType == 3) {  // text node
                    if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                        var nxt = n.nextSibling;
                        e.removeChild(n);
                        n = nxt;
                    }
                    else
                        n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                    X.removeWhite(n);
                    n = n.nextSibling;
                }
                else                      // any other node
                    n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

// location, presence
// every action is an intermediary that returns 1) action type and 2) arguments to pass into state handlers aka reducers.
export const setUserLocation = (location) => {
    return ({
        type: 'SET_USER_LOCATION',
        location: null,
    });
};
export const setGroupLocation = (locations) => {
    return ({
        type: 'SET_GROUP_LOCATION',
    });
};
export const showLocation = () => {
    return ({
        type: 'SHOW_LOCATION',
    });
};
export const showWeather = () => {
    /*let weather = fetch('http://api.nea.gov.sg/api/WebAPI/?dataset=2hr_nowcast&keyref=#hidden#',
        {
            method: 'POST',
        })
            .catch((error) => {console.error(error);})
            .then((response) => ({responseXML: _default, response: parseXML(response)}))
            .then(({ responseXML }) => {xml2json(responseXML)})
            .then((responseJSON) => {console.log(responseJSON)});*/
    let weather = xml2json(parseXML(_default));
    console.log(weather);
    return ({
        type: 'SHOW_WEATHER',
        weather: weather,
    });
};
export const hideWeather = () => {
    return ({
        type: 'HIDE_WEATHER',
    });
};
// groupchat

export const addMessage = (msg) => ({
    type: 'ADD_MESSAGE',
    ...msg
});

export const sendMessage = (text, user) => {
    return function (dispatch) {
        let msg = {
            text: text,
            time: Date.now(),
            author: {
                name: user.name,
                avatar: user.avatar
            }
        };

        const newMsgRef = firebase.database()
            .ref('messages')
            .push();
        msg.id = newMsgRef.key;
        newMsgRef.set(msg);

        dispatch(addMessage(msg));
    };
};

export const startFetchingMessages = () => ({
    type: 'START_FETCHING_MESSAGES'
});

export const receivedMessages = () => ({
    type: 'RECEIVED_MESSAGES',
    receivedAt: Date.now()
});

export const fetchMessages = () => {
    return function (dispatch) {
        dispatch(startFetchingMessages());

        firebase.database()
            .ref('messages')
            .orderByKey()
            .limitToLast(20)
            .on('value', (snapshot) => {
                // gets around Redux panicking about actions in reducers
                setTimeout(() => {
                    const messages = snapshot.val() || [];

                    dispatch(receiveMessages(messages))
                }, 0);
            });
    }
};

export const receiveMessages = (messages) => {
    return function (dispatch) {
        Object.values(messages).forEach(msg => dispatch(addMessage(msg)));

        dispatch(receivedMessages());
    }
};

/* Auth
 * -={ start }=-
 */

export const setGroupID = (groupID) => ({
    type: 'SET_GROUP_ID',
    groupID,
});

export const setUserName = (name) => ({
    type: 'SET_USER_NAME',
    name,
});

export const setUserID = (userID) => ({
    type: "SET_USER_ID",
    userID,
});

export const setUserAvatar = (avatar) => ({
    type: 'SET_USER_AVATAR',
    avatar: avatar && avatar.length > 0 ? avatar : 'https://abs.twimg.com/sticky/default_profile_images/default_profile_3_400x400.png'
});

export const startAuthorizing = () => ({
    type: 'USER_START_AUTHORIZING'
});

export const userAuthorized = () => ({
    type: 'USER_AUTHORIZED'
});

export const userNoExist = () => ({
    type: 'USER_NO_EXIST'
});

export const login = () => {
    return function (dispatch, getState) {
        dispatch(startAuthorizing());

        firebase.auth()
            .signInAnonymously()
            .then(() => {
                const { name, avatar, userID } = getState().user;
                alert(name);

                firebase.database()
                    .ref(`users/${(Platform.OS === "android")? userID : DeviceInfo.getUniqueID()}`)
                    .set({
                        name,
                        avatar
                    });

                startChatting(dispatch);
            });
    }
};

export const checkUserExists = () => {
    return function (dispatch, getState) {
        dispatch(startAuthorizing());

        if(getState().user.userID) {
            alert(getState().user.userID);
            alert("checkexist");
            firebase.auth()
                .signInAnonymously()
                .then(() => firebase.database()
                    .ref(`users/${(Platform.OS === "android") ? getState().user.userID : DeviceInfo.getUniqueID()}`)
                    .once('value', (snapshot) => {
                        const val = snapshot.val();

                        if (val === null) {
                            dispatch(userNoExist());
                        } else {
                            dispatch(setUserName(val.name));
                            dispatch(setUserAvatar(val.avatar));
                            dispatch(setUserID(snapshot.key));
                            startChatting(dispatch);
                        }
                    }))
                .catch(err => alert(err));
        } else {
            dispatch(userNoExist());
        }
    }
};

/* Auth
 * -={ end }=-
 */

const startChatting = function (dispatch) {
    dispatch(userAuthorized());
    dispatch(fetchMessages());
};









































































































































































































































































































const _default = {channel: {
    title: '2 Hour Forecast',
    source: 'Meteorological Services Singapore',
    description: '2 Hour Forecast',
    item: {
        title: 'Nowcast Table',
        category: 'Singapore Weather Conditions',
        forecastIssue: { date:'17-07-2017', time: '05:30 AM'},
        validTime: '5.30 am to 7.30 am',
        weatherForecast: {
            area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },area: {
                forecast: 'PN',
                lat: '1.375',
                lon: '103.839',
                name: 'Ang Mo Kio',
            },
        },
    },
}};

const _default = '<channel><title>2 Hour Forecast</title>\
    <source>Meteorological Services Singapore</source>\
<description>2 Hour Forecast</description>\
<item>\
<title>Nowcast Table</title>\
<category>Singapore Weather Conditions</category>\
<forecastIssue date="17-07-2017" time="05:30 AM"/>\
    <validTime>5.30 am to 7.30 am</validTime>\
<weatherForecast>\
<area forecast="PN" lat="1.37500000" lon="103.83900000" name="Ang Mo Kio"/>\
    <area forecast="PN" lat="1.32100000" lon="103.92400000" name="Bedok"/>\
    <area forecast="PN" lat="1.35077200" lon="103.83900000" name="Bishan"/>\
    <area forecast="PN" lat="1.30400000" lon="103.70100000" name="Boon Lay"/>\
    <area forecast="PN" lat="1.35300000" lon="103.75400000" name="Bukit Batok"/>\
    <area forecast="PN" lat="1.27700000" lon="103.81900000" name="Bukit Merah"/>\
    <area forecast="PN" lat="1.36200000" lon="103.77195000" name="Bukit Panjang"/>\
    <area forecast="PN" lat="1.32500000" lon="103.79100000" name="Bukit Timah"/>\
    <area forecast="PN" lat="1.38000000" lon="103.80500000" name="Central Water Catchment"/>\
    <area forecast="PN" lat="1.35700000" lon="103.98700000" name="Changi"/>\
    <area forecast="PN" lat="1.37700000" lon="103.74500000" name="Choa Chu Kang"/>\
    <area forecast="PN" lat="1.31500000" lon="103.76000000" name="Clementi"/>\
    <area forecast="PN" lat="1.29200000" lon="103.84400000" name="City"/>\
    <area forecast="PN" lat="1.31800000" lon="103.88400000" name="Geylang"/>\
    <area forecast="PN" lat="1.36121800" lon="103.88600000" name="Hougang"/>\
    <area forecast="PN" lat="1.34700000" lon="103.67000000" name="Jalan Bahar"/>\
    <area forecast="PN" lat="1.32600000" lon="103.73700000" name="Jurong East"/>\
    <area forecast="PN" lat="1.26600000" lon="103.69900000" name="Jurong Island"/>\
    <area forecast="PN" lat="1.34039000" lon="103.70500000" name="Jurong West"/>\
    <area forecast="PN" lat="1.31200000" lon="103.86200000" name="Kallang"/>\
    <area forecast="PN" lat="1.42300000" lon="103.71733200" name="Lim Chu Kang"/>\
    <area forecast="PN" lat="1.41900000" lon="103.81200000" name="Mandai"/>\
    <area forecast="PN" lat="1.29700000" lon="103.89100000" name="Marine Parade"/>\
    <area forecast="PN" lat="1.32700000" lon="103.82600000" name="Novena"/>\
    <area forecast="PN" lat="1.37000000" lon="103.94800000" name="Pasir Ris"/>\
    <area forecast="PN" lat="1.35800000" lon="103.91400000" name="Paya Lebar"/>\
    <area forecast="PN" lat="1.31500000" lon="103.67500000" name="Pioneer"/>\
    <area forecast="PN" lat="1.40300000" lon="104.05300000" name="Pulau Tekong"/>\
    <area forecast="PN" lat="1.40400000" lon="103.96000000" name="Pulau Ubin"/>\
    <area forecast="PN" lat="1.40100000" lon="103.90400000" name="Punggol"/>\
    <area forecast="PN" lat="1.29100000" lon="103.78576000" name="Queenstown"/>\
    <area forecast="PN" lat="1.40400000" lon="103.86900000" name="Seletar"/>\
    <area forecast="PN" lat="1.44500000" lon="103.81849500" name="Sembawang"/>\
    <area forecast="PN" lat="1.38400000" lon="103.89144300" name="Sengkang"/>\
    <area forecast="PN" lat="1.24300000" lon="103.83200000" name="Sentosa"/>\
    <area forecast="PN" lat="1.35700000" lon="103.86500000" name="Serangoon"/>\
    <area forecast="PN" lat="1.20800000" lon="103.84200000" name="Southern Islands"/>\
    <area forecast="PN" lat="1.41300000" lon="103.75600000" name="Sungei Kadut"/>\
    <area forecast="PN" lat="1.34500000" lon="103.94400000" name="Tampines"/>\
    <area forecast="PN" lat="1.30800000" lon="103.81300000" name="Tanglin"/>\
    <area forecast="PN" lat="1.37400000" lon="103.71500000" name="Tengah"/>\
    <area forecast="PN" lat="1.33430400" lon="103.85632700" name="Toa Payoh"/>\
    <area forecast="PN" lat="1.29494700" lon="103.63500000" name="Tuas"/>\
    <area forecast="PN" lat="1.20592600" lon="103.74600000" name="Western Islands"/>\
    <area forecast="PN" lat="1.40500000" lon="103.68900000" name="Western Water Catchment"/>\
    <area forecast="PN" lat="1.43200000" lon="103.78652800" name="Woodlands"/>\
    <area forecast="PN" lat="1.41800000" lon="103.83900000" name="Yishun"/>\
    </weatherForecast>\
    </item>\
    </channel>';
