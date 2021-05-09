const inputModal = document.querySelector(".input-modal");
// const inputTreatment = document.querySelectorAll("input")["icsi"];
const closeIcon = document.querySelector(".fa-times");
const eventInputForm = document.querySelector(".event-input-form");
const allTdEls = document.querySelector("td");

// console.log(inputTreatment);

const yearEl = document.getElementById("year");
const monthEl = document.getElementById("month");
const preMonthArrow = document.getElementById("left");
const nextMonthArrow = document.getElementById("right");

const currentTable = document.querySelector(".current-tbl");
const currentTbody = document.querySelector(".current-tbody");
const tblHeader = document.querySelector(".tbl-header");

const calcIcon = document.querySelector(".calc-icon");
const setIcon = document.querySelector(".setting-icon");
const resultContainer = document.querySelector(".result-container");
const resultTable = document.querySelector(".result-table");
const settingContainer = document.querySelector(".setting-container");
const settingForm = document.querySelector(".setting-form");
const intervalForm = document.querySelector(".interval-form");
const fromDateInput = document.getElementById("from-date");
const toDateInput = document.getElementById("to-date");

const today = new Date();
const currentDate = today.getDate();
// jan = 1, feb = 2 , ...
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

const days1 = getDays(currentYear, currentMonth);
const days2 = getDays(currentYear, currentMonth + 1);
const days3 = getDays(currentYear, currentMonth + 2);

const year2 = standardlization(currentYear, currentMonth + 1).newYear;
const month2 = standardlization(currentYear, currentMonth + 1).newMonth;
const year3 = standardlization(currentYear, currentMonth + 2).newYear;
const month3 = standardlization(currentYear, currentMonth + 2).newMonth;

const firstDayOfMonth1 = new Date(`${currentYear}/${currentMonth}/1`);
const firstDayOfMonth2 = new Date(`${year2}/${month2}/1`);
const firstDayOfMonth3 = new Date(`${year3}/${month3}/1`);

const daysArr1 = createDaysArr(currentYear, currentMonth).daysArr;
const daysArr2 = createDaysArr(currentYear, currentMonth + 1).daysArr;
const daysArr3 = createDaysArr(currentYear, currentMonth + 2).daysArr;

let emptyEventData = {
  firstMonth: {
    year: currentYear,
    month: currentMonth,
    eventArr: new Array(daysArr1.length),
  },
  secondMonth: {
    year: year2,
    month: month2,
    eventArr: new Array(daysArr2.length),
  },
  thirdMonth: {
    year: year3,
    month: month3,
    eventArr: new Array(daysArr3.length),
  },
};

const defaultSettingValues = {
  "set-cIVF-1": 5,
  "set-cIVF-2": 11,
  "set-cIVF-3": 17,
  "set-ICSI-1": 9,
  "set-ICSI-2": 19,
  "set-volume-1": 2.6,
  "set-volume-2": 4.6,
  "set-volume-3": 2.0,
  "set-split": 50,
};

let eventData = emptyEventData;

// the array for rendering the page
let eventArr;

// to store setting values
let settingValues = {};

// 1: firstMonth 2: secondMonth 3: thirdMonth
let nthMonth = 1;

// calendar rows and daysArr to fill calendar cell
let rows;
let daysArr;

//the index to locate td element
let selectedIndex;

// global varibles used for drag funcs
let draggedItem;
let targetTd;
let eventArrIndex;
let eventArrSubIndex;

//toggle show/hide result/setting container
let showResult = false;
let showSetting = false;

// BASIC FUNCTIONS could be saved in a new .js file

// get rows in calendar and array containing all days in a given year-month
function createDaysArr(unformatedYear, unformatedMonth) {
  const year = standardlization(unformatedYear, unformatedMonth).newYear;
  const month = standardlization(unformatedYear, unformatedMonth).newMonth;
  const firstDay = new Date(`${year}/${month}/1`).getDay();
  const daysInFirstRow = firstDay === 0 ? 1 : 8 - firstDay;
  const allDaysInMonth = getDays(year, month);
  const rows = Math.ceil((allDaysInMonth - daysInFirstRow) / 7) + 1;
  const allDaysInPreMonth = getDays(year, month - 1);
  const daysInNextMonth = 7 * rows - allDaysInMonth - (7 - daysInFirstRow);
  const daysArr =
    firstDay === 1
      ? [...createDayArr(allDaysInMonth), ...createDayArr(daysInNextMonth)]
      : [
          ...createDayArr(allDaysInPreMonth).slice(daysInFirstRow - 7),
          ...createDayArr(allDaysInMonth),
          ...createDayArr(daysInNextMonth),
        ];
  return {
    rows,
    daysArr,
  };
}

