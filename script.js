const timezones = [
  "Asia/Kolkata",
  "America/New_York",
  "Europe/London",
  "Asia/Tokyo",
  "Australia/Sydney",
  "America/Los_Angeles"
];

const fromSelect = document.getElementById("fromTimezone");
const toSelect = document.getElementById("toTimezone");

timezones.forEach(tz => {

  const option1 = document.createElement("option");
  option1.value = tz;
  option1.textContent = tz;
  fromSelect.appendChild(option1);

  const option2 = document.createElement("option");
  option2.value = tz;
  option2.textContent = tz;
  toSelect.appendChild(option2);

});

fromSelect.value = "Asia/Kolkata";
toSelect.value = "America/New_York";

function convertTime() {

  const inputTime =
    document.getElementById("timeInput").value;

  const fromTZ = fromSelect.value;
  const toTZ = toSelect.value;

  if (!inputTime) {
    alert("Please select time");
    return;
  }

  const dateTime =
    luxon.DateTime
      .fromISO(inputTime, { zone: fromTZ });

  const converted =
    dateTime
      .setZone(toTZ)
      .toFormat("ffff");

  document.getElementById("result").innerHTML =
    `
      Converted Time:
      <br><br>
      ${converted}
    `;
}
