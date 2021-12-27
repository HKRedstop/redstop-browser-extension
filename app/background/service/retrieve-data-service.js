class RetrieveDataService {

  constructor(logHelper, dbHelper, webService) {
    this.logHelper = logHelper;
    this.dbHelper = dbHelper;
    this.webService = webService;
  }

  /* Check Need To Update */
  async checkNeedToDownloadData() {
    let needToDownloadData = true;

    // check last data download time, download if more than 1 day
    const lastDataDownloadTime = await this.getLastDataDownloadTime();
    if (lastDataDownloadTime) {
      const msDiff = Date.now() - lastDataDownloadTime;
      if (msDiff < 24 * 60 * 60 * 1000) needToDownloadData = false;
    }

    // check if db can be opened
    try {
      const db = await this.dbHelper.openDb();

      // download if one of the db table is empty
      if (!needToDownloadData) {
        const tableList = [ SchemaRedCompanyInfo.TABLE_NAME(), SchemaRedCompanyWebsite.TABLE_NAME(), SchemaRedCompanyWiki.TABLE_NAME(),
            SchemaRedCompanyFacebook.TABLE_NAME(), SchemaRedCompanyIg.TABLE_NAME(), SchemaRedCompanyTwitter.TABLE_NAME(), SchemaRedCompanyOpenrice.TABLE_NAME(),
            SchemaRedCompanyIosStore.TABLE_NAME(), SchemaRedCompanyIosApp.TABLE_NAME(), SchemaRedCompanyAndroidStore.TABLE_NAME(), SchemaRedCompanyAndroidPackage.TABLE_NAME(),
            SchemaRedCompanySteamStore.TABLE_NAME(), SchemaRedCompanySwitchApp.TABLE_NAME(), SchemaRedCompanyPsApp.TABLE_NAME(), SchemaRedCompanyXboxApp.TABLE_NAME(),
            SchemaRedCompanySwitchApp.TABLE_NAME() ];
        const transaction = db.transaction(tableList);

        for (const tableName of tableList) {
          const hasRecord = await this.checkDbTableHasRecord(transaction, tableName);
          if (!hasRecord) {
            needToDownloadData = true;
            break;
          }
        }
      }
    } catch (e) {
      this.logHelper.log('Cannot open DB, no need to download data');
      return false;
    }

    if (needToDownloadData) this.logHelper.log('Download data now');
    else this.logHelper.log('No need to download data');

    return needToDownloadData;
  }

  async checkDbTableHasRecord(transaction, tableName) {
    return new Promise((resolve) => {
      const table = transaction.objectStore(tableName);
      const request = table.count();

      request.onerror = function(event) {
        resolve(null);
      };

      request.onsuccess = function(event) {
        if (request.result) resolve(true);
        else resolve(false);
      };
    });
  }


  /* Last Data Download Time */
  async getLastDataDownloadTime() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(StorageKey.LAST_DATA_DOWNLOAD_TIME(), (data) => {
        if (data && (StorageKey.LAST_DATA_DOWNLOAD_TIME() in data) && data[StorageKey.LAST_DATA_DOWNLOAD_TIME()]) resolve(data[StorageKey.LAST_DATA_DOWNLOAD_TIME()]);
        else resolve(null);
      });
    });
  }

  updateLastDataDownloadTime() {
    const lastDataDownloadTime = new Date();
    this.logHelper.log('Update Data Download Time: ' + lastDataDownloadTime.toUTCString());

    const storeValue = {};
    storeValue[StorageKey.LAST_DATA_DOWNLOAD_TIME()] = lastDataDownloadTime.getTime();
    chrome.storage.sync.set(storeValue);
  }


  /* Download Data */
  async refreshRedCompanyInfo() {
    // download data
    const datas = await this.webService.getRedCompanyInfo();
    if (!datas) return;

    // open db
    try {
      const db = await this.dbHelper.openDb();
      const transaction = db.transaction(SchemaRedCompanyInfo.TABLE_NAME(), 'readwrite');
      const table = transaction.objectStore(SchemaRedCompanyInfo.TABLE_NAME());

      // clear all
      table.clear();

      // re-insert all datas
      Object.keys(datas).forEach(key => {
        const obj = {};
        obj[SchemaRedCompanyInfo.COLUMN_CODE()] = key;
        obj[SchemaRedCompanyInfo.COLUMN_NAME()] = datas[key].pn;
        obj[SchemaRedCompanyInfo.COLUMN_SUB_NAME()] = datas[key].sn;
        obj[SchemaRedCompanyInfo.COLUMN_STAR()] = datas[key].st.toString();
        table.add(obj);
      });

      this.logHelper.log('Updated Red Company Info DB');
    } catch (e) {
      this.logHelper.log('Cannot open DB, no need to update: ' + e);
    }
  }

  async refreshRedCompanyWebsite() {
    const datas = await this.webService.getRedCompanyWebsite();
    await this.refreshRedCompanyExtData('Website', datas, SchemaRedCompanyWebsite);
  }

  async refreshRedCompanyWiki() {
    const datas = await this.webService.getRedCompanyWiki();
    await this.refreshRedCompanyExtData('Wiki', datas, SchemaRedCompanyWiki);
  }

  async refreshRedCompanyFacebook() {
    const datas = await this.webService.getRedCompanyFacebook();
    await this.refreshRedCompanyExtData('Facebook', datas, SchemaRedCompanyFacebook);
  }

  async refreshRedCompanyIg() {
    const datas = await this.webService.getRedCompanyIg();
    await this.refreshRedCompanyExtData('IG', datas, SchemaRedCompanyIg);
  }

  async refreshRedCompanyTwitter() {
    const datas = await this.webService.getRedCompanyTwitter();
    await this.refreshRedCompanyExtData('Twitter', datas, SchemaRedCompanyTwitter);
  }

  async refreshRedCompanyOpenrice() {
    const datas = await this.webService.getRedCompanyOpenrice();
    await this.refreshRedCompanyExtData('Openrice', datas, SchemaRedCompanyOpenrice);
  }

  async refreshRedCompanyIosStore() {
    const datas = await this.webService.getRedCompanyIosStore();
    await this.refreshRedCompanyExtData('iOS Store', datas, SchemaRedCompanyIosStore);
  }

  async refreshRedCompanyIosApp() {
    const datas = await this.webService.getRedCompanyIosApp();
    await this.refreshRedCompanyExtData('iOS App', datas, SchemaRedCompanyIosApp);
  }

  async refreshRedCompanyAndroidStore() {
    const datas = await this.webService.getRedCompanyAndroidStore();
    await this.refreshRedCompanyExtData('Android Store', datas, SchemaRedCompanyAndroidStore);
  }

  async refreshRedCompanyAndroidPackage() {
    const datas = await this.webService.getRedCompanyAndroidPackage();
    await this.refreshRedCompanyExtData('Android Package', datas, SchemaRedCompanyAndroidPackage);
  }

  async refreshRedCompanySteamStore() {
    const datas = await this.webService.getRedCompanySteamStore();
    await this.refreshRedCompanyExtData('Steam Store', datas, SchemaRedCompanySteamStore);
  }

  async refreshRedCompanySteamApp() {
    const datas = await this.webService.getRedCompanySteamApp();
    await this.refreshRedCompanyExtData('Steam App', datas, SchemaRedCompanySteamApp);
  }

  async refreshRedCompanyPsApp() {
    const datas = await this.webService.getRedCompanyPsApp();
    await this.refreshRedCompanyExtData('PS App', datas, SchemaRedCompanyPsApp);
  }

  async refreshRedCompanyXboxApp() {
    const datas = await this.webService.getRedCompanyXboxApp();
    await this.refreshRedCompanyExtData('Xbox App', datas, SchemaRedCompanyXboxApp);
  }

  async refreshRedCompanySwitchApp() {
    const datas = await this.webService.getRedCompanySwitchApp();
    await this.refreshRedCompanyExtData('Switch App', datas, SchemaRedCompanySwitchApp);
  }

  async refreshRedCompanyExtData(tag, datas, schema) {
    if (!datas) return;

    // open db
    try {
      const db = await this.dbHelper.openDb();
      const transaction = db.transaction(schema.TABLE_NAME(), 'readwrite');
      const table = transaction.objectStore(schema.TABLE_NAME());

      // clear all
      table.clear();

      // re-insert all datas
      const allValueList = [];
      Object.keys(datas).forEach(key => {
        datas[key].forEach(value => {
          // to upper case
          value = value.toUpperCase();

          // prevent duplicate key
          if (!allValueList.includes(value)) {
            allValueList.push(value);

            // insert
            const obj = {};
            obj[schema.COLUMN_CODE()] = key;
            obj[schema.COLUMN_VALUE()] = value;
            table.add(obj);
          }
        });
      });

      this.logHelper.log('Updated Red Company ' + tag + ' DB');
    } catch (e) {
      this.logHelper.log('Cannot open DB, no need to update: ' + e);
    }
  }

}
