const DateTime = luxon.DateTime;

const timezones = Intl.supportedValuesOf('timeZone');

const fromSelect = document.getElementById("fromTimezone");
const toSelect = document.getElementById("toTimezone");

// ✅ Flag + region map
function getFlag(tz) {
  if (tz.startsWith("Asia")) return "🌏";
  if (tz.startsWith("Europe")) return "🇪🇺";
  if (tz.startsWith("America")) return "🌎";
  if (tz.startsWith("Africa")) return "🌍";
  if (tz.startsWith("Australia")) return "🇦🇺";
  if (tz.startsWith("Indian")) return "🇮🇳";
  return "🌐";
}

// ✅ Offset function
function getOffset(tz) {
  return DateTime.now().setZone(tz).toFormat("ZZ");
}

// ✅ Populate dropdowns
timezones.forEach(tz => {
  const label = `${getFlag(tz)} ${tz} (GMT${getOffset(tz)})`;

  fromSelect.add(new Option(label, tz));
  toSelect.add(new Option(label, tz));
});

// ✅ Auto detect timezone
const userTZ = DateTime.local().zoneName;

fromSelect.value = userTZ || "Asia/Kolkata";
toSelect.value = "America/New_York";

// ✅ Enable search dropdown
const fromTS = new TomSelect("#fromTimezone", { create: false });
const toTS = new TomSelect("#toTimezone", { create: false });

// ✅ Swap
function swapTimezones() {
  const temp = fromTS.getValue();

  fromTS.setValue(toTS.getValue());
  toTS.setValue(temp);

  updateCurrentTime();
}

// ✅ Use current time
function setNow() {
  const now = DateTime.now().toISO({
    suppressSeconds: true,
    includeOffset: false
  });
  document.getElementById("timeInput").value = now;
}

// ✅ Update current time preview
function updateCurrentTime() {
  const tz = fromSelect.value;

  const now = DateTime.now()
    .setZone(tz)
    .toFormat("cccc, dd LLL yyyy, hh:mm a");

  document.getElementById("currentTime").innerText =
    `Current time in ${tz}: ${now}`;
}

fromSelect.addEventListener("change", updateCurrentTime);
updateCurrentTime();

// ✅ Convert
function convertTime() {

  const input = document.getElementById("timeInput").value;
  const fromTZ = fromSelect.value;
  const toTZ = toSelect.value;

  if (!input) {
    alert("Please select time");
    return;
  }

  const date = DateTime.fromISO(input, { zone: fromTZ });

  const result = date
    .setZone(toTZ)
    .toFormat("cccc, dd LLL yyyy, hh:mm a");

  document.getElementById("result").innerHTML = `
    <div style="font-size:13px;color:#666">
      ${fromTZ} → ${toTZ}
    </div>
    <div style="margin-top:6px;font-size:18px;font-weight:bold;">
      ${result}
    </div>
  `;
}