// get correct year and month when month is not between 1 -12
function standardlization(year, month) {
  if (month > 12) {
    month = month % 12;
    year = year + Math.floor(month / 12);
  }
  if (month < 1) {
    month = (month % 12) + 12;
    year = year + Math.floor(month / 12);
  }
  return {
    newYear: year,
    newMonth: month,
  };
}

// get how many days in a given year-month
function getDays(year, month) {
  const { newYear, newMonth } = standardlization(year, month);
  if ([1, 3, 5, 7, 8, 10, 12].includes(newMonth)) return 31;
  if ([4, 6, 9, 11].includes(newMonth)) return 30;
  return newYear % 4 ? 28 : 29;
}

// create an array [0, 1, 2, ..., days]
function createDayArr(days) {
  let arr = [];
  for (let i = 1; i < days + 1; i++) {
    arr.push(i);
  }
  return arr;
}

//FUNCTIONS
function loadData() {
  if (localStorage.getItem("eventData")) {
    eventData = JSON.parse(localStorage.getItem("eventData"));
    // check if local eventData is updated
    const duration =
      (currentYear - eventData.firstMonth.year) * 12 +
      (currentMonth - eventData.firstMonth.month);
    // local data is not updated for more than 3 months
    if (duration >= 3) {
      eventData = emptyEventData;
      setDemoEventData();
    }
    // not updated for 2 months
    if (duration === 2) {
      eventData = { ...emptyEventData, firstMonth: eventData.thirdMonth };
    }
    // not updated for 1 month
    if (duration === 1) {
      eventData = {
        ...emptyEventData,
        firstMonth: eventData.secondMonth,
        secondMonth: eventData.thirdMonth,
      };
    }
    eventArr = eventData.firstMonth.eventArr;
  } else {
    setDemoEventData();
  }
  if (localStorage.getItem("settingValues")) {
    settingValues = JSON.parse(localStorage.getItem("settingValues"));
  } else {
    localStorage.setItem("settingValues", JSON.stringify(defaultSettingValues));
  }
}

function setDemoEventData() {
  eventData.firstMonth.eventArr[6] = [["i", 10], ["s", 5], ["e"], ["f"]];
  eventData.firstMonth.eventArr[12] = [["i", 10], ["s", 5], ["e"], ["f"]];
  eventData.firstMonth.eventArr[23] = [
    ["i", 10],
    ["s", 5],
    ["e"],
    ["f"],
    ["c", 20],
  ];
  eventData.secondMonth.eventArr[18] = [["s", 10], ["i", 5], ["e"], ["f"]];
  eventArr = eventData.firstMonth.eventArr;
}

function saveToLocalStorage() {
  localStorage.setItem("eventData", JSON.stringify(eventData));
}

//show selected month calendar
function showCalender() {
  const { newYear, newMonth } = standardlization(
    currentYear,
    currentMonth + nthMonth - 1
  );
  rows = createDaysArr(newYear, newMonth).rows;
  daysArr = createDaysArr(newYear, newMonth).daysArr;
  yearEl.textContent = `${newYear}年`;
  monthEl.textContent = `${newMonth}月`;
  populateDaysToDom(rows, daysArr);
}

//show next month calendar when click
function showNextMonth() {
  if (nthMonth >= 3) return;
  nthMonth++;
  eventArr =
    nthMonth === 2
      ? eventData.secondMonth.eventArr
      : eventData.thirdMonth.eventArr;
  if (nthMonth === 3) {
    nextMonthArrow.classList.add("hidden");
  }
  if (nthMonth > 1) {
    preMonthArrow.classList.remove("hidden");
  }

  showCalender();
}

//show pre month calendar when click
function showPreMonth() {
  if (nthMonth === 1) return;
  nthMonth--;
  eventArr =
    nthMonth === 2
      ? eventData.secondMonth.eventArr
      : eventData.firstMonth.eventArr;

  if (nthMonth > 1) {
    preMonthArrow.classList.remove("hidden");
    nextMonthArrow.classList.remove("hidden");
  }
  if (nthMonth === 1) {
    preMonthArrow.classList.add("hidden");
  }
  showCalender();
}

