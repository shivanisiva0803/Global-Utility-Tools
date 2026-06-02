const DateTime = luxon.DateTime;

let fp;

const GEO_USERNAME = "sathwi";

/* =========================
   POPULAR CITIES
========================= */

const popularCities = [
    ["Hyderabad","India","IN","Asia/Kolkata"],
    ["Mumbai","India","IN","Asia/Kolkata"],
    ["Delhi","India","IN","Asia/Kolkata"],
    ["New York","United States","US","America/New_York"],
    ["Dallas","United States","US","America/Chicago"],
    ["Chicago","United States","US","America/Chicago"],
    ["Los Angeles","United States","US","America/Los_Angeles"],
    ["London","United Kingdom","GB","Europe/London"],
    ["Berlin","Germany","DE","Europe/Berlin"],
    ["Paris","France","FR","Europe/Paris"],
    ["Tokyo","Japan","JP","Asia/Tokyo"],
    ["Sydney","Australia","AU","Australia/Sydney"],
    ["Dubai","United Arab Emirates","AE","Asia/Dubai"]
];

/* =========================
   FLATPICKR
========================= */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime:true,
        allowInput:true,
        dateFormat:"Y-m-d H:i",
        defaultDate:new Date()
    });

    initSelect("#fromTimezone");
    initSelect("#toTimezone");

    setTimeout(() => {

        selectDefault(
            "#fromTimezone",
            "Hyderabad",
            "India",
            "IN",
            "Asia/Kolkata"
        );

        selectDefault(
            "#toTimezone",
            "New York",
            "United States",
            "US",
            "America/New_York"
        );

        updateCurrentTime();
        convertTime();

    },300);
});

/* =========================
   FLAGS
========================= */

function flagEmoji(code){

    if(!code) return "🌍";

    return code
        .toUpperCase()
        .replace(/./g,char =>
            String.fromCodePoint(
                127397 + char.charCodeAt()
            )
        );
}

/* =========================
   TEMPLATE
========================= */

function renderLocation(item){

    if(!item.id)
        return item.text;

    return $(`
        <div class="location-item">

            <div class="location-left">

                <div class="city">
                    📍 ${item.city}
                </div>

                <div class="country">
                    ${flagEmoji(item.countryCode)}
                    ${item.country}
                </div>

            </div>

        </div>
    `);
}

function renderSelection(item){

    if(!item.city)
        return item.text;

    return `
        📍 ${item.city}
        ${flagEmoji(item.countryCode)}
    `;
}

/* =========================
   INIT SELECT2
========================= */

