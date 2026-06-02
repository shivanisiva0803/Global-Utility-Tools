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

    const fromTZRaw = $("#fromTimezone").val();
    const toTZRaw = $("#toTimezone").val();

    // Normalize aliases
    const aliasMap = {
        "Asia/Calcutta": "Asia/Kolkata"
    };

    const fromTZ = aliasMap[fromTZRaw] || fromTZRaw;
    const toTZ = aliasMap[toTZRaw] || toTZRaw;

    if (!fp || !fp.selectedDates.length) {
        document.getElementById("result").innerHTML =
            "Please select a date and time";
        return;
    }

    const d = fp.selectedDates[0];

    const source = luxon.DateTime.fromObject(
        {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            hour: d.getHours(),
            minute: d.getMinutes()
        },
        {
            zone: fromTZ
        }
    );

    if (!source.isValid) {

        document.getElementById("result").innerHTML = `
            <div style="color:red">
                Source invalid<br>
                Reason: ${source.invalidReason}<br>
                ${source.invalidExplanation || ""}
            </div>
        `;

        console.log("SOURCE", source);
        return;
    }

    const converted = source.setZone(toTZ);

    if (!converted.isValid) {

        document.getElementById("result").innerHTML = `
            <div style="color:red">
                Target invalid<br>
                Reason: ${converted.invalidReason}<br>
                ${converted.invalidExplanation || ""}
            </div>
        `;

        console.log("TARGET", converted);
        return;
    }

    document.getElementById("result").innerHTML = `
        <div style="color:#777">
            ${fromTZ} → ${toTZ}
        </div>

        <div style="
            font-size:28px;
            font-weight:bold;
            margin-top:10px;
        ">
            ${converted.toFormat("cccc, dd LLL yyyy")}
        </div>

        <div style="
            font-size:22px;
            margin-top:8px;
        ">
            ${converted.toFormat("hh:mm a")}
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