// create calendar and populate event into it
function populateDaysToDom(rows, arr) {
  currentTbody.textContent = "";
  for (let i = 0; i < rows; i++) {
    const trEl = document.createElement("tr");
    // j is index of arr
    for (let j = 7 * i; j < 7 * (i + 1); j++) {
      const tdEl = document.createElement("td");
      tdEl.textContent = arr[j];

      //add "gray" style to days not in current month, otherwise add functional icons
      if ((i === 0 && arr[j] > 7) || (i === rows - 1 && arr[j] < 7)) {
        tdEl.classList.add("gray");
      } else {
        const addIcon = document.createElement("i");
        addIcon.classList = "fas fa-plus";
        addIcon.setAttribute("onclick", `showModal(${j})`);
        tdEl.appendChild(addIcon);
        tdEl.id = j;
        if (eventArr[j] && eventArr[j].length) {
          const minusIcon = document.createElement("i");
          minusIcon.classList = "fas fa-minus";
          minusIcon.setAttribute("onclick", `showDeleteIcon(${j})`);
          tdEl.appendChild(minusIcon);
          tdEl.setAttribute("onmouseleave", `hideDeleteIcon(${j})`);
        }
        // add drag functions
        tdEl.setAttribute("ondragstart", "drag(event)");
        tdEl.setAttribute("ondragover", "allowDrop(event)");
        tdEl.setAttribute("ondragenter", "dragEnter(event)");
        tdEl.setAttribute("ondragleave", "dragLeave(event)");
        tdEl.setAttribute("ondrop", `drop(${j})`);
      }

      // add 'red' sytle to Sat and Sun day
      if (j === 7 * i + 5 || j === 7 * i + 6) {
        tdEl.classList.add("red");
      }

      // add events where exist
      if (eventArr[j] && eventArr[j].length) {
        const eventsEl = document.createElement("div");
        eventsEl.classList.add("events");
        eventArr[j].forEach(function (item, index) {
          const eventContainer = document.createElement("div");
          eventContainer.classList.add("event-container");
          const eventEl = document.createElement("div");
          eventEl.id = `${j}-${index}`;
          eventEl.draggable = true;
          eventEl.className = `event ${item[0]}`;
          eventEl.textContent = item[1]
            ? `${item[0].toUpperCase()}-${item[1]}`
            : item[0].toUpperCase();
          const deleteIcon = document.createElement("i");
          deleteIcon.className = "fas fa-times-circle noshow";
          deleteIcon.setAttribute("onclick", `deleteEvent(${j}, ${index})`);
          eventContainer.append(eventEl, deleteIcon);
          eventsEl.appendChild(eventContainer);
        });
        tdEl.appendChild(eventsEl);
      }
      trEl.appendChild(tdEl);
    }
    currentTbody.appendChild(trEl);
  }
}

function showModal(index) {
  inputModal.classList.remove("noshow");
  selectedIndex = index;
}

function closeModal() {
  eventInputForm.reset();
  inputModal.classList.add("noshow");
}

function addEvent(e) {
  e.preventDefault();
  const treatment = eventInputForm.treatment.value;
  const value = Number(eventInputForm.count.value);
  // stop submit if value = 0 when treatment is either "i" "c" or "c"
  if (["i", "c", "s"].includes(treatment)) {
    if (!value) return;
  }
  if (!eventArr[selectedIndex]) {
    eventArr[selectedIndex] = [];
  }
  eventArr[selectedIndex].push([treatment, value]);
  eventInputForm.reset();
  saveToLocalStorage();
  showCalender();
  closeModal();
}

function showDeleteIcon(index) {
  const targetEventsEl = document.querySelectorAll("td")[index].lastChild;
  for (let i = 0; i < eventArr[index].length; i++) {
    targetEventsEl.childNodes[i].firstChild.classList.add("half-opacity");
    targetEventsEl.childNodes[i].lastChild.classList.remove("noshow");
  }
  selectedIndex = index;
}

function deleteEvent(j, index) {
  eventArr[j].splice(index, 1);
  saveToLocalStorage();
  showCalender();
  showDeleteIcon(j);
}

function hideDeleteIcon(index) {
  const targetEventsEl = document.querySelectorAll("td")[index].lastChild;
  for (let i = 0; i < eventArr[index].length; i++) {
    targetEventsEl.childNodes[i].firstChild.classList.remove("half-opacity");
    targetEventsEl.childNodes[i].lastChild.classList.add("noshow");
  }
}