function initSelect(selector){

    const localData = popularCities.map(c => ({
        id:c[3],
        city:c[0],
        country:c[1],
        countryCode:c[2],
        timezone:c[3],
        text:c[0]
    }));

    $(selector).select2({

        width:"100%",

        data:localData,

        templateResult:renderLocation,

        templateSelection:renderSelection,

        escapeMarkup:m=>m,

        ajax:{

            delay:300,

            transport:async function(params,success,failure){

                const term = params.data.term;

                if(!term || term.length < 2){

                    success({results:[]});
                    return;
                }

                try{

                    const res = await fetch(
                        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=15&featureClass=P&orderby=population&username=${GEO_USERNAME}`
                    );

                    const data = await res.json();

                    success({
                        results:data.geonames.map(city => ({

                            id:city.geonameId,

                            city:city.name,

                            country:city.countryName,

                            countryCode:city.countryCode,

                            lat:city.lat,

                            lng:city.lng,

                            text:city.name

                        }))
                    });

                }catch(err){

                    failure(err);
                }
            },

            processResults:data=>data
        }
    });

    $(selector).on(
        "select2:select",
        async function(e){

            const item = e.params.data;

            if(!item.lat)
                return;

            try{

                const res = await fetch(
                    `https://secure.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${GEO_USERNAME}`
                );

                const tz = await res.json();

                $(this).data("city",item.city);
                $(this).data("country",item.country);
                $(this).data("countryCode",item.countryCode);
                $(this).data("timezone",tz.timezoneId);

                updateCurrentTime();
                convertTime();

            }catch(err){

                console.error(err);
            }
        }
    );
}

/* =========================
   DEFAULT
========================= */

function selectDefault(
    selector,
    city,
    country,
    code,
    timezone
){

    $(selector).data("city",city);
    $(selector).data("country",country);
    $(selector).data("countryCode",code);
    $(selector).data("timezone",timezone);

    $(selector)
        .val(timezone)
        .trigger("change");
}

/* =========================
   HELPERS
========================= */

function getZone(selector){

    return (
        $(selector).data("timezone")
        ||
        $(selector).val()
    );
}

function getCity(selector){

    return (
        $(selector).data("city")
        ||
        $(selector).select2("data")[0]?.city
        ||
        "Unknown"
    );
}

function getCountryCode(selector){

    return (
        $(selector).data("countryCode")
        ||
        $(selector).select2("data")[0]?.countryCode
        ||
        ""
    );
}

/* =========================
   CURRENT TIME
========================= */

function updateCurrentTime(){

    const zone = getZone("#fromTimezone");

    const now = DateTime.now()
        .setZone(zone)
        .toFormat(
            "cccc, dd LLL yyyy, hh:mm a"
        );

    document.getElementById(
        "currentTime"
    ).innerHTML =
    `Current time: ${now}`;
}

/* =========================
   NOW
========================= */

function setNow(){

    fp.setDate(
        new Date(),
        true
    );

    convertTime();
}

/* =========================
   SWAP
========================= */

function swapTimezones(){

    const fromData = {
        city:$("#fromTimezone").data("city"),
        country:$("#fromTimezone").data("country"),
        countryCode:$("#fromTimezone").data("countryCode"),
        timezone:$("#fromTimezone").data("timezone")
    };

    const toData = {
        city:$("#toTimezone").data("city"),
        country:$("#toTimezone").data("country"),
        countryCode:$("#toTimezone").data("countryCode"),
        timezone:$("#toTimezone").data("timezone")
    };

    $("#fromTimezone").data(toData);
    $("#toTimezone").data(fromData);

    const fromVal = $("#fromTimezone").val();
    const toVal = $("#toTimezone").val();

    $("#fromTimezone").val(toVal).trigger("change");
    $("#toTimezone").val(fromVal).trigger("change");

    updateCurrentTime();
    convertTime();
}

/* =========================
   CONVERT
========================= */

function convertTime(){

    if(!fp.selectedDates.length)
        return;

    const fromZone = getZone("#fromTimezone");
    const toZone = getZone("#toTimezone");

    const d = fp.selectedDates[0];

    const source = DateTime.fromObject(
        {
            year:d.getFullYear(),
            month:d.getMonth()+1,
            day:d.getDate(),
            hour:d.getHours(),
            minute:d.getMinutes()
        },
        {
            zone:fromZone
        }
    );

    const converted =
        source.setZone(toZone);

    document.getElementById("result")
    .innerHTML = `

        <div class="result-route">

            <div class="result-city">
                <span class="pin">📍</span>
                ${getCity("#fromTimezone")}
                <span class="flag">
                    ${flagEmoji(
                        getCountryCode("#fromTimezone")
                    )}
                </span>
            </div>

            ➜

            <div class="result-city">
                <span class="pin">📍</span>
                ${getCity("#toTimezone")}
                <span class="flag">
                    ${flagEmoji(
                        getCountryCode("#toTimezone")
                    )}
                </span>
            </div>

        </div>

        <div style="
            font-size:28px;
            font-weight:700;
            color:#4361ee;
        ">
            ${converted.toFormat(
                "cccc, dd LLL yyyy"
            )}
        </div>

        <div style="
            font-size:22px;
            margin-top:8px;
        ">
            ${converted.toFormat(
                "hh:mm a"
            )}
        </div>

        <div style="
            margin-top:10px;
            color:#777;
        ">
            GMT${converted.toFormat("ZZ")}
        </div>
    `;
}

/* =========================
   EVENTS
========================= */

$(document).on(
    "change",
    "#fromTimezone",
    updateCurrentTime
);

document.addEventListener(
    "keydown",
    e => {

        if(e.key==="Enter")
            convertTime();
    }
);
