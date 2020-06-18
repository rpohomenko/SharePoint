import { sp, IList, PermissionKind, IListInfo, IFieldInfo, FieldTypes } from "@pnp/sp/presets/all";
import { ITimeZoneInfo, IRegionalSettingsInfo } from "@pnp/sp/regional-settings/types";
import { ISPListInfo } from "../controls/components/listPicker";
import { IListItem, DataType, IFieldDateInfo, IFieldLookupInfo, IFieldMultiLineTextInfo, IFieldUserInfo, IFormField, PrincipalType, IUserInfo, IFilterGroup, IFilter, FilterJoin, FilterType } from "./Entities";

export default class SPService {

  public static async getRegionalSettingsInfo(): Promise<IRegionalSettingsInfo> {
    const regionalSettings = await sp.web.regionalSettings.get();
    return regionalSettings;
  }

  public static async getTimeZoneInfo(): Promise<ITimeZoneInfo> {
    const timeZone = await sp.web.regionalSettings.timeZone();
    return timeZone;
  }

  public static getList(listInfo: ISPListInfo): IList {
    if (!listInfo) return undefined;
    let list: IList;
    if (listInfo.Url) {
      list = sp.web.getList(listInfo.Url);
    }
    else if (listInfo.Id) {
      list = sp.web.lists.getById(listInfo.Id);
    }
    else if (listInfo.Title) {
      list = sp.web.lists.getByTitle(listInfo.Title);
    }
    return list;
  }

  public static compareFieldNames(name1: string, name2: string): boolean {
    const isTitle1 = name1 === "LinkTitle" || name1 === "Title" || name1 === "LinkTitleNoMenu";
    const isTitle2 = name2 === "LinkTitle" || name2 === "Title" || name2 === "LinkTitleNoMenu";
    if (isTitle1 && isTitle2) {
      return true;
    }
    return name1 === name2;
  }

