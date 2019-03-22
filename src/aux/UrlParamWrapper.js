/* UrlParamWrapper
 * Class for parsing urls into params and viceversa to use them inside uris
 * Proper and valid URL Query Strings are described in https://tools.ietf.org/html/rfc3986#page-12
 * Reserved characters as of 29 of october, 2018 are:
        reserved    = gen-delims / sub-delims

        gen-delims  = ":" / "/" / "?" / "#" / "[" / "]" / "@"

        sub-delims  = "!" / "$" / "&" / "'" / "(" / ")" / "*" / "+" / "," / ";" / "="
 * */
class UrlParamWrapper{
    constructor(){

    }

    safeParamToStandarParam(param){
        return(this.urlToStandarParam(this.paramToUrl(param)))
    }

    standarParamToSafeParam(param){
        return(this.urlToParam(this.standarParamToUrl(param)));
    }

    graphFromEntry(e){
        return(e.split('+')[0]);
    }

    entityFromEntry(e){
        return(e.split('+')[1]);
    }

    nameOfEntity(e){
        return(e.slice(Math.max(...[
          e.lastIndexOf('/'),
          e.lastIndexOf('#'),
          e.lastIndexOf(':'),
        ])+1));
    }

    urlToParam(url){
        let param = url;

        const filters = [
            (u)=>u.replace(/\./g,'-2E-'),
            (u)=>u.replace(/:/g,'-3A-'),
            (u)=>u.replace(/\//g,'-2F-'),
            (u)=>u.replace(/\?/g,'-3F-'),
            (u)=>u.replace(/#/g,'-23-'),
            (u)=>u.replace(/\[/g,'-5B-'),

            (u)=>u.replace(/\]/g,'-5D-'),
            (u)=>u.replace(/@/g,'-40-'),
            (u)=>u.replace(/!/g,'-21-'),
            (u)=>u.replace(/\$/g,'-24-'),
            (u)=>u.replace(/&/g,'-26-'),

            (u)=>u.replace(/'/g,'-60-'),
            (u)=>u.replace(/\(/g,'-28-'),
            (u)=>u.replace(/\)/g,'-29-'),
            (u)=>u.replace(/\*/g,'-2A-'),
            (u)=>u.replace(/,/g,'-2C-'),

            (u)=>u.replace(/;/g,'-3B-'),
            (u)=>u.replace(/=/g,'-3D-'),
            (u)=>u.replace(/ /g,'-20-'),

        ];

        filters.map(filter=>param=filter(param));

        return param;
    }

    paramToUrl(param){
        let url = param;

        const filters = [
            (u)=>u.replace(/-3A-/g,':'),
            (u)=>u.replace(/-2F-/g,'/'),
            (u)=>u.replace(/-3F-/g,'?'),
            (u)=>u.replace(/-23-/g,'#'),
            (u)=>u.replace(/-5B-/g,'['),

            (u)=>u.replace(/-5D-/g,']'),
            (u)=>u.replace(/-40-/g,'@'),
            (u)=>u.replace(/-21-/g,'!'),
            (u)=>u.replace(/-24-/g,'$'),
            (u)=>u.replace(/-26-/g,'&'),

            (u)=>u.replace(/-60-/g,'\''),
            (u)=>u.replace(/-28-/g,'('),
            (u)=>u.replace(/-29-/g,')'),
            (u)=>u.replace(/-2A-/g,'*'),
            (u)=>u.replace(/-2C-/g,','),

            (u)=>u.replace(/-2E-/g,'.'),
            (u)=>u.replace(/-3B-/g,';'),
            (u)=>u.replace(/-3D-/g,'='),
            (u)=>u.replace(/-20-/g,' '),
        ];

        filters.map(filter=>url=filter(url));

        return url;
    }

    urlToStandarParam(url){
        let param = url;

        const filters = [
            (u)=>u.replace(/\./g,'%2E'),
            (u)=>u.replace(/:/g,'%3A'),
            (u)=>u.replace(/\//g,'%2F'),
            (u)=>u.replace(/\?/g,'%3F'),
            (u)=>u.replace(/#/g,'%23'),
            (u)=>u.replace(/\[/g,'%5B'),
            (u)=>u.replace(/\]/g,'%5D'),
            (u)=>u.replace(/@/g,'%40'),
            (u)=>u.replace(/!/g,'%21'),
            (u)=>u.replace(/\$/g,'%24'),
            (u)=>u.replace(/&/g,'%26'),
            (u)=>u.replace(/'/g,'%60'),
            (u)=>u.replace(/\(/g,'%28'),
            (u)=>u.replace(/\)/g,'%29'),
            (u)=>u.replace(/\*/g,'%2A'),
            (u)=>u.replace(/,/g,'%2C'),
            (u)=>u.replace(/;/g,'%3B'),
            (u)=>u.replace(/=/g,'%3D'),
            (u)=>u.replace(/ /g,'%20'),

        ];

        filters.map(filter=>param=filter(param));

        return param;
    }

    standarParamToUrl(param){
        let url = param;

        const filters = [
            (u)=>u.replace(/%3A/g,':'),
            (u)=>u.replace(/%2F/g,'/'),
            (u)=>u.replace(/%3F/g,'?'),
            (u)=>u.replace(/%23/g,'#'),
            (u)=>u.replace(/%5B/g,'['),
            (u)=>u.replace(/%5D/g,']'),
            (u)=>u.replace(/%40/g,'@'),
            (u)=>u.replace(/%21/g,'!'),
            (u)=>u.replace(/%24/g,'$'),
            (u)=>u.replace(/%26/g,'&'),
            (u)=>u.replace(/%60/g,'\''),
            (u)=>u.replace(/%28/g,'('),
            (u)=>u.replace(/%29/g,')'),
            (u)=>u.replace(/%2A/g,'*'),
            (u)=>u.replace(/%2C/g,','),
            (u)=>u.replace(/%2E/g,'.'),
            (u)=>u.replace(/%3B/g,';'),
            (u)=>u.replace(/%3D/g,'='),
            (u)=>u.replace(/%20/g,' '),
        ];

        filters.map(filter=>url=filter(url));

        return url;
    }
}

export default UrlParamWrapper;