function drag(e) {
  draggedItem = e.target;
  let elmId = e.target.id;
  let indexOfSepa = elmId.indexOf("-");
  eventArrIndex = Number(elmId.slice(0, indexOfSepa));
  eventArrSubIndex = Number(elmId.slice(indexOfSepa + 1));
}

function allowDrop(e) {
  e.preventDefault();
}

function dragEnter(e) {
  if (e.target.tagName === "TD") {
    targetTd = e.target;
    targetTd.classList.add("lavender");
  }
}

function dragLeave(e) {
  if (e.target.tagName === "TD") {
    e.target.classList.remove("lavender");
  }
}

function drop(index) {
  // remove old
  eventArr[eventArrIndex].splice(eventArrSubIndex, 1);
  // add new
  const text = draggedItem.textContent;
  let newItem = [];
  newItem[0] = text[0].toLowerCase();
  if (text.length > 1) {
    newItem[1] = Number(text.slice(2));
  }
  if (eventArr[index]) {
    eventArr[index].push(newItem);
  } else {
    eventArr[index] = [];
    eventArr[index][0] = newItem;
  }
  targetTd.classList.remove("lavender");
  saveToLocalStorage();
  showCalender();
}

function toggleResult() {
  showResult = !showResult;
  showSetting = false;
  if (showResult) {
    resultContainer.classList.remove("noshow");
    settingContainer.classList.add("noshow");
  } else {
    resultContainer.classList.add("noshow");
  }
}

function toggleSetting() {
  showSetting = !showSetting;
  showResult = false;
  if (showSetting) {
    resultContainer.classList.add("noshow");
    settingContainer.classList.remove("noshow");
  } else {
    settingContainer.classList.add("noshow");
  }
}

function setValue(e) {
  e.preventDefault();
  Array.from(settingForm.children).forEach((item) => {
    if (item.className === "input-group") {
      settingValues[item.children[1].id] = Number(item.children[1].value);
    }
  });
  localStorage.setItem("settingValues", JSON.stringify(settingValues));
}

function populateSettingValues() {
  Array.from(settingForm.children).forEach((item) => {
    if (item.className === "input-group") {
      item.children[1].value = settingValues[item.children[1].id];
    }
  });
}

//set Date Inputs "min" "max" and "value" attributes
function setDefaultDateInputs() {
  const lastDayOfMonth3 = new Date(`${year3}/${month3}/${days3}`);
  fromDateInput.setAttribute(
    "min",
    firstDayOfMonth1.toLocaleDateString("en-CA")
  );
  fromDateInput.setAttribute(
    "max",
    lastDayOfMonth3.toLocaleDateString("en-CA")
  );
  toDateInput.setAttribute("min", firstDayOfMonth1.toLocaleDateString("en-CA"));
  toDateInput.setAttribute("max", lastDayOfMonth3.toLocaleDateString("en-CA"));
  fromDateInput.value = today.toLocaleDateString("en-CA");
}

//calculate interval between input dates
function filterEventData() {
  let fromDateTem = new Date(fromDateInput.value);
  let toDateTem = new Date(toDateInput.value);
  fromDate = fromDateTem >= toDateTem ? toDateTem : fromDateTem;
  toDate = fromDateTem > toDateTem ? fromDateTem : toDateTem;
  const nthDayOfFromDate = fromDate.getDate();
  const nthDayOfToDate = toDate.getDate();
  const fromMonth = fromDate.getMonth() + 1;
  const toMonth = toDate.getMonth() + 1;
  const eventArrCombined = [
    ...eventData.firstMonth.eventArr,
    ...eventData.secondMonth.eventArr,
    ...eventData.thirdMonth.eventArr,
  ];

  const daysOfPreMonthInMonth1 =
    firstDayOfMonth1.getDay() === 0 ? 6 : firstDayOfMonth1.getDay() - 1;
  const daysOfPreMonthInMonth2 =
    firstDayOfMonth2.getDay() === 0 ? 6 : firstDayOfMonth2.getDay() - 1;
  const daysOfPreMonthInMonth3 =
    firstDayOfMonth3.getDay() === 0 ? 6 : firstDayOfMonth3.getDay() - 1;

  let startingIndex;
  let endingIndex;

  if (fromMonth === eventData.firstMonth.month) {
    startingIndex = daysOfPreMonthInMonth1 + nthDayOfFromDate - 1;
  } else if (fromMonth === eventData.secondMonth.month) {
    startingIndex =
      daysArr1.length + daysOfPreMonthInMonth2 + nthDayOfFromDate - 1;
  } else {
    startingIndex =
      daysArr1.length +
      daysArr2.length +
      daysOfPreMonthInMonth3 +
      nthDayOfFromDate -
      1;
  }

  if (toMonth === eventData.firstMonth.month) {
    endingIndex = daysOfPreMonthInMonth1 + nthDayOfToDate - 1;
  } else if (toMonth === eventData.secondMonth.month) {
    endingIndex = daysArr1.length + daysOfPreMonthInMonth2 + nthDayOfToDate - 1;
  } else {
    endingIndex =
      daysArr1.length +
      daysArr2.length +
      daysOfPreMonthInMonth3 +
      nthDayOfToDate -
      1;
  }
  return eventArrCombined.slice(startingIndex, endingIndex + 1);
}

