(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['Boards.hbs'] = template({"1":function(container,depth0,helpers,partials,data) {
    var alias1=container.lambda, alias2=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "            <div class=\"list__boards__block\">\n                <img class=\"board__image\" src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"image") : depth0), depth0))
    + "\" alt=\"Фото квартиры\">\n                <span class=\"board__like "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"likeClass") : depth0), depth0))
    + "\" data-ad-id=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"id") : depth0), depth0))
    + "\">\n                    <img src=\""
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"likeIcon") : depth0), depth0))
    + "\" alt=\"Лайк\">\n                </span>\n                <span class=\"board__price\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"price") : depth0), depth0))
    + "</span>\n                <span class=\"board__description\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"description") : depth0), depth0))
    + "</span>\n                <span class=\"board__metro\">\n                    <img src=\"../../images/metro.png\" alt=\"Метро\"> "
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"metro") : depth0), depth0))
    + "\n                </span>\n                <span class=\"board__address\">"
    + alias2(alias1((depth0 != null ? lookupProperty(depth0,"address") : depth0), depth0))
    + "</span>\n            </div>\n";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"list__boards\">\n    <h1>Популярные объявления</h1>\n    <div class=\"list__boards__container\">\n"
    + ((stack1 = lookupProperty(helpers,"each").call(depth0 != null ? depth0 : (container.nullContext || {}),(depth0 != null ? lookupProperty(depth0,"items") : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":4,"column":8},"end":{"line":17,"column":17}}})) != null ? stack1 : "")
    + "    </div>\n</div>";
},"useData":true});
})();