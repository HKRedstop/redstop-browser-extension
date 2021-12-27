class CheckDataService {

  constructor(logHelper, dbHelper, webService) {
    this.logHelper = logHelper;
    this.dbHelper = dbHelper;
    this.webService = webService;
  }

  async checkPage(data) {
    const codeList = [];

    try {
      // build value key to db table scheme map
      const schemaMap = {
        'website': SchemaRedCompanyWebsite,
        'wikiId': SchemaRedCompanyWiki,
        'facebookId': SchemaRedCompanyFacebook,
        'igId': SchemaRedCompanyIg,
        'twitterId': SchemaRedCompanyTwitter,
        'openriceId': SchemaRedCompanyOpenrice,
        'iosStoreId': SchemaRedCompanyIosStore,
        'iosAppId': SchemaRedCompanyIosApp,
        'androidStoreId': SchemaRedCompanyAndroidStore,
        'androidPackage': SchemaRedCompanyAndroidPackage,
        'steamStoreId': SchemaRedCompanySteamStore,
        'steamAppId': SchemaRedCompanySteamApp,
        'psAppId': SchemaRedCompanyPsApp,
        'xboxAppId': SchemaRedCompanyXboxApp,
        'switchAppId': SchemaRedCompanySwitchApp
      }

      // build db table list
      const tableList = [ SchemaRedCompanyInfo.TABLE_NAME() ];
      for (const key of Object.keys(schemaMap)) {
        if (key in data) tableList.push(schemaMap[key].TABLE_NAME());
      }

      // open db
      const db = await this.dbHelper.openDb();
      const transaction = db.transaction(tableList);

      // check website
      if ('website' in data) {

      }

      // checking
      for (const key of Object.keys(schemaMap)) {
        if (key in data) {
          var valueList = []
          if (key === 'website') valueList = this.getWebsiteGroupList(data[key]);
          else valueList.push(data[key]);

          // use first value matched code
          for (const value of valueList) {
            const code = await this.getDbDataCode(transaction, value, schemaMap[key].TABLE_NAME(), schemaMap[key].COLUMN_CODE());
            if (code && !codeList.includes(code)) {
              codeList.push(code);
              break;
            }
          }
        }
      }

      // build result
      const resultList = [];
      for (const code of codeList) {
        const redCompanyInfo = await this.getDbData(transaction, code, SchemaRedCompanyInfo.TABLE_NAME(), false);
        if (redCompanyInfo) {
          const resultObj = {};

          resultObj.companyCode = redCompanyInfo[SchemaRedCompanyInfo.COLUMN_CODE()];
          resultObj.displayName = redCompanyInfo[SchemaRedCompanyInfo.COLUMN_NAME()];
          resultObj.displaySubName = redCompanyInfo[SchemaRedCompanyInfo.COLUMN_SUB_NAME()];
          resultObj.redStar = redCompanyInfo[SchemaRedCompanyInfo.COLUMN_STAR()];

          // company code must be [groupCode]_xxxxxxx
          resultObj.groupCode = resultObj.companyCode.split('_')[0];

          resultList.push(resultObj);
        }
      }

      return resultList;
    } catch (e) {
      // cannot open db, call api directly
      this.logHelper.log('Cannot open DB, call api directly: ' + e);
      const result = await this.webService.checkWebsite(data);
      return result.results;
    }
  }

  getWebsiteGroupList(website) {
    // - split by "." then group from longest to shortest (at least 2 split parts)
		// e.g. www.abc.def.com > abc.def.com > def.com
    const parts = website.split('.');
		const totalNum = parts.length;
		const websiteGroupList = [];

		if (totalNum >= 2) {
			for (let i = totalNum; i >= 2; i--) {
				let websiteGroup = '';

				for (let j = totalNum - i; j < totalNum; j++) {
					if (websiteGroup != '') websiteGroup += '.';
					websiteGroup += parts[j];
				}

				websiteGroupList.push(websiteGroup);
			}
		}

    return websiteGroupList;
  }

  async getDbDataCode(transaction, data, tableName, codeColumn) {
    const result = await this.getDbData(transaction, data, tableName, true);
    if (result) return result[codeColumn];
    else return null;
  }

  async getDbData(transaction, data, tableName, toUpper) {
    return new Promise((resolve) => {
      const table = transaction.objectStore(tableName);
      const request = table.get(toUpper ? data.toUpperCase() : data);

      request.onerror = function(event) {
        resolve(null);
      };

      request.onsuccess = function(event) {
        resolve(request.result);
      };
    });
  }

}
