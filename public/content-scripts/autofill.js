/*
import {
  keyDownEvent,
  keyUpEvent,
  mouseUpEvent,
  changeEvent,
  inputEvent,
  sleep,
  curDateStr,
  scrollToTop,
  base64ToArrayBuffer,
  monthToNumber,
  getTimeElapsed,
  delays,
  getStorageDataLocal,
  getStorageDataSync,
  setNativeValue,
  fields
} from "./utils";
import { workDayAutofill } from './workday';
*/

let initTime;
console.log('[DEBUG] AutofillJobs content script injected.');
window.addEventListener("load", (_) => {
  console.log("[DEBUG] window load event triggered.");
  console.log("AutofillJobs: found job page.");
  initTime = new Date().getTime();
  awaitForm();
});
const applicationFormQuery = "#application-form, #application_form, #applicationform";


function inputQuery(jobParam, form) {
  let normalizedParam = jobParam.toLowerCase();
  let inputElement = Array.from(form.querySelectorAll("input")).find(
    (input) => {
      const attributes = [
        input.id?.toLowerCase().trim(),
        input.name?.toLowerCase().trim(),
        input.placeholder?.toLowerCase().trim(),
        input.getAttribute("aria-label")?.toLowerCase().trim(),
        input.getAttribute("aria-labelledby")?.toLowerCase().trim(),
        input.getAttribute("aria-describedby")?.toLowerCase().trim(),
        input.getAttribute("data-qa")?.toLowerCase().trim(),
      ];

      for (let i = 0; i < attributes.length; i++) {
        if (
          attributes[i] != undefined &&
          attributes[i].includes(normalizedParam)
        ) {
          return true;
        }
      }
      return false;
    }
  );
  return inputElement;
}

function formatCityStateCountry(data, param) {
  let formattedStr = `${data[param] != undefined ? `${data[param]},` : ""} ${
    data["Location (State/Region)"] != undefined
      ? `${data["Location (State/Region)"]},`
      : ""
  }`;
  if (formattedStr[formattedStr.length - 1] == ",")
    formattedStr = formattedStr.slice(0, formattedStr.length - 1);
  return formattedStr;
}

async function awaitForm() {
  // Create a MutationObserver to detect changes in the DOM
  const observerCallback = (_, observer) => {
    console.log('[DEBUG] MutationObserver callback triggered.');
    // 新增 Google Forms 直接判斷
    if (window.location.hostname.includes("docs.google.com") && window.location.pathname.includes("/forms/")) {
      console.log("[DEBUG] MutationObserver: Google Forms detected, calling autofill()");
      autofill(null);
      observer.disconnect();
      return;
    }
    for (let jobForm in fields) {
      if (!window.location.hostname.includes(jobForm)) continue;
      //workday
      if (jobForm == "workday") {
        autofill(null);
        observer.disconnect();
        return;
      }
      let form = document.querySelector(applicationFormQuery);
      if (form) {
        observer.disconnect();
        autofill(form);
        return;
      } else {
        form = document.querySelector("form, #mainContent");
        if (form) {
          observer.disconnect();
          autofill(form);
          return;
        }
      }
    }
  };
  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  // 主動執行一次 observer callback，確保初次載入也能 autofill
  observerCallback([], observer);
  if (window.location.hostname.includes("lever")) {
    let form = document.querySelector("#application-form, #application_form");
    if (form) autofill(form);
  }
}

async function autofill(form) {
  console.log("[DEBUG] autofill() called.");
  console.log("Autofill Jobs: Starting autofill.");
  let res = await getStorageDataSync();
  res["Current Date"] = curDateStr();
  await sleep(delays.initial);

  // Google Forms specific autofill logic
  if (window.location.hostname.includes("docs.google.com") && window.location.pathname.includes("/forms/")) {
    console.log("[DEBUG] Google Forms match: true");
    const firstNameValue = res["First Name"];
    let filled = false;
    // Debug: 印出所有 jsname="YPqjbf" 的 input
    const inputs = document.querySelectorAll('input[jsname="YPqjbf"]');
    console.log("[DEBUG] Google Forms text inputs found:", inputs);
    inputs.forEach(input => {
      const ariaLabelledby = input.getAttribute('aria-labelledby');
      console.log("[DEBUG] aria-labelledby:", ariaLabelledby);
      if (!ariaLabelledby) return;
      // 取所有 label id
      const labelIds = ariaLabelledby.split(' ');
      labelIds.forEach(id => {
        const label = document.getElementById(id);
        console.log(`[DEBUG] Label for id ${id}:`, label ? label.textContent : null);
        if (label && label.textContent.toLowerCase().includes('first name')) {
          if (firstNameValue) {
            setNativeValue(input, firstNameValue);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("Autofill Jobs: First name filled for Google Forms.");
            filled = true;
          }
        }
      });
    });
    if (!filled) {
      console.log("Autofill Jobs: First name input or value not found for Google Forms.");
    }
    return;
  } else {
    console.log("[DEBUG] Google Forms match: false");
  }

  for (let jobForm in fields) {
    if (!window.location.hostname.includes(jobForm)) continue;
    if (jobForm == "workday") {
      workDayAutofill(res);
      return;
    }

    for (let jobParam in fields[jobForm]) {
      if (jobParam.toLowerCase() == "resume") {
          let localData = await getStorageDataLocal();
          if (!localData.Resume) continue;

          let resumeDiv = {
            greenhouse: 'input[id="resume"]',
            lever: 'input[id="resume-upload-input"]',
            dover:
              'input[type="file"][accept=".pdf"], input[type="file"][accept="application/pdf"]',
          };
          let el = document.querySelector(resumeDiv[jobForm]);
          if (!el) {
            //old greenhouse forms
            el = document.querySelector('input[type="file"]');
          }
          el.addEventListener("submit", function (event) {
            event.preventDefault();
          });
          
          const dt = new DataTransfer();
          let arrBfr = base64ToArrayBuffer(localData.Resume);

          dt.items.add(
            new File([arrBfr], `${localData["Resume_name"]}`, {
              type: "application/pdf",
            })
          );
          el.files = dt.files;
          el.dispatchEvent(changeEvent);
          await sleep(delays.short);
          
        
        continue;
      }

      let useLongDelay = false;
      //gets param from user data
      const param = fields[jobForm][jobParam];
      let fillValue = res[param];
      if (!fillValue) continue;
      let inputElement = inputQuery(jobParam, form);
      if (!inputElement) continue;

      if (param === "Gender" || "Location (City)") useLongDelay = true;
      if (param === "Location (City)")  fillValue = formatCityStateCountry(res, param);

      setNativeValue(inputElement, fillValue);
      //for the dropdown elements
      let btn = inputElement.closest(".select__control--outside-label");
      if (!btn) continue;

      btn.dispatchEvent(mouseUpEvent);
      await sleep(useLongDelay ? delays.long : delays.short);
      btn.dispatchEvent(keyDownEvent);
      await sleep(delays.short);
    }
    scrollToTop();
    console.log(`Autofill Jobs: Complete in ${getTimeElapsed(initTime)}s.`);
    break; //found site
  }
  
}
