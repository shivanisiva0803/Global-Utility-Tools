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

    const input =
        document.getElementById(
            "timeInput"
        ).value;

    if (!input) {

        document.getElementById(
            "result"
        ).innerHTML =
            "Select date and time";

        return;
    }

    const fromTZ =
        $("#fromTimezone").val();

    const toTZ =
        $("#toTimezone").val();

    if (!fromTZ || !toTZ) return;

    const sourceDate =

        DateTime.fromFormat(
            input,
            "yyyy-MM-dd HH:mm",
            {
                zone: fromTZ
            }
        );

    if (!sourceDate.isValid) {

        document.getElementById(
            "result"
        ).innerHTML =
            "Invalid date/time";

        return;
    }

    const converted =

        sourceDate
            .setZone(toTZ);

    document.getElementById(
        "result"
    ).innerHTML =

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
            font-size:24px;
            font-weight:700;
            color:#4361ee;
        ">
            ${converted.toFormat(
                "cccc, dd LLL yyyy"
            )}
        </div>

        <div style="
            margin-top:8px;
            font-size:20px;
            font-weight:600;
        ">
            ${converted.toFormat(
                "hh:mm a"
            )}
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
