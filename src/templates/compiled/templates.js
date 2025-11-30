import Handlebars from 'handlebars';

const templates = {
  'Authorization': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true}),
  'Complex': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <span class=\"complex__slider-price\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"price") || (depth0 != null ? lookupProperty(depth0,"price") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"price","hash":{},"data":data,"loc":{"start":{"line":6,"column":48},"end":{"line":6,"column":57}}}) : helper)))
    + "</span>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <img class=\"complex__slider-image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":12,"column":46},"end":{"line":12,"column":95}}})) != null ? stack1 : "")
    + "\"\r\n                 src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\"\r\n                 alt=\"Фото комплекса "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":14,"column":37},"end":{"line":14,"column":47}}}) : helper)))
    + "\"\r\n                 loading=\"lazy\">\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "complex__slider-image_active";
},"6":function(container,depth0,helpers,partials,data) {
    return "            <img class=\"complex__slider-image complex__slider-image_active\"\r\n                 src=\"../images/default_complex.jpg\"\r\n                 alt=\"Фото комплекса\"\r\n                 loading=\"lazy\">\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"complex__slider-controls\">\r\n                <button class=\"complex__slider-btn complex__slider-btn_prev\" type=\"button\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n                <button class=\"complex__slider-btn complex__slider-btn_next\" type=\"button\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n            </div>\r\n\r\n            <div class=\"complex__slider-dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":38,"column":16},"end":{"line":40,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"complex__slider-dot "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":51},"end":{"line":39,"column":98}}})) != null ? stack1 : "")
    + "\" type=\"button\"></button>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    return "complex__slider-dot_active";
},"12":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <span class=\"complex__metro\">\r\n            <img src=\"../images/metro.png\" alt=\"Метро\"> "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":51,"column":56},"end":{"line":51,"column":65}}}) : helper)))
    + "\r\n        </span>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"complex__info-item\">\r\n            <span class=\"complex__info-label\">Застройщик:</span>\r\n            <span class=\"complex__info-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"developer") || (depth0 != null ? lookupProperty(depth0,"developer") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"developer","hash":{},"data":data,"loc":{"start":{"line":57,"column":46},"end":{"line":57,"column":59}}}) : helper)))
    + "</span>\r\n        </div>\r\n";
},"16":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"complex__info-item\">\r\n            <span class=\"complex__info-label\">Год постройки:</span>\r\n            <span class=\"complex__info-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"yearBuilt") || (depth0 != null ? lookupProperty(depth0,"yearBuilt") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"yearBuilt","hash":{},"data":data,"loc":{"start":{"line":63,"column":46},"end":{"line":63,"column":59}}}) : helper)))
    + "</span>\r\n        </div>\r\n";
},"18":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <p class=\"complex__description\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"description","hash":{},"data":data,"loc":{"start":{"line":67,"column":40},"end":{"line":67,"column":55}}}) : helper)))
    + "</p>\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"complex\">\r\n    <div class=\"complex__slider\">\r\n        <div class=\"complex__slider-content\">\r\n            <span class=\"complex__slider-title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":4,"column":48},"end":{"line":4,"column":57}}}) : helper)))
    + "</span>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"price") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":5,"column":12},"end":{"line":7,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n\r\n        <div class=\"complex__slider-images\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":11,"column":12},"end":{"line":21,"column":21}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":23,"column":12},"end":{"line":42,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n    </div>\r\n\r\n    <div class=\"complex__block\">\r\n        <span class=\"complex__suptitle\">Адрес</span>\r\n        <h1 class=\"complex__title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":48,"column":35},"end":{"line":48,"column":46}}}) : helper)))
    + "</h1>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"metro") : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":49,"column":8},"end":{"line":53,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"developer") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":54,"column":8},"end":{"line":59,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"yearBuilt") : depth0),{"name":"if","hash":{},"fn":container.program(16, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":60,"column":8},"end":{"line":65,"column":15}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"description") : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":66,"column":8},"end":{"line":68,"column":15}}})) != null ? stack1 : "")
    + "    </div>\r\n\r\n    <div class=\"complex__block\">\r\n        <h2 class=\"complex__subtitle\">Доступные апартаменты</h2>\r\n        <div class=\"complex__apartments\">\r\n            <p class=\"complex__empty\">Загрузка доступных апартаментов...</p>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"complex__block complex__map-section\">\r\n        <h2 class=\"complex__subtitle\">Местоположение на карте</h2>\r\n        <div id=\"yandex-complex-map\" class=\"complex__map\" data-address=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":80,"column":72},"end":{"line":80,"column":83}}}) : helper)))
    + "\"></div>\r\n    </div>\r\n</div>";
},"useData":true}),
  'ComplexesList': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
    + "\" loading=\"lazy\">\r\n";
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
},"useData":true}),
  'Header': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <button type=\"button\" class=\"header__menu-btn header__menu-btn--like\">\r\n                <img src=\"../../images/menu__like.png\" alt=\"Избранное\">\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--add-object\">\r\n                + Объект\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--user\">\r\n                <img src=\""
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"user") : depth0)) != null ? lookupProperty(stack1,"avatar") : stack1), depth0))
    + "\" alt=\"Профиль\" onerror=\"this.src='../../images/default_avatar.jpg'\">\r\n            </button>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "            <button type=\"button\" class=\"header__menu-btn header__menu-btn--register\">\r\n                Регистрация\r\n            </button>\r\n            <button type=\"button\" class=\"header__menu-btn header__menu-btn--login\">\r\n                Войти\r\n            </button>\r\n";
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
},"useData":true}),
  'Offer': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":28,"column":38},"end":{"line":28,"column":79}}})) != null ? stack1 : "")
    + "\"\r\n                 src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\"\r\n                 alt=\"Фото объявления "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":30,"column":38},"end":{"line":30,"column":48}}}) : helper)))
    + "\"\r\n                 loading=\"lazy\">\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    return "slider__image_active";
},"6":function(container,depth0,helpers,partials,data) {
    return "            <img class=\"slider__image slider__image_active\"\r\n                 src=\"../images/default_offer.jpg\"\r\n                 alt=\"Фото объявления\"\r\n                 loading=\"lazy\">\r\n";
},"8":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <button class=\"slider__btn slider__btn_prev\">\r\n                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                    <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                </svg>\r\n            </button>\r\n            <button class=\"slider__btn slider__btn_next\">\r\n                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                    <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                </svg>\r\n            </button>\r\n\r\n            <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":52,"column":16},"end":{"line":54,"column":25}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":53,"column":43},"end":{"line":53,"column":82}}})) != null ? stack1 : "")
    + "\"></button>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    return "slider__dot_active";
},"12":function(container,depth0,helpers,partials,data) {
    return "            <button class=\"slider__fullscreen-btn\">\r\n                <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                    <path d=\"M8 3H5C4.44772 3 4 3.44772 4 4V7M20 7V4C20 3.44772 19.5523 3 19 3H16M16 21H19C19.5523 21 20 20.5523 20 20V17M4 17V20C4 20.5523 4.44772 21 5 21H8\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"/>\r\n                </svg>\r\n            </button>\r\n";
},"14":function(container,depth0,helpers,partials,data) {
    return "Убрать из избранного";
},"16":function(container,depth0,helpers,partials,data) {
    return "Добавить в избранное";
},"18":function(container,depth0,helpers,partials,data) {
    return "offer__likes-counter--active";
},"20":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"offer__rent-info\">\r\n                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Оплата ЖКХ</span>\r\n                    <span class=\"offer__rent-value\">включена (без счётчиков)</span>\r\n                </div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"deposit") : depth0),{"name":"if","hash":{},"fn":container.program(21, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":84,"column":16},"end":{"line":89,"column":23}}})) != null ? stack1 : "")
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"commission") : depth0),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":90,"column":16},"end":{"line":95,"column":23}}})) != null ? stack1 : "")
    + "                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Предоплата</span>\r\n                    <span class=\"offer__rent-value\">1 месяц</span>\r\n                </div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"rentalPeriod") : depth0),{"name":"if","hash":{},"fn":container.program(25, data, 0),"inverse":container.program(27, data, 0),"data":data,"loc":{"start":{"line":100,"column":16},"end":{"line":110,"column":23}}})) != null ? stack1 : "")
    + "            </div>\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Залог</span>\r\n                    <span class=\"offer__rent-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"formattedDeposit") || (depth0 != null ? lookupProperty(depth0,"formattedDeposit") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"formattedDeposit","hash":{},"data":data,"loc":{"start":{"line":87,"column":52},"end":{"line":87,"column":72}}}) : helper)))
    + "</span>\r\n                </div>\r\n";
},"23":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Комиссия</span>\r\n                    <span class=\"offer__rent-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"formattedCommission") || (depth0 != null ? lookupProperty(depth0,"formattedCommission") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"formattedCommission","hash":{},"data":data,"loc":{"start":{"line":93,"column":52},"end":{"line":93,"column":75}}}) : helper)))
    + "</span>\r\n                </div>\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Срок аренды</span>\r\n                    <span class=\"offer__rent-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"rentalPeriod") || (depth0 != null ? lookupProperty(depth0,"rentalPeriod") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"rentalPeriod","hash":{},"data":data,"loc":{"start":{"line":103,"column":52},"end":{"line":103,"column":68}}}) : helper)))
    + "</span>\r\n                </div>\r\n";
},"27":function(container,depth0,helpers,partials,data) {
    return "                <div class=\"offer__rent-item\">\r\n                    <span class=\"offer__rent-label\">Срок аренды</span>\r\n                    <span class=\"offer__rent-value\">от года</span>\r\n                </div>\r\n";
},"29":function(container,depth0,helpers,partials,data) {
    return "            <div class=\"offer__owner-actions\">\r\n                <button class=\"offer__edit-btn\">Изменить</button>\r\n                <button class=\"offer__delete-btn\">Удалить</button>\r\n            </div>\r\n";
},"31":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"showPhone") : depth0),{"name":"if","hash":{},"fn":container.program(32, data, 0),"inverse":container.program(34, data, 0),"data":data,"loc":{"start":{"line":120,"column":16},"end":{"line":129,"column":23}}})) != null ? stack1 : "");
},"32":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <div class=\"offer__phone-display\">\r\n                    <span class=\"offer__phone-label\">Телефон:</span>\r\n                    <span class=\"offer__phone-number\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"userPhone") || (depth0 != null ? lookupProperty(depth0,"userPhone") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"userPhone","hash":{},"data":data,"loc":{"start":{"line":123,"column":54},"end":{"line":123,"column":67}}}) : helper)))
    + "</span>\r\n                </div>\r\n";
},"34":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"showContactBtn") : depth0),{"name":"if","hash":{},"fn":container.program(35, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":126,"column":20},"end":{"line":128,"column":27}}})) != null ? stack1 : "");
},"35":function(container,depth0,helpers,partials,data) {
    return "                    <button class=\"offer__contact-btn\">Позвонить</button>\r\n";
},"37":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"offer__feature-item\">\r\n                <div class=\"offer__feature-icon-wrapper\">\r\n                    <img src=\"../images/"
    + alias4(((helper = (helper = lookupProperty(helpers,"icon") || (depth0 != null ? lookupProperty(depth0,"icon") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"icon","hash":{},"data":data,"loc":{"start":{"line":145,"column":40},"end":{"line":145,"column":48}}}) : helper)))
    + "_icon.png\" alt=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":145,"column":64},"end":{"line":145,"column":73}}}) : helper)))
    + "\" class=\"offer__feature-icon\">\r\n                </div>\r\n                <div class=\"offer__feature-info\">\r\n                    <div class=\"offer__feature-title\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"title") || (depth0 != null ? lookupProperty(depth0,"title") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data,"loc":{"start":{"line":148,"column":54},"end":{"line":148,"column":63}}}) : helper)))
    + "</div>\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isComplex") : depth0),{"name":"if","hash":{},"fn":container.program(38, data, 0),"inverse":container.program(40, data, 0),"data":data,"loc":{"start":{"line":149,"column":20},"end":{"line":157,"column":27}}})) != null ? stack1 : "")
    + "                </div>\r\n            </div>\r\n";
},"38":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <a href=\"/complexes/"
    + alias4(((helper = (helper = lookupProperty(helpers,"complexId") || (depth0 != null ? lookupProperty(depth0,"complexId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"complexId","hash":{},"data":data,"loc":{"start":{"line":150,"column":44},"end":{"line":150,"column":57}}}) : helper)))
    + "\"\r\n                           class=\"offer__feature-value offer__feature-value--complex\"\r\n                           data-complex-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"complexId") || (depth0 != null ? lookupProperty(depth0,"complexId") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"complexId","hash":{},"data":data,"loc":{"start":{"line":152,"column":44},"end":{"line":152,"column":57}}}) : helper)))
    + "\">\r\n                            "
    + alias4(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"value","hash":{},"data":data,"loc":{"start":{"line":153,"column":28},"end":{"line":153,"column":37}}}) : helper)))
    + "\r\n                        </a>\r\n";
},"40":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                        <div class=\"offer__feature-value\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"value") || (depth0 != null ? lookupProperty(depth0,"value") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"value","hash":{},"data":data,"loc":{"start":{"line":156,"column":58},"end":{"line":156,"column":67}}}) : helper)))
    + "</div>\r\n";
},"42":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "    <div class=\"offer__section\">\r\n        <h2 class=\"offer__section-title\">Описание</h2>\r\n        <p class=\"offer__description\">"
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"description") || (depth0 != null ? lookupProperty(depth0,"description") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"description","hash":{},"data":data,"loc":{"start":{"line":167,"column":38},"end":{"line":167,"column":53}}}) : helper)))
    + "</p>\r\n    </div>\r\n";
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
    + "</span>\r\n        </div>\r\n\r\n        <div class=\"offer__views\">\r\n            <svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\">\r\n                <path d=\"M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z\" stroke=\"currentColor\" stroke-width=\"2\"/>\r\n                <circle cx=\"8\" cy=\"8\" r=\"2\" fill=\"currentColor\"/>\r\n            </svg>\r\n            <span>"
    + alias4(((helper = (helper = lookupProperty(helpers,"views") || (depth0 != null ? lookupProperty(depth0,"views") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"views","hash":{},"data":data,"loc":{"start":{"line":20,"column":18},"end":{"line":20,"column":27}}}) : helper)))
    + " "
    + alias4((lookupProperty(helpers,"pluralize")||(depth0 && lookupProperty(depth0,"pluralize"))||alias2).call(alias1,(depth0 != null ? lookupProperty(depth0,"views") : depth0),"просмотр","просмотра","просмотров",{"name":"pluralize","hash":{},"data":data,"loc":{"start":{"line":20,"column":28},"end":{"line":20,"column":83}}}))
    + "</span>\r\n        </div>\r\n\r\n    </div>\r\n\r\n    <div class=\"offer__main\">\r\n        <div class=\"offer__gallery\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.program(6, data, 0),"data":data,"loc":{"start":{"line":27,"column":12},"end":{"line":37,"column":21}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":39,"column":12},"end":{"line":56,"column":19}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,((stack1 = (depth0 != null ? lookupProperty(depth0,"images") : depth0)) != null ? lookupProperty(stack1,"length") : stack1),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":58,"column":12},"end":{"line":64,"column":19}}})) != null ? stack1 : "")
    + "        </div>\r\n\r\n        <div class=\"offer__sidebar\">\r\n            <div class=\"offer__price-container\">\r\n                <h3 class=\"offer__price\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"price") || (depth0 != null ? lookupProperty(depth0,"price") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"price","hash":{},"data":data,"loc":{"start":{"line":69,"column":41},"end":{"line":69,"column":50}}}) : helper)))
    + "</h3>\r\n                <button class=\"offer__like-btn\">\r\n                    <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"likeIcon") || (depth0 != null ? lookupProperty(depth0,"likeIcon") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likeIcon","hash":{},"data":data,"loc":{"start":{"line":71,"column":30},"end":{"line":71,"column":42}}}) : helper)))
    + "\" alt=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isLiked") : depth0),{"name":"if","hash":{},"fn":container.program(14, data, 0),"inverse":container.program(16, data, 0),"data":data,"loc":{"start":{"line":71,"column":49},"end":{"line":71,"column":119}}})) != null ? stack1 : "")
    + "\">\r\n                    <span class=\"offer__likes-counter "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isLiked") : depth0),{"name":"if","hash":{},"fn":container.program(18, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":72,"column":54},"end":{"line":72,"column":104}}})) != null ? stack1 : "")
    + "\">\r\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"likesCount") || (depth0 != null ? lookupProperty(depth0,"likesCount") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likesCount","hash":{},"data":data,"loc":{"start":{"line":73,"column":24},"end":{"line":73,"column":38}}}) : helper)))
    + "\r\n                    </span>\r\n                </button>\r\n            </div>\r\n\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isRent") : depth0),{"name":"if","hash":{},"fn":container.program(20, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":78,"column":12},"end":{"line":112,"column":19}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"showOwnerActions") : depth0),{"name":"if","hash":{},"fn":container.program(29, data, 0),"inverse":container.program(31, data, 0),"data":data,"loc":{"start":{"line":114,"column":12},"end":{"line":130,"column":19}}})) != null ? stack1 : "")
    + "\r\n            <div class=\"offer__user\">\r\n                <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"userAvatar") || (depth0 != null ? lookupProperty(depth0,"userAvatar") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"userAvatar","hash":{},"data":data,"loc":{"start":{"line":133,"column":26},"end":{"line":133,"column":40}}}) : helper)))
    + "\" alt=\"Пользователь\" class=\"offer__user-avatar\">\r\n                <span class=\"offer__user-name\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"userName") || (depth0 != null ? lookupProperty(depth0,"userName") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"userName","hash":{},"data":data,"loc":{"start":{"line":134,"column":47},"end":{"line":134,"column":59}}}) : helper)))
    + "</span>\r\n            </div>\r\n        </div>\r\n    </div>\r\n\r\n    <div class=\"offer__section\">\r\n        <h2 class=\"offer__section-title\">Характеристики</h2>\r\n        <div class=\"offer__features-grid\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"characteristics") : depth0),{"name":"each","hash":{},"fn":container.program(37, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":142,"column":12},"end":{"line":160,"column":21}}})) != null ? stack1 : "")
    + "        </div>\r\n    </div>\r\n\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"description") : depth0),{"name":"if","hash":{},"fn":container.program(42, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":164,"column":4},"end":{"line":169,"column":11}}})) != null ? stack1 : "")
    + "\r\n    <div class=\"offer__section offer__map-section\">\r\n        <h2 class=\"offer__section-title\">Местоположение на карте</h2>\r\n        <div id=\"yandex-map\" class=\"offer__map\" data-address=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":173,"column":62},"end":{"line":173,"column":73}}}) : helper)))
    + "\"></div>\r\n    </div>\r\n\r\n    <div class=\"offer__section offer__price-history-section\">\r\n        <h2 class=\"offer__section-title\">История изменения цены</h2>\r\n        <div class=\"offer__price-history-container\" id=\"price-history-chart\">\r\n        </div>\r\n    </div>\r\n</div>";
},"useData":true}),
  'OffersList': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    return "    <h1 class=\"offers__title\">Популярные объявления</h1>\r\n";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <div class=\"offer-card\" data-offer-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":7,"column":47},"end":{"line":7,"column":53}}}) : helper)))
    + "\">\r\n            <div class=\"offer-card__gallery\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(7, data, 0),"data":data,"loc":{"start":{"line":9,"column":16},"end":{"line":19,"column":25}}})) != null ? stack1 : "")
    + "\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"multipleImages") : depth0),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":21,"column":16},"end":{"line":39,"column":23}}})) != null ? stack1 : "")
    + "\r\n                <button class=\"offer-card__like\" data-offer-id=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"id") || (depth0 != null ? lookupProperty(depth0,"id") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data,"loc":{"start":{"line":41,"column":64},"end":{"line":41,"column":70}}}) : helper)))
    + "\">\r\n                    <img src=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"likeIcon") || (depth0 != null ? lookupProperty(depth0,"likeIcon") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likeIcon","hash":{},"data":data,"loc":{"start":{"line":42,"column":30},"end":{"line":42,"column":42}}}) : helper)))
    + "\" alt=\""
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isLiked") : depth0),{"name":"if","hash":{},"fn":container.program(13, data, 0),"inverse":container.program(15, data, 0),"data":data,"loc":{"start":{"line":42,"column":49},"end":{"line":42,"column":119}}})) != null ? stack1 : "")
    + "\">\r\n                    <span class=\"offer-card__likes-counter "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"isLiked") : depth0),{"name":"if","hash":{},"fn":container.program(17, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":43,"column":59},"end":{"line":43,"column":114}}})) != null ? stack1 : "")
    + "\">\r\n                        "
    + alias4(((helper = (helper = lookupProperty(helpers,"likesCount") || (depth0 != null ? lookupProperty(depth0,"likesCount") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"likesCount","hash":{},"data":data,"loc":{"start":{"line":44,"column":24},"end":{"line":44,"column":38}}}) : helper)))
    + "\r\n                    </span>\r\n                </button>\r\n            </div>\r\n\r\n            <span class=\"offer-card__price\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"formattedPrice") || (depth0 != null ? lookupProperty(depth0,"formattedPrice") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"formattedPrice","hash":{},"data":data,"loc":{"start":{"line":49,"column":44},"end":{"line":49,"column":62}}}) : helper)))
    + " ₽</span>\r\n            <span class=\"offer-card__description\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"rooms") : depth0),{"name":"if","hash":{},"fn":container.program(19, data, 0),"inverse":container.program(21, data, 0),"data":data,"loc":{"start":{"line":51,"column":16},"end":{"line":55,"column":23}}})) != null ? stack1 : "")
    + "                · "
    + alias4(((helper = (helper = lookupProperty(helpers,"area") || (depth0 != null ? lookupProperty(depth0,"area") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"area","hash":{},"data":data,"loc":{"start":{"line":56,"column":18},"end":{"line":56,"column":26}}}) : helper)))
    + "м²\r\n            </span>\r\n            <span class=\"offer-card__metro\">\r\n                <img src=\"../images/metro.png\" alt=\"Метро\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"metro") : depth0),{"name":"if","hash":{},"fn":container.program(23, data, 0),"inverse":container.program(25, data, 0),"data":data,"loc":{"start":{"line":60,"column":16},"end":{"line":64,"column":23}}})) != null ? stack1 : "")
    + "            </span>\r\n            <span class=\"offer-card__address\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"address") || (depth0 != null ? lookupProperty(depth0,"address") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"address","hash":{},"data":data,"loc":{"start":{"line":66,"column":46},"end":{"line":66,"column":57}}}) : helper)))
    + "</span>\r\n        </div>\r\n";
},"4":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <img class=\"slider__image "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":10,"column":42},"end":{"line":10,"column":83}}})) != null ? stack1 : "")
    + "\"\r\n                     src=\""
    + alias2(container.lambda(depth0, depth0))
    + "\" \r\n                     alt=\"Фото объявления "
    + alias2(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":12,"column":42},"end":{"line":12,"column":52}}}) : helper)))
    + "\"\r\n                     loading=\"lazy\">\r\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "slider__image_active";
},"7":function(container,depth0,helpers,partials,data) {
    return "                <img class=\"slider__image slider__image_active\"\r\n                     src=\"../images/default_offer.jpg\"\r\n                     alt=\"Фото объявления\"\r\n                     loading=\"lazy\">\r\n";
},"9":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                <button class=\"slider__btn slider__btn_prev\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M15 18L9 12L15 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n                <button class=\"slider__btn slider__btn_next\">\r\n                    <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\">\r\n                        <path d=\"M9 18L15 12L9 6\" stroke=\"currentColor\" stroke-width=\"2\"></path>\r\n                    </svg>\r\n                </button>\r\n\r\n                <div class=\"slider__dots\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"images") : depth0),{"name":"each","hash":{},"fn":container.program(10, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":34,"column":20},"end":{"line":37,"column":29}}})) != null ? stack1 : "")
    + "                </div>\r\n";
},"10":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    <button class=\"slider__dot "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(data && lookupProperty(data,"first")),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":35,"column":47},"end":{"line":35,"column":86}}})) != null ? stack1 : "")
    + "\"\r\n                            data-index=\""
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"index") || (data && lookupProperty(data,"index"))) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"index","hash":{},"data":data,"loc":{"start":{"line":36,"column":40},"end":{"line":36,"column":50}}}) : helper)))
    + "\"></button>\r\n";
},"11":function(container,depth0,helpers,partials,data) {
    return "slider__dot_active";
},"13":function(container,depth0,helpers,partials,data) {
    return "Убрать из избранного";
},"15":function(container,depth0,helpers,partials,data) {
    return "Добавить в избранное";
},"17":function(container,depth0,helpers,partials,data) {
    return "offer-card__likes-counter--active";
},"19":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"rooms") || (depth0 != null ? lookupProperty(depth0,"rooms") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"rooms","hash":{},"data":data,"loc":{"start":{"line":52,"column":20},"end":{"line":52,"column":29}}}) : helper)))
    + "-комн.\r\n";
},"21":function(container,depth0,helpers,partials,data) {
    return "                    Студия\r\n";
},"23":function(container,depth0,helpers,partials,data) {
    var helper, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "                    "
    + container.escapeExpression(((helper = (helper = lookupProperty(helpers,"metro") || (depth0 != null ? lookupProperty(depth0,"metro") : depth0)) != null ? helper : container.hooks.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : (container.nullContext || {}),{"name":"metro","hash":{},"data":data,"loc":{"start":{"line":61,"column":20},"end":{"line":61,"column":29}}}) : helper)))
    + "\r\n";
},"25":function(container,depth0,helpers,partials,data) {
    return "                    Метро не указано\r\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, alias1=depth0 != null ? depth0 : (container.nullContext || {}), lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"offers\">\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"showTitle") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":2,"column":4},"end":{"line":4,"column":11}}})) != null ? stack1 : "")
    + "    <div class=\"offers__container\">\r\n"
    + ((stack1 = lookupProperty(helpers,"each").call(alias1,(depth0 != null ? lookupProperty(depth0,"offers") : depth0),{"name":"each","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":6,"column":8},"end":{"line":68,"column":17}}})) != null ? stack1 : "")
    + "    </div>\r\n</div>";
},"useData":true}),
  'Search': Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
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
},"useData":true})
};

templates['Header.hbs'] = templates['Header'];
templates['Search.hbs'] = templates['Search'];
templates['Authorization.hbs'] = templates['Authorization'];
templates['Complex.hbs'] = templates['Complex'];
templates['ComplexesList.hbs'] = templates['ComplexesList'];
templates['Offer.hbs'] = templates['Offer'];

export { templates };
export default templates;
