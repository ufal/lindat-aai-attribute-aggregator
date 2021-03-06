/*
 * 
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global jQuery, window, document */
define(['utils', 'jquery'], function (utils, jQuery) {

    function Html() {
        this.pallete = [
            "#588C7E",
            "#F2E394",
            "#F2AE72",
            "#D96459",
            "#8C4646",
            "#64E8F4",
            "#666259",
            "#89714D",
            "#160F08",
            "#644516",
        ];

        this.entity_info =
            '<hr><div class="entity-info-name" data-entity-attribute="displayName_en"></div>' +
            '<hr><div class="entity-contacts" data-entity-attribute="contacts"></div>' +
            '<hr><div class="entity-info-value entity-info-height-two" data-entity-attribute="displayDesc_en"><i class="fa fa-home" aria-hidden="true"></i> </div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="registrationAuthority"><i class="fa fa-registered" aria-hidden="true"></i> Registrator: </div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="entityAttributes"></div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="requested_required"></div>' +
            '<hr><div class="entity-info-value" data-entity-attribute="feeds"></div>'
        ;
    }

	Html.prototype.list_sp = function (pos, entityID, entity) {
        return (
        '<div class="row entry" data-entity="{1}">' +
            '<div class="text-left text-muted">' +
                '<h3><i class="fa fa-cogs"> {0}. {1} </i></h3>' +
            '</div>' +
            '<div class="col-sm-4">' +
                '<div class="entity-info-value" data-entity-attribute="registrationAuthority"><i class="fa fa-registered" aria-hidden="true"></i> Registrator: </div>' +
                '<hr><div class="entity-info-name" data-entity-attribute="displayName_en"></div>' +
                '<div class="entity-info-value entity-info-height-two" data-entity-attribute="displayDesc_en"><i class="fa fa-home" aria-hidden="true"></i> </div>' +
                '<hr><div class="entity-contacts" data-entity-attribute="contacts"></div>' +
            '</div>' +
            '<div class="col-sm-4">' +
                '<div class="entity-info-value" data-entity-attribute="feeds"></div><hr>' +
                '<div class="entity-info-value" data-entity-attribute="requested_required"></div>' +
            '</div>' +
        '</div><hr class="entity-hr">').format(pos, entityID, entity, this.entity_info);
	};

    Html.prototype.list_login_item = function (pos, idp, sp, attributes, ts, result_label, result) {
        var attributes_html = "";
        if (attributes) {
            for (var i = 0; i < attributes.length; ++i) {
                attributes_html += '<li class="text-muted {0}">{0}</li>'.format(attributes[i]);
            }
        }else {
            attributes_html = "<li>MISSING!</li>";
        }
        attributes_html = '<ul class="entity-attributes">{0}</ul>'.format(attributes_html);

        return ('<div class="row entry">' +
                '<div class="row page-header">' +
                    '<span class="label label-primary"> {6}</span>' +
                    ' <span class="text-muted "> <i class="fa fa-clock-o" aria-hidden="true"></i> {5}</span>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-sm-4" data-entity="{0}" data-entity-brother="{1}" data-type="idp">' +
                        '<div class="text-right text-muted">' +
                            '<h5><a href="https://met.refeds.org/met/entity/{0}" target="_blank">{0}</a> <i class="fa fa-university fa-2x"></i></h5>' +
                        '</div>' +
                        '<div class="text-center entity-info entity-idp">{7}</div>' +
                    '</div>' +
                    '<div class="col-sm-3 aa-vs">' +
                        '<h4 class="text-center text-huge">vs.</h4>' +
                        '<div class="col-sm-12 {2} auth-result">' +
                            '{3}' +
                        '</div>' +
                        '<div class="col-sm-12">' +
                            '{4}' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-4 text-left" data-entity="{1}" data-entity-brother="{0}" data-type="sp">' +
                        '<div class="text-left text-muted">' +
                            '<h5><i class="fa fa-cogs fa-2x"></i> {1}</h5>' +
                        '</div>' +
                        '<div class="text-center entity-info">' +
                            '<div class="text-center entity-info">{7}</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>').format(idp, sp, result_label, result, attributes_html, ts, pos, this.entity_info);
    };

    Html.prototype.link = function(text, href) {
      return '<a href="{0}">{1}</a>'.format(href, text);
    };

    Html.prototype.loading_html = function(mul) {
        return '<i class="fa fa-cog fa-spin fa-{0}x fa-fw margin-bottom"></i>'.format(mul || '3');
    };

    Html.prototype.loading = function(obj) {
        obj.append(this.loading_html());
    };
    
    Html.prototype.user = function(name) {
        return '<i class="fa fa-2x fa-user-md" aria-hidden="true"></i> ' + name;
    };

    Html.prototype.contact = function(email, msg) {
        return '<div><a href="mailto:{0}"><i class="fa fa-envelope-o" aria-hidden="true"></i> {1}</a></div>'.format(
            email, msg || email
        );
    };

    Html.prototype.howler = function(subject, email, msg_link, msg_body, email_cc) {
        var mailto_msg = 'subject={0}&cc={1}&body={2}';
        mailto_msg = mailto_msg.format(
            encodeURI(subject),
            encodeURI(email_cc || ""),
            encodeURI(msg_body.format())
        );
        return '<div><a href="mailto:{0}?{1}" class="alert-danger"><i class="fa fa-envelope fa-2x"></i> {2}</a></div>'.format(
            email, mailto_msg, msg_link
        );
    };

    Html.prototype.nav_link = function(text, link) {
        return '<li class="alert-success"><a href="{1}" target="_blank">{0}</a></li>'.format(text, link);
    };

    Html.prototype.result_title = function(name) {
        jQuery("#result-title").html(name);
    };

    Html.prototype.huge_text = function(text) {
        return '<div class="text-huge">{0}</div>'.format(text);
    };

    Html.prototype.dict_entry = function(key, value) {
        return '<div>{0}: <span class="badge">{1}</span></div>'.format(key, value);
    };

    Html.prototype.mandatory = function(msg) {
        return '<span class="label label-danger">{0}</span>'.format(msg);
    };

    Html.prototype.optional = function(msg) {
        return '<span class="label label-info">{0}</span>'.format(msg);
    };
    

    Html.prototype.show_idp_statistics = function(ra_count, ra_total, nullRA) {
		var heading = "<h3>IdP Statistics</h3>";
		var summary = "<a class='btn btn-primary btn-sm pull-right' style='margin: 4px;' href='./map.html' target='_blank'><i class='fa fa-map-o'></i> View Map</a>" +
				"<div class='well'><strong>"
				+ "<div>In total <kbd>{0}</kbd> Federations</div>"
				+ "<div><kbd>{1}</kbd> IdPs are registered</div>"
				+ "<div>out of which <kbd>{2}</kbd> are in eduGAIN and <kbd>{3}</kbd> in SPF</div>"
				+ "</strong></div>";
		var totalFed = Object.keys(ra_count).length;
		if (nullRA.length>0) {
            totalFed -= 1;
        }
		summary = summary.format(totalFed,
				ra_total.count, ra_total.edugain, ra_total.spf);
		
		var message = "<div class='alert alert-warning'><small><strong>The total IdP Counts are collected from https://wiki.edugain.org/isFederatedCheck/Federations.</strong><small></div>";		
		var thead = "<thead><tr>" + "<th>Federation</th>"
				+ "<th class='text-right'>IdP Counts</th>"
				+ "<th class='text-right'>In Our Feeds</th>"
				+ "<th class='text-right'>from eduGain</th>"
				+ "<th class='text-right'>from SPF</th></tr></thead>";
		var trows = "";
		var nullRARow = "";
        var collapsed = "";
		if (ra_count[null]) {
			collapsed = "role='button' data-toggle='collapse' data-target='#null_ra_row'";
	    	nullRARow += "<tr class='{1} {7}' style='cursor: pointer;'><td>{0}</td><td class='text-right'><strong>-</strong></td><td class='text-right'><strong>{2}</strong></td><td class='text-right {5}'>{3}</td><td class='text-right {6}'>{4}</td></tr>"
				.format("Registration Authority Unknown", "danger", ra_count[null].our_idp_count,
						ra_count[null].edugain, ra_count[null].spf,
						"", "", collapsed);
	    	nullRARow += "<tr class='small danger collapse out' id='null_ra_row'><td colspan='7'>";
	        for (var i=0;i<nullRA.length;i++) {
	        	nullRARow += "<div>{0}</div>".format(nullRA[i]);
	        }	
	        nullRARow += "</td></tr>";
		}		
		var keys = Object.keys(ra_count);
		keys.sort();
		for (var r=0;r<keys.length;r++) {
			var ra = keys[r];
			var edu_cls = "";
			var sp_cls = "";
			if (ra_count[ra].edugain > ra_count[ra].spf) {
                edu_cls = "success";
            }
			if (ra_count[ra].edugain < ra_count[ra].spf) {
                sp_cls = "success";
            }
			var ra_name = "<a href='{0}'>{1}</a>".format(ra_count[ra].registration_authority, ra_count[ra].name);
			var ra_cls = "";
			trows += "<tr class='{1}' {7}><td>{0}</td><td class='text-right'><strong>{8}</strong></td><td class='text-right'><strong>{2}</strong></td><td class='text-right {5}'>{3}</td><td class='text-right {6}'>{4}</td></tr>"
				.format(ra_name, ra_cls, ra_count[ra].our_idp_count,
						ra_count[ra].edugain, ra_count[ra].spf,
						edu_cls, sp_cls, collapsed, ra_count[ra]["wiki.edugain_idp_count"]);            	
		}
		var tbody = "<tbody>{0}{1}</tbody>".format(nullRARow, trows);
		var table = "<table class='table table-striped'>{0}{1}</table>"
				.format(thead, tbody);
		return "<div class='col-md-6' style='border-right: 2px solid #C0C0C0'>{0}{1}{2}{3}</div>"
				.format(heading, summary, message, table);
	};

	Html.prototype.show_sp_statistics = function(sp_counts, sp_ra, sp_undefined) {
		var heading = "<h3>SP Statistics</h3>";
		var help = "<div class='well'><strong>"
				+ "<div>Clarin friendly = releases eduPersonPrincipalName or eduPersonTargetedID</div>"
				+ "<div>ID friendly = Clarin friendly + releases eduPersonTargetedID-persistentID or mail</div>"
				+ "<div>Nasty = releases 0 attributes</div>" + "</div>";
		var thead = "<caption class='small text-info'> * Click on SP name to show/hide the breakdown of registration authorities.</caption>"
				+ "<thead class='small'>"
				+ "<tr><th>Service Provider</th>"
				+ "<th class='text-right'>IdP Count</th>"
				+ "<th class='text-right'>In eduGain</th>"
				+ "<th class='text-right'>In SPF</th>"
				+ "<th class='text-right'>Clarin friendly</th>"
				+ "<th class='text-right'>ID friendly</th>"
				+ "<th class='text-right'>Nasty</th></tr></thead>";
		var trows = "";
		var i = 0;
		for (var sp in sp_counts) {
            if (!sp_counts.hasOwnProperty(sp)) {
                continue;
            }
			i++;
			var nasty_cls = "";
			if (sp_counts[sp].nasty > 0) {
                nasty_cls = "danger";
            }
			trows += "<tr class='info' role='button' data-toggle='collapse' id='{1}' data-target='{2}'><td colspan='7'><b>{0}</b></td></tr>"
					.format(sp, i, "." + i + "collapsed");
			trows += "<tr><td>&nbsp;</td><td class='text-right'><b>{0}</b></td><td class='text-right'><b>{1}</b></td><td class='text-right'><b>{2}</b></td><td class='text-success text-right'><b>{3}</b></td><td class='text-success text-right'><b>{4}</b></td><td class='text-right {6}'><b>{5}</b></td></tr>"
					.format(sp_counts[sp].idp, sp_counts[sp].edugain,
							sp_counts[sp].spf,
							sp_counts[sp].clarin_friendly,
							sp_counts[sp].id_friendly,
							sp_counts[sp].nasty, nasty_cls);
			for (var ra in sp_ra[sp]) {
                if (!sp_ra[sp].hasOwnProperty(ra)) {
                    continue;
                }
				var ra_counts = sp_ra[sp][ra];
				var cls = i + "collapsed";
				var ra_name = "<a href='{0}' target='_blank'>{0}</a>".format(ra);
				if (ra === 'undefined') {
					cls += " danger";
					ra_name = "Registration Authority Unknown";
				}
				nasty_cls = "";
				if (ra_counts.nasty > 0) {
                    nasty_cls = "danger";
                }
				trows += "<tr class='small collapse out {7}'><td>{0}</td><td class='text-right'>{1}</td><td class='text-right'>{2}</td><td class='text-right'>{3}</td><td class='text-right'>{4}</td><td class='text-right'>{5}</td><td class='text-right {8}'>{6}</td></tr>"
						.format(ra_name, ra_counts.idp,
								ra_counts.edugain, ra_counts.spf,
								ra_counts.clarin_friendly,
								ra_counts.id_friendly, ra_counts.nasty,
								cls, nasty_cls);
				if (ra === 'undefined') {
					trows += "<tr class='small collapse out {0}'><td colspan='7'>"
							.format(cls);
					for (var ud = 0; ud < sp_undefined[sp].length; ud++) {
						trows += "<div>{0}</div>"
								.format(sp_undefined[sp][ud]);
					}
					trows += "</td></tr>";
				}
			}
		}
		var tbody = "<tbody>{0}</tbody>".format(trows);
		var table = "<table class='table table-condensed table-hover'>{0}{1}</table>"
				.format(thead, tbody);
		return "<div class='col-md-6'>{0}{1}{2}</div>".format(
            heading, help, table
        );
	};    

    var html = new Html();
    jQuery(document).ready(function () {

        jQuery(".loading").each(function() {
            html.loading(jQuery(this));
        });
    });

    return html;
});