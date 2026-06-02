const fromTZ = document.getElementById("fromTimezone");
const toTZ = document.getElementById("toTimezone");

// ✅ Get ALL supported timezones
const timezones = Intl.supportedValuesOf("timeZone");

// Populate dropdowns
timezones.forEach(tz => {
  const option1 = document.createElement("option");
  option1.value = tz;
  option1.textContent = tz;
  fromTZ.appendChild(option1);

  const option2 = document.createElement("option");
  option2.value = tz;
  option2.textContent = tz;
  toTZ.appendChild(option2);
});

// Default selections
fromTZ.value = "Asia/Kolkata";
toTZ.value = "America/New_York";

// Convert function
function convertTime() {
  const inputTime = document.getElementById("timeInput").value;
  const from = fromTZ.value;
  const to = document.getElementById("toTimezone").value;

  if (!inputTime) {
    alert("Please select a time");
    return;
  }

  const date = new Date(inputTime);

  const options = {
    timeZone: to,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };

  const converted = new Intl.DateTimeFormat([], options).format(date);

  document.getElementById("result").innerText =
    `Converted Time (${to}): ${converted}`;
}
