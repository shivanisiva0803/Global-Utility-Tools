const DateTime = luxon.DateTime;

let fp;

const GEO_USERNAME = "sathwi";

/* ==========================
   POPULAR CITIES
========================== */

const popularCities = [

    {
        city: "Hyderabad",
        country: "India",
        countryCode: "IN",
        timezone: "Asia/Kolkata"
    },

    {
        city: "Mumbai",
        country: "India",
        countryCode: "IN",
        timezone: "Asia/Kolkata"
    },

    {
        city: "Delhi",
        country: "India",
        countryCode: "IN",
        timezone: "Asia/Kolkata"
    },

    {
        city: "London",
        country: "United Kingdom",
        countryCode: "GB",
        timezone: "Europe/London"
    },

    {
        city: "New York",
        country: "United States",
        countryCode: "US",
        timezone: "America/New_York"
    },

    {
        city: "Chicago",
        country: "United States",
        countryCode: "US",
        timezone: "America/Chicago"
    },

    {
        city: "Los Angeles",
        country: "United States",
        countryCode: "US",
        timezone: "America/Los_Angeles"
    },

    {
        city: "Sydney",
        country: "Australia",
        countryCode: "AU",
        timezone: "Australia/Sydney"
    },

    {
        city: "Tokyo",
        country: "Japan",
        countryCode: "JP",
        timezone: "Asia/Tokyo"
    },

    {
        city: "Dubai",
        country: "United Arab Emirates",
        countryCode: "AE",
        timezone: "Asia/Dubai"
    }
];

/* ==========================
   INIT
========================== */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime: true,
        allowInput: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date()
    });

    initDropdown("#fromTimezone");
    initDropdown("#toTimezone");

    setTimeout(() => {

        selectDefaultValues();

        convertTime();

    }, 500);
});

/* ==========================
   FLAGS
========================== */

function flagEmoji(code) {

    return code
        .toUpperCase()
        .replace(/./g, c =>
            String.fromCodePoint(
                127397 + c.charCodeAt()
            )
        );
}

/* ==========================
   TEMPLATE
========================== */

function renderLocation(item) {

    if (!item.id) return item.text;

    return $(`
        <div class="location-item">

            <div class="location-left">

                <div class="city">
                    ${flagEmoji(item.countryCode)}
                    ${item.city}
                </div>

                <div class="country">
                    ${item.country}
                </div>

            </div>

        </div>
    `);
}

function renderSelection(item) {

    if (!item.city)
        return item.text;

    return `
        ${flagEmoji(item.countryCode)}
        ${item.city}
    `;
}

/* ==========================
   DROPDOWN
========================== */

function initDropdown(selector) {

    const localData = popularCities.map(x => ({

        id: x.timezone,

        city: x.city,

        country: x.country,

        countryCode: x.countryCode,

        timezone: x.timezone,

        text: x.city
    }));

    $(selector).select2({

        width: "100%",

        data: localData,

        minimumInputLength: 0,

        templateResult: renderLocation,

        templateSelection: renderSelection,

        escapeMarkup: m => m,

        ajax: {

            delay: 300,

            transport: function(params, success, failure) {

                const term =
                    params.data.term;

                if (!term || term.length < 2) {

                    success({
                        results: []
                    });

                    return;
                }

                fetch(
                    `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=15&featureClass=P&orderby=population&username=${GEO_USERNAME}`
                )
                .then(r => r.json())
                .then(data => {

                    const results =
                        data.geonames.map(x => ({

                            id:
                                `${x.lat}_${x.lng}`,

                            city:
                                x.name,

                            country:
                                x.countryName,

                            countryCode:
                                x.countryCode,

                            lat:
                                x.lat,

                            lng:
                                x.lng,

                            text:
                                x.name
                        }));

                    success({
                        results
                    });
                })
                .catch(failure);
            },

            processResults: data => data
        }
    });

    $(selector).on(
        "select2:select",
        async function(e) {

            const item =
                e.params.data;

            if (!item.lat)
                return;

            try {

                const response =
                    await fetch(
                        `https://secure.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${GEO_USERNAME}`
                    );

                const tz =
                    await response.json();

                item.timezone =
                    tz.timezoneId;

                $(this)
                    .data("timezone",
                        tz.timezoneId
                    );

            } catch {}
        }
    );
}

/* ==========================
   DEFAULTS
========================== */

function selectDefaultValues() {

    $("#fromTimezone")
        .val("Asia/Kolkata")
        .trigger("change");

    $("#toTimezone")
        .val("America/New_York")
        .trigger("change");

    updateCurrentTime();
}

/* ==========================
   GET TIMEZONE
========================== */

function getTimezone(selector) {

    const selected =
        $(selector)
        .select2("data")[0];

    if (!selected)
        return "UTC";

    return (
        selected.timezone ||
        selected.id ||
        "UTC"
    );
}

/* ==========================
   CURRENT TIME
========================== */

function updateCurrentTime() {

    const zone =
        getTimezone("#fromTimezone");

    const now =
        DateTime.now()
        .setZone(zone)
        .toFormat(
            "cccc, dd LLL yyyy, hh:mm a"
        );

    document
        .getElementById("currentTime")
        .innerHTML =
        `Current time: ${now}`;
}

$("#fromTimezone").on(
    "change",
    updateCurrentTime
);

/* ==========================
   NOW
========================== */

function setNow() {

    fp.setDate(
        new Date(),
        true
    );

    convertTime();
}

/* ==========================
   SWAP
========================== */

function swapTimezones() {

    const from =
        $("#fromTimezone").val();

    const to =
        $("#toTimezone").val();

    $("#fromTimezone")
        .val(to)
        .trigger("change");

    $("#toTimezone")
        .val(from)
        .trigger("change");

    convertTime();
}

/* ==========================
   CONVERT
========================== */

function convertTime() {

    if (!fp.selectedDates.length)
        return;

    const fromZone =
        getTimezone(
            "#fromTimezone"
        );

    const toZone =
        getTimezone(
            "#toTimezone"
        );

    const d =
        fp.selectedDates[0];

    const source =
        DateTime.fromObject(
            {
                year: d.getFullYear(),
                month: d.getMonth() + 1,
                day: d.getDate(),
                hour: d.getHours(),
                minute: d.getMinutes()
            },
            {
                zone: fromZone
            }
        );

    const converted =
        source.setZone(toZone);

    document
        .getElementById("result")
        .innerHTML = `
            <div style="
                color:#777;
                font-size:13px;
            ">
                ${fromZone}
                →
                ${toZone}
            </div>

            <div style="
                margin-top:12px;
                font-size:28px;
                font-weight:700;
                color:#4361ee;
            ">
                ${converted.toFormat(
                    "cccc, dd LLL yyyy"
                )}
            </div>

            <div style="
                margin-top:8px;
                font-size:22px;
            ">
                ${converted.toFormat(
                    "hh:mm a"
                )}
            </div>
        `;
}

/* ==========================
   ENTER
========================== */

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter")
            convertTime();
    }
);
