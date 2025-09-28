/**
 * Скомпилированный Handlebars шаблон для отображения заголовка приложения
 * @module HeaderTemplate
 * @description Предкомпилированный шаблон для компонента Header
 */
(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['Header.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "        <span class=\"menu__user\">"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? lookupProperty(depth0,"user") : depth0)) != null ? lookupProperty(stack1,"email") : stack1), depth0))
    + "</span>\n        <button type=\"button\" class=\"menu__button logout\">Выйти</button>\n";
},"3":function(container,depth0,helpers,partials,data) {
    return "        <button type=\"button\" class=\"menu__button login\">Войти</button>\n        <button type=\"button\" class=\"menu__button register\">Регистрация</button>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"logo\">\n    <a href=\"/\" class=\"logo__link\">\n        <img src=\"../../images/logo.png\" class=\"logo__image\" alt=\"Логотип\">\n        <span class=\"logo__title\">Homa</span>\n    </a>\n</div>\n<div class=\"menu\">\n"
    + ((stack1 = lookupProperty(helpers,"if").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"isAuthenticated") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.program(3, data, 0),"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":14,"column":11}}})) != null ? stack1 : "")
    + "</div>";
},"useData":true});
})();