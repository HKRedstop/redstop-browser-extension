(function() {

  // service
  const logHelper = new LogHelper();
  const dbHelper = new DbHelper(logHelper);
  const webService = new WebService(logHelper);
  const urlService = new UrlService();
  const retrieveDataService = new RetrieveDataService(logHelper, dbHelper, webService);
  const checkDataService = new CheckDataService(logHelper, dbHelper, webService);


  // data
  const isTabGoogleMap = {};
  const tabOnLoadTimeMap = {};
  let isRefreshingData = false;


  /* Init Storage */
  initStorage(StorageKey.ENABLE(), true);

  initStorage(StorageKey.FUNCTION_WIKI(), true);
  initStorage(StorageKey.FUNCTION_FACEBOOK(), true);
  initStorage(StorageKey.FUNCTION_IG(), true);
  initStorage(StorageKey.FUNCTION_TWITTER(), true);
  initStorage(StorageKey.FUNCTION_OPENRICE(), true);
  initStorage(StorageKey.FUNCTION_IOS(), true);
  initStorage(StorageKey.FUNCTION_ANDROID(), true);
  initStorage(StorageKey.FUNCTION_STEAM(), true);
  initStorage(StorageKey.FUNCTION_PS(), true);
  initStorage(StorageKey.FUNCTION_XBOX(), true);
  initStorage(StorageKey.FUNCTION_SWITCH(), true);
  initStorage(StorageKey.FUNCTION_CHECK_DOMAIN_CN(), true);
  initStorage(StorageKey.FUNCTION_CHECK_CHINA_ICP(), true);

  initStorage(StorageKey.APPEARANCE_NOTIFICATION_POSITION(), NotificationPosition.BOTTOM_RIGHT());
  initStorage(StorageKey.APPEARANCE_MENU_DARK_MODE(), false);
  initStorage(StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE(), false);
  initStorage(StorageKey.APPEARANCE_AUTO_HIDE(), false);
  initStorage(StorageKey.APPEARANCE_AUTO_HIDE_TIME(), 5);

  initStorage(StorageKey.EXCEPT_SITE_WEBSITE(), 'www.example1.com\nwww.example2.com\nwww.example3.com');
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_WIKI());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_FACEBOOK());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_IG());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_TWITTER());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_OPENRICE());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_IOS_STORE());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_IOS_APP());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_ANDROID_STORE());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_ANDROID_PACKAGE());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_STEAM_STORE());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_STEAM_APP());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_PS_APP());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_XBOX_APP());
  initExceptSiteStorage(StorageKey.EXCEPT_SITE_SWITCH_APP());

  function initExceptSiteStorage(key) {
    initStorage(key, 'example1\nexample2\nexample3');
  }

  function initStorage(key, defaultValue) {
    chrome.storage.sync.get(key, (data) => {
      if (!data || !(key in data)) {
        const storeValue = {};
        storeValue[key] = defaultValue;
        chrome.storage.sync.set(storeValue);
      }
    });
  }


  /* Download Data (check every hour) */
  downloadData();
  setInterval(() => { downloadData(); }, 60 * 60 * 1000);

  function downloadData() {
    retrieveDataService.checkNeedToDownloadData().then((result) => {
      if (result) refreshData();
    });
  }

  async function refreshData() {
    isRefreshingData = true;

    await retrieveDataService.refreshRedCompanyInfo()
    await retrieveDataService.refreshRedCompanyWebsite();
    await retrieveDataService.refreshRedCompanyWiki();
    await retrieveDataService.refreshRedCompanyFacebook();
    await retrieveDataService.refreshRedCompanyIg();
    await retrieveDataService.refreshRedCompanyTwitter();
    await retrieveDataService.refreshRedCompanyOpenrice();
    await retrieveDataService.refreshRedCompanyIosStore();
    await retrieveDataService.refreshRedCompanyIosApp();
    await retrieveDataService.refreshRedCompanyAndroidStore();
    await retrieveDataService.refreshRedCompanyAndroidPackage();
    await retrieveDataService.refreshRedCompanySteamStore();
    await retrieveDataService.refreshRedCompanySteamApp();
    await retrieveDataService.refreshRedCompanyPsApp();
    await retrieveDataService.refreshRedCompanyXboxApp();
    await retrieveDataService.refreshRedCompanySwitchApp();

    // update last data download time
    retrieveDataService.updateLastDataDownloadTime();
    isRefreshingData = false;
  }


  /* Browser Icon */
  chrome.storage.sync.get(StorageKey.ENABLE(), (data) => {
    if (data && (StorageKey.ENABLE() in data) && !data[StorageKey.ENABLE()]) {
      setBrowserIconDisabled();
    }
  });

  function setBrowserIconEnabled() {
    chrome.browserAction.setIcon({
      path: {
        16: '/images/logo/logo-16.png',
        24: '/images/logo/logo-24.png',
        32: '/images/logo/logo-32.png'
      }
    });
  }

  function setBrowserIconDisabled() {
    chrome.browserAction.setIcon({
      path: {
        16: '/images/logo/logo-16-off.png',
        24: '/images/logo/logo-24-off.png',
        32: '/images/logo/logo-32-off.png'
      }
    });
  }


  /* Connect Popup and Option */
  chrome.runtime.onConnect.addListener(function(port) {
    if (port.name === ConnectionPort.POPUP_BACKGROUND_PORT()) connectPopup(port);
    else if (port.name === ConnectionPort.BACKGROUND_OPTION_PORT()) connectOption(port);
  });


  /* Connect Popup */
  function connectPopup(port) {
    port.onMessage.addListener(function(msg) {
      // update browser icon when enable / disable
      if (msg.code === BrowserMessage.PB_UPDATE_BROWSER_ICON()) {
        if (msg.enabled) setBrowserIconEnabled();
        else setBrowserIconDisabled();
      }

      // get website data
      else if (msg.code === BrowserMessage.PB_REQUEST_WEBSITE_DATA()) {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs && tabs[0]) {
            const data = urlService.extractUrl(tabs[0].url);
            port.postMessage({
              code: BrowserMessage.PB_RETURN_WEBSITE_DATA(),
              data: data
            });
          }
        });
      }

      // open website
      // open website suggestion
      else if (msg.code === BrowserMessage.PB_OPEN_WEBSITE() || msg.code === BrowserMessage.PB_OPEN_SUGGESTION()) {
        openWebsite(msg.code);

        // call popup to close
        port.postMessage({
          code: BrowserMessage.PB_CLOSE_POPUP()
        });
      }
    });
  }


  /* Connect Option */
  function connectOption(port) {
    port.onMessage.addListener(function(msg) {
      // manual update db
      if (msg.code === BrowserMessage.BO_UPDATE_DB_START()) {
        if (isRefreshingData) waitUntilRefreshDataFinish(port);
        else manualUpdateDb(port);
      }
    });
  }

  async function manualUpdateDb(port) {
    await refreshData();
    updateOptionDbRefreshTime(port);
  }

  function waitUntilRefreshDataFinish(port) {
    setTimeout(() => {
      if (isRefreshingData) waitUntilRefreshDataFinish(port);
      else updateOptionDbRefreshTime(port);
    }, 5000);
  }

  function updateOptionDbRefreshTime(port) {
    // need a long time to refresh db, when option page is closed, error will throw
    try {
      port.postMessage({
        code: BrowserMessage.BO_UPDATE_DB_FINISH()
      });
    } catch (ignored) {}
  }


  /* On Page Load */
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // to prevent flash due to multi changeInfo when scroll, diff time should be more than 100ms
    if (changeInfo.status == 'complete' && (!tabOnLoadTimeMap[tabId] || new Date() - tabOnLoadTimeMap[tabId] > 100)) {
      checkStorage(tabId, tab);
    }

    // reset onload time for tab
    if (changeInfo.status == 'complete') tabOnLoadTimeMap[tabId] = new Date();
  });

  function checkStorage(tabId, tab) {
    // check enable first
    chrome.storage.sync.get(StorageKey.ENABLE(), (enableData) => {
      if (enableData && enableData[StorageKey.ENABLE()]) {
        // get other storage
        chrome.storage.sync.get([
          StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE(),
          StorageKey.FUNCTION_WIKI(), StorageKey.FUNCTION_FACEBOOK(), StorageKey.FUNCTION_IG(), StorageKey.FUNCTION_TWITTER(), StorageKey.FUNCTION_OPENRICE(),
          StorageKey.FUNCTION_IOS(), StorageKey.FUNCTION_ANDROID(), StorageKey.FUNCTION_STEAM(), StorageKey.FUNCTION_PS(), StorageKey.FUNCTION_XBOX(), StorageKey.FUNCTION_SWITCH(),
          StorageKey.FUNCTION_CHECK_DOMAIN_CN(), StorageKey.FUNCTION_CHECK_CHINA_ICP(),
          StorageKey.EXCEPT_SITE_WEBSITE(),
          StorageKey.EXCEPT_SITE_WIKI(), StorageKey.EXCEPT_SITE_FACEBOOK(), StorageKey.EXCEPT_SITE_IG(), StorageKey.EXCEPT_SITE_TWITTER(), StorageKey.EXCEPT_SITE_OPENRICE(),
          StorageKey.EXCEPT_SITE_IOS_STORE(), StorageKey.EXCEPT_SITE_IOS_APP(), StorageKey.EXCEPT_SITE_ANDROID_STORE(), StorageKey.EXCEPT_SITE_ANDROID_PACKAGE(),
          StorageKey.EXCEPT_SITE_STEAM_STORE(), StorageKey.EXCEPT_SITE_STEAM_APP(), StorageKey.EXCEPT_SITE_PS_APP(), StorageKey.EXCEPT_SITE_XBOX_APP(), StorageKey.EXCEPT_SITE_SWITCH_APP()
        ], (data) => {
          checkPage(tabId, tab, data ? data : {});
        });
      }
    });
  }

  function checkPage(tabId, tab, storageData) {
    // extract url data
    const data = urlService.extractUrl(tab.url);
    const domain = data.website;
    const isGoogleMap = urlService.isGoogleMap(tab.url);

    // special rule: if tab is opening google map, skip checking
    if (isTabGoogleMap[tabId] && isGoogleMap) return;
    else isTabGoogleMap[tabId] = isGoogleMap;

    // check function enable
    urlService.checkFunctionEnable(
      data,
      storageData[StorageKey.FUNCTION_WIKI()],
      storageData[StorageKey.FUNCTION_FACEBOOK()], storageData[StorageKey.FUNCTION_IG()],  storageData[StorageKey.FUNCTION_TWITTER()], storageData[StorageKey.FUNCTION_OPENRICE()],
      storageData[StorageKey.FUNCTION_IOS()], storageData[StorageKey.FUNCTION_ANDROID()],
      storageData[StorageKey.FUNCTION_STEAM()], storageData[StorageKey.FUNCTION_PS()],  storageData[StorageKey.FUNCTION_XBOX()], storageData[StorageKey.FUNCTION_SWITCH()]);

    // check except site
    urlService.checkExceptSite(
      data,
      storageData[StorageKey.EXCEPT_SITE_WEBSITE()], storageData[StorageKey.EXCEPT_SITE_WIKI()],
      storageData[StorageKey.EXCEPT_SITE_FACEBOOK()], storageData[StorageKey.EXCEPT_SITE_IG()], storageData[StorageKey.EXCEPT_SITE_TWITTER()], storageData[StorageKey.EXCEPT_SITE_OPENRICE()],
      storageData[StorageKey.EXCEPT_SITE_IOS_STORE()], storageData[StorageKey.EXCEPT_SITE_IOS_APP()], storageData[StorageKey.EXCEPT_SITE_ANDROID_STORE()], storageData[StorageKey.EXCEPT_SITE_ANDROID_PACKAGE()],
      storageData[StorageKey.EXCEPT_SITE_STEAM_STORE()], storageData[StorageKey.EXCEPT_SITE_STEAM_APP()],
      storageData[StorageKey.EXCEPT_SITE_PS_APP()], storageData[StorageKey.EXCEPT_SITE_XBOX_APP()], storageData[StorageKey.EXCEPT_SITE_SWITCH_APP()]
    );

    // check page
    if (domain) {
      if (Object.keys(data).length > 0) {
        checkDataService.checkPage(data).then((result) => {
          // send message to content.js
          if (result && result.length > 0) {
            showNotifications(tabId, result, storageData[StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE()]);
          }
          else {
            checkContent(tabId, domain, storageData[StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE()],
            storageData[StorageKey.FUNCTION_CHECK_DOMAIN_CN()], storageData[StorageKey.FUNCTION_CHECK_CHINA_ICP()]);
          }
        });
      }
      else {
        checkContent(tabId, domain, storageData[StorageKey.APPEARANCE_NOTIFICATION_DARK_MODE()],
        storageData[StorageKey.FUNCTION_CHECK_DOMAIN_CN()], storageData[StorageKey.FUNCTION_CHECK_CHINA_ICP()]);
      }
    }
  }

  function showNotifications(tabId, results, isDarkMode) {
    chrome.tabs.sendMessage(tabId, {
      code: BrowserMessage.BC_SHOW_NOTIFICATION(),
      results: results,
      isDarkMode: isDarkMode
    });
  }

  function checkContent(tabId, domain, isDarkMode, checkDomainCn, checkChinaIcp) {
    chrome.tabs.sendMessage(tabId, {
      code: BrowserMessage.BC_CHECK_CONTENT(),
      domain: domain,
      isDarkMode: isDarkMode,
      checkDomainCn: checkDomainCn,
      checkChinaIcp: checkChinaIcp
    });
  }

  function openWebsite(code) {
    var url;
    if (code === BrowserMessage.PB_OPEN_WEBSITE()) url = 'https://www.redstop.info';
    else if (code === BrowserMessage.PB_OPEN_SUGGESTION()) url = 'https://www.redstop.info/suggestion';

    if (url) {
      chrome.tabs.create({
        url: url
      });
    }
  }

})()
