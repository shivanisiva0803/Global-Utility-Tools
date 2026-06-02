const DateTime = luxon.DateTime;

const fromSelect = document.getElementById("fromTimezone");
const toSelect = document.getElementById("toTimezone");

const timezones = Intl.supportedValuesOf("timeZone");

/* ✅ Flag + offset */
function getFlag(tz) {
  if (tz.startsWith("Asia")) return "🌏";
  if (tz.startsWith("Europe")) return "🇪🇺";
  if (tz.startsWith("America")) return "🌎";
  if (tz.startsWith("Africa")) return "🌍";
  if (tz.startsWith("Australia")) return "🇦🇺";
  if (tz.startsWith("Indian")) return "🇮🇳";
  return "🌐";
}

function getOffset(tz) {
  return DateTime.now().setZone(tz).toFormat("ZZ");
}

/* ✅ Populate dropdown */
timezones.forEach(tz => {
  const label = `${getFlag(tz)} ${tz} (GMT${getOffset(tz)})`;

  fromSelect.add(new Option(label, tz));
  toSelect.add(new Option(label, tz));
});

/* ✅ Auto-detect */
const userTZ = DateTime.local().zoneName;
fromSelect.value = userTZ;
toSelect.value = "America/New_York";

/* ✅ Tom Select */
const fromTS = new TomSelect("#fromTimezone", {
  create: false,
  selectOnTab: false,
  closeAfterSelect: true
});

const toTS = new TomSelect("#toTimezone", {
  create: false,
  selectOnTab: false,
  closeAfterSelect: true
});

/* ✅ Fix unwanted selection */
[fromTS, toTS].forEach(ts => {
  ts.on("blur", () => ts.close());
});

/* ✅ Swap */
function swapTimezones() {
  const temp = fromTS.getValue();
  fromTS.setValue(toTS.getValue());
  toTS.setValue(temp);
  updateCurrentTime();
}

/* ✅ Current time */
function updateCurrentTime() {
  const tz = fromSelect.value;
  const now = DateTime.now()
    .setZone(tz)
    .toFormat("cccc, dd LLL yyyy, hh:mm a");

  document.getElementById("currentTime").innerText =
    `Current time: ${now}`;
}

fromSelect.addEventListener("change", updateCurrentTime);
updateCurrentTime();

/* ✅ Set now */
function setNow() {
  document.getElementById("timeInput").value = DateTime.now().toISO({
    suppressSeconds: true,
    includeOffset: false
  });
}

/* ✅ Convert */
function convertTime() {
  const input = document.getElementById("timeInput").value;

  if (!input) {
    alert("Select time");
    return;
  }

  const result = DateTime.fromISO(input, {
    zone: fromSelect.value
  })
    .setZone(toSelect.value)
    .toFormat("cccc, dd LLL yyyy, hh:mm a");

  document.getElementById("result").innerHTML = `
    <div style="font-size:13px;color:#888">
      ${fromSelect.value} → ${toSelect.value}
    </div>
    <div style="font-size:18px;margin-top:6px;font-weight:bold;">
      ${result}
    </div>
  `;
}

/* ✅ Enter key shortcut */
document.addEventListener("keydown", e => {
  if (e.key === "Enter") convertTime();
});

/* ✅ Dark mode toggle */
function toggleTheme() {
  document.body.classList.toggle("dark");
}
