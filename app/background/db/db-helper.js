class DbHelper {

  static DB_NAME() { return 'REDSTOP_EXTENSION_DB'; }
  static DB_VERSION() { return 1; }

  constructor(logHelper) {
    this.logHelper = logHelper;
  }

  async openDb() {
    return new Promise((resolve, reject) => {
      const logHelper = this.logHelper; // cannot reference this.logHelper in dbRequest.onerror and dbRequest.onsuccess
      let openRequest = indexedDB.open(DbHelper.DB_NAME(), DbHelper.DB_VERSION());

      openRequest.onupgradeneeded = function(event) {
        let db = openRequest.result;
        switch(event.oldVersion) { // existing db version
          case 0:
            db.createObjectStore(SchemaRedCompanyInfo.TABLE_NAME(), { keyPath: SchemaRedCompanyInfo.COLUMN_CODE() });
            db.createObjectStore(SchemaRedCompanyWebsite.TABLE_NAME(), { keyPath: SchemaRedCompanyWebsite.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyWiki.TABLE_NAME(), { keyPath: SchemaRedCompanyWiki.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyFacebook.TABLE_NAME(), { keyPath: SchemaRedCompanyFacebook.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyIg.TABLE_NAME(), { keyPath: SchemaRedCompanyIg.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyTwitter.TABLE_NAME(), { keyPath: SchemaRedCompanyTwitter.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyOpenrice.TABLE_NAME(), { keyPath: SchemaRedCompanyOpenrice.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyIosStore.TABLE_NAME(), { keyPath: SchemaRedCompanyIosStore.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyIosApp.TABLE_NAME(), { keyPath: SchemaRedCompanyIosApp.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyAndroidStore.TABLE_NAME(), { keyPath: SchemaRedCompanyAndroidStore.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyAndroidPackage.TABLE_NAME(), { keyPath: SchemaRedCompanyAndroidPackage.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanySteamStore.TABLE_NAME(), { keyPath: SchemaRedCompanySteamStore.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanySteamApp.TABLE_NAME(), { keyPath: SchemaRedCompanySteamApp.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyPsApp.TABLE_NAME(), { keyPath: SchemaRedCompanyPsApp.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanyXboxApp.TABLE_NAME(), { keyPath: SchemaRedCompanyXboxApp.COLUMN_VALUE() });
            db.createObjectStore(SchemaRedCompanySwitchApp.TABLE_NAME(), { keyPath: SchemaRedCompanySwitchApp.COLUMN_VALUE() });
        }
      };

      openRequest.onerror = function() {
        logHelper.error(openRequest.error);
        reject();
      };

      openRequest.onsuccess = function() {
        resolve(openRequest.result);
      };
    });
  }

}
