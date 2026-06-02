const DateTime = luxon.DateTime;

let fp;

/* ==========================
   INIT
========================== */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime: true,
        time_24hr: false,
        allowInput: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date()
    });

    loadTimezones();

    setTimeout(() => {
        convertTime();
    }, 300);
});

/* ==========================
   TIMEZONE DATA
========================== */

function loadTimezones() {

    const zones = [

        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Asia/Tokyo",
        "Asia/Shanghai",

        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",
        "Europe/Rome",

        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "America/Toronto",

        "Australia/Sydney",
        "Australia/Melbourne",

        "Africa/Cairo",
        "Africa/Johannesburg",

        "Pacific/Auckland"
    ];

    function getFlag(zone) {

        if (zone.startsWith("Asia")) return "🌏";
        if (zone.startsWith("Europe")) return "🇪🇺";
        if (zone.startsWith("America")) return "🌎";
        if (zone.startsWith("Australia")) return "🇦🇺";
        if (zone.startsWith("Africa")) return "🌍";
        if (zone.startsWith("Pacific")) return "🌊";

        return "🌐";
    }

    const data = zones.map(zone => ({

        id: zone,

        text:
            `${getFlag(zone)} ${zone} (GMT${DateTime.now()
                .setZone(zone)
                .toFormat("ZZ")})`
    }));

    $("#fromTimezone").select2({
        data,
        width: "100%"
    });

    $("#toTimezone").select2({
        data,
        width: "100%"
    });

    $("#fromTimezone")
        .val("Asia/Kolkata")
        .trigger("change");

    $("#toTimezone")
        .val("America/New_York")
        .trigger("change");

    $("#fromTimezone")
        .on("change", updateCurrentTime);

    updateCurrentTime();
}

/* ==========================
   CURRENT TIME
========================== */

function updateCurrentTime() {

    const zone =
        $("#fromTimezone").val();

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

/* ==========================
   SET NOW
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

    if (!fp.selectedDates.length) {

        document.getElementById("result")
            .innerHTML =
            "Select date and time";

        return;
    }

    const fromZone =
        $("#fromTimezone").val();

    const toZone =
        $("#toTimezone").val();

    const d =
        fp.selectedDates[0];

    const sourceDate = DateTime.fromObject(
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

    if (!sourceDate.isValid) {

        document.getElementById("result")
            .innerHTML =
            "Invalid source timezone";

        return;
    }

    const targetDate =
        sourceDate.setZone(toZone);

    if (!targetDate.isValid) {

        document.getElementById("result")
            .innerHTML =
            "Invalid target timezone";

        return;
    }

    document.getElementById("result")
        .innerHTML =

        `
        <div style="
            color:#666;
            font-size:13px;
            margin-bottom:10px;
        ">
            ${fromZone}
            →
            ${toZone}
        </div>

        <div style="
            font-size:28px;
            font-weight:700;
            color:#4361ee;
        ">
            ${targetDate.toFormat(
                "cccc, dd LLL yyyy"
            )}
        </div>

        <div style="
            margin-top:10px;
            font-size:22px;
            font-weight:600;
        ">
            ${targetDate.toFormat(
                "hh:mm a"
            )}
        </div>

        <div style="
            margin-top:10px;
            color:#777;
            font-size:13px;
        ">
            GMT${targetDate.toFormat("ZZ")}
        </div>
        `;
}

/* ==========================
   ENTER KEY
========================== */

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {
            convertTime();
        }
    }
);
