(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['Authorization.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"auth-input\" data-input-type=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"type") || (depth0 != null ? lookupProperty(depth0,"type") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data,"loc":{"start":{"line":9,"column":57},"end":{"line":9,"column":65}}}) : helper)))
    + "\" data-input-name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":9,"column":84},"end":{"line":9,"column":92}}}) : helper)))
    + "\">\r\n                    <input class=\"auth-input__field\" \r\n                           type=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"type") || (depth0 != null ? lookupProperty(depth0,"type") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data,"loc":{"start":{"line":11,"column":33},"end":{"line":11,"column":41}}}) : helper)))
    + "\" \r\n                           placeholder=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"placeholder") || (depth0 != null ? lookupProperty(depth0,"placeholder") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"placeholder","hash":{},"data":data,"loc":{"start":{"line":12,"column":40},"end":{"line":12,"column":55}}}) : helper)))
    + "\" \r\n                           name=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"name") || (depth0 != null ? lookupProperty(depth0,"name") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data,"loc":{"start":{"line":13,"column":33},"end":{"line":13,"column":41}}}) : helper)))
    + "\"\r\n                           maxlength=\"100\"\r\n                           "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(lookupProperty(helpers,"eq")||(depth0 && lookupProperty(depth0,"eq"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"type") : depth0),"password",{"name":"eq","hash":{},"data":data,"loc":{"start":{"line":15,"column":33},"end":{"line":15,"column":53}}}),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.program(4, data, 0),"data":data,"loc":{"start":{"line":15,"column":27},"end":{"line":15,"column":119}}})) != null ? stack1 : "")
    + ">\r\n                    <div class=\"auth-input__error\"></div>\r\n                </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "autocomplete=\"current-password\"";
},"4":function(container,depth0,helpers,partials,data) {
    return "autocomplete=\"off\"";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"auth-page\">\r\n    <div class=\"auth-page__background\"></div>\r\n    <div class=\"auth-page__form-container\">\r\n        <form class=\"auth-form\" novalidate>\r\n            <img class=\"auth-form__logo\" src=\"../../images/logo.png\" alt=\"Логотип\">\r\n            <h1 class=\"auth-form__title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":6,"column":41},"end":{"line":6,"column":50}}}) : helper)))
    + "</h1>\r\n            <div class=\"auth-form__inputs\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"inputs") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":16},"end":{"line":18,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n            <div class=\"auth-form__actions\">\r\n                <div class=\"auth-form__error\"></div>\r\n                <button type=\"submit\" class=\"auth-button\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"buttonText") || (depth0 != null ? lookupProperty(depth0,"buttonText") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"buttonText","hash":{},"data":data,"loc":{"start":{"line":22,"column":58},"end":{"line":22,"column":72}}}) : helper)))
    + "</button>\r\n            </div>\r\n        </form>\r\n    </div>\r\n</div>";
},"useData":true});
templates['Complex.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <img class=\"slider__image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":38},"end":{"line":10,"column":79}}})) != null ? stack1 : "")
    + "\" \r\n                 src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\" \r\n                 alt=\"Фото комплекса "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":12,"column":37},"end":{"line":12,"column":47}}}) : helper)))
    + "\">\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    return "slider__image_active";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"slider__btn-group\">\r\n                <button class=\"slider__btn slider__btn_prev\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n                <button class=\"slider__btn slider__btn_next\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n            </div>\r\n\r\n            <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":30,"column":16},"end":{"line":32,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":31,"column":43},"end":{"line":31,"column":82}}})) != null ? stack1 : "")
    + "\"></button>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    return "slider__dot_active";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"offer-card\" data-offer-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":51,"column":47},"end":{"line":51,"column":53}}}) : helper)))
    + "\">\r\n            <div class=\"offer-card__gallery\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":16},"end":{"line":57,"column":25}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":59,"column":16},"end":{"line":77,"column":23}}})) != null ? stack1 : "")
    + "            </div>\r\n\r\n            <span class=\"offer-card__price\">"
    + alias4((lookupProperty(helpers,"formatPrice")||(depth0 && lookupProperty(depth0,"formatPrice"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"price") : depth0),{"name":"formatPrice","hash":{},"data":data,"loc":{"start":{"line":80,"column":44},"end":{"line":80,"column":65}}}))
    + " ₽</span>\r\n            <span class=\"offer-card__description\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"rooms") || (depth0 != null ? lookupProperty(depth0,"rooms") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"rooms","hash":{},"data":data,"loc":{"start":{"line":81,"column":50},"end":{"line":81,"column":59}}}) : helper)))
    + "-комн. · "
    + alias4(((helper = (helper = lookupProperty(helpers,"area") || (depth0 != null ? lookupProperty(depth0,"area") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"area","hash":{},"data":data,"loc":{"start":{"line":81,"column":68},"end":{"line":81,"column":76}}}) : helper)))
    + "м²</span>\r\n            <span class=\"offer-card__metro\">\r\n                <img src=\"../../images/metro.png\" alt=\"Метро\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":83,"column":63},"end":{"line":83,"column":72}}}) : helper)))
    + "\r\n            </span>\r\n            <span class=\"offer-card__address\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":85,"column":46},"end":{"line":85,"column":57}}}) : helper)))
    + "</span>\r\n        </div>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <img class=\"slider__image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":54,"column":42},"end":{"line":54,"column":83}}})) != null ? stack1 : "")
    + "\" \r\n                     src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\" \r\n                     alt=\"Фото объявления "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":56,"column":42},"end":{"line":56,"column":52}}}) : helper)))
    + "\">\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__btn slider__btn_prev\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n                <button class=\"slider__btn slider__btn_next\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n\r\n                <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":72,"column":20},"end":{"line":75,"column":29}}})) != null ? stack1 : "")
    + "                </div>\r\n";
},"12":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":73,"column":47},"end":{"line":73,"column":86}}})) != null ? stack1 : "")
    + "\" \r\n                            data-index=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":74,"column":40},"end":{"line":74,"column":50}}}) : helper)))
    + "\"></button>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"complex\">\r\n    <div class=\"complex__slider\">\r\n        <div class=\"complex__slider-group\">\r\n            <span class=\"complex__slider-title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":4,"column":48},"end":{"line":4,"column":57}}}) : helper)))
    + "</span>\r\n            <span class=\"complex__slider-price\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"price") || (depth0 != null ? lookupProperty(depth0,"price") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"price","hash":{},"data":data,"loc":{"start":{"line":5,"column":48},"end":{"line":5,"column":57}}}) : helper)))
    + "</span>\r\n        </div>\r\n        \r\n        <div class=\"complex__slider-images\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":9,"column":12},"end":{"line":13,"column":21}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":15,"column":12},"end":{"line":34,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n    </div>\r\n\r\n    <div class=\"complex__block\">\r\n        <span class=\"complex__suptitle\">Адрес</span>\r\n        <h1 class=\"complex__title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":40,"column":35},"end":{"line":40,"column":46}}}) : helper)))
    + "</h1>\r\n        <span class=\"complex__metro\">\r\n            <img src=\"../images/metro.png\" alt=\"Метро\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":42,"column":56},"end":{"line":42,"column":65}}}) : helper)))
    + "\r\n        </span>\r\n        <p class=\"complex__desc\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":44,"column":33},"end":{"line":44,"column":48}}}) : helper)))
    + "</p>\r\n    </div>\r\n\r\n    <div class=\"complex__block\">\r\n        <h2 class=\"complex__title\">Доступные апартаменты</h2>\r\n        <div class=\"complex__apartments\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"apartments") : depth0),{"name":"each","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":50,"column":13},"end":{"line":87,"column":17}}})) != null ? stack1 : "")
    + "        </div>\r\n    </div>\r\n\r\n    <div class=\"complex__block\">\r\n        <div class=\"complex__map\"></div>\r\n    </div>\r\n</div>";
},"useData":true});
templates['ComplexesList.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"complexes-list__item\" data-complex-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":4,"column":55},"end":{"line":4,"column":61}}}) : helper)))
    + "\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"imageUrl") : depth0),{"name":"if","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":7,"column":15}}})) != null ? stack1 : "")
    + "        <span class=\"complexes-list__item-title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":8,"column":49},"end":{"line":8,"column":58}}}) : helper)))
    + "</span>\r\n        <span class=\"complexes-list__status\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"status") || (depth0 != null ? lookupProperty(depth0,"status") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"status","hash":{},"data":data,"loc":{"start":{"line":9,"column":45},"end":{"line":9,"column":55}}}) : helper)))
    + "</span>\r\n        <span class=\"complexes-list__metro\">\r\n            <img src=\"../../images/metro.png\" alt=\"Метро\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":11,"column":59},"end":{"line":11,"column":68}}}) : helper)))
    + "\r\n        </span>\r\n        <span class=\"complexes-list__address\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":13,"column":46},"end":{"line":13,"column":57}}}) : helper)))
    + "</span>\r\n    </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <img class=\"complexes-list__image\" src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"imageUrl") || (depth0 != null ? lookupProperty(depth0,"imageUrl") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"imageUrl","hash":{},"data":data,"loc":{"start":{"line":6,"column":48},"end":{"line":6,"column":60}}}) : helper)))
    + "\" alt=\"Фото ЖК "
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":6,"column":75},"end":{"line":6,"column":84}}}) : helper)))
    + "\">\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<h1 class=\"complexes-list__title\">Подобрали ЖК для вас</h1>\r\n<div class=\"complexes-list__container\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"complexes") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":3,"column":4},"end":{"line":15,"column":13}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true});
