const DateTime = luxon.DateTime;

let fp;

/* ---------------------------
   FLATPICKR INIT
---------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    fp = flatpickr("#timeInput", {
        enableTime: true,
        enableSeconds: false,
        time_24hr: false,
        allowInput: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: new Date(),
        minuteIncrement: 1
    });

    initializeTimezones();

    setTimeout(() => {
        convertTime();
    }, 300);
});

/* ---------------------------
   TIMEZONE DATA
---------------------------- */

function initializeTimezones() {

    const timezones = [

        "Asia/Kolkata",
        "Asia/Dubai",
        "Asia/Singapore",
        "Asia/Tokyo",

        "Europe/London",
        "Europe/Paris",
        "Europe/Berlin",

        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",

        "Australia/Sydney",
        "Australia/Melbourne",

        "Africa/Cairo",
        "Africa/Johannesburg",

        "Pacific/Auckland"
    ];

    function getFlag(tz) {

        if (tz.startsWith("Asia")) return "🌏";
        if (tz.startsWith("Europe")) return "🇪🇺";
        if (tz.startsWith("America")) return "🌎";
        if (tz.startsWith("Africa")) return "🌍";
        if (tz.startsWith("Australia")) return "🇦🇺";
        if (tz.startsWith("Pacific")) return "🌊";

        return "🌐";
    }

    const timezoneData = timezones.map(tz => ({

        id: tz,

        text:
            `${getFlag(tz)} ${tz} (GMT${DateTime.now()
                .setZone(tz)
                .toFormat("ZZ")})`

    }));

    $("#fromTimezone").select2({
        data: timezoneData,
        width: "100%"
    });

    $("#toTimezone").select2({
        data: timezoneData,
        width: "100%"
    });

    const userTZ =
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;

    if (timezones.includes(userTZ)) {

        $("#fromTimezone")
            .val(userTZ)
            .trigger("change");

    } else {

        $("#fromTimezone")
            .val("Asia/Kolkata")
            .trigger("change");
    }

    $("#toTimezone")
        .val("America/New_York")
        .trigger("change");

    $("#fromTimezone")
        .on("change", updateCurrentTime);

    updateCurrentTime();
}

/* ---------------------------
   SET CURRENT TIME
---------------------------- */

function setNow() {

    if (fp) {

        fp.setDate(
            new Date(),
            true
        );
    }

    updateCurrentTime();
}

/* ---------------------------
   CURRENT TIME DISPLAY
---------------------------- */

function updateCurrentTime() {

    const tz =
        $("#fromTimezone").val();

    if (!tz) return;

    const now =
        DateTime.now()
            .setZone(tz)
            .toFormat(
                "cccc, dd LLL yyyy, hh:mm a"
            );

    document.getElementById("currentTime")
        .innerHTML =
        `Current time: ${now}`;
}

/* ---------------------------
   SWAP
---------------------------- */

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

/* ---------------------------
   CONVERT TIME
---------------------------- */

function convertTime() {

    const fromTZ = $("#fromTimezone").val();
    const toTZ = $("#toTimezone").val();

    if (!fp || !fp.selectedDates.length) {

        alert("Please select date and time");
        return;
    }

    // Get JS Date directly from Flatpickr
    const selectedDate = fp.selectedDates[0];

    // Create DateTime in source timezone
    const sourceDate = luxon.DateTime
        .fromJSDate(selectedDate)
        .setZone(fromTZ, {
            keepLocalTime: true
        });

    if (!sourceDate.isValid) {

        console.log(sourceDate.invalidReason);
        console.log(sourceDate.invalidExplanation);

        document.getElementById("result").innerHTML =
            "Invalid source timezone";

        return;
    }

    const converted =
        sourceDate.setZone(toTZ);

    if (!converted.isValid) {

        console.log(converted.invalidReason);
        console.log(converted.invalidExplanation);

        document.getElementById("result").innerHTML =
            "Invalid target timezone";

        return;
    }

    document.getElementById("result").innerHTML = `
        <div style="
            color:#777;
            font-size:13px;
            margin-bottom:10px;
        ">
            ${fromTZ} → ${toTZ}
        </div>

        <div style="
            font-size:26px;
            font-weight:700;
            color:#4361ee;
        ">
            ${converted.toFormat("cccc, dd LLL yyyy")}
        </div>

        <div style="
            margin-top:8px;
            font-size:22px;
            font-weight:600;
        ">
            ${converted.toFormat("hh:mm a")}
        </div>

        <div style="
            margin-top:10px;
            color:#666;
            font-size:13px;
        ">
            GMT${converted.toFormat("ZZ")}
        </div>
    `;
}
/* ---------------------------
   ENTER KEY
---------------------------- */

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {

            convertTime();
        }
    }
);
