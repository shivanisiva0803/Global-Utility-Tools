const DateTime = luxon.DateTime;

let fp;
const GEO_USERNAME = "sathwi";

/* =========================
   POPULAR CITIES
========================= */

const popularCities = [
    { city: "Hyderabad", country: "India", countryCode: "IN", timezone: "Asia/Kolkata" },
    { city: "Mumbai", country: "India", countryCode: "IN", timezone: "Asia/Kolkata" },
    { city: "Delhi", country: "India", countryCode: "IN", timezone: "Asia/Kolkata" },
    { city: "New York", country: "United States", countryCode: "US", timezone: "America/New_York" },
    { city: "Chicago", country: "United States", countryCode: "US", timezone: "America/Chicago" },
    { city: "Dallas", country: "United States", countryCode: "US", timezone: "America/Chicago" },
    { city: "London", country: "United Kingdom", countryCode: "GB", timezone: "Europe/London" },
    { city: "Paris", country: "France", countryCode: "FR", timezone: "Europe/Paris" },
    { city: "Tokyo", country: "Japan", countryCode: "JP", timezone: "Asia/Tokyo" },
    { city: "Sydney", country: "Australia", countryCode: "AU", timezone: "Australia/Sydney" }
];

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime: true,
        allowInput: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date()
    });

    initSelect("#fromTimezone");
    initSelect("#toTimezone");

    setTimeout(() => {

        $("#fromTimezone")
            .val("Asia/Kolkata")
            .trigger("change");

        $("#toTimezone")
            .val("America/New_York")
            .trigger("change");

        updateCurrentTime();
        convertTime();

    }, 300);
});

/* =========================
   FLAGS
========================= */

function flagEmoji(code) {

    if (!code) return "🌍";

    return code
        .toUpperCase()
        .replace(/./g, c =>
            String.fromCodePoint(
                127397 + c.charCodeAt()
            )
        );
}

/* =========================
   TEMPLATE
========================= */

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

/* =========================
   SELECT2
========================= */

function initSelect(selector) {

    const localData = popularCities.map(x => ({
        id: x.timezone,
        text: x.city,
        city: x.city,
        country: x.country,
        countryCode: x.countryCode,
        timezone: x.timezone
    }));

    $(selector).select2({

        width: "100%",

        data: localData,

        templateResult: renderLocation,

        templateSelection: renderSelection,

        escapeMarkup: m => m,

        ajax: {

            delay: 300,

            transport: async function(params, success, failure) {

                const term = params.data.term;

                if (!term || term.length < 2) {
                    success({ results: [] });
                    return;
                }

                try {

                    const response = await fetch(
                        `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=15&featureClass=P&orderby=population&username=${GEO_USERNAME}`
                    );

                    const data = await response.json();

                    success({
                        results: data.geonames.map(city => ({
                            id: city.geonameId,
                            city: city.name,
                            country: city.countryName,
                            countryCode: city.countryCode,
                            lat: city.lat,
                            lng: city.lng,
                            text: city.name
                        }))
                    });

                } catch (err) {
                    failure(err);
                }
            },

            processResults: data => data
        }
    });

    $(selector).on("select2:select", async function(e) {

        const item = e.params.data;

        if (!item.lat || !item.lng)
            return;

        try {

            const tzResponse = await fetch(
                `https://secure.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${GEO_USERNAME}`
            );

            const tzData = await tzResponse.json();

            const timezone = tzData.timezoneId;

            const option = new Option(
                item.city,
                timezone,
                true,
                true
            );

            $(this)
                .append(option)
                .trigger("change");

            updateCurrentTime();
            convertTime();

        } catch (error) {

            console.error(
                "Timezone lookup failed",
                error
            );
        }
    });
}

/* =========================
   CURRENT TIME
========================= */

function updateCurrentTime() {

    const zone =
        $("#fromTimezone").val();

    if (!zone) return;

    const now =
        DateTime.now()
            .setZone(zone)
            .toFormat(
                "cccc, dd LLL yyyy, hh:mm a"
            );

    document.getElementById(
        "currentTime"
    ).innerHTML =
        `Current time: ${now}`;
}

$("#fromTimezone").on(
    "change",
    updateCurrentTime
);

/* =========================
   NOW
========================= */

function setNow() {

    fp.setDate(
        new Date(),
        true
    );

    convertTime();
}

/* =========================
   SWAP
========================= */

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

/* =========================
   CONVERT
========================= */

function convertTime() {

    if (!fp.selectedDates.length)
        return;

    const fromZone =
        $("#fromTimezone").val();

    const toZone =
        $("#toTimezone").val();

    if (!fromZone || !toZone)
        return;

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

    if (!source.isValid) {

        document.getElementById("result")
            .innerHTML =
            "Invalid source timezone";

        return;
    }

    const converted =
        source.setZone(toZone);

    if (!converted.isValid) {

        document.getElementById("result")
            .innerHTML =
            "Invalid target timezone";

        return;
    }

    document.getElementById("result")
        .innerHTML = `
            <div style="color:#777;font-size:13px;">
                ${fromZone} → ${toZone}
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

            <div style="
                margin-top:8px;
                color:#777;
                font-size:13px;
            ">
                GMT${converted.toFormat("ZZ")}
            </div>
        `;
}

/* =========================
   ENTER
========================= */

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            convertTime();
        }
    }
);
