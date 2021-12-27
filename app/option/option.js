(function() {

  // connect background
  const backgroundOptionPort = chrome.runtime.connect({
    name: ConnectionPort.BACKGROUND_OPTION_PORT()
  });

  backgroundOptionPort.onMessage.addListener(function(msg) {
    if (msg.code === BrowserMessage.BO_UPDATE_DB_FINISH()) finishUpdateDb();
  });


  /* Onload Event */
  window.onload = function() {
    // open which tab
    chrome.storage.sync.get([StorageKey.OPTION_TAB(), StorageKey.APPEARANCE_MENU_DARK_MODE()], (data) => {
      var optionTab;
      if (data && (StorageKey.OPTION_TAB() in data)) optionTab = data[StorageKey.OPTION_TAB()];
      if (!optionTab) optionTab = OptionTab.FUNCTION();

      // dark mode
      var isDarkMode = false;
      if (data && data[StorageKey.APPEARANCE_MENU_DARK_MODE()]) {
        document.body.classList.add('redstop-dark-mode');
        isDarkMode = true;
      }

      // update src of iframe for dark mode
      const functionIframe = document.getElementById('redstop-option-content-function-iframe');
      functionIframe.src = functionIframe.src += '?darkMode=' + isDarkMode;

      const appearanceIframe = document.getElementById('redstop-option-content-appearance-iframe');
      appearanceIframe.src = appearanceIframe.src += '?darkMode=' + isDarkMode;

      const exceptSiteIframe = document.getElementById('redstop-option-content-except-site-iframe');
      exceptSiteIframe.src = exceptSiteIframe.src += '?darkMode=' + isDarkMode;

      // trigger change tab
      var tabId;
      if (optionTab === OptionTab.FUNCTION()) tabId = 'redstop-option-tab-function';
      else if (optionTab === OptionTab.APPEARANCE()) tabId = 'redstop-option-tab-appearance';
      else if (optionTab === OptionTab.EXCEPT_SITE()) tabId = 'redstop-option-tab-except-site';
      openTab(tabId);

      // reset option tab
      chrome.storage.sync.remove(StorageKey.OPTION_TAB());
    });

    // connect iframe
    window.addEventListener('message', function(e) {
      if (e.data.code === BrowserMessage.OI_UPDATE_DARK_MODE()) updateDarkMode();
      else if (e.data.code === BrowserMessage.OI_UPDATE_DB_START()) startUpdateDb();
    });
  }


  /* Open Tab */
  function openTab(id) {
    if (id) {
      var tabElement = document.getElementById(id);
      var tab = new bootstrap.Tab(tabElement);
      tab.show();
    }
  }


  /* Dark Mode */
  function updateDarkMode() {
    const functionIframe = document.getElementById('redstop-option-content-function-iframe');
    const appearanceIframe = document.getElementById('redstop-option-content-appearance-iframe');
    const exceptSiteIframe = document.getElementById('redstop-option-content-except-site-iframe');

    if (document.body.classList.contains('redstop-dark-mode')) {
      document.body.classList.remove('redstop-dark-mode');
      functionIframe.contentDocument.body.classList.remove('redstop-dark-mode');
      appearanceIframe.contentDocument.body.classList.remove('redstop-dark-mode');
      exceptSiteIframe.contentDocument.body.classList.remove('redstop-dark-mode');
    }
    else {
      document.body.classList.add('redstop-dark-mode');
      functionIframe.contentDocument.body.classList.add('redstop-dark-mode');
      appearanceIframe.contentDocument.body.classList.add('redstop-dark-mode');
      exceptSiteIframe.contentDocument.body.classList.add('redstop-dark-mode');
    }
  }


  /* Update DB */
  function startUpdateDb() {
    backgroundOptionPort.postMessage({
      code: BrowserMessage.BO_UPDATE_DB_START()
    });
  }

  function finishUpdateDb() {
    const functionIframe = document.getElementById('redstop-option-content-function-iframe');
    functionIframe.contentWindow.postMessage({
      code: BrowserMessage.OI_UPDATE_DB_FINISH()
    });
  }

})()
