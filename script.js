const DateTime = luxon.DateTime;

const timezones = Intl.supportedValuesOf('timeZone');

const fromSelect = document.getElementById("fromTimezone");
const toSelect = document.getElementById("toTimezone");

/* ✅ Flag mapping */
function getFlag(tz) {
  if (tz.startsWith("Asia")) return "🌏";
  if (tz.startsWith("Europe")) return "🇪🇺";
  if (tz.startsWith("America")) return "🌎";
  if (tz.startsWith("Africa")) return "🌍";
  if (tz.startsWith("Australia")) return "🇦🇺";
  if (tz.startsWith("Indian")) return "🇮🇳";
  return "🌐";
}

/* ✅ GMT Offset */
function getOffset(tz) {
  return DateTime.now().setZone(tz).toFormat("ZZ");
}

/* ✅ Populate dropdown */
timezones.forEach(tz => {
  const label = `${getFlag(tz)} ${tz} (GMT${getOffset(tz)})`;

  fromSelect.add(new Option(label, tz));
  toSelect.add(new Option(label, tz));
});

/* ✅ Auto detect user timezone */
const userTZ = DateTime.local().zoneName;

fromSelect.value = userTZ || "Asia/Kolkata";
toSelect.value = "America/New_York";

/* ✅ Searchable dropdown with FIXED behavior */
const fromTS = new TomSelect("#fromTimezone", {
  create: false,
  allowEmptyOption: true,
  selectOnTab: false,
  closeAfterSelect: true
});

const toTS = new TomSelect("#toTimezone", {
  create: false,
  allowEmptyOption: true,
  selectOnTab: false,
  closeAfterSelect: true
});

/* ✅ Prevent unwanted auto-select */
[fromTS, toTS].forEach(ts => {
  ts.on('blur', () => {
    ts.close();
  });
});

/* ✅ Swap */
function swapTimezones() {
  const temp = fromTS.getValue();

  fromTS.setValue(toTS.getValue());
  toTS.setValue(temp);

  updateCurrentTime();
}

/* ✅ Set current time */
function setNow() {
  const now = DateTime.now().toISO({
    suppressSeconds: true,
    includeOffset: false
  });

  document.getElementById("timeInput").value = now;
}

/* ✅ Live current time display */
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

/* ✅ Convert function */
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
