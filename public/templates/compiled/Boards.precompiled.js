(function() {
    var template = Handlebars.template,
        templates = Handlebars.templates = Handlebars.templates || {};
    
    templates['Boards.hbs'] = template({
        "1": function(container, depth0, helpers, partials, data) {
            var alias1 = container.lambda,
                alias2 = container.escapeExpression,
                lookupProperty = container.lookupProperty || function(parent, propertyName) {
                    if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
                        return parent[propertyName];
                    }
                    return undefined;
                };

            return "    <div class=\"board__block\">\n"
                + "        <h3>" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "title") : depth0), depth0)) + "</h3>\n"
                + "        <p>" + alias2(alias1((depth0 != null ? lookupProperty(depth0, "description") : depth0), depth0)) + "</p>\n"
                + "        <span class=\"board__price\">Цена: "
                + (alias1((depth0 != null ? lookupProperty(depth0, "price") : depth0), depth0) ? alias2(alias1((depth0 != null ? lookupProperty(depth0, "price") : depth0), depth0)) + " ₽" : "Не указана")
                + "</span>\n"
                + "        <span class=\"board__rooms\">Комнаты: "
                + (alias1((depth0 != null ? lookupProperty(depth0, "rooms") : depth0), depth0) ? alias2(alias1((depth0 != null ? lookupProperty(depth0, "rooms") : depth0), depth0)) + "-комн." : "Не указано")
                + "</span>\n"
                + "        <span class=\"board__area\">Площадь: "
                + (alias1((depth0 != null ? lookupProperty(depth0, "area") : depth0), depth0) ? alias2(alias1((depth0 != null ? lookupProperty(depth0, "area") : depth0), depth0)) + "м²" : "Не указана")
                + "</span>\n"
                + "        <span class=\"board__address\">Адрес: "
                + alias2(alias1((depth0 != null ? lookupProperty(depth0, "address") : depth0), depth0))
                + "</span>\n"
                + "        <span class=\"board__type\">Тип предложения: "
                + alias2(alias1((depth0 != null ? lookupProperty(depth0, "offer_type") : depth0), depth0))
                + "</span>\n"
                + "    </div>\n";
        },
        "compiler": [8, ">= 4.3.0"],
        "main": function(container, depth0, helpers, partials, data) {
            var stack1, lookupProperty = container.lookupProperty || function(parent, propertyName) {
                if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
                    return parent[propertyName];
                }
                return undefined;
            };

            return "<div class=\"board-list\">\n"
                + ((stack1 = lookupProperty(helpers, "each").call(
                    depth0 != null ? depth0 : (container.nullContext || {}),
                    lookupProperty(depth0, "offers"),
                    {
                        "name": "each",
                        "hash": {},
                        "fn": container.program(1, data, 0),
                        "inverse": container.noop,
                        "data": data,
                        "loc": { "start": { "line": 1, "column": 0 }, "end": { "line": 15, "column": 9 } }
                    }
                )) != null ? stack1 : "")
                + "</div>\n"
                + "<div class=\"pagination\">\n"
                + "    <p>Страница "
                + alias2(alias1((depth0 != null ? lookupProperty(depth0, "meta.page") : depth0), depth0))
                + " из "
                + alias2(alias1((depth0 != null ? lookupProperty(depth0, "meta.total") : depth0), depth0))
                + " предложений</p>\n"
                + "</div>";
        },
        "useData": true
    });
})();