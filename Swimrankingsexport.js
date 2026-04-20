const pbTable = document.getElementsByClassName("athleteBest")[0];
const rows = [...pbTable.children[0].children].splice(1);

const swimmerFormat = document.getElementById("name").innerText.split("\n")[0];
const swimmer =
  swimmerFormat.split(", ")[1] +
  " " +
  swimmerFormat
    .split(", ")[0]
    .toLowerCase()
    .split(" ")
    .map((str, i, ar) =>
      i === ar.length - 1 ? str.slice(0, 1).toUpperCase() + str.slice(1) : str,
    )
    .join(" ");

const timeObjects = [];

function formatDate(dateString) {
  const dates = {
    Jan: 1,
    Feb: 2,
    Mar: 3,
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
    Mrt: 3,
    Maa: 3,
    Mei: 5,
    Okt: 10,
  };

  const [day, month, year] = dateString.split(/\s/g);
  const monthNo = dates[month.trim()];
  return `${String(day.trim()).padStart(2, "0")}-${String(monthNo).padStart(2, "0")}-${String(year.trim()).padStart(2, "0")}`;
}

function formatEvent(event) {
  const events = {
    freestyle: "Vrije Slag",
    backstroke: "Rugslag",
    breaststroke: "Schoolslag",
    butterfly: "Vlinderslag",
    medley: "Wisselslag",
    "vrije slag": "Vrije Slag",
    rugslag: "Rugslag",
    schoolslag: "Schoolslag",
    vlinderslag: "Vlinderslag",
    wisselslag: "Wisselslag",
  };

  const [distance, strokeEnglish, lap] = event.split(" ");
  const stroke = events[strokeEnglish.toLowerCase()];
  return `${distance} ${stroke} ${lap ?? ""}`;
}

for (const row of rows) {
  const timeObject = {
    event: formatEvent(row.children[0].children[0].innerText),
    time: row.children[2].children[0].innerText,
    poolSize: row.children[1].innerText,
    points: parseInt(row.children[3].innerText),
    swimmer,
    date: formatDate(row.children[4].innerText.replace(/&nbsp;/g, " ")),
    meet: row.children[6].innerText,
    location: row.children[5].innerText,
  };

  timeObjects.push(timeObject);
}

const a = document.createElement("a");
const file = new Blob([JSON.stringify(timeObjects)], {
  type: "application/json",
});
a.href = URL.createObjectURL(file);
a.download = `Persoonlijke_Records_${swimmer.replace(/\s/g, "_")}`;
a.click();
