const DateTime = luxon.DateTime;

let fp;

/* ---------------------------
   INIT
---------------------------- */

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

/* ---------------------------
   TIMEZONE LIST
---------------------------- */

function loadTimezones() {

    let zones = [];

    try {
        zones = Intl.supportedValuesOf("timeZone");
    } catch {
        zones = [
            "Asia/Kolkata",
            "Asia/Dubai",
            "Asia/Tokyo",
            "Europe/London",
            "Europe/Paris",
            "America/New_York",
            "America/Chicago",
            "America/Los_Angeles",
            "Australia/Sydney"
        ];
    }

    const data = zones.map(z => ({
        id: z,
        text: z
    }));

    $("#fromTimezone").select2({
        data: data,
        width: "100%"
    });

    $("#toTimezone").select2({
        data: data,
        width: "100%"
    });

    const userTZ =
        Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;

    $("#fromTimezone")
        .val(userTZ)
        .trigger("change");

    $("#toTimezone")
        .val("America/New_York")
        .trigger("change");

    $("#fromTimezone")
        .on("change", updateCurrentTime);

    updateCurrentTime();
}

/* ---------------------------
   CURRENT TIME
---------------------------- */

function updateCurrentTime() {

    const tz = $("#fromTimezone").val();

    const now = DateTime.now()
        .setZone(tz)
        .toFormat("cccc, dd LLL yyyy, hh:mm a");

    document.getElementById("currentTime")
        .innerHTML = `Current time: ${now}`;
}

/* ---------------------------
   SET NOW
---------------------------- */

function setNow() {

    fp.setDate(new Date(), true);

    convertTime();
}

/* ---------------------------
   SWAP
---------------------------- */

function swapTimezones() {

    const from = $("#fromTimezone").val();
    const to = $("#toTimezone").val();

    $("#fromTimezone")
        .val(to)
        .trigger("change");

    $("#toTimezone")
        .val(from)
        .trigger("change");

    convertTime();
}

/* ---------------------------
   CONVERT
---------------------------- */

function convertTime() {

    if (!fp.selectedDates.length) {
        return;
    }

    const fromTZ =
        $("#fromTimezone").val();

    const toTZ =
        $("#toTimezone").val();

    const jsDate =
        fp.selectedDates[0];

    const localDateTime =
        DateTime.fromObject({
            year: jsDate.getFullYear(),
            month: jsDate.getMonth() + 1,
            day: jsDate.getDate(),
            hour: jsDate.getHours(),
            minute: jsDate.getMinutes()
        }, {
            zone: fromTZ
        });

    if (!localDateTime.isValid) {

        document.getElementById("result")
            .innerHTML =
            "Invalid source timezone";

        return;
    }

    const converted =
        localDateTime.setZone(toTZ);

    document.getElementById("result")
        .innerHTML = `

        <div style="
            color:#777;
            margin-bottom:10px;
            font-size:13px;
        ">
            ${fromTZ} → ${toTZ}
        </div>

        <div style="
            font-size:26px;
            font-weight:700;
            color:#4361ee;
        ">
            ${converted.toFormat(
                "cccc, dd LLL yyyy"
            )}
        </div>

        <div style="
            margin-top:10px;
            font-size:22px;
            font-weight:600;
        ">
            ${converted.toFormat(
                "hh:mm a"
            )}
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

document.addEventListener("keydown", e => {

    if (e.key === "Enter") {
        convertTime();
    }
});
