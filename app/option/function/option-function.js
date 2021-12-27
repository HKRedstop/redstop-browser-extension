(function() {

  /* Onload Event */
  window.onload = function() {
    // dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDarkMode = urlParams.get('darkMode') == 'true';
    if (isDarkMode) document.body.classList.add('redstop-dark-mode');

    // layout
    initFunctionCheckbox('wiki', StorageKey.FUNCTION_WIKI());
    initFunctionCheckbox('facebook', StorageKey.FUNCTION_FACEBOOK());
    initFunctionCheckbox('ig', StorageKey.FUNCTION_IG());
    initFunctionCheckbox('twitter', StorageKey.FUNCTION_TWITTER());
    initFunctionCheckbox('openrice', StorageKey.FUNCTION_OPENRICE());
    initFunctionCheckbox('ios', StorageKey.FUNCTION_IOS());
    initFunctionCheckbox('android', StorageKey.FUNCTION_ANDROID());
    initFunctionCheckbox('steam', StorageKey.FUNCTION_STEAM());
    initFunctionCheckbox('ps', StorageKey.FUNCTION_PS());
    initFunctionCheckbox('xbox', StorageKey.FUNCTION_XBOX());
    initFunctionCheckbox('switch', StorageKey.FUNCTION_SWITCH());

    initFunctionCheckbox('check-domain-cn', StorageKey.FUNCTION_CHECK_DOMAIN_CN());
    initFunctionCheckbox('check-china-icp', StorageKey.FUNCTION_CHECK_CHINA_ICP());

    updateDbLastUpdateTime();
    initUpdateDbButton();

    // communicate with option
    window.addEventListener('message', function(e) {
      if (e.data.code === BrowserMessage.OI_UPDATE_DB_FINISH()) updateDbLastUpdateTime();
    }, false);
  }


  /* Function Check Box */
  function initFunctionCheckbox(id, storageKey) {
    const checkboxId = 'redstop-option-function-' + id + '-checkbox';
    const checkbox = document.getElementById(checkboxId);

    // init function checkbox
    chrome.storage.sync.get(storageKey, (data) => {
      if (data && (storageKey in data) && data[storageKey]) {
        checkbox.checked = true;
      }
    });

    // init function checkbox change listener
    checkbox.addEventListener('change', function(e) {
      const storeValue = {};
      storeValue[storageKey] = e.target.checked;
      chrome.storage.sync.set(storeValue);
    });
  }


  /* Update DB */
  function initUpdateDbButton() {
    const updateDbButton = document.getElementById('redstop-option-function-update-db-button');
    updateDbButton.addEventListener('click', function() {
      // change button to loading
      setButtonLoading(updateDbButton, true);

      // send message to option.js
      window.parent.postMessage({
        code: BrowserMessage.OI_UPDATE_DB_START()
      });
    });
  }

  function updateDbLastUpdateTime() {
    // update db last update time
    const dbLastUpdateTimeSpan = document.getElementById('redstop-option-function-db-last-update-time');
    chrome.storage.sync.get(StorageKey.LAST_DATA_DOWNLOAD_TIME(), (data) => {
      if (data && (StorageKey.LAST_DATA_DOWNLOAD_TIME() in data) && data[StorageKey.LAST_DATA_DOWNLOAD_TIME()]) {
        dbLastUpdateTimeSpan.innerHTML = formatDateToStr(data[StorageKey.LAST_DATA_DOWNLOAD_TIME()]);
      }
    });

    // enable update db button
    const updateDbButton = document.getElementById('redstop-option-function-update-db-button');
    setButtonLoading(updateDbButton, false);
  }

  function formatDateToStr(dateTime) {
    const date = new Date(dateTime);

    const year = date.getFullYear();

    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;

    let day = date.getDate();
    if (day < 10) day = '0' + day;

    let hour = date.getHours();
    if (hour < 10) hour = '0' + hour;

    let min = date.getMinutes();
    if (min < 10) min = '0' + min;

    return year + '/' + month + '/' + day + ' ' + hour + ':' + min;
  }


  /* Common */
  function setButtonLoading(button, isLoading) {
    if (isLoading) {
      const width = button.offsetWidth;
      button.disabled = true;
      button.style.width = width + 'px';
      button.classList.add('redstop-option-content-button-loading');
    }
    else {
      button.disabled = false;
      button.style.width = 'auto';
      button.classList.remove('redstop-option-content-button-loading');
    }
  }

})()