templates['Header.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <button type=\"button\" class=\"header__menu-btn header__menu-btn--like\">\r\n                <img src=\"../images/menu__like.png\" alt=\"Избранное\">\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--add-object\">\r\n                + Объект\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--user\">\r\n                <img src=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"user") : depth0)) != null ? lookupProperty(stack1,"avatar") : stack1), depth0))
    + "\" alt=\"Профиль\">\r\n            </button>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <button type=\"button\" class=\"header__menu-btn header__menu-btn--register "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRegisterPage") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":20,"column":85},"end":{"line":20,"column":140}}})) != null ? stack1 : "")
    + "\">\r\n                Регистрация\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--login "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isLoginPage") : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":82},"end":{"line":23,"column":134}}})) != null ? stack1 : "")
    + "\">\r\n                Войти\r\n            </button>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "header__menu-btn--disabled";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"header__container\">\r\n    <div class=\"header__logo\">\r\n        <a href=\"/\" class=\"header__logo-link\">\r\n            <img src=\"../../images/logo.png\" class=\"header__logo-image\" alt=\"Логотип\">\r\n            <span class=\"header__logo-title\">Homa</span>\r\n        </a>\r\n    </div>\r\n    <div class=\"header__menu\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAuthenticated") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":9,"column":8},"end":{"line":26,"column":15}}})) != null ? stack1 : "")
    + "    </div>\r\n</div>";
},"useData":true});
templates['Offer.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span class=\"offer__metro\">\r\n                <img src=\"../images/metro.png\" alt=\"Метро\">\r\n                "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":9,"column":16},"end":{"line":9,"column":25}}}) : helper)))
    + "\r\n            </span>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <img class=\"slider__image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":19,"column":38},"end":{"line":19,"column":79}}})) != null ? stack1 : "")
    + "\" \r\n                 src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\" \r\n                 alt=\"Фото объявления "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":21,"column":38},"end":{"line":21,"column":48}}}) : helper)))
    + "\">\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "slider__image_active";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <button class=\"slider__btn slider__btn_prev\">\r\n                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                    <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                </svg>\r\n            </button>\r\n            <button class=\"slider__btn slider__btn_next\">\r\n                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                    <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                </svg>\r\n            </button>\r\n\r\n            <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":37,"column":16},"end":{"line":39,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":43},"end":{"line":38,"column":82}}})) != null ? stack1 : "")
    + "\"></button>\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    return "slider__dot_active";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"offer__rent-info\">\r\n                <ul class=\"offer__rent-list\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"deposit") : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":55,"column":20},"end":{"line":57,"column":27}}})) != null ? stack1 : "")
    + "                    <li class=\"offer__rent-item\">Комиссия .............................................................. "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"commission") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":58,"column":121},"end":{"line":58,"column":172}}})) != null ? stack1 : "")
    + "</li>\r\n                    <li class=\"offer__rent-item\">Предоплата ................................................... 1 месяц</li>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"rentalPeriod") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":20},"end":{"line":62,"column":27}}})) != null ? stack1 : "")
    + "                </ul>\r\n            </div>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    var lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <li class=\"offer__rent-item\">Залог ............................................................ "
    + container.escapeExpression((lookupProperty(helpers,"formatCurrency")||(depth0 && lookupProperty(depth0,"formatCurrency"))||container.hooks.helperMissing).call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"deposit") : depth0),{"name":"formatCurrency","hash":{},"data":data,"loc":{"start":{"line":56,"column":116},"end":{"line":56,"column":142}}}))
    + "</li>\r\n";
},"13":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return container.escapeExpression(((helper = (helper = lookupProperty(helpers,"commission") || (depth0 != null ? lookupProperty(depth0,"commission") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"commission","hash":{},"data":data,"loc":{"start":{"line":58,"column":139},"end":{"line":58,"column":153}}}) : helper)))
    + "%";
},"15":function(container,depth0,helpers,partials,data) {
    return "нет";
},"17":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <li class=\"offer__rent-item\">Срок аренды ................................................. "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"rentalPeriod") || (depth0 != null ? lookupProperty(depth0,"rentalPeriod") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"rentalPeriod","hash":{},"data":data,"loc":{"start":{"line":61,"column":111},"end":{"line":61,"column":127}}}) : helper)))
    + "</li>\r\n";
},"19":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"offer__feature\">\r\n                <img class=\"offer__feature-icon\" src=\"../images/"
    + alias4(((helper = (helper = lookupProperty(helpers,"icon") || (depth0 != null ? lookupProperty(depth0,"icon") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data,"loc":{"start":{"line":81,"column":64},"end":{"line":81,"column":72}}}) : helper)))
    + "_icon.png\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":81,"column":88},"end":{"line":81,"column":97}}}) : helper)))
    + "\">\r\n                <div class=\"offer__feature-content\">\r\n                    <h3 class=\"offer__feature-title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":83,"column":53},"end":{"line":83,"column":62}}}) : helper)))
    + "</h3>\r\n                    <p class=\"offer__feature-value\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":84,"column":52},"end":{"line":84,"column":61}}}) : helper)))
    + "</p>\r\n                </div>\r\n            </div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"offer\">\r\n    <div class=\"offer__header\">\r\n        <h1 class=\"offer__title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":3,"column":33},"end":{"line":3,"column":42}}}) : helper)))
    + "</h1>\r\n        <div class=\"offer__info\">\r\n            <span class=\"offer__info-desc\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"infoDesc") || (depth0 != null ? lookupProperty(depth0,"infoDesc") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"infoDesc","hash":{},"data":data,"loc":{"start":{"line":5,"column":43},"end":{"line":5,"column":55}}}) : helper)))
    + "</span>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"metro") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":12},"end":{"line":11,"column":19}}})) != null ? stack1 : "")
    + "            <span class=\"offer__address\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":12,"column":41},"end":{"line":12,"column":52}}}) : helper)))
    + "</span>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"offer__main\">\r\n        <div class=\"offer__gallery\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":18,"column":12},"end":{"line":22,"column":21}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":24,"column":12},"end":{"line":41,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n\r\n        <div class=\"offer__sidebar\">\r\n            <div class=\"offer__price-container\">\r\n                <h3 class=\"offer__price\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"price") || (depth0 != null ? lookupProperty(depth0,"price") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"price","hash":{},"data":data,"loc":{"start":{"line":46,"column":41},"end":{"line":46,"column":50}}}) : helper)))
    + "</h3>\r\n                <button class=\"offer__like-btn\">\r\n                    <img src=\"../images/like.png\" alt=\"Добавить в избранное\">\r\n                </button>\r\n            </div>\r\n            \r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRent") : depth0),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":12},"end":{"line":65,"column":19}}})) != null ? stack1 : "")
    + "\r\n            <button class=\"offer__contact-btn\">Позвонить</button>\r\n\r\n            <div class=\"offer__user\">\r\n                <img src=\"../images/user.png\" alt=\"Пользователь\">\r\n                <span class=\"offer__user-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"userName") || (depth0 != null ? lookupProperty(depth0,"userName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"userName","hash":{},"data":data,"loc":{"start":{"line":71,"column":47},"end":{"line":71,"column":59}}}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"offer__section\">\r\n        <h2 class=\"offer__section-title\">Характеристики</h2>\r\n        <div class=\"offer__features\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"characteristics") : depth0),{"name":"each","hash":{},"fn":container.program(19, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":79,"column":12},"end":{"line":87,"column":21}}})) != null ? stack1 : "")
    + "        </div>\r\n    </div>\r\n\r\n    <div class=\"offer__section\">\r\n        <h2 class=\"offer__section-title\">Описание</h2>\r\n        <p class=\"offer__description\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data,"loc":{"start":{"line":93,"column":38},"end":{"line":93,"column":53}}}) : helper)))
    + "</p>\r\n    </div>\r\n\r\n    <div class=\"offer__section\">\r\n        <h2 class=\"offer__section-title\">Местоположение на карте</h2>\r\n        <div class=\"offer__map\"></div>\r\n    </div>\r\n</div>";
},"useData":true});
templates['OffersList.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"offer-card\" data-offer-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":5,"column":47},"end":{"line":5,"column":53}}}) : helper)))
    + "\">\r\n            <div class=\"offer-card__gallery\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(2, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":16},"end":{"line":11,"column":25}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":13,"column":16},"end":{"line":31,"column":23}}})) != null ? stack1 : "")
    + "\r\n                <button class=\"offer-card__like "
    + alias4(((helper = (helper = lookupProperty(helpers,"likeClass") || (depth0 != null ? lookupProperty(depth0,"likeClass") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likeClass","hash":{},"data":data,"loc":{"start":{"line":33,"column":48},"end":{"line":33,"column":61}}}) : helper)))
    + "\">\r\n                    <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"likeIcon") || (depth0 != null ? lookupProperty(depth0,"likeIcon") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likeIcon","hash":{},"data":data,"loc":{"start":{"line":34,"column":30},"end":{"line":34,"column":42}}}) : helper)))
    + "\" alt=\"Лайк\">\r\n                </button>\r\n            </div>\r\n\r\n            <span class=\"offer-card__price\">"
    + alias4((lookupProperty(helpers,"formatPrice")||(depth0 && lookupProperty(depth0,"formatPrice"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"price") : depth0),{"name":"formatPrice","hash":{},"data":data,"loc":{"start":{"line":38,"column":44},"end":{"line":38,"column":65}}}))
    + " ₽</span>\r\n            <span class=\"offer-card__description\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"rooms") || (depth0 != null ? lookupProperty(depth0,"rooms") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"rooms","hash":{},"data":data,"loc":{"start":{"line":39,"column":50},"end":{"line":39,"column":59}}}) : helper)))
    + "-комн. · "
    + alias4(((helper = (helper = lookupProperty(helpers,"area") || (depth0 != null ? lookupProperty(depth0,"area") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"area","hash":{},"data":data,"loc":{"start":{"line":39,"column":68},"end":{"line":39,"column":76}}}) : helper)))
    + "м²</span>\r\n            <span class=\"offer-card__metro\">\r\n                <img src=\"../../images/metro.png\" alt=\"Метро\"> "
    + alias4(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":41,"column":63},"end":{"line":41,"column":72}}}) : helper)))
    + "\r\n            </span>\r\n            <span class=\"offer-card__address\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":43,"column":46},"end":{"line":43,"column":57}}}) : helper)))
    + "</span>\r\n        </div>\r\n";
},"2":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <img class=\"slider__image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":42},"end":{"line":8,"column":83}}})) != null ? stack1 : "")
    + "\" \r\n                     src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\" \r\n                     alt=\"Фото объявления "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":10,"column":42},"end":{"line":10,"column":52}}}) : helper)))
    + "\">\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "slider__image_active";
},"5":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__btn slider__btn_prev\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n                <button class=\"slider__btn slider__btn_next\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n\r\n                <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(6, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":26,"column":20},"end":{"line":29,"column":29}}})) != null ? stack1 : "")
    + "                </div>\r\n";
},"6":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(7, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":27,"column":47},"end":{"line":27,"column":86}}})) != null ? stack1 : "")
    + "\" \r\n                            data-index=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":28,"column":40},"end":{"line":28,"column":50}}}) : helper)))
    + "\"></button>\r\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "slider__dot_active";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"offers\">\r\n    <h1 class=\"offers__title\">Популярные объявления</h1>\r\n    <div class=\"offers__container\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"offers") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":45,"column":17}}})) != null ? stack1 : "")
    + "    </div>\r\n</div>";
},"useData":true});
templates['Search.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"search-widget__dropdown\" data-type=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"type") || (depth0 != null ? lookupProperty(depth0,"type") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"type","hash":{},"data":data,"loc":{"start":{"line":6,"column":56},"end":{"line":6,"column":64}}}) : helper)))
    + "\" data-key=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"key") || (depth0 != null ? lookupProperty(depth0,"key") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data,"loc":{"start":{"line":6,"column":76},"end":{"line":6,"column":83}}}) : helper)))
    + "\"></div>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"search-widget\">\r\n    <div class=\"search-widget__background\"></div>\r\n    <h1 class=\"search-widget__title\">Твой следующий адрес начинается здесь</h1>\r\n    <div class=\"search-widget__block\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"dropdowns") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":8},"end":{"line":7,"column":17}}})) != null ? stack1 : "")
    + "        <div class=\"search-widget__field\"></div>\r\n    </div>\r\n    <div class=\"search-widget__actions\">\r\n        <div class=\"search-widget__buttons\"></div>\r\n    </div>\r\n</div>";
},"useData":true});
})();