  public static getLocaleName(lcid: number): string {
    const locales: Record<number, string> = {
      1025: 'ar-SA',
      1026: 'bg-BG',
      1027: 'ca-ES',
      1028: 'zh-TW',
      1029: 'cs-CZ',
      1030: 'da-DK',
      1031: 'de-DE',
      1032: 'el-GR',
      1033: 'en-US',
      1034: 'es-ES',
      1035: 'fi-FI',
      1036: 'fr-FR',
      1037: 'he-IL',
      1038: 'hu-HU',
      1039: 'is-IS',
      1040: 'it-IT',
      1041: 'ja-JP',
      1042: 'ko-KR',
      1043: 'nl-NL',
      1044: 'nb-NO',
      1045: 'pl-PL',
      1046: 'pt-BR',
      1047: 'rm-CH',
      1048: 'ro-RO',
      1049: 'ru-RU',
      1050: 'hr-HR',
      1051: 'sk-SK',
      1052: 'sq-AL',
      1053: 'sv-SE',
      1054: 'th-TH',
      1055: 'tr-TR',
      1056: 'ur-PK',
      1057: 'id-ID',
      1058: 'uk-UA',
      1059: 'be-BY',
      1060: 'sl-SI',
      1061: 'et-EE',
      1062: 'lv-LV',
      1063: 'lt-LT',
      1064: 'tg-Cyrl-TJ',
      1065: 'fa-IR',
      1066: 'vi-VN',
      1067: 'hy-AM',
      1068: 'az-Latn-AZ',
      1069: 'eu-ES',
      1070: 'wen-DE',
      1071: 'mk-MK',
      1072: 'st-ZA',
      1073: 'ts-ZA',
      1074: 'tn-ZA',
      1075: 'ven-ZA',
      1076: 'xh-ZA',
      1077: 'zu-ZA',
      1078: 'af-ZA',
      1079: 'ka-GE',
      1080: 'fo-FO',
      1081: 'hi-IN',
      1082: 'mt-MT',
      1083: 'se-NO',
      1084: 'gd-GB',
      1085: 'yi',
      1086: 'ms-MY',
      1087: 'kk-KZ',
      1088: 'ky-KG',
      1089: 'sw-KE',
      1090: 'tk-TM',
      1091: 'uz-Latn-UZ',
      1092: 'tt-RU',
      1093: 'bn-IN',
      1094: 'pa-IN',
      1095: 'gu-IN',
      1096: 'or-IN',
      1097: 'ta-IN',
      1098: 'te-IN',
      1099: 'kn-IN',
      1100: 'ml-IN',
      1101: 'as-IN',
      1102: 'mr-IN',
      1103: 'sa-IN',
      1104: 'mn-MN',
      1105: 'bo-CN',
      1106: 'cy-GB',
      1107: 'km-KH',
      1108: 'lo-LA',
      1109: 'my-MM',
      1110: 'gl-ES',
      1111: 'kok-IN',
      1112: 'mni',
      1113: 'sd-IN',
      1114: 'syr-SY',
      1115: 'si-LK',
      1116: 'chr-US',
      1117: 'iu-Cans-CA',
      1118: 'am-ET',
      1119: 'tmz',
      1120: 'ks-Arab-IN',
      1121: 'ne-NP',
      1122: 'fy-NL',
      1123: 'ps-AF',
      1124: 'fil-PH',
      1125: 'dv-MV',
      1126: 'bin-NG',
      1127: 'fuv-NG',
      1128: 'ha-Latn-NG',
      1129: 'ibb-NG',
      1130: 'yo-NG',
      1131: 'quz-BO',
      1132: 'nso-ZA',
      1136: 'ig-NG',
      1137: 'kr-NG',
      1138: 'gaz-ET',
      1139: 'ti-ER',
      1140: 'gn-PY',
      1141: 'haw-US',
      1142: 'la',
      1143: 'so-SO',
      1144: 'ii-CN',
      1145: 'pap-AN',
      1152: 'ug-Arab-CN',
      1153: 'mi-NZ',
      2049: 'ar-IQ',
      2052: 'zh-CN',
      2055: 'de-CH',
      2057: 'en-GB',
      2058: 'es-MX',
      2060: 'fr-BE',
      2064: 'it-CH',
      2067: 'nl-BE',
      2068: 'nn-NO',
      2070: 'pt-PT',
      2072: 'ro-MD',
      2073: 'ru-MD',
      2074: 'sr-Latn-CS',
      2077: 'sv-FI',
      2080: 'ur-IN',
      2092: 'az-Cyrl-AZ',
      2108: 'ga-IE',
      2110: 'ms-BN',
      2115: 'uz-Cyrl-UZ',
      2117: 'bn-BD',
      2118: 'pa-PK',
      2128: 'mn-Mong-CN',
      2129: 'bo-BT',
      2137: 'sd-PK',
      2143: 'tzm-Latn-DZ',
      2144: 'ks-Deva-IN',
      2145: 'ne-IN',
      2155: 'quz-EC',
      2163: 'ti-ET',
      3073: 'ar-EG',
      3076: 'zh-HK',
      3079: 'de-AT',
      3081: 'en-AU',
      3082: 'es-ES',
      3084: 'fr-CA',
      3098: 'sr-Cyrl-CS',
      3179: 'quz-PE',
      4097: 'ar-LY',
      4100: 'zh-SG',
      4103: 'de-LU',
      4105: 'en-CA',
      4106: 'es-GT',
      4108: 'fr-CH',
      4122: 'hr-BA',
      5121: 'ar-DZ',
      5124: 'zh-MO',
      5127: 'de-LI',
      5129: 'en-NZ',
      5130: 'es-CR',
      5132: 'fr-LU',
      5146: 'bs-Latn-BA',
      6145: 'ar-MO',
      6153: 'en-IE',
      6154: 'es-PA',
      6156: 'fr-MC',
      7169: 'ar-TN',
      7177: 'en-ZA',
      7178: 'es-DO',
      7180: 'fr-029',
      8193: 'ar-OM',
      8201: 'en-JM',
      8202: 'es-VE',
      8204: 'fr-RE',
      9217: 'ar-YE',
      9225: 'en-029',
      9226: 'es-CO',
      9228: 'fr-CG',
      10241: 'ar-SY',
      10249: 'en-BZ',
      10250: 'es-PE',
      10252: 'fr-SN',
      11265: 'ar-JO',
      11273: 'en-TT',
      11274: 'es-AR',
      11276: 'fr-CM',
      12289: 'ar-LB',
      12297: 'en-ZW',
      12298: 'es-EC',
      12300: 'fr-CI',
      13313: 'ar-KW',
      13321: 'en-PH',
      13322: 'es-CL',
      13324: 'fr-ML',
      14337: 'ar-AE',
      14345: 'en-ID',
      14346: 'es-UY',
      14348: 'fr-MA',
      15361: 'ar-BH',
      15369: 'en-HK',
      15370: 'es-PY',
      15372: 'fr-HT',
      16385: 'ar-QA',
      16393: 'en-IN',
      16394: 'es-BO',
      17417: 'en-MY',
      17418: 'es-SV',
      18441: 'en-SG',
      18442: 'es-HN',
      19466: 'es-NI',
      20490: 'es-PR',
      21514: 'es-US',
      58378: 'es-419',
      58380: 'fr-015',
    };
    return locales[lcid];
  }

  public static doesItemHavePermissions(item: IListItem, perm: PermissionKind): boolean {
    return item ? sp.web.hasPermissions(item.EffectiveBasePermissions, perm) : false;
  }

  public static doesListHavePermissions(item: IListInfo, perm: PermissionKind): boolean {
    return item ? sp.web.hasPermissions(item.EffectiveBasePermissions, perm) : false;
  }

  public static get_DataType(field: IFieldInfo): DataType {
    switch (field.FieldTypeKind) {
      case FieldTypes.Boolean:
      case FieldTypes.Recurrence:
      case FieldTypes.AllDayEvent:
        return DataType.Boolean;
      case FieldTypes.Choice:
        return DataType.Choice;
      case FieldTypes.DateTime:
        if ((field as IFieldDateInfo).DisplayFormat === 0) {
          return DataType.Date;
        }
        return DataType.DateTime;
      case FieldTypes.Lookup:
        if ((field as IFieldLookupInfo).AllowMultipleValues) {
          return DataType.MultiLookup;
        }
        return DataType.Lookup;
      case FieldTypes.MultiChoice:
        return DataType.MultiChoice;
      case FieldTypes.Number:
      case FieldTypes.Integer:
      case FieldTypes.Counter:
        return DataType.Number;
      case FieldTypes.Note:
        if ((field as IFieldMultiLineTextInfo).RichText) {
          return DataType.RichText;
        }
        return DataType.MultiLineText;
      case FieldTypes.User:
        if ((field as IFieldUserInfo).AllowMultipleValues) {
          return DataType.MultiUser;
        }
        return DataType.User;
      case FieldTypes.URL:
        return DataType.URL;
      default: return DataType.Text;
    }
  }

  public static is_Filterable(dataType: DataType) {
    switch (dataType) {
      //case DataType.MultiLookup:
      //case DataType.MultiChoice:
      case DataType.MultiLineText:
      case DataType.RichText:
      //case DataType.MultiUser:
      case DataType.URL:
        return false;
      default: return true;
    }
  }

  /**
   * Search person by its email or login name
   */
  public static async searchPersonByEmailOrLogin(email: string, principalTypes: PrincipalType[], ensureUser: boolean = false): Promise<IUserInfo> {
    const userResults = await this.searchUsers(email, 1, principalTypes, ensureUser);
    return (userResults && userResults.length > 0) ? userResults[0] : null;

  }

  /**
   * Search All Users from the SharePoint People database
   */
  public static async searchPeople(query: string, maximumSuggestions: number, principalTypes: PrincipalType[], ensureUser: boolean = false): Promise<IUserInfo[]> {
    return await this.searchUsers(query, maximumSuggestions, principalTypes, ensureUser);
  }