function calcDishCountForIcsi(num) {
  if (num <= settingValues["set-ICSI-1"]) {
    return 1;
  } else if (num <= settingValues["set-ICSI-2"]) {
    return 2;
  } else {
    return 3;
  }
}

function calcDishCountForCivf(num) {
  if (num <= settingValues["set-cIVF-1"]) {
    return 1;
  } else if (num <= settingValues["set-cIVF-2"]) {
    return 2;
  } else if (num <= settingValues["set-cIVF-3"]) {
    return 3;
  } else {
    return 4;
  }
}

function calcVolumeAndPopulate(e) {
  e.preventDefault();
  const result = {
    //Exaple treatment:[accuTime, accuDishCount, accuVolume]
    c: [0, 0, 0],
    i: [0, 0, 0],
    s: [0, 0, 0],
    f: [0, 0, 0],
    e: [0, 0, 0],
    total: [0, 0, 0],
  };

  const selectedArr = filterEventData();
  selectedArr.forEach((item) => {
    if (item) {
      item.forEach((event) => {
        result[event[0]][0]++;
        result.total[0]++;
        if (event[0] === "f") {
          result.f[1]++;
          result.total[1]++;
        }
        if (event[0] === "e") {
          result.e[1]++;
          result.total[1]++;
        }
        if (event[0] === "c") {
          result.c[1] += calcDishCountForCivf(event[1]);
          result.total[1] += calcDishCountForCivf(event[1]);
        }
        if (event[0] === "i") {
          result.i[1] += calcDishCountForIcsi(event[1]);
          result.total[1] += calcDishCountForIcsi(event[1]);
        }
        if (event[0] === "s") {
          const cPart = Math.ceil(
            (event[1] * settingValues["set-split"]) / 100
          );
          const iPart = event[1] - cPart;
          result.s[1] +=
            calcDishCountForCivf(cPart) + calcDishCountForIcsi(iPart);
          result.total[1] +=
            calcDishCountForCivf(cPart) + calcDishCountForIcsi(iPart);
        }
      });
    }
  });

  result.c[2] = Number(
    (result.c[1] * settingValues["set-volume-1"]).toFixed(1)
  );
  result.i[2] = Number(
    (result.i[1] * settingValues["set-volume-1"]).toFixed(1)
  );
  result.s[2] = Number(
    (result.s[1] * settingValues["set-volume-1"]).toFixed(1)
  );
  result.f[2] = Number(
    (result.f[1] * settingValues["set-volume-2"]).toFixed(1)
  );
  result.e[2] = Number(
    (result.e[1] * settingValues["set-volume-3"]).toFixed(1)
  );
  result.total[2] = Number(
    (
      result.c[2] +
      result.i[2] +
      result.s[2] +
      result.f[2] +
      result.e[2]
    ).toFixed(1)
  );
  const resultForPolulate = [
    result.c,
    result.i,
    result.s,
    result.f,
    result.e,
    result.total,
  ];
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 4; j++) {
      resultTable.children[0].children[i].children[j].textContent =
        resultForPolulate[i - 1][j - 1];
    }
  }
}

nextMonthArrow.addEventListener("click", showNextMonth);
preMonthArrow.addEventListener("click", showPreMonth);
closeIcon.addEventListener("click", closeModal);
eventInputForm.addEventListener("submit", addEvent);
calcIcon.addEventListener("click", toggleResult);
setIcon.addEventListener("click", toggleSetting);
settingForm.addEventListener("submit", setValue);
intervalForm.addEventListener("submit", calcVolumeAndPopulate);

loadData();
populateSettingValues();
setDefaultDateInputs();
showCalender();
