const DateTime = luxon.DateTime;

let fp;

const GEO_USERNAME = "sathwi";

/* =========================
   POPULAR CITIES
========================= */

const popularCities = [
    ["Hyderabad", "India", "IN", "Asia/Kolkata"],
    ["Mumbai", "India", "IN", "Asia/Kolkata"],
    ["Delhi", "India", "IN", "Asia/Kolkata"],
    ["New York", "United States", "US", "America/New_York"],
    ["Dallas", "United States", "US", "America/Chicago"],
    ["Chicago", "United States", "US", "America/Chicago"],
    ["Los Angeles", "United States", "US", "America/Los_Angeles"],
    ["London", "United Kingdom", "GB", "Europe/London"],
    ["Berlin", "Germany", "DE", "Europe/Berlin"],
    ["Paris", "France", "FR", "Europe/Paris"],
    ["Tokyo", "Japan", "JP", "Asia/Tokyo"],
    ["Sydney", "Australia", "AU", "Australia/Sydney"],
    ["Dubai", "United Arab Emirates", "AE", "Asia/Dubai"]
];

/* =========================
   FLAG
========================= */

function flagEmoji(code) {

    if (!code) return "🌍";

    return code
        .toUpperCase()
        .replace(
            /./g,
            c =>
                String.fromCodePoint(
                    127397 + c.charCodeAt()
                )
        );
}

/* =========================
   INIT
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        fp = flatpickr(
            "#timeInput",
            {
                enableTime: true,
                allowInput: true,
                dateFormat: "Y-m-d H:i",
                defaultDate: new Date()
            }
        );

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
    }
);

/* =========================
   TEMPLATE
========================= */

function renderLocation(item) {

    if (!item.id)
        return item.text;

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
   DROPDOWN
========================= */

function initSelect(selector) {

    const localData =
        popularCities.map(x => ({
            id: x[3], // timezone
            city: x[0],
            country: x[1],
            countryCode: x[2],
            timezone: x[3],
            text: x[0]
        }));

    $(selector).select2({

        width: "100%",

        data: localData,

        templateResult: renderLocation,

        templateSelection: renderSelection,

        escapeMarkup: m => m,

        ajax: {

            delay: 300,

            transport: async function (
                params,
                success,
                failure
            ) {

                const term =
                    params.data.term;

                if (
                    !term ||
                    term.length < 2
                ) {

                    success({
                        results: []
                    });

                    return;
                }

                try {

                    const response =
                        await fetch(
                            `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=15&featureClass=P&orderby=population&username=${GEO_USERNAME}`
                        );

                    const data =
                        await response.json();

                    const results =
                        data.geonames.map(
                            city => ({

                                id:
                                    city.geonameId,

                                city:
                                    city.name,

                                country:
                                    city.countryName,

                                countryCode:
                                    city.countryCode,

                                lat:
                                    city.lat,

                                lng:
                                    city.lng,

                                text:
                                    city.name
                            })
                        );

                    success({
                        results
                    });

                } catch (err) {

                    failure(err);
                }
            },

            processResults:
                data => data
        }
    });

    $(selector).on(
        "select2:select",
        async function (e) {

            const item =
                e.params.data;

            if (
                !item.lat ||
                !item.lng
            ) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `https://secure.geonames.org/timezoneJSON?lat=${item.lat}&lng=${item.lng}&username=${GEO_USERNAME}`
                    );

                const tz =
                    await response.json();

                const timezone =
                    tz.timezoneId;

                // Save timezone on select
                $(this).data(
                    "timezone",
                    timezone
                );

                $(this).data(
                    "city",
                    item.city
                );

                updateCurrentTime();

                convertTime();

            } catch (err) {

                console.error(
                    err
                );
            }
        }
    );
}

/* =========================
   GET TIMEZONE
========================= */

function getTimezone(selector) {

    const stored =
        $(selector)
            .data("timezone");

    if (stored)
        return stored;

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

/* =========================
   CURRENT TIME
========================= */

function updateCurrentTime() {

    const zone =
        getTimezone(
            "#fromTimezone"
        );

    const now =
        DateTime.now()
            .setZone(zone)
            .toFormat(
                "cccc, dd LLL yyyy, hh:mm a"
            );

    document
        .getElementById(
            "currentTime"
        )
        .innerHTML =
        `Current time: ${now}`;
}

$(document).on(
    "change",
    "#fromTimezone",
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

    const fromZone =
        getTimezone(
            "#fromTimezone"
        );

    const toZone =
        getTimezone(
            "#toTimezone"
        );

    $("#fromTimezone")
        .data(
            "timezone",
            toZone
        );

    $("#toTimezone")
        .data(
            "timezone",
            fromZone
        );

    const fromVal =
        $("#fromTimezone")
            .val();

    const toVal =
        $("#toTimezone")
            .val();

    $("#fromTimezone")
        .val(toVal)
        .trigger("change");

    $("#toTimezone")
        .val(fromVal)
        .trigger("change");

    convertTime();
}

/* =========================
   CONVERT
========================= */

function convertTime() {

    if (
        !fp ||
        !fp.selectedDates.length
    ) {
        return;
    }

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
                year:
                    d.getFullYear(),
                month:
                    d.getMonth() + 1,
                day:
                    d.getDate(),
                hour:
                    d.getHours(),
                minute:
                    d.getMinutes()
            },
            {
                zone:
                    fromZone
            }
        );

    if (!source.isValid) {

        document
            .getElementById(
                "result"
            )
            .innerHTML =
            "Invalid source timezone";

        return;
    }

    const converted =
        source.setZone(
            toZone
        );

    if (!converted.isValid) {

        document
            .getElementById(
                "result"
            )
            .innerHTML =
            "Invalid target timezone";

        return;
    }

    document
        .getElementById(
            "result"
        )
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

        <div style="
            margin-top:10px;
            color:#777;
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

        if (
            e.key === "Enter"
        ) {
            convertTime();
        }
    }
);
