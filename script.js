const DateTime = luxon.DateTime;

let fp;

/* ==================================
   INIT
================================== */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime: true,
        allowInput: true,
        time_24hr: false,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date()
    });

    initializeSelect2();

    setNow();
});

/* ==================================
   SELECT2 + GEONAMES
================================== */

function initializeSelect2() {

    $("#fromTimezone").select2({

        width: "100%",

        placeholder: "Search city or country",

        minimumInputLength: 2,

        ajax: {

            transport: function(params, success, failure) {

                const term =
                    params.data.term || "";

                fetch(
                    `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=20&featureClass=P&orderby=population&username=sathwi`
                )
                .then(r => r.json())
                .then(data => {

                    success({

                        results:
                            data.geonames.map(city => ({

                                id:
                                    city.timezone?.timeZoneId ||
                                    city.name,

                                text:
                                    city.name,

                                city:
                                    city.name,

                                country:
                                    city.countryName,

                                timezone:
                                    city.timezone?.timeZoneId ||

                                    "UTC"
                            }))
                    });

                })
                .catch(failure);
            }
        },

        templateResult: formatLocation,

        templateSelection: function(item) {

            return item.city
                ? `📍 ${item.city}`
                : item.text;
        }
    });

    $("#toTimezone").select2({

        width: "100%",

        placeholder: "Search city or country",

        minimumInputLength: 2,

        ajax: {

            transport: function(params, success, failure) {

                const term =
                    params.data.term || "";

                fetch(
                    `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(term)}&maxRows=20&featureClass=P&orderby=population&username=sathwi`
                )
                .then(r => r.json())
                .then(data => {

                    success({

                        results:
                            data.geonames.map(city => ({

                                id:
                                    city.timezone?.timeZoneId ||
                                    city.name,

                                text:
                                    city.name,

                                city:
                                    city.name,

                                country:
                                    city.countryName,

                                timezone:
                                    city.timezone?.timeZoneId ||

                                    "UTC"
                            }))
                    });

                })
                .catch(failure);
            }
        },

        templateResult: formatLocation,

        templateSelection: function(item) {

            return item.city
                ? `📍 ${item.city}`
                : item.text;
        }
    });

    addDefaultSelections();
}

/* ==================================
   DROPDOWN UI
================================== */

function formatLocation(item) {

    if (!item.id)
        return item.text;

    return $(`
        <div class="location-item">

            <div class="location-left">

                <div class="city">
                    📍 ${item.city}
                </div>

                <div class="country">
                    ${item.country}
                </div>

            </div>

        </div>
    `);
}

/* ==================================
   DEFAULT VALUES
================================== */

function addDefaultSelections() {

    const india = {

        id: "Asia/Kolkata",
        text: "Hyderabad",
        city: "Hyderabad",
        country: "India",
        timezone: "Asia/Kolkata"
    };

    const ny = {

        id: "America/New_York",
        text: "New York",
        city: "New York",
        country: "United States",
        timezone: "America/New_York"
    };

    const option1 =
        new Option(
            india.text,
            india.timezone,
            true,
            true
        );

    $("#fromTimezone")
        .append(option1)
        .trigger("change");

    const option2 =
        new Option(
            ny.text,
            ny.timezone,
            true,
            true
        );

    $("#toTimezone")
        .append(option2)
        .trigger("change");

    updateCurrentTime();
}

/* ==================================
   CURRENT TIME
================================== */

function updateCurrentTime() {

    const tz =
        $("#fromTimezone").val();

    if (!tz) return;

    document
        .getElementById("currentTime")
        .innerHTML =

        "Current time: " +

        DateTime.now()
            .setZone(tz)
            .toFormat(
                "cccc, dd LLL yyyy, hh:mm a"
            );
}

$(document).on(
    "change",
    "#fromTimezone",
    updateCurrentTime
);

/* ==================================
   SET NOW
================================== */

function setNow() {

    fp.setDate(
        new Date(),
        true
    );

    convertTime();
}

/* ==================================
   SWAP
================================== */

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

/* ==================================
   CONVERT
================================== */

function convertTime() {

    if (!fp.selectedDates.length)
        return;

    const fromTZ =
        $("#fromTimezone").val();

    const toTZ =
        $("#toTimezone").val();

    if (!fromTZ || !toTZ)
        return;

    const d =
        fp.selectedDates[0];

    const sourceDate =
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
                    fromTZ
            }
        );

    const converted =
        sourceDate.setZone(
            toTZ
        );

    document
        .getElementById("result")
        .innerHTML =

        `
        <div style="
            color:#777;
            font-size:13px;
            margin-bottom:10px;
        ">
            ${fromTZ}
            →
            ${toTZ}
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
            margin-top:10px;
        ">
            ${converted.toFormat(
                "hh:mm a"
            )}
        </div>
        `;
}

/* ==================================
   ENTER KEY
================================== */

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            convertTime();
        }
    }
);
