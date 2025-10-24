import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function compileTemplates() {
    const templatesDir = path.join(__dirname, 'public/templates');
    const outputFile = path.join(__dirname, 'public/templates/compiled/templates.js');

    if (!fs.existsSync(path.dirname(outputFile))) {
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    }

    const templateFiles = fs.readdirSync(templatesDir).filter(file => file.endsWith('.hbs'));

    let compiledCode = ``;
    compiledCode += `import Handlebars from 'handlebars';\n\n`;
    compiledCode += `const templates = {\n`;

    templateFiles.forEach((file, index) => {
        const templateName = path.basename(file, '.hbs');
        const templatePath = path.join(templatesDir, file);
        const templateContent = fs.readFileSync(templatePath, 'utf8');

        const compiledTemplate = Handlebars.precompile(templateContent);

        compiledCode += `  '${templateName}': Handlebars.template(${compiledTemplate})`;
        compiledCode += index < templateFiles.length - 1 ? ',\n' : '\n';
    });

    compiledCode += `};\n\n`;
    compiledCode += `templates['Header.hbs'] = templates['Header'];\n`;
    compiledCode += `templates['Search.hbs'] = templates['Search'];\n`;
    compiledCode += `templates['Authorization.hbs'] = templates['Authorization'];\n`;
    compiledCode += `templates['Complex.hbs'] = templates['Complex'];\n`;
    compiledCode += `templates['ComplexesList.hbs'] = templates['ComplexesList'];\n`;
    compiledCode += `templates['Offer.hbs'] = templates['Offer'];\n`;
    compiledCode += `templates['OffersList.hbs'] = templates['OffersList'];\n\n`;

    compiledCode += `export { templates };\n`;
    compiledCode += `export default templates;\n`;

    fs.writeFileSync(outputFile, compiledCode);
}

compileTemplates();