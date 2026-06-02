const timezones = Intl.supportedValuesOf('timeZone');

const fromSelect = document.getElementById("fromTimezone");
const toSelect = document.getElementById("toTimezone");

// 🌍 Add flag-like emoji by region
function getFlag(tz) {
  if (tz.startsWith("Asia")) return "🌏";
  if (tz.startsWith("Europe")) return "🇪🇺";
  if (tz.startsWith("America")) return "🌎";
  if (tz.startsWith("Africa")) return "🌍";
  if (tz.startsWith("Australia")) return "🇦🇺";
  return "🌐";
}

// ✅ Populate dropdown
timezones.forEach(tz => {
  const label = `${getFlag(tz)} ${tz}`;

  const opt1 = new Option(label, tz);
  const opt2 = new Option(label, tz);

  fromSelect.add(opt1);
  toSelect.add(opt2);
});

// ✅ Auto-detect user timezone
const userTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;

fromSelect.value = userTZ || "Asia/Kolkata";
toSelect.value = "America/New_York";

// ✅ Convert selects to searchable dropdowns
new TomSelect("#fromTimezone", {
  create: false,
  sortField: { field: "text", direction: "asc" }
});

new TomSelect("#toTimezone", {
  create: false,
  sortField: { field: "text", direction: "asc" }
});

// ✅ Conversion function (Luxon)
function convertTime() {
  const inputTime = document.getElementById("timeInput").value;
  const fromTZ = fromSelect.value;
  const toTZ = toSelect.value;

  if (!inputTime) {
    alert("Please select time");
    return;
  }

  const dateTime = luxon.DateTime.fromISO(inputTime, {
    zone: fromTZ
  });

  const converted = dateTime
    .setZone(toTZ)
    .toFormat("cccc, dd LLL yyyy, hh:mm a");

  document.getElementById("result").innerHTML = `
    Converted Time:<br><br>
    ${converted}
  `;
}