  public static async findSiteUsers(query: string, maximumSuggestions: number, principalTypes: PrincipalType[]): Promise<IUserInfo[]> {
    let filter = `substringof('${encodeURIComponent(query)}', Title) or startswith(Email,'${encodeURIComponent(query)}') or startswith(UserPrincipalName,'${encodeURIComponent(query)}')`;
    if (principalTypes instanceof Array && principalTypes.length > 0) {
      filter += ` and ${principalTypes.map(principalType => `PrincipalType eq ${principalType}`).join(' or ')}`;
    }
    let users = await sp.web.siteUsers.filter(filter).top(maximumSuggestions).get();
    return users as IUserInfo[];
  }

  private static async searchUsers(query: string, maximumSuggestions: number, principalTypes: PrincipalType[], ensureUser: boolean): Promise<IUserInfo[]> {
    let users = await sp.profiles.clientPeoplePickerSearchUser({
      AllowEmailAddresses: true,
      AllowMultipleEntities: false,
      AllUrlZones: false,
      MaximumEntitySuggestions: maximumSuggestions,
      PrincipalSource: 15,
      PrincipalType: this.getSumOfPrincipalTypes(principalTypes),
      QueryString: query
    });

    // Filter out "UNVALIDATED_EMAIL_ADDRESS"
    users = users.filter(u => u.Key !== null && !(u.EntityData && u.EntityData.PrincipalType && u.EntityData.PrincipalType === "UNVALIDATED_EMAIL_ADDRESS"));

    const result: IUserInfo[] = [];
    // Check if local user IDs need to be retrieved     
    for (const user of users) {
      let userInfo: IUserInfo;
      if (ensureUser === true) {
        // Only ensure the user if it is not a SharePoint group
        if (!user.EntityData || (user.EntityData && typeof user.EntityData.SPGroupID === "undefined")) {
          userInfo = await this.ensureUser(user.Key);
        }
      }
      else {
        let email: string = user.EntityData.Email !== null ? user.EntityData.Email : user.Description;
        switch (user.EntityType) {
          case 'User':
            userInfo = {
              Id: undefined,
              LoginName: user.Key,
              Title: user.DisplayText,
              PrincipalType: PrincipalType.User,
              Email: email
            };
            break;
          case 'SecGroup':
            userInfo = {
              Id: undefined,
              LoginName: user.Key,
              Title: user.DisplayText,
              PrincipalType: PrincipalType.SecurityGroup,
              Email: email
            };
            break;
          case 'FormsRole':
          default:
            userInfo = {
              Id: undefined,
              LoginName: user.Key,
              Title: user.DisplayText,
              PrincipalType: PrincipalType.User,
              Email: email
            };
            break;
        }
      }
      result.push(userInfo);
    }
    return result;
  }

  private static getSumOfPrincipalTypes(principalTypes: PrincipalType[]) {
    return !!principalTypes && principalTypes.length > 0 ? principalTypes.reduce((a, b) => a + b, 0) : 1;
  }

  /**
  * Retrieves the local user ID
  *
  * @param userId
  */
  private static async ensureUser(loginName: string): Promise<IUserInfo> {
    const user = await sp.web.ensureUser(loginName);
    return user ? user.data as IUserInfo : undefined;
  }

