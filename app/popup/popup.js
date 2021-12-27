(function() {

  // connect background
  const popupBackgroundPort = chrome.runtime.connect({
    name: ConnectionPort.POPUP_BACKGROUND_PORT()
  });

  popupBackgroundPort.onMessage.addListener(function(msg) {
    if (msg.code === BrowserMessage.PB_RETURN_WEBSITE_DATA()) initButtonWithWebsiteData(msg.data);
    else if (msg.code === BrowserMessage.PB_CLOSE_POPUP()) window.close();
  });


  /* Onload Event */
  window.onload = function() {
    initPopupLayout();
    initEnableSwitch();
    initButton();

    // connect iframe
    window.addEventListener('message', function(e) {
      if (e.data.code === BrowserMessage.PI_INIT_POPUP_HEIGHT()) updateAddExceptSiteIframeHeight(e.data.width, e.data.height);
      else if (e.data.code === BrowserMessage.PI_CLOSE_POPUP()) window.close();
    });
  }


  /* Init */
  function initPopupLayout() {
    // dark mode
    // check if enabled
    chrome.storage.sync.get([StorageKey.APPEARANCE_MENU_DARK_MODE(), StorageKey.ENABLE()], (data) => {
      // dark mode
      var isDarkMode = false;
      if (data && data[StorageKey.APPEARANCE_MENU_DARK_MODE()]) {
        document.body.classList.add('redstop-dark-mode');
        isDarkMode = true;
      }

      // update src of iframe for dark mode
      const addExceptSiteIframe = document.getElementById('redstop-popup-add-except-site-iframe');
      addExceptSiteIframe.src = addExceptSiteIframe.src += '?darkMode=' + isDarkMode;

      // check if enabled
      if (data && data[StorageKey.ENABLE()]) {
        // logo
        const logo = document.getElementById('redstop-popup-logo');
        logo.classList.add('redstop-popup-logo-active');

        // enable switch
        const enableSwitch = document.getElementById('redstop-popup-enable-switch');
        enableSwitch.checked = true;
      }
    });

    // update version
    const version = document.getElementById('redstop-popup-version');
    version.innerHTML = 'Version ' + chrome.runtime.getManifest().version;
  }

  function initEnableSwitch() {
    // enable switch
    const enableSwitch = document.getElementById('redstop-popup-enable-switch');
    enableSwitch.addEventListener('change', function(e) {
      // update logo
      const logo = document.getElementById('redstop-popup-logo');
      if (e.target.checked) logo.classList.add('redstop-popup-logo-active');
      else logo.classList.remove('redstop-popup-logo-active');

      // storage
      const storeValue = {};
      storeValue[StorageKey.ENABLE()] = e.target.checked;
      chrome.storage.sync.set(storeValue);

      // browser icon (pass to background to handle)
      popupBackgroundPort.postMessage({
        code: BrowserMessage.PB_UPDATE_BROWSER_ICON(),
        enabled: e.target.checked
      });
    });
  }

  function initButton() {
    // function setting
    const functionSettingButton = document.getElementById('redstop-popup-function-setting-button');
    functionSettingButton.addEventListener('click', function() { openOption(OptionTab.FUNCTION()); });

    // appearance setting
    const appearanceSettingButton = document.getElementById('redstop-popup-appearance-setting-button');
    appearanceSettingButton.addEventListener('click', function() { openOption(OptionTab.APPEARANCE()); });

    // manage except site
    const manageExceptSiteButton = document.getElementById('redstop-popup-manage-except-site-button');
    manageExceptSiteButton.addEventListener('click', function() { openOption(OptionTab.EXCEPT_SITE()); });

    // report
    const reportButton = unhideButton('report');
    reportButton.addEventListener('click', function() { callBackgroundToOpenWebsite(BrowserMessage.PB_OPEN_SUGGESTION()); });

    // open website
    const openWebsiteButton = unhideButton('open-website');
    openWebsiteButton.addEventListener('click', function() { callBackgroundToOpenWebsite(BrowserMessage.PB_OPEN_WEBSITE()); });

    // get website data from background
    popupBackgroundPort.postMessage({
      code: BrowserMessage.PB_REQUEST_WEBSITE_DATA()
    });
  }

  function initButtonWithWebsiteData(data) {
    if (data && Object.keys(data).length > 0) {
      // add except site
      const addExceptSiteButton = unhideButton('add-except-site');
      addExceptSiteButton.addEventListener('click', function() { showAddExceptSiteView(data); });
    }
  }

  function unhideButton(id) {
    const buttonId = 'redstop-popup-' + id + '-button';
    const button = document.getElementById(buttonId);
    button.classList.remove('redstop-popup-button-hide');
    button.classList.add('redstop-popup-button');

    const hrId = 'redstop-popup-' + id + '-hr';
    const hr = document.getElementById(hrId);
    hr.classList.remove('redstop-popup-button-hr-hide');
    hr.classList.add('redstop-popup-button-hr');

    return button;
  }


  /* Open Option Page */
  function openOption(optionTab) {
    const storeValue = {};
    storeValue[StorageKey.OPTION_TAB()] = optionTab;
    chrome.storage.sync.set(storeValue, () => {
      // open option page
      chrome.runtime.openOptionsPage(() => {
        // close popup
        window.close();
      });
    });
  }


  /* Open Website */
  function callBackgroundToOpenWebsite(code) {
    popupBackgroundPort.postMessage({
      code: code
    });
  }


  /* Add Except Site */
  function showAddExceptSiteView(websiteData) {
    // switch view
    const popupContainer = document.getElementById('redstop-popup-container');
    popupContainer.classList.add('redstop-popup-container-hide');

    const addExceptSiteContainer = document.getElementById('redstop-popup-add-except-site-container');
    addExceptSiteContainer.classList.remove('redstop-popup-add-except-site-container-hide');

    // init iframe
    const addExceptSiteIframe = document.getElementById('redstop-popup-add-except-site-iframe');
    addExceptSiteIframe.contentWindow.postMessage({
      code: BrowserMessage.PI_INIT_ADD_EXCEPT_SITE(),
      data: websiteData
    });
  }

  function updateAddExceptSiteIframeHeight(width, height) {
    const addExceptSiteIframe = document.getElementById('redstop-popup-add-except-site-iframe');
    addExceptSiteIframe.style.width = width + 'px';
    addExceptSiteIframe.style.height = height + 'px';
  }

})()
