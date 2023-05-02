// ==UserScript==
// @name         Geotech Late Minutes Calculator (For GMAN)
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Calculate total late minutes for a GMAN timesheet
// @author       Hollen
// @match        https://gman.geotech-science.com/Administrative/TimesheetSingleCrew*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function calculateLateMinutes(timeString) {
        const targetHour = 9;
        const targetMinutes = 0;
        const [hour, minutes] = timeString.split(":").map(Number);
        let lateMinutes = (hour - targetHour) * 60 + (minutes - targetMinutes);

        if (hour >= 13) {
            lateMinutes -= 60; // 減去午休時間
        }

        return lateMinutes > 0 ? lateMinutes : 0;
    }

    function appendLateMinutesToRow(row, lateMinutes) {
        const timeCell = row.querySelector("td:nth-child(3)");
        const lateMinutesSpan = document.createElement("span");
        lateMinutesSpan.textContent = `(${lateMinutes})`;
        lateMinutesSpan.style.fontSize = "12px";
        lateMinutesSpan.style.marginLeft = "5px";
        timeCell.appendChild(lateMinutesSpan);
    }

    const table = document.getElementById("Timesheet");

    const rows = table.querySelectorAll("tr");

    let totalLateMinutes = 0;

    for (const row of rows) {
        const timeCell = row.querySelector("td:nth-child(3)");
        const noteCell = row.querySelector("td:last-child"); // 選擇備註欄單元格
        if (timeCell) {
            const timeString = timeCell.textContent.trim();
            const noteString = noteCell ? noteCell.textContent.trim() : ""; // 獲取備註欄內容
            const timeRegex = /^\d{1,2}:\d{2}$/;

            if (timeRegex.test(timeString)) {
                const lateMinutes = calculateLateMinutes(timeString);
                console.log("當前進入時間：", timeString, "遲到分鐘數：", lateMinutes);
                appendLateMinutesToRow(row, lateMinutes);
                totalLateMinutes += lateMinutes;
            } else if (noteString.includes("*")) { // 如果備註欄包含 "*", 視為缺曠
                const lateMinutes = 8 * 60; // 缺曠視為遲到 8 小時
                console.log("缺曠，遲到分鐘數：", lateMinutes);
                appendLateMinutesToRow(row, lateMinutes);
                totalLateMinutes += lateMinutes;
            } else {
                console.log("略過非時間行：", timeString);
            }
        }
    }

    console.log("該月總遲到分鐘數：", totalLateMinutes);

    const resultDiv = document.createElement("div");
    resultDiv.style.fontSize = "18px";
    resultDiv.style.fontWeight = "bold";
    resultDiv.style.marginTop = "20px";
    resultDiv.textContent = `該月總遲到：${totalLateMinutes}分鐘 (尚未扣除休假時數)`;

    table.parentElement.appendChild(resultDiv);

})();

