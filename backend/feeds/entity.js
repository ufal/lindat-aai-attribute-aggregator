var log = require('../libs/logger')("entity");

/**
 * Takes as an input a json like object of the entity metadata and stores
 * important information about it.
 *
 * @param entity js dict
 */
var entity_cls = function(entity) {
    var log_errors = false;
    this.entityID = entity_cls.get_entityID(entity);
    // reg info
    this.registrationAuthority = null;
    this.registrationAuthorityDate = null;
    // entity attributes
    this.eattrs = [];
    // idp/sp
    this.entity_type = null;
    this.mdui = null;
    this.displayName_en = null;
    this.displayDesc_en = null;
    this.logo = null;
    this.requested_required = [];
    this.requested = [];
    this.emails = {};
    this.feeds = [];

    try {
        try {
            var extensions = entity["md:Extensions"];
            for (var j=0; j < extensions.length; ++j) {
                var extension = extensions[j];
                if (extension.hasOwnProperty("mdrpi:RegistrationInfo")) {
                    var reg_info = extension["mdrpi:RegistrationInfo"][0];
                    this.registrationAuthority = reg_info["$"]["registrationAuthority"];
                    this.registrationAuthorityDate = reg_info["$"]["registrationInstant"];
                    break;
                }
            }
        } catch (err) {
        }

        // entity attributes
        //
        try {
            var entityattrs = entity["md:Extensions"][0]["mdattr:EntityAttributes"];
            for (var j = 0; j < entityattrs.length; ++j) {
                var ea = entityattrs[j];
                for (var k = 0; k < ea["saml:Attribute"].length; ++k) {
                    this.eattrs.push(ea["saml:Attribute"][k]["saml:AttributeValue"][0].trim());
                }
            }
        }catch(err){
        }

        // idp/sp
        //
        var desc = null;
        if (entity.hasOwnProperty("md:IDPSSODescriptor")) {
            desc = entity["md:IDPSSODescriptor"][0];
            this.entity_type = "idp";
        }else if (entity.hasOwnProperty("md:SPSSODescriptor")){
            desc = entity["md:SPSSODescriptor"][0];
            this.entity_type = "sp";
        }else if (entity.hasOwnProperty("md:AttributeAuthorityDescriptor")) {
            return;
        }else {
            if (log_errors) {
                log.info("[{0}]: unrecognised entity - not IdP, SP, AA".format(this.entityID));
            }
            return;
        }
        try {
            this.mdui = desc["md:Extensions"][0]["mdui:UIInfo"][0];
        }catch(err){
            if (log_errors) {
                log.info("[{0}]: missing mdui:UIInfo".format(this.entityID));
            }
        }

        // display names
        //
        try {
            this.displayName_en = entity_cls.get_english(this.mdui["mdui:DisplayName"]);
            this.displayDesc_en = entity_cls.get_english(this.mdui["mdui:Description"]);
        } catch (err) {
        }

        try {
            this.logo = this.mdui["mdui:Logo"][0]["_"];
            if (!this.logo.startsWith("http")) {
                this.logo = null;
            }
        } catch (err) {
        }

        // requested
        //
        try {
            var requested_arr = desc["md:AttributeConsumingService"][0]["md:RequestedAttribute"];
            for (var j = 0; j < requested_arr.length; ++j) {
                this.requested.push(requested_arr[j]["$"]["Name"]);
                this.requested_required.push("{0}_{1}".format(
                    requested_arr[j]["$"]["Name"],
                    requested_arr[j]["$"]["isRequired"]
                ));
            }
        } catch (err) {
            if(log_errors) {
                log.info("[{0}]: missing RequestedAttribute".format(this.entityID));
            }
        }

        // contacts
        //
        var people = entity["md:ContactPerson"];
        if (people) {
            for (var j = 0; j < people.length; ++j) {
                var person = people[j];
                try {
                    this.emails[person["$"]["contactType"]] = person["md:EmailAddress"][0].replace("mailto:", "");
                } catch (err) {
                    // could be a telephone
                    if (log_errors) {
                        log.info("[{0}]: missing EmailAddress".format(this.entityID));
                    }
                }
            }

        }else {
            log.info("[{0}]: missing ContactPerson".format(this.entityID));
        }
    }catch(exc) {
        log.warn("[{0}] parsing error - {1}".format(this.entityID, exc));
        throw exc;
    }
};

entity_cls.get_english = function(arr) {
    for (var i =0; i < arr.length; ++i) {
        if ("en" === arr[i]["$"]["xml:lang"]) {
            return arr[i]["_"];
        }
    }
    return 0 < arr.length ? arr[0]["_"] : "N/A";
};

entity_cls.get_entityID = function(entity) {
    return entity["$"]["entityID"];
};

module.exports = entity_cls;