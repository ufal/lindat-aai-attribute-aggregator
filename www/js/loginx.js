/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['attributes', 'entities', 'utils', 'theme', 'jquery'], function (attributes, entities, utils, theme, jQuery) {

    function Loginx() {
        this.met_refeds = "https://met.refeds.org/met/entity/{0}/?federation=edugain";
    }

    Loginx.prototype.obj = function() {
        return jQuery("#list-logins");
    };

    Loginx.prototype.clear = function () {
        this.obj().html('');
    };

    Loginx.prototype.loading = function (start_loading) {
        if (false == start_loading) {
            this.obj().html('');
        }else {
            theme.loading(this.obj());
        }
    };

    Loginx.prototype.counts = function() {
        utils.simple_ajax(
            settings.backend.api.details,
            function(data) {
                var facets = data.result.facets;
                jQuery(".idp-count").html(theme.huge_text(facets.idp.length / 2));
                jQuery(".sp-count").html(theme.huge_text(facets.sp.length / 2));
                jQuery(".idpsp-count").html(theme.huge_text(facets.idpsp.length / 2));
                var idps = "";
                for (var i=0; i < facets.idp.length; i+=2) {
                    idps += theme.dict_entry(facets.idp[i], facets.idp[i+1]);
                }
                jQuery("#list-idps").html(idps);
                var sps = "";
                for (var i=0; i < facets.sp.length; i+=2) {
                    sps += theme.dict_entry(facets.sp[i], facets.sp[i+1]);
                }
                jQuery("#list-sps").html(sps);
            },
            function(xhr, status, error){
            }
        );
    };

    Loginx.prototype.check_freshness = function (idp, sp, timestamp, obj) {
        var loader = obj.parent().children().last();
        var params = 'q=idpsp:"{0}|{1}"'.format(idp, sp);
        utils.simple_ajax(
            settings.backend.api.list + "?" + utils.encodeUriSpecial(params),
            function(data) {
                loader.remove();
                try {
                    if (timestamp != data.result[0].timestamp) {
                        obj.children().first().append(' ... removed because newer entry available... ');
                        obj.children().last().fadeOut();
                        return;
                    }
                }catch(err){
                }
                obj.removeClass('grayed-out');
            },function(xhr, status, error){
            }
        );
    };

    Loginx.prototype.list_loginx = function (params, clb) {
        if (!params) {
            params = "";
        }
        var self = this;
        utils.simple_ajax(
            settings.backend.api.list + "?" + params,
            function(data) {
                self.loading(false);
                var docs = data.result;
                for (var i=0; i<docs.length; ++i) {
                    var doc = docs[i];
                    var ts = doc.timestamp || doc.our_timestamp || "unknown";
                    ts = ts.toString().replace("T", " ").replace("Z", "");

                    var idp = doc.idp;
                    var sp = doc.sp;
                    var attributes_names = (doc.attributes || []).map(attributes.name).sort();
                    var result_label = "label label-danger";
                    var result = '<i class="fa fa-3x fa-meh-o" aria-hidden="true"></i>';
                    var keys = Object.keys(settings.frontend.profile).sort();
                    for (var j=0; j < keys.length; ++j) {
                        var key = keys[j];
                        var fnc = settings.frontend.profile[key];
                        var res = fnc(attributes_names);
                        if (false !== res) {
                            result_label = key;
                            result = res;
                            break;
                        }
                    }
                    var feeds = doc.feeds;

                    self.obj().append(
                        theme.list_login_item(
                            i + 1, idp, sp, attributes_names, ts, result_label, result, feeds
                        )
                    );
                    if (clb) {
                        clb(idp, sp, doc, self.obj().children().last());
                    }

                } // for

                entities.update();
            },
            function(xhr, status, error){
            }
        );
    };
    
    Loginx.prototype.statistics = function () {
        var self = this;
        utils.simple_ajax(
            settings.backend.api.statistics + "?func=getRA_counts",
            function(data) {
                self.loading(false);

                var ra_count  = {};
                var ra_total = { count: 0, edugain: 0, spf: 0};
                var idp2ra = {};
                var idp2feed = {}
                var nullRA = [];

                for(r in data.results) {
                        ra = data.results[r];
                        if(ra.value===undefined) continue;
                        var edugain = 0;
                        var spf = 0;
                        for(i in ra.pivot){
                                var idp = ra.pivot[i].value;                                
                                if(idp===undefined) continue;
                                if(idp in idp2ra) {
                                        idp2ra[idp].push(ra.value);
                                } else {
                                        idp2ra[idp] = [ra.value];
                                }
                                var feeds = ra.pivot[i].pivot;
                                for(f in feeds) {
                                        var feed = feeds[f].value;
                                        if(feed){
                                                if(idp in idp2feed){
                                                        idp2feed[idp].push(feed);
                                                } else {
                                                        idp2feed[idp] = [feed];
                                                }
                                                if(feed=="edugain") edugain++;
                                                else
                                                if(feed=="spf") spf++;
                                        }
                                }
                                if(!ra.value) {
                                	nullRA.push(idp);
                                }                                
                        }
                        ra_count[ra.value] =
                                        {
                                                count: ra.count,
                                                edugain: edugain,
                                                spf: spf
                                        };
                        ra_total.count += ra.count;
                        ra_total.edugain += edugain;
                        ra_total.spf += spf;
                }
                
                utils.simple_ajax(
                        settings.backend.api.idps,
                        function(data) {
                        	
			                self.obj().append(theme.show_idp_statistics(data.results, ra_total, nullRA));
			
			                utils.simple_ajax(
			                    settings.backend.api.statistics + "?func=getSP_counts",
			                    function(data) {
			                        var sp_counts = {};
			                        var sp_ra = {};
			                        var sp_undefined = {};
			                        for(s in data.results) {
			                                var sp = data.results[s];
			                                if(sp.value===undefined) continue;
			                                var c = {idp: sp.count, edugain: 0, spf: 0, clarin_friendly: 0, id_friendly: 0, nasty: 0};
			                                var ra_breakdown = {};
			                                var undef = [];
			                                for(i in sp.pivot) {
			                                        var idp = sp.pivot[i];
			                                        if(idp.value===undefined) continue;
			                                        var ra = idp2ra[idp.value];
			                                        if(ra==null || ra=="") ra=undefined;
			                                        if(!(ra in ra_breakdown)){
			                                                ra_breakdown[ra] = {idp: 1, edugain: 0, spf: 0, clarin_friendly: 0, id_friendly: 0, nasty: 0};
			                                        } else {
			                                                ra_breakdown[ra].idp ++;
			                                        }
			                                        if(!ra) {
			                                                undef.push(idp.value);
			                                        }
			                                        var feeds = idp2feed[idp.value];
			                                        for(f in feeds) {
			                                                if(feeds[f]=="edugain"){
			                                                        c.edugain ++;
			                                                        ra_breakdown[ra].edugain ++;
			                                                }
			                                                else
			                                                if(feeds[f]=="spf"){
			                                                        c.spf ++;
			                                                        ra_breakdown[ra].spf ++;
			                                                }
			                                        }
			                                        var nasty = false;
			                                        var eppn = false;
			                                        var eptid = false;
			                                        var perid = false;
			                                        var mail = false; 
			                                        for(a in idp.pivot) {
			                                                var attribute = idp.pivot[a];
			                                                if(!attribute.field) continue;
			                                                if(attribute.value == null) nasty = true;
			                                                else {
			                                                        name = attributes.name(attribute.value);
			                                                        if(name == "eduPersonPrincipalName") eppn = true;
			                                                        else
			                                                        if(name == "eduPersonTargetedID") eptid = true;
			                                                        else
			                                                        if(name == "eduPersonTargetedID-persistentID") perid = true;
			                                                        else
			                                                        if(name == "mail") mail = true;
			                                                }
			                                        }
			                                        if(nasty) {
			                                                c.nasty++;
			                                                ra_breakdown[ra].nasty++;
			                                        }
			                                        if(eppn || eptid) {
			                                                c.clarin_friendly ++;
			                                                ra_breakdown[ra].clarin_friendly ++;
			                                        }
			                                        if((eppn || eptid) && (perid || mail)) {
			                                                c.id_friendly ++;
			                                                ra_breakdown[ra].id_friendly ++;
			                                        }
			                                }
			                                sp_counts[sp.value] = c;
			                                sp_ra[sp.value] = ra_breakdown;
			                                sp_undefined[sp.value] = undef;
			                        }
			                        self.obj().append(theme.show_sp_statistics(sp_counts, sp_ra, sp_undefined));
			                    },
			                    function(xhr, status, error){
			                    }
			                );
	                    },
	                    function(xhr, status, error){
	                    }
	                );			                
            },
            function(xhr, status, error){
            }
        );
    };    

    return new Loginx();
});