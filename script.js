const DateTime = luxon.DateTime;

/* ---------------------------
   FLATPICKR
---------------------------- */

const fp = flatpickr("#timeInput", {
    enableTime: true,
    time_24hr: false,
    allowInput: true,
    dateFormat: "Y-m-d h:i K",
    defaultDate: new Date()
});

/* ---------------------------
   TIMEZONES
---------------------------- */

const timezones = Intl.supportedValuesOf("timeZone");

function getFlag(tz) {

    if (tz.startsWith("Asia"))
        return "🌏";

    if (tz.startsWith("Europe"))
        return "🇪🇺";

    if (tz.startsWith("America"))
        return "🌎";

    if (tz.startsWith("Africa"))
        return "🌍";

    if (tz.startsWith("Australia"))
        return "🇦🇺";

    return "🌐";
}

const timezoneData = timezones.map(tz => ({

    id: tz,

    text:
        `${getFlag(tz)} ${tz} (${DateTime.now()
            .setZone(tz)
            .toFormat("ZZ")})`

}));

/* ---------------------------
   SELECT2
---------------------------- */

$("#fromTimezone").select2({
    data: timezoneData
});

$("#toTimezone").select2({
    data: timezoneData
});

/* ---------------------------
   DEFAULT VALUES
---------------------------- */

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

/* ---------------------------
   SET NOW
---------------------------- */

function setNow() {

    fp.setDate(new Date());

    updateCurrentTime();
}

/* ---------------------------
   CURRENT TIME
---------------------------- */

function updateCurrentTime() {

    const tz =
        $("#fromTimezone").val();

    const now =
        DateTime.now()
        .setZone(tz)
        .toFormat(
            "cccc, dd LLL yyyy, hh:mm a"
        );

    document
        .getElementById("currentTime")
        .innerHTML =
        `Current time: ${now}`;
}

$("#fromTimezone")
.on("change", updateCurrentTime);

updateCurrentTime();

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
}

/* ---------------------------
   CONVERT
---------------------------- */

function convertTime() {

    const input =
        document
        .getElementById("timeInput")
        .value;

    if (!input) {

        alert(
            "Please select date and time"
        );

        return;
    }

    const fromTZ =
        $("#fromTimezone").val();

    const toTZ =
        $("#toTimezone").val();

    const sourceDate =

        DateTime.fromFormat(
            input,
            "yyyy-MM-dd hh:mm a",
            {
                zone: fromTZ
            }
        );

    const converted =

        sourceDate
        .setZone(toTZ)
        .toFormat(
            "cccc, dd LLL yyyy, hh:mm a"
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
        ">
            ${converted}
        </div>
        `;
}

/* ---------------------------
   ENTER KEY
---------------------------- */

document.addEventListener(
    "keydown",
    e => {

        if (e.key === "Enter") {
            convertTime();
        }
    }
);

/* ---------------------------
   INITIAL CONVERT
---------------------------- */

convertTime();