  public static get_FilterGroup(filterJoin: FilterJoin, ...filters: Array<IFilter | IFilterGroup>): IFilterGroup {
    if (!(filters instanceof Array && filters.length > 0)) return null;

    if (filterJoin === undefined) {
      filterJoin = FilterJoin.And;
    }

    let leftFilter: IFilter = null;
    let leftFilterGroup: IFilterGroup = null;
    let rightFilter: IFilter = null;
    let rightFilterGroup: IFilterGroup = null;

    do {
      const firstFilter: IFilter | IFilterGroup = filters instanceof Array && filters.length > 0 ? filters[0] : null;
      filters = filters.slice(1);
      if (firstFilter) {
        if ((firstFilter as IFilter).Field) {
          leftFilter = firstFilter as IFilter;
        }
        else if (((firstFilter as IFilterGroup).LeftFilter || (firstFilter as IFilterGroup).LeftFilterGroup) || (firstFilter as IFilterGroup).RightFilter || (firstFilter as IFilterGroup).RightFilterGroup) {
          leftFilterGroup = firstFilter as IFilterGroup;
          if (leftFilterGroup && !(leftFilterGroup.RightFilter || leftFilterGroup.RightFilterGroup)) {
            leftFilter = leftFilterGroup.LeftFilter;
            leftFilterGroup = leftFilterGroup.LeftFilterGroup;
          }
        }
        if (leftFilter || leftFilterGroup) {
          rightFilterGroup = this.get_FilterGroup(filterJoin, ...filters);
          if (rightFilterGroup && !(rightFilterGroup.LeftFilter || rightFilterGroup.LeftFilterGroup)) {
            rightFilter = rightFilterGroup.RightFilter;
            rightFilterGroup = rightFilterGroup.RightFilterGroup;
          }
        }
      }
    }
    while (leftFilter === null && leftFilterGroup === null && filters.length > 0);

    if (rightFilterGroup === null && rightFilter === null) {
      return leftFilterGroup !== null ? leftFilterGroup :
        (leftFilter !== null ? {
          LeftFilter: null,
          LeftFilterGroup: null,
          RightFilter: leftFilter,
          RightFilterGroup: null,
          Join: filterJoin
        } as IFilterGroup : null);
    }

    if (leftFilterGroup && !leftFilterGroup.LeftFilter && !leftFilterGroup.LeftFilterGroup) {
      leftFilterGroup = null;
      leftFilter = leftFilterGroup.RightFilter;
    }

    const filterGroup: IFilterGroup = {
      LeftFilter: !!leftFilterGroup ? null : leftFilter,
      LeftFilterGroup: leftFilterGroup,
      Join: filterJoin,
      RightFilter: rightFilter,
      RightFilterGroup: rightFilterGroup
    };
    return filterGroup;
  }

  public static get_Filter(filterGroup: IFilterGroup): string {
    let filter = "";
    if (!!filterGroup) {
      let leftFilter: string;
      if (filterGroup.LeftFilterGroup) {
        leftFilter = this.get_Filter(filterGroup.LeftFilterGroup);
      }
      if (!leftFilter) {
        leftFilter = this.get_FilterQuery(filterGroup.LeftFilter);
      }
      let rightFilter: string;
      if (filterGroup.RightFilterGroup) {
        rightFilter = this.get_Filter(filterGroup.RightFilterGroup);
      }
      if (!rightFilter) {
        rightFilter = this.get_FilterQuery(filterGroup.RightFilter);
      }

      if (!leftFilter) {
        filter = rightFilter;
      }
      else {
        if (!rightFilter) {
          filter = leftFilter;
        }
        else {
          filter = `( ${leftFilter} ${filterGroup.Join === FilterJoin.Or ? "or" : "and"} ${rightFilter}  )`;
        }
      }
    }
    return filter;
  }

  private static get_FilterQuery(filter: IFilter): string {
    let query = "";
    if (!!filter) {
      switch (filter.Type) {
        case FilterType.Equals:
          query = `${filter.Field} eq ${filter.FilterValue}`;
          break;
        case FilterType.NotEquals:
          query = `${filter.Field} ne ${filter.FilterValue}`;
          break;
        case FilterType.Empty:
          query = `${filter.Field} eq null`;
          break;
        case FilterType.NotEmpty:
          query = `${filter.Field} ne null`;
          break;
        case FilterType.Contains:
          query = `substringof(${filter.FilterValue},${filter.Field})`;
          break;
        case FilterType.StartsWith:
          query = `startswith(${filter.Field},${filter.FilterValue})`;
          break;
        case FilterType.Less:
          query = `${filter.Field} lt ${filter.FilterValue}`;
          break;
        case FilterType.LessOrEquals:
          query = `${filter.Field} le ${filter.FilterValue}`;
          break;
        case FilterType.Greater:
          query = `${filter.Field} gt ${filter.FilterValue}`;
          break;
        case FilterType.GreaterOrEquals:
          query = `${filter.Field} ge ${filter.FilterValue}`;
          break;
      }
    }
    return query;
  }
}