(function() {

  var waitSavingList = [];


  /* Onload Event */
  window.onload = function() {
    // dark mode
    const urlParams = new URLSearchParams(window.location.search);
    const isDarkMode = urlParams.get('darkMode') == 'true';
    if (isDarkMode) document.body.classList.add('redstop-dark-mode');

    // communicate with popup
    window.addEventListener('message', function(e) {
      if (e.data.code === BrowserMessage.PI_INIT_ADD_EXCEPT_SITE()) initInputForm(e.data.data);
    }, false);
  }


  /* Input Form */
  function initInputForm(data) {
    if (data.website) initCheckbox('website', data.website);
    if (data.wikiId) initCheckbox('wiki', data.wikiId);
    if (data.facebookId) initCheckbox('facebook', data.facebookId);
    if (data.igId) initCheckbox('ig', data.igId);
    if (data.twitterId) initCheckbox('twitter', data.twitterId);
    if (data.openriceId) initCheckbox('openrice', data.openriceId);
    if (data.iosStoreId) initCheckbox('ios-store', data.iosStoreId);
    if (data.iosAppId) initCheckbox('ios-app', data.iosAppId);
    if (data.androidStoreId) initCheckbox('android-store', data.androidStoreId);
    if (data.androidPackage) initCheckbox('android-package', data.androidPackage);
    if (data.steamStoreId) initCheckbox('steam-store', data.steamStoreId);
    if (data.steamAppId) initCheckbox('steam-app', data.steamAppId);
    if (data.psAppId) initCheckbox('ps-app', data.psAppId);
    if (data.xboxAppId) initCheckbox('xbox-app', data.xboxAppId);
    if (data.switchAppId) initCheckbox('switch-app', data.switchAppId);

    initSaveButton(data);
    initCancelButton();

    // init height
    window.parent.postMessage({
      code: BrowserMessage.PI_INIT_POPUP_HEIGHT(),
      width: document.body.scrollWidth,
      height: document.body.scrollHeight
    });
  }

  function initCheckbox(id, value) {
    const checkboxId = 'redstop-popup-add-except-site-' + id + '-checkbox';

    const container = document.getElementById(checkboxId + '-container');
    container.classList.remove('redstop-popup-content-checkbox-container-hidden');
    container.classList.add('redstop-popup-content-checkbox-container');

    const checkbox = document.getElementById(checkboxId);
    checkbox.checked = true;

    const labelValueSpan = document.getElementById(checkboxId + '-label-value');
    labelValueSpan.innerHTML = value;
  }


  /* Button */
  function initCancelButton() {
    const cancelButton = document.getElementById('redstop-popup-add-except-site-cancel-button');
    cancelButton.addEventListener('click', close);
  }

  function initSaveButton(data) {
    const saveButton = document.getElementById('redstop-popup-add-except-site-save-button');
    saveButton.addEventListener('click', function() {
      performSaveExceptSite(data);
      close();
    });
  }

  function performSaveExceptSite(data) {
    waitSavingList = [];
    if (isCheckboxChecked('website')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_WEBSITE(), data.website);
    if (isCheckboxChecked('wiki')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_WIKI(), data.wikiId);
    if (isCheckboxChecked('facebook')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_FACEBOOK(), data.facebookId);
    if (isCheckboxChecked('ig')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_IG(), data.igId);
    if (isCheckboxChecked('twitter')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_TWITTER(), data.twitterId);
    if (isCheckboxChecked('openrice')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_OPENRICE(), data.openriceId);
    if (isCheckboxChecked('ios-store')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_IOS_STORE(), data.iosStoreId);
    if (isCheckboxChecked('ios-app')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_IOS_APP(), data.iosAppId);
    if (isCheckboxChecked('android-store')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_ANDROID_STORE(), data.androidStoreId);
    if (isCheckboxChecked('android-package')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_ANDROID_PACKAGE(), data.androidPackage);
    if (isCheckboxChecked('steam-store')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_STEAM_STORE(), data.steamStoreId);
    if (isCheckboxChecked('steam-app')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_STEAM_APP(), data.steamAppId);
    if (isCheckboxChecked('ps-app')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_PS_APP(), data.psAppId);
    if (isCheckboxChecked('xbox-app')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_XBOX_APP(), data.xboxAppId);
    if (isCheckboxChecked('switch-app')) saveExceptSiteToStorage(StorageKey.EXCEPT_SITE_SWITCH_APP(), data.switchAppId);
  }

  function isCheckboxChecked(id) {
    const checkboxId = 'redstop-popup-add-except-site-' + id + '-checkbox';
    const checkbox = document.getElementById(checkboxId);
    return checkbox && checkbox.checked;
  }

  function saveExceptSiteToStorage(storageKey, newValue) {
    if (newValue) {
      // add to waiting list
      waitSavingList.push(storageKey);

      // - read original value
      // - check duplicated
      // - add to last line
      // - save
      chrome.storage.sync.get(storageKey, (data) => {
        var saveValue = '';
        if (data && (storageKey in data)) saveValue = data[storageKey];

        const lines = saveValue.split('\n');
        if (!lines.includes(newValue)) {
          if (saveValue) saveValue += '\n';
          saveValue += newValue;
        }

        const storeValue = {};
        storeValue[storageKey] = saveValue;
        chrome.storage.sync.set(storeValue, () => {
          // remove from waiting list
          const deleteIndex = waitSavingList.indexOf(storageKey);
          waitSavingList.splice(deleteIndex, 1);
        });
      });
    }
  }


  /* Close */
  function close() {
    // check waiting list
    if (!waitSavingList || waitSavingList.length <= 0) {
      window.parent.postMessage({
        code: BrowserMessage.PI_CLOSE_POPUP()
      });
    }
    else setTimeout(() => { close(); }, 100);
  }

})